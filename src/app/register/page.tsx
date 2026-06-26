"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "../login/login.module.css"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const data = new FormData(e.currentTarget)
    const username = data.get("username") as string
    const password = data.get("password") as string
    const confirm = data.get("confirm") as string

    if (password !== confirm) {
      setError("Hesla se neshodují")
      return
    }

    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)

    if (res.ok) {
      router.push("/login")
    } else {
      const body = await res.json()
      setError(body.error ?? "Chyba při registraci")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>✦ <span>DIVU</span>KRAJ ✦</h1>
        <p className={styles.subtitle}>Nový hráč v lese</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoFocus
              minLength={2}
              maxLength={20}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Heslo</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm">Heslo znovu</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Registruji..." : "Vstoupit do lesa"}
          </button>
        </form>

        <p className={styles.link}>
          Máš účet? <Link href="/login">Přihlásit se</Link>
        </p>
      </div>
    </div>
  )
}
