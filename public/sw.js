/* PWA service worker: network-only fetch + Web Push. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request))
})

self.addEventListener("push", (event) => {
  let payload = {
    title: "Today's picks are ready",
    body: "Open Fridge To Meals to see your meal ideas.",
    url: "/todays-picks",
  }
  try {
    if (event.data) {
      const parsed = event.data.json()
      if (parsed && typeof parsed === "object") {
        payload = { ...payload, ...parsed }
      }
    }
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url || "/todays-picks" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/todays-picks"
  const target = new URL(url, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target)
      }
    })
  )
})
