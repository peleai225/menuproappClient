"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { requestFcmToken, getFirebaseMessaging } from "@/lib/firebase"
import { onMessage } from "firebase/messaging"
import { updateFcmToken } from "@/lib/services"
import { useAuth } from "@/store/auth"

export function useFcm() {
  const token = useAuth((s) => s.token)
  const registered = useRef(false)

  useEffect(() => {
    if (!token || registered.current) return
    if (typeof window === "undefined" || !("Notification" in window)) return

    registered.current = true

    requestFcmToken().then((fcmToken) => {
      if (!fcmToken) return
      updateFcmToken(fcmToken).catch(() => {})
    })

    const messaging = getFirebaseMessaging()
    if (!messaging) return

    const unsub = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "MenuPro"
      const body  = payload.notification?.body  ?? ""
      const data  = payload.data ?? {}

      // Notification avec lien vers la commande si dispo
      if (data.order_id) {
        toast.info(title, {
          description: body,
          action: {
            label: "Suivre",
            onClick: () => {
              window.location.href = `/orders/${data.order_id}`
            },
          },
        })
      } else {
        toast.info(title, { description: body })
      }
    })

    return () => unsub()
  }, [token])
}
