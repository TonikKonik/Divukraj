# Santora — vize hry

> Tahová karetní hra pro 2–4 hráče. Fantasy svět bez slunce, kde **světlo je
> surovina, měna, život i čas zároveň**. Tvoříš život ze světla a vzdoruješ
> Hladové tmě. Kdo na konci září nejvíc, vyhrává.

*Living document — v0.1. Inspirováno deskovými „engine builder" hrami, ale
svět, mechanika i identita jsou vlastní.*

---

## 1. Svět: Santora

Santora je svět, jehož hvězda dávno pohasla. Je **temný** — a život se
nepřizpůsobil tím, že by hledal slunce, ale tím, že **si světlo vytváří sám**.
Všechno živé fosforeskuje. Santora je černé plátno, na kterém každý život svítí.

Světlo tu není téma — je to **všechno**:
- **surovina**, ze které se tvoří nový život,
- **měna**, kterou platíš,
- **hodnota**, podle které se vítězí (Záře),
- **zrod i zánik** — když světlo dojde, přichází konec.

Není to hra o čase. Je to hra o **tom, kolik je světla**. Tam, kde je ho dost,
vládne klid a nesmírná krása. Tam, kde chybí, je napětí a nebezpečí.

---

## 2. Hráč: Světvor

Hráč je **Světvor** — zvláštní entita, **jediná, kdo umí tvořit**. Bez světvora
nic nežije, nic nevznikne. Není to stavitel; je to **tvůrce života ze světla**.

Ve hře jsou 4 druhy světvorů, každý s unikátní vlastností (návrhy k doladění):

| Světvor | Motiv | Návrh unikátní vlastnosti |
|---------|-------|---------------------------|
| **Svítal** | úsvit, první světlo | Lépe **doplňuje ingredience** — když by ti světlo mělo dojít, Svítal jako jediný ještě jednou rozsvítí zdroj. |
| **Zátor** | hráz, obrana | Lépe **vzdoruje Hladové tmě** — staví bariéru, tma mu ubírá pomaleji / méně. |
| **Lumin** | čistá zář | Jeho výtvory **září jasněji** — za stejnou cenu získá víc Záře (bodů). |
| **Fosfa** | fosforescence, řetězení | Jeho život **rozsvěcí okolní** — tvorové a stavby si navzájem dodávají světlo (kombá, engine). |

---

## 3. Hladová tma (antagonista)

**Hladová tma** je aktivní protivník, ne jen kulisa. **To, co vytvoříš, ona
ubírá.** Každým tahem se přibližuje a požírá.

- Pokud **průběžně nedoplňuješ světlo** (noví tvorové, stavby, fauna), Hladová
  tma tě pohltí víc — **ubere ti z toho, co jsi už vytvořil**.
- Musíš zůstat „v plusu": tvořit rychleji, než tma stačí žrát.
- Čím dál hra postupuje, tím je tma hladovější.

To dělá z každého tahu rozhodnutí: **útok** (tvořit, zvyšovat Záři) vs.
**obrana** (udržet to, co máš, proti tmě).

---

## 4. Suroviny: odstíny světla

Místo dřeva/kamene sbíráš **barvy světla**. Tvořit konkrétní život vyžaduje
konkrétní odstíny:

- **Jantarová zář** — teplá, životodárná, **hojná**. Z ní pučí Putující.
- **Tyrkysová zář** — strukturní, „tkací", **střední**. Z ní rostou Spřádané.
- **Purpurová zář** — hlubinná, mocná, **vzácná**. Leží jen v nejtemnějších,
  nejnebezpečnějších místech — chceš ji, riskuješ.

**Ingredience jsou omezené.** Sdílený zdroj se doplňuje, ale když nejsi
prozíravý, **v daném tahu se na tebe nemusí dostat**. O světlo se soutěží.

---

## 5. Co tvoříš (3 typy karet)

- **Kořenící** — svítící flóra, co skladuje a množí zář. *Tvůj engine.*
- **Putující** — éteričtí, fosforeskující tvorové. *Efekty, kombá.*
- **Spřádané** — živá rostlá architektura z utkaného světla. *Silné, trvalé.*

Každý nový život sám fosforeskuje → přidává do háje Záři. Háj se rozsvěcí jako
živý organismus.

---

## 6. Herní smyčka (návrh)

Na svém tahu uděláš jednu hlavní akci:

1. **Sklidit světlo** — vezmi odstíny ze sdíleného (omezeného) zdroje.
2. **Tvořit život** — zaplať odstíny a založ kartu (Kořenící / Putující /
   Spřádané) do svého háje.

Poté se ozve **Hladová tma**: pokud tvůj háj nesvítí dost (nedoplnil jsi),
ubere ti. Pak je na řadě další hráč.

> Cíl tahů: udržet háj net-pozitivní (víc světla, než tma sežere) a zároveň
> dlouhodobě budovat Záři.

---

## 7. Konec hry a vítězství

Svět se postupně stmívá. Když světlo dojde, padá **Dlouhá tma** a hra končí.

- Vítězí ten, jehož háj **září nejvíc** (nejvyšší Záře).
- Kdo září málo — nebo jen tvořil, ale neudržel světlo — končí poslední.

---

## 8. Vizuální identita

- **Černé plátno, na kterém všechno svítí.** Tma odpouští nedokonalosti a dává
  okamžitě nezaměnitelný vzhled.
- Paleta záře: jantarová, tyrkysová, purpurová na hluboké černé/modré.
- **Karta je hrdina.** Investice jde do jednoho krásného rámu karty + zamčeného
  ilustračního stylu; UI (tlačítka, dialogy) se dělá v CSS/SVG ve stejné identitě.
- Ilustrace (tvorové, flóra, architektura) generujeme v dávkách se **zamčeným
  stylem** (jeden style-reference), aby vše vypadalo od jednoho ilustrátora.

---

## 9. Otevřené otázky / TODO

- Doladit unikátní vlastnosti 4 světvorů (Svítal, Zátor, Lumin, Fosfa).
- Přesná mechanika Hladové tmy (kolik ubírá, podle čeho, jak se brání).
- Jak přesně funguje sdílený zdroj světla a jeho doplňování.
- Počet karet, typy efektů, podmínky kombo-řetězení.
- Délka hry (kdy přesně padá Dlouhá tma).
- Vizuál: návrh rámu karty + výběr fontů a palety.
