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

const defaultHeaders = {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
}

export const verifyCloudflareToken = async () => {
    try {
        const response = await fetch(VERIFY_CLOUDFLARE_TOKEN_URL, {
            method: 'GET',
            headers: defaultHeaders,
        });
        
        if (response.ok) {
            const json = await response.json();
            if (json.result && json.result.status === 'active') {
                return true;
            }
            return false;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const getPublicIpAddress = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json', {
            method: 'GET',
        });
        
        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
    }
};

export const getCloudflareZones = async () => {
    try {
        const response = await fetch(GET_ZONES_URL, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
    }
};

export const getCloudflareZoneRecords = async (zoneId) => {
    try {
        const response = await fetch(GET_ZONE_RECORDS_URL(zoneId), {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
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

        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
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
        if (response.ok) {
            const json = await response.json();
            return json;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
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

        if (response.ok) {
            return response.status;
        }

        // Check if the response code is 429 (too many requests)
        if (response.status === 429) {
            throw new Error('Too many requests');
        }
        
        // If the response code is not 429, throw an error
        throw new Error(response.status);
    } catch (error) {
        console.error(error);
    }
};