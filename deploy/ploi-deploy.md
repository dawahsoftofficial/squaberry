# Deploying squaberry.co.uk on Ploi

The site is a Next.js app: a Node.js server (kept running by a Ploi daemon) behind nginx, with a
DigitalOcean managed MySQL database. Paths below assume the site user `squaberry-wzh0k` and the
repository at `/home/squaberry-wzh0k/squaberry.co.uk`.

## 1. Node.js

Next.js 16 needs Node.js 20.9 or newer. Check with `node -v` on the server. If it's older,
install a newer version from Ploi (Server > Manage > NodeJS).

## 2. Environment variables

In Ploi, open Site > Environment and paste the variables from `.env.example` with real values.
Ploi saves them to `.env` in the site folder, which is gitignored and read by Next.js at build
and run time.

- `DB_*`: the DigitalOcean database details.
- `ADMIN_PASSWORD`: the admin panel password. Use a long random value.
- `ADMIN_SESSION_SECRET`: a different random value of at least 32 characters, for example the
  output of `openssl rand -base64 48`.
- `DB_CA_CERT_PATH` (recommended): download the CA certificate from the DigitalOcean database
  page, save it on the server (e.g. `/home/squaberry-wzh0k/.squaberry/do-ca.crt`) and put its path
  here, so the database server's identity is verified as well as encrypted.

In DigitalOcean, add the server's IP address to the database's **Trusted sources**, or the app
can't connect.

## 3. Deploy script

Site > Deploy script:

```sh
cd /home/squaberry-wzh0k/squaberry.co.uk
git pull origin main
npm ci
npm run db:migrate
npm run build
```

`npm run db:migrate` is safe to run on every deploy: it only creates missing tables.

After each deploy, restart the daemon (step 4) so it serves the new build. Use the restart
button on Ploi's Daemons page, or add the restart command Ploi shows for that daemon to the end
of this script.

## 4. Daemon

Server > Daemons > New daemon:

- Command: `npm run start`
- Directory: `/home/squaberry-wzh0k/squaberry.co.uk`
- User: `squaberry-wzh0k`
- Processes: 1

`npm run start` listens on 127.0.0.1:3090 (override with a `PORT` environment variable).

## 5. nginx

Paste `deploy/nginx-ploi.conf` into Site > Manage > NGINX configuration and save. It proxies
every request to the daemon on port 3090.

## 6. Check

- Visit the site and a service page.
- Send a test enquiry, then sign in at `/admin` and confirm it's there. Delete it afterwards.
