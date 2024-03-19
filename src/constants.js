export const VERIFY_CLOUDFLARE_TOKEN_URL =
  'https://api.cloudflare.com/client/v4/user/tokens/verify';
export const GET_ZONES_URL = 'https://api.cloudflare.com/client/v4/zones';
export const GET_ZONE_RECORDS_URL = (zoneId) =>
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
export const UPDATE_ZONE_RECORD_URL = (zoneId, recordId) =>
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
export const CREATE_ZONE_RECORD_URL = (zoneId) =>
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
