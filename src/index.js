import { CronJob } from 'cron';

import {
    verifyCloudflareToken,
    getPublicIpAddress,
    getCloudflareZones,
    getCloudflareZoneRecords,
    updateCloudflareZoneRecord,
    createCloudflareZoneRecord,
    sendWebhookRequest,
} from './apiUtils.js';

const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const DNS_URL = process.env.DNS_URL;
const PROXIED = process.env.PROXIED !== 'false' || false;
const TIMEZONE = process.env.TIMEZONE || 'Europe/London';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_METHOD = process.env.WEBHOOK_METHOD;
const IP_OVERRIDE = process.env.IP_OVERRIDE;
const DEBUG = process.env.DEBUG || false;

let job = null;

const start = async () => {
    try {
        // Verify that the cloudflare API key is valid
        const isCloudflareTokenValid = await verifyCloudflareToken();
        if (!isCloudflareTokenValid) {
            console.log('Cloudflare API key is invalid. Exiting. Sent API key: ', CLOUDFLARE_API_KEY);
            job.stop();
        }

        // Find out the TLD of the DNS_URL
        const PARSED_TLD = DNS_URL.split('.').slice(-2).join('.');
        console.log(`Parsed TLD: ${PARSED_TLD}`);

        // Get the public IP address of the machine
        const publicIpAddress = IP_OVERRIDE ? IP_OVERRIDE : await getPublicIpAddress();
        if (IP_OVERRIDE) {
            console.log(`IP Override: ${IP_OVERRIDE}, not checking public IP address.`);
        } else {
            if (!publicIpAddress) {
                console.log('Unable to get public IP address.', publicIpAddress);
            }
            console.log(`Public IP Address: ${publicIpAddress}`);
        }

        // Get the zones from Cloudflare and find the zone ID for the DNS_URL
        const zones = await getCloudflareZones();
        const zone = zones.result.find((zone) => zone.name === PARSED_TLD);
        if (!zone) {
            sendWebhookRequest({ status: 'error', message: `Unable to find zone for ${PARSED_TLD}. Please ensure that the domain is registered with Cloudflare.` });
            console.log(`Unable to find zone for ${PARSED_TLD}. Please ensure that the domain is registered with Cloudflare.`);
            throw new Error('Unable to find zone for ${PARSED_TLD}')
        }
        console.log(`Successfully Found Zone: ${zone.name} (${zone.id})`);

        // Get the DNS records for the zone
        const zoneRecords = await getCloudflareZoneRecords(zone.id);
        if (!zoneRecords) {
            sendWebhookRequest({ status: 'error', message: `Unable to get DNS records for ${PARSED_TLD}.` });
            console.log(`Unable to get DNS records for ${PARSED_TLD}.`);
        }

        // Check if the DNS_URL is already in the zone
        const dnsRecord = zoneRecords.result.find((record) => record.name === DNS_URL);
        if (dnsRecord) {
            console.log(`DNS record already exists for ${DNS_URL}, checking if it needs to be updated...`);

            // Check if the DNS record needs to be updated
            if (dnsRecord.content === publicIpAddress && dnsRecord.proxied === PROXIED) {
                console.log(`DNS record for ${DNS_URL} is already up to date. No action required.`);
                sendWebhookRequest({ status: 'success', message: `DNS record for ${DNS_URL} is already up to date. No action required.` });
            } else {
                if (dnsRecord.content !== publicIpAddress) {
                    console.log(`DNS record for ${DNS_URL} needs to be updated. IP Address: ${dnsRecord.content} -> ${publicIpAddress}`);
                }
                if (dnsRecord.proxied !== PROXIED) {
                    console.log(`DNS record for ${DNS_URL} needs to be updated. Proxied: ${dnsRecord.proxied} -> ${PROXIED}`);
                }
                sendWebhookRequest({ status: 'progress', message: `DNS record for ${DNS_URL} needs to be updated. IP Address: ${dnsRecord.content} -> ${publicIpAddress}, Proxied: ${dnsRecord.proxied} -> ${PROXIED}` });

                // Update the DNS record
                const updatedDnsRecord = await updateCloudflareZoneRecord(zone.id, dnsRecord.id, {
                    type: dnsRecord.type,
                    name: dnsRecord.name,
                    content: publicIpAddress,
                    proxied: PROXIED,
                });

                console.log(`DNS record for ${DNS_URL} has been updated. IP Address: ${updatedDnsRecord.result.content}, Proxied: ${updatedDnsRecord.result.proxied}`);
                sendWebhookRequest({ status: 'success', message: `DNS record for ${DNS_URL} has been updated. IP Address: ${updatedDnsRecord.result.content}, Proxied: ${updatedDnsRecord.result.proxied}` });
            }
        } else {
            console.log(`DNS record does not exist for ${DNS_URL}, creating it...`);
            const newRecord = await createCloudflareZoneRecord(zone.id, {
                type: 'A',
                name: DNS_URL,
                content: publicIpAddress,
                proxied: PROXIED,
            });

            console.log(`DNS record for ${DNS_URL} has been created. IP Address: ${newRecord.result.content}`);
            sendWebhookRequest({ status: 'progress', message: `DNS record for ${DNS_URL} has been created. IP Address: ${newRecord.result.content}` });
        }

        console.log('Completed, waiting for next scheduled run...\n');
    } catch (error) {
        console.error('An error occurred while running. The job wont be stopped.', error);
        sendWebhookRequest({ status: 'error', message: 'An uncaught error occurred while running. The job will be stopped.', error });
    }
};

const verifyStartup = () => {
    try {
        console.log('Starting Cloudflare DNS Updater...');
        console.log('Configuration:');
        console.log(`CLOUDFLARE_API_KEY: ${CLOUDFLARE_API_KEY}`);
        console.log(`DNS_URL: ${DNS_URL}`);
        console.log(`CRON_SCHEDULE: ${CRON_SCHEDULE}`);
        console.log(`TIMEZONE: ${TIMEZONE}`);
        if (PROXIED) console.log(`PROXIED: ${PROXIED}`);
        if (IP_OVERRIDE) console.log(`IP_OVERRIDE: ${IP_OVERRIDE}`);
        if (DEBUG) console.log(`DEBUG: ${DEBUG}`);
        console.log(`----------------------------------------`);

        if (!CLOUDFLARE_API_KEY) {
            return console.log('CLOUDFLARE_API_KEY is required.');
        }

        if (!DNS_URL) {
            return console.log('DNS_URL is required.');
        }

        if (!CRON_SCHEDULE) {
            return console.log('CRON_SCHEDULE is required.');
        }

        if (!PROXIED) {
            console.log('PROXIED value is not supplied so defaulting to - false.');
        }

        if (WEBHOOK_URL || WEBHOOK_METHOD) {
            if (WEBHOOK_METHOD && WEBHOOK_METHOD) {
                if (WEBHOOK_METHOD !== 'GET' && WEBHOOK_METHOD !== 'POST') {
                    return console.log('WEBHOOK_METHOD must be either GET or POST.');
                }
                console.log(`${WEBHOOK_METHOD} request will be sent to ${WEBHOOK_URL} when the DNS record is updated.`)
            } else {
                return console.log('WEBHOOK_URL and WEBHOOK_METHOD are both required.');
            }
        }

        console.log('Startup configuration is valid, starting the cron job...');
        job = new CronJob(
            CRON_SCHEDULE,
            function () {
                start();
            },
            null,
            true,
            TIMEZONE,
            null,
            true
        );
    } catch (error) {
        console.error('An error occurred while verifying the startup config. Error -', error);
    }
};

verifyStartup();
