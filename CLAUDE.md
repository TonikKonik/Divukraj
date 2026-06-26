# Divukraj - CLAUDE.md

> Global info: [tonikkonik-workspace/CLAUDE.md](https://github.com/TonikKonik/tonikkonik-workspace/blob/main/CLAUDE.md)

## Stack

- Framework: Next.js (App Router)
- Database: PostgreSQL on Hetzner VPS
- Auth: none
- Deploy: PM2 on Hetzner VPS, port 3002
- URL: http://188.34.162.255:3002

## Deploy

Push to main -> GitHub Actions (deploy.yml) -> PM2 restart

## Server

- Directory: /var/www/divukraj/
- Database: PostgreSQL, db name: divukraj
- Logs: pm2 logs divukraj
- Restart: pm2 restart divukraj

## Secrets

- SERVER_HOST, SERVER_USER, SERVER_SSH_KEY, SERVER_PORT
- DIVUKRAJ_DATABASE_URL
- DIVUKRAJ_AUTH_SECRET