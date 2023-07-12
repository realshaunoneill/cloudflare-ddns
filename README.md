# Cloudflare DDNS Service :cloud: :arrows_counterclockwise:
[![Github Source](https://img.shields.io/badge/source-github-orange)](https://github.com/realshaunoneill/cloudflare-ddns)
[![Docker Image Size](https://img.shields.io/docker/image-size/realshaunoneill/cloudflare-ddns/latest)](https://hub.docker.com/r/realshaunoneill/cloudflare-ddns)
[![DockerHub Pulls](https://img.shields.io/docker/pulls/realshaunoneill/cloudflare-ddns)](https://hub.docker.com/r/realshaunoneill/cloudflare-ddns 'DockerHub pulls')

A Node.js-based Dynamic DNS (DDNS) service using Cloudflare as the DNS provider. This service automatically updates the IP address of a chosen domain with the current IP address of the machine running the service.

## Features :sparkles:
- Automatic IP address update with Cloudflare
- Configurable interval (using cron) for IP address checks and updates
- Simple setup and configuration
- The Docker image is small and efficient.
- Wildcard domains (*.example.org) are also supported.
- Supports all platforms.

## Prerequisites :clipboard:
To use this service, you need to have either Node.js or Docker installed on your machine.
- A Cloudflare account with a domain name already set up and configured on Cloudflare.
- A Cloudflare API key with the following permissions:
  - Zone:Zone:Read
  - Zone:DNS:Edit


## Installation :computer:
There are two ways to run this service: using Docker or Node.js. The Docker image is recommended for most users, but if you want to run the service on a machine that doesn't have Docker installed, you can use Node.js instead.
### Using Docker :whale:
1. Create a new file called docker-compose.yml and copy the following contents into it:

   ```yaml
   version: "3.8"
   services:
     cloudflare-ddns:
       image: realshaunoneill/cloudflare-ddns:latest
       container_name: cloudflare-ddns
       restart: unless-stopped
       environment:
         - CLOUDFLARE_API_KEY=your-api-key
         - DNS_URL=your-domain-name
         - PROXIED=false
         - CRON_SCHEDULE=* * * * *
         - WEBHOOK_URL=https://your-webhook-url
         - WEBHOOK_METHOD=POST
   ```
2. Modify the environment variables to your liking. See Configuration for more information.
3. Run the service:

   ```shell
   docker-compose up -d
   ```
### Using Node.js :computer:
1. Clone this repository to your local machine:

   ```shell
   git clone https://github.com/your-username/your-repo.git
   ```
2. Install the dependencies:

   ```shell
   npm install
   ```
3. Copy the .env.example file to .env and modify the values to your liking. See Configuration for more information.

   ```shell
   cp .env.example .env
   ```
4. Run the service:

   ```shell
   npm start
   ```
5. (Optional) If you want to run the service in the background, you can use a process manager like [PM2](https://pm2.keymetrics.io/):

   ```shell
   npm install pm2 -g
   pm2 start index.js --name cloudflare-ddns
   ```

## Configuration :wrench:
You can modify the following settings in the config.json file:

CLOUDFLARE_API_KEY: Your Cloudflare API key or access token.
DNS_URL: The subdomain to update with the current IP address (can be a wildcard).
PROXIED: Whether or not to proxy the DNS record through Cloudflare.
CRON_SCHEDULE: The interval at which to check for IP address changes (using cron syntax).
WEBHOOK_URL: The URL to send a webhook to when the IP address changes.
WEBHOOK_METHOD: The HTTP method to use when sending the webhook (GET or POST).

## Contributing :handshake:
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License :page_facing_up:
This project is licensed under the MIT License.