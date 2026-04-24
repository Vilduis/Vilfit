import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1)

      if (existing.length === 0) {
        await db.insert(users).values({
          id: user.id ?? crypto.randomUUID(),
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
          role: null,
        })
      }

      return true
    },
    async jwt({ token, trigger }) {
      // Re-fetch from DB on sign-in or whenever role is missing from token
      if (trigger === "signIn" || !token.id || !token.role) {
        if (token.email) {
          const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.email, token.email as string))
            .limit(1)
          if (dbUser[0]) {
            token.id = dbUser[0].id
            token.role = dbUser[0].role
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // @ts-expect-error - extending session type
        session.user.role = token.role ?? null
      }
      return session
    },
  },
})
