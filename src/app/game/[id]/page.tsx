import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import GameWaitingRoom from "./GameWaitingRoom"
import GameBoard from "./GameBoard"

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const game = await db.game.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, username: true } },
      players: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  })

  if (!game) notFound()

  const isPlayer = game.players.some((p) => p.userId === session.user.id)
  if (!isPlayer) redirect("/lobby")

  if (game.status === "LOBBY") {
    return <GameWaitingRoom game={game} currentUserId={session.user.id} />
  }

  return <GameBoard gameId={id} currentUserId={session.user.id} />
}
