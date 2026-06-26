import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import LobbyClient from "./LobbyClient"

export default async function LobbyPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const games = await db.game.findMany({
    where: { status: { not: "FINISHED" } },
    include: {
      host: { select: { id: true, username: true } },
      players: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <LobbyClient
      games={games}
      currentUser={{ id: session.user.id, name: session.user.name! }}
    />
  )
}
