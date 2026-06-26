# Divukraj - CLAUDE.md

> Global info: [tonikkonik-workspace/CLAUDE.md](https://github.com/TonikKonik/tonikkonik-workspace/blob/main/CLAUDE.md)

## Co je Divukraj

Online multiplayerová implementace deskové hry **Divukraj** (orig. název **Everdell** od Starling Games) pro 2–4 hráče. Soukromý projekt — přístup jen pro vybrané hráče (přihlášení přes credentials). Hráči zakládají město v lese, sbírají suroviny (větvičky, pryskyřici, kamínky, bobule), vysílají dělníky na lokace a hrají karty (Obyvatelé + Stavby). Hra probíhá přes 4 sezóny (Jaro → Léto → Podzim → Zima).

## Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL on Hetzner VPS + Prisma ORM
- **Auth:** NextAuth.js (Credentials provider) — hesla bcrypt v DB
- **Real-time:** Socket.io (plánováno pro multiplayer synchronizaci)
- **Deploy:** PM2 on Hetzner VPS, port 3002
- **URL:** http://188.34.162.255:3002

## Deploy

Push to main → GitHub Actions (deploy.yml) → PM2 restart

## Server

- **Directory:** /var/www/divukraj/
- **Database:** PostgreSQL, db name: `divukraj`, user: `divukraj`
- **Logs:** `pm2 logs divukraj`
- **Restart:** `pm2 restart divukraj`

## Secrets

| Secret | Popis |
|--------|-------|
| `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_PORT` | VPS přístup |
| `DIVUKRAJ_DATABASE_URL` | PostgreSQL connection string |
| `DIVUKRAJ_AUTH_SECRET` | NextAuth.js secret pro JWT podepisování |

> `AUTH_SECRET` je v secrets nastaven a připraven k použití i přesto, že bootstrap proběhl s `auth: none`. NextAuth.js ho využije.

## Prisma

Schema žije v `prisma/schema.prisma`. Migrace se pouštějí automaticky při deployi:
```
npx prisma migrate deploy   # produkce
npx prisma db push          # vývoj / první spuštění
```

## Herní pravidla (přehled)

- **Suroviny:** větvičky (twigs), pryskyřice (resin), kamínky (pebbles), bobule (berries)
- **Karty:** 128 unikátních karet — Obyvatelé (Critters) a Stavby (Constructions)
- **Dělníci:** každý hráč má 2 dělníky (Jaro/Léto), +1 (Podzim), +1 (Zima)
- **Město:** max 15 karet, každý hráč staví vlastní
- **Louky (Meadow):** 8 karet k dispozici, doplňují se
- **Sezóny:** příchod sezóny = dělníci se vrátí, hráč lízne karty + suroviny z Ever Tree

## Vývoj — fáze

1. **Auth + lobby** — přihlášení (NextAuth credentials), vytvoření/připojení hry
2. **Herní stav** — DB model, Socket.io real-time sync
3. **Herní mechaniky** — louky, lokace, karty, město, sezóny
4. **Vizuál** — CSS design system (viz `design/divukraj-preview.html` v workspace repo)
