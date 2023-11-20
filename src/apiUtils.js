import fetch from "node-fetch";
import {
    VERIFY_CLOUDFLARE_TOKEN_URL,
    GET_ZONES_URL,
    GET_ZONE_RECORDS_URL,
    UPDATE_ZONE_RECORD_URL,
    CREATE_ZONE_RECORD_URL,
} from "./constants.js";

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_METHOD = process.env.WEBHOOK_METHOD;
const DEBUG = process.env.DEBUG || false;

const defaultHeaders = {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
}

export const verifyCloudflareToken = async () => {
    try {
        const response = await fetch(VERIFY_CLOUDFLARE_TOKEN_URL, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (DEBUG) {
            console.log('Cloudflare API key verification response:', await response.json());
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        return response.ok;
    } catch (error) {
        console.error('Unable to verify Cloudflare API key', error);
        return false;
    }
};

export const getPublicIpAddress = async () => {
    try {
        const response = await fetch('https://one.one.one.one/cdn-cgi/trace');

        if (DEBUG) {
            console.log('Public IP address response:', await response.text());
        }

        if (response.ok) {
            const data = await response.text();
            const lines = data.split('\n');
            let ip_address = null;
        
            for (const line of lines) {
              if (line.startsWith('ip=')) {
                ip_address = line.split('=')[1];
                break;
              }
            }
            return ip_address;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to get public IP address', error);
    }
};

export const getCloudflareZones = async () => {
    try {
        const response = await fetch(GET_ZONES_URL, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (DEBUG) {
            console.log('Cloudflare zones response:', await response.json());
        }

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to get Cloudflare zones', error);
    }
};

export const getCloudflareZoneRecords = async (zoneId) => {
    try {
        const response = await fetch(GET_ZONE_RECORDS_URL(zoneId), {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (DEBUG) {
            console.log('Cloudflare zone records response:', await response.json());
        }

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to get Cloudflare zone records', error);
    }
};

export const updateCloudflareZoneRecord = async (zoneId, recordId, data) => {
    try {
        const response = await fetch(UPDATE_ZONE_RECORD_URL(zoneId, recordId), {
            method: 'PUT',
            headers: {
                ...defaultHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (DEBUG) {
            console.log('Cloudflare update zone record response:', await response.json(), 'data:', data);
        }

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to update Cloudflare zone record', error);
    }
};

export const createCloudflareZoneRecord = async (zoneId, data) => {
    try {
        const response = await fetch(CREATE_ZONE_RECORD_URL(zoneId), {
            method: 'POST',
            headers: {
                ...defaultHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (DEBUG) {
            console.log('Cloudflare create zone record response:', await response.json(), 'data:', data);
        }

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to create Cloudflare zone record', error);
    }
};

export const sendWebhookRequest = async (data) => {
    if (!WEBHOOK_URL || !WEBHOOK_METHOD) return;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: WEBHOOK_METHOD,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (DEBUG) {
            console.log('Webhook response:', await response.json(), 'data:', data);
        }

        if (response.ok) {
            return response.status;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests, error code 429');
        }

        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error('Unable to send webhook request', error);
    }
};