#!/usr/bin/env node
/**
 * Generate VAPID key pair for Web Push. Add to .env.local:
 *
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:you@example.com
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...  (same as VAPID_PUBLIC_KEY)
 */
import webpush from "web-push"

const keys = webpush.generateVAPIDKeys()
console.log("Add these to .env.local:\n")
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log("VAPID_SUBJECT=mailto:support@fridgetomeals.com")
