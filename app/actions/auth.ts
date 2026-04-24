"use server"

import { signOut } from "@/lib/proxy"

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}
