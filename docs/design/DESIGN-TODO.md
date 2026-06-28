# Divukraj — Design plán UI

Postupný návrh každého herního elementu. Každý prvek se navrhne vizuálně,
odsouhlasí se podoba, teprve pak se implementuje.

---

## Stav

| # | Prvek | Stav | Poznámka |
|---|-------|------|----------|
| 1 | **Herní plán** (deska hry) | 🔲 k návrhu | Rozložení lokací, Prastromu, louky |
| 2 | **Stůl** (pozadí pod herním plánem) | 🔄 v řešení | Masivní hranoly, opotřebené hrany |
| 3 | **Karty tvorů a staveb** (128 ks) | 🔄 v řešení | Detail malý + velký po tapnutí |
| 4 | **Karty lesa** (11 ks) | 🔲 k návrhu | Zvláštní lokace v lese |
| 5 | **Karty významných událostí** (16 ks) | 🔲 k návrhu | Veřejné + tajné úkoly |
| 6 | **Dílky běžných událostí** (4 ks) | 🔲 k návrhu | Základní bonusy za splnění |
| 7 | **Bodovací žetony** | 🔲 k návrhu | 10× tříbodové, 20× jednobodové |
| 8 | **Žetony obyvatel** | 🔲 k návrhu | Malé žetony pro identifikaci karet |
| 9 | **Pomocníci** (24 ks, 6/hráč) | 🔲 k návrhu | Ježci/myši/veverky/želvy dle barvy |
| 10 | **Bobule** (surovina) | 🔲 k návrhu | Fialové kulaté žetony |
| 11 | **Úlomky smůly** (surovina) | 🔲 k návrhu | Oranžové krystalky |
| 12 | **Oblázky** (surovina) | 🔲 k návrhu | Šedé kamínky |
| 13 | **Větvičky** (surovina) | 🔲 k návrhu | Hnědé dřívka |
| 14 | **Prastrom** (Ever Tree) | 🔲 k návrhu | 3D ve fyzické hře → 2D řešení |
| 15 | **Moje město** | 🔲 k návrhu | Vyložené karty hráče (max 15) |
| 16 | **Moje ruka** | 🔲 k návrhu | Karty na ruce, výběr, zahrání |
| 17 | **Logo Divukraj** | 🔲 k návrhu | Header, styl titulu |
| 18 | **Přehled hráčů** | 🔲 k návrhu | Panel surovin, karet, pomocníků |
| 19 | **Ostatní herní prvky** | 🔲 k návrhu | Balíček, odkladiště, kolo hry |

---

## Legenda

- 🔲 k návrhu — ještě nezačato
- 🔄 v řešení — pracuje se na tom
- 💬 k odsouhlasení — návrh hotov, čeká na schválení
- ✅ odsouhlaseno — schválená podoba, implementováno

---

## Pracovní postup pro každý prvek

1. **Návrh** — zobrazíme vizuální mock ve velkém (CSS, SVG nebo screenshot referenční fyzické hry)
2. **Diskuze** — hráč odsouhlasí nebo požádá o úpravu
3. **Implementace** — zapracujeme do GameBoard
4. **Deploy** — push na main → VPS

---

## Poznámky k fyzické hře

- Fyzická hra: Everdell od Starling Games, česká edice Divukraj od Tlama Games
- Barvy hráčů: červená, modrá, hnědá, bílá (4 hráči)
- Pomocníci: **ježci** (šedí), **myši** (bílé), **veverky** (oranžové), **želvy** (tyrkysové)
- Sezóny: Jaro → Léto → Podzim → Zima
- Suroviny: větvičky (hnědé), smůla (oranžová), oblázky (šedé), bobule (fialové)
- Funkční typy karet: Zelené (sběr), Červené (místa), Modré (služby), Hnědé (poutě), Fialové (rozkvět)
- Manuál: viz `docs/rules/` pro podrobné herní pravidla
