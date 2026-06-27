export type CardType = "CRITTER" | "CONSTRUCTION"
export type CardColor = "GREEN" | "RED" | "BLUE" | "TAN" | "PURPLE"

export interface CardCost {
  twigs?: number
  resin?: number
  pebbles?: number
  berries?: number
}

export interface CardDef {
  id: string
  name: string
  nameEn: string
  type: CardType
  color: CardColor
  points: number
  cost: CardCost
  copies: number
  unique: boolean
  pairedWith?: string
  effectText: string
}

export const CARDS: Record<string, CardDef> = {
  ARCHITECT: {
    id: "ARCHITECT", name: "Architekt", nameEn: "Architect",
    type: "CRITTER", color: "PURPLE", points: 2, cost: { berries: 4 },
    copies: 2, unique: true, pairedWith: "CRANE",
    effectText: "1 bod za každý nepoužitý oblázek a smůlu ve svém zásobníku (max. 6).",
  },
  BARD: {
    id: "BARD", name: "Bard", nameEn: "Bard",
    type: "CRITTER", color: "PURPLE", points: 0, cost: { berries: 3 },
    copies: 2, unique: true, pairedWith: "THEATRE",
    effectText: "Odlož až 5 karet pro 1 bod vítězství za každou.",
  },
  BARGE_TOAD: {
    id: "BARGE_TOAD", name: "Vorová ropucha", nameEn: "Barge Toad",
    type: "CRITTER", color: "GREEN", points: 1, cost: { berries: 2 },
    copies: 3, unique: false, pairedWith: "TWIG_BARGE",
    effectText: "Získej 2 větvičky za každou Farmu ve svém městě.",
  },
  CASTLE: {
    id: "CASTLE", name: "Hrad", nameEn: "Castle",
    type: "CONSTRUCTION", color: "PURPLE", points: 4, cost: { twigs: 2, resin: 3, pebbles: 3 },
    copies: 2, unique: true, pairedWith: "KING",
    effectText: "1 bod za každou běžnou stavbu ve svém městě.",
  },
  CEMETERY: {
    id: "CEMETERY", name: "Hřbitov", nameEn: "Cemetery",
    type: "CONSTRUCTION", color: "RED", points: 0, cost: { pebbles: 2 },
    copies: 2, unique: true, pairedWith: "UNDERTAKER",
    effectText: "Umísti pomocníka: Odhal 4 karty z odkladiště nebo balíčku. Zahraj 1 zdarma. Zbytek odlož.",
  },
  CHAPEL: {
    id: "CHAPEL", name: "Kaple", nameEn: "Chapel",
    type: "CONSTRUCTION", color: "RED", points: 2, cost: { twigs: 2, resin: 1, pebbles: 1 },
    copies: 2, unique: true, pairedWith: "SHEPHERD",
    effectText: "Při změně sezóny umísti 1 bod na Kapli. Vyber 2 karty za každý bod na Kapli.",
  },
  CHIP_SWEEP: {
    id: "CHIP_SWEEP", name: "Pilař", nameEn: "Chip Sweep",
    type: "CRITTER", color: "GREEN", points: 2, cost: { berries: 3 },
    copies: 3, unique: false, pairedWith: "RESIN_REFINERY",
    effectText: "Aktivuj 1 produkční schopnost ve svém městě.",
  },
  CLOCK_TOWER: {
    id: "CLOCK_TOWER", name: "Hodinová věž", nameEn: "Clock Tower",
    type: "CONSTRUCTION", color: "BLUE", points: 0, cost: { twigs: 3, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "HISTORIAN",
    effectText: "Zaplať 1 bod vítězství: Aktivuj obsazenou základní nebo lesní lokaci.",
  },
  COURTHOUSE: {
    id: "COURTHOUSE", name: "Soud", nameEn: "Courthouse",
    type: "CONSTRUCTION", color: "BLUE", points: 2, cost: { twigs: 1, resin: 1, pebbles: 2 },
    copies: 2, unique: true, pairedWith: "JUDGE",
    effectText: "Po zahrání Stavby získej 1 libovolnou surovinu.",
  },
  CRANE: {
    id: "CRANE", name: "Jeřáb", nameEn: "Crane",
    type: "CONSTRUCTION", color: "BLUE", points: 1, cost: { pebbles: 1 },
    copies: 3, unique: false, pairedWith: "ARCHITECT",
    effectText: "Odlož Jeřáb: Zahraj Stavbu o 3 suroviny levněji.",
  },
  DOCTOR: {
    id: "DOCTOR", name: "Doktor", nameEn: "Doctor",
    type: "CRITTER", color: "PURPLE", points: 4, cost: { berries: 4 },
    copies: 2, unique: true, pairedWith: "UNIVERSITY",
    effectText: "Zaplať až 3 bobule pro 1 bod vítězství za každou.",
  },
  DUNGEON: {
    id: "DUNGEON", name: "Žalář", nameEn: "Dungeon",
    type: "CONSTRUCTION", color: "BLUE", points: 0, cost: { resin: 1, pebbles: 2 },
    copies: 2, unique: true, pairedWith: "RANGER",
    effectText: "Přidej Tvora pod Žalář: Sniž cenu Stavby o 3 suroviny.",
  },
  EVERTREE: {
    id: "EVERTREE", name: "Prastrom", nameEn: "Ever Tree",
    type: "CONSTRUCTION", color: "PURPLE", points: 5, cost: { twigs: 3, resin: 3, pebbles: 3 },
    copies: 2, unique: true,
    effectText: "1 bod za každou kartu Prosperity ve svém městě. Libovolný Tvor může být zahrán zdarma.",
  },
  FAIRGROUNDS: {
    id: "FAIRGROUNDS", name: "Tržiště", nameEn: "Fairgrounds",
    type: "CONSTRUCTION", color: "GREEN", points: 3, cost: { twigs: 1, resin: 2, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "FOOL",
    effectText: "Po zahrání Stavby vyber 2 karty.",
  },
  FARM: {
    id: "FARM", name: "Farma", nameEn: "Farm",
    type: "CONSTRUCTION", color: "GREEN", points: 1, cost: { twigs: 2, resin: 1 },
    copies: 8, unique: false, pairedWith: "HUSBAND",
    effectText: "Získej 1 bobuli.",
  },
  FOOL: {
    id: "FOOL", name: "Blázen", nameEn: "Fool",
    type: "CRITTER", color: "TAN", points: -2, cost: { berries: 3 },
    copies: 2, unique: true, pairedWith: "FAIRGROUNDS",
    effectText: "Zahraj do prázdného slotu ve městě libovolného soupeře. Soupeř obdrží -2 body.",
  },
  GENERAL_STORE: {
    id: "GENERAL_STORE", name: "Obchod", nameEn: "General Store",
    type: "CONSTRUCTION", color: "GREEN", points: 1, cost: { resin: 1, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "SHOPKEEPER",
    effectText: "Získej 1 bobuli. Pokud máš ve městě Farmu, získej 2 bobule.",
  },
  HISTORIAN: {
    id: "HISTORIAN", name: "Kronikář", nameEn: "Historian",
    type: "CRITTER", color: "BLUE", points: 1, cost: { berries: 2 },
    copies: 3, unique: false, pairedWith: "CLOCK_TOWER",
    effectText: "Po zahrání libovolné karty (Tvor nebo Stavba) vyber 1 kartu.",
  },
  HUSBAND: {
    id: "HUSBAND", name: "Manžel", nameEn: "Husband",
    type: "CRITTER", color: "GREEN", points: 2, cost: { berries: 3 },
    copies: 4, unique: false, pairedWith: "FARM",
    effectText: "Pokud je spárován s Manželkou a Farmou, každou produkcí získej 1 libovolnou surovinu navíc.",
  },
  INN: {
    id: "INN", name: "Hostinec", nameEn: "Inn",
    type: "CONSTRUCTION", color: "RED", points: 2, cost: { twigs: 2, resin: 1 },
    copies: 3, unique: false, pairedWith: "INNKEEPER",
    effectText: "Umísti pomocníka: Zahraj libovolnou kartu z Louky o 3 suroviny levněji.",
  },
  INNKEEPER: {
    id: "INNKEEPER", name: "Hostinský", nameEn: "Innkeeper",
    type: "CRITTER", color: "BLUE", points: 1, cost: { berries: 1 },
    copies: 3, unique: false, pairedWith: "INN",
    effectText: "Odlož Hostinského: Sniž cenu Tvora o 3 bobule.",
  },
  JUDGE: {
    id: "JUDGE", name: "Soudce", nameEn: "Judge",
    type: "CRITTER", color: "BLUE", points: 2, cost: { berries: 3 },
    copies: 2, unique: true, pairedWith: "COURTHOUSE",
    effectText: "Při hraní karet můžeš 1 z placených surovin nahradit jinou libovolnou surovinou.",
  },
  KING: {
    id: "KING", name: "Král", nameEn: "King",
    type: "CRITTER", color: "PURPLE", points: 4, cost: { berries: 6 },
    copies: 2, unique: true, pairedWith: "CASTLE",
    effectText: "1 bod za každý splněný základní cíl + 2 body za každý splněný zvláštní cíl.",
  },
  LOOKOUT: {
    id: "LOOKOUT", name: "Vyhlídka", nameEn: "Lookout",
    type: "CONSTRUCTION", color: "RED", points: 2, cost: { twigs: 1, resin: 1, pebbles: 1 },
    copies: 2, unique: true, pairedWith: "WANDERER",
    effectText: "Umísti pomocníka: Zkopíruj schopnost libovolné základní nebo lesní lokace.",
  },
  MINE: {
    id: "MINE", name: "Důl", nameEn: "Mine",
    type: "CONSTRUCTION", color: "GREEN", points: 2, cost: { twigs: 1, resin: 1, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "MINER_MOLE",
    effectText: "Získej 1 oblázek.",
  },
  MINER_MOLE: {
    id: "MINER_MOLE", name: "Krtek horník", nameEn: "Miner Mole",
    type: "CRITTER", color: "GREEN", points: 1, cost: { berries: 3 },
    copies: 3, unique: false, pairedWith: "MINE",
    effectText: "Zkopíruj 1 produkční schopnost z města libovolného soupeře.",
  },
  MONASTERY: {
    id: "MONASTERY", name: "Klášter", nameEn: "Monastery",
    type: "CONSTRUCTION", color: "RED", points: 1, cost: { twigs: 1, resin: 1, pebbles: 1 },
    copies: 2, unique: true, pairedWith: "MONK",
    effectText: "Umísti pomocníka: Dej 2 suroviny jinému hráči a získej 4 body vítězství.",
  },
  MONK: {
    id: "MONK", name: "Mnich", nameEn: "Monk",
    type: "CRITTER", color: "GREEN", points: 0, cost: { berries: 1 },
    copies: 2, unique: true, pairedWith: "MONASTERY",
    effectText: "Dej soupeři až 2 bobule a získej 2 body vítězství za každou.",
  },
  PALACE: {
    id: "PALACE", name: "Palác", nameEn: "Palace",
    type: "CONSTRUCTION", color: "PURPLE", points: 4, cost: { twigs: 2, resin: 3, pebbles: 3 },
    copies: 2, unique: true, pairedWith: "QUEEN",
    effectText: "1 bod za každou unikátní stavbu ve svém městě.",
  },
  PEDDLER: {
    id: "PEDDLER", name: "Podomní obchodník", nameEn: "Peddler",
    type: "CRITTER", color: "GREEN", points: 1, cost: { berries: 2 },
    copies: 3, unique: false, pairedWith: "RUINS",
    effectText: "Zaplať až 2 libovolné suroviny a získej stejný počet surovin jiného druhu.",
  },
  POST_OFFICE: {
    id: "POST_OFFICE", name: "Pošta", nameEn: "Post Office",
    type: "CONSTRUCTION", color: "RED", points: 2, cost: { twigs: 1, resin: 2 },
    copies: 3, unique: false, pairedWith: "POSTAL_PIGEON",
    effectText: "Umísti pomocníka: Dej soupeři 2 karty z ruky. Pak odlož libovolné karty a dober do plné ruky.",
  },
  POSTAL_PIGEON: {
    id: "POSTAL_PIGEON", name: "Poštovní holub", nameEn: "Postal Pigeon",
    type: "CRITTER", color: "TAN", points: 0, cost: { berries: 2 },
    copies: 3, unique: false, pairedWith: "POST_OFFICE",
    effectText: "Odhal 2 karty z balíčku. Zahraj 1 kartu s hodnotou ≤3 body zdarma. Zbytek odlož.",
  },
  QUEEN: {
    id: "QUEEN", name: "Královna", nameEn: "Queen",
    type: "CRITTER", color: "RED", points: 4, cost: { berries: 5 },
    copies: 2, unique: true, pairedWith: "PALACE",
    effectText: "Umísti pomocníka: Zahraj libovolnou kartu z ruky s hodnotou ≤3 body zdarma.",
  },
  RANGER: {
    id: "RANGER", name: "Lesní strážník", nameEn: "Ranger",
    type: "CRITTER", color: "TAN", points: 1, cost: { berries: 2 },
    copies: 2, unique: true, pairedWith: "DUNGEON",
    effectText: "Přesuň libovolného ze svých nasazených pomocníků na nové místo.",
  },
  RESIN_REFINERY: {
    id: "RESIN_REFINERY", name: "Výrobna smůly", nameEn: "Resin Refinery",
    type: "CONSTRUCTION", color: "GREEN", points: 1, cost: { resin: 1, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "CHIP_SWEEP",
    effectText: "Získej 1 smůlu.",
  },
  RUINS: {
    id: "RUINS", name: "Trosky", nameEn: "Ruins",
    type: "CONSTRUCTION", color: "TAN", points: 0, cost: {},
    copies: 3, unique: false, pairedWith: "PEDDLER",
    effectText: "Odstraň Stavbu ze svého města. Získej zpět její cenu. Vyber 2 karty.",
  },
  SCHOOL: {
    id: "SCHOOL", name: "Škola", nameEn: "School",
    type: "CONSTRUCTION", color: "PURPLE", points: 2, cost: { twigs: 2, resin: 2 },
    copies: 2, unique: true, pairedWith: "TEACHER",
    effectText: "1 bod za každého běžného Tvora ve svém městě.",
  },
  SHEPHERD: {
    id: "SHEPHERD", name: "Pastýř", nameEn: "Shepherd",
    type: "CRITTER", color: "TAN", points: 1, cost: { berries: 3 },
    copies: 2, unique: true, pairedWith: "CHAPEL",
    effectText: "Získej 3 bobule. Pokud máš Kapli, vezmi žetony bodů rovné počtu bodů na Kapli.",
  },
  SHOPKEEPER: {
    id: "SHOPKEEPER", name: "Kupec", nameEn: "Shopkeeper",
    type: "CRITTER", color: "BLUE", points: 1, cost: { berries: 2 },
    copies: 3, unique: false, pairedWith: "GENERAL_STORE",
    effectText: "Po zahrání Tvora získej 1 bobuli.",
  },
  STOREHOUSE: {
    id: "STOREHOUSE", name: "Sklad", nameEn: "Storehouse",
    type: "CONSTRUCTION", color: "GREEN", points: 2, cost: { twigs: 1, resin: 1, pebbles: 1 },
    copies: 3, unique: false, pairedWith: "WOODCARVER",
    effectText: "Umísti zásoby: 3 větvičky, 2 smůly, 1 oblázek nebo 2 bobule.",
  },
  TEACHER: {
    id: "TEACHER", name: "Učitel", nameEn: "Teacher",
    type: "CRITTER", color: "PURPLE", points: 2, cost: { berries: 3 },
    copies: 2, unique: true, pairedWith: "SCHOOL",
    effectText: "Získej 2 bobule. Každý ostatní hráč vyber 2 karty.",
  },
  THEATRE: {
    id: "THEATRE", name: "Divadlo", nameEn: "Theatre",
    type: "CONSTRUCTION", color: "PURPLE", points: 3, cost: { twigs: 3, resin: 1, pebbles: 1 },
    copies: 2, unique: true, pairedWith: "BARD",
    effectText: "1 bod za každého unikátního Tvora ve svém městě.",
  },
  TWIG_BARGE: {
    id: "TWIG_BARGE", name: "Vorové čluny", nameEn: "Twig Barge",
    type: "CONSTRUCTION", color: "GREEN", points: 1, cost: { twigs: 1, pebbles: 2 },
    copies: 3, unique: false, pairedWith: "BARGE_TOAD",
    effectText: "Získej 2 větvičky.",
  },
  UNDERTAKER: {
    id: "UNDERTAKER", name: "Pohřebník", nameEn: "Undertaker",
    type: "CRITTER", color: "TAN", points: 1, cost: { berries: 2 },
    copies: 2, unique: true, pairedWith: "CEMETERY",
    effectText: "Odlož 3 karty z Louky. Doplň Louku. Vyber 1 kartu.",
  },
  UNIVERSITY: {
    id: "UNIVERSITY", name: "Univerzita", nameEn: "University",
    type: "CONSTRUCTION", color: "RED", points: 3, cost: { resin: 2, pebbles: 3 },
    copies: 2, unique: true, pairedWith: "DOCTOR",
    effectText: "Umísti pomocníka: Odstraň Tvora ze svého města. Získej 1 z každé suroviny + vyber 1 kartu.",
  },
  WANDERER: {
    id: "WANDERER", name: "Poutník", nameEn: "Wanderer",
    type: "CRITTER", color: "TAN", points: 1, cost: {},
    copies: 5, unique: false, pairedWith: "LOOKOUT",
    effectText: "Vyber 3 karty.",
  },
  WIFE: {
    id: "WIFE", name: "Manželka", nameEn: "Wife",
    type: "CRITTER", color: "GREEN", points: 2, cost: { berries: 2 },
    copies: 4, unique: false, pairedWith: "FARM",
    effectText: "Je-li spárována s Manželem, limit města +1. Spolu s Manželem a Farmou produkuj suroviny navíc.",
  },
  WOODCARVER: {
    id: "WOODCARVER", name: "Řezbář", nameEn: "Woodcarver",
    type: "CRITTER", color: "GREEN", points: 2, cost: { berries: 2 },
    copies: 2, unique: true, pairedWith: "STOREHOUSE",
    effectText: "Zaplať až 3 větvičky pro 1 bod vítězství za každou.",
  },
}

export const CARD_LIST = Object.values(CARDS)

export function buildDeck(): string[] {
  const deck: string[] = []
  for (const card of CARD_LIST) {
    for (let i = 0; i < card.copies; i++) {
      deck.push(card.id)
    }
  }
  return deck
}

export function shuffleDeck(deck: string[]): string[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getCard(id: string): CardDef {
  const card = CARDS[id]
  if (!card) throw new Error(`Neznámá karta: ${id}`)
  return card
}

export const COLOR_LABELS: Record<CardColor, string> = {
  GREEN: "Zelená",
  RED: "Červená",
  BLUE: "Modrá",
  TAN: "Hnědá",
  PURPLE: "Fialová",
}
