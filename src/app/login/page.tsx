"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./login.module.css"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = new FormData(e.currentTarget)

    const result = await signIn("credentials", {
      username: data.get("username"),
      password: data.get("password"),
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError("Nesprávné jméno nebo heslo")
    } else {
      router.push("/lobby")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>✦ <span>DIVU</span>KRAJ ✦</h1>
        <p className={styles.subtitle}>Přihlaste se pro vstup do lesa</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Heslo</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Přihlašuji..." : "Vstoupit do lesa"}
          </button>
        </form>

        <p className={styles.link}>
          Ještě nemáš účet?{" "}
          <Link href="/register">Zaregistrovat se</Link>
        </p>
      </div>
    </div>
  )
}
