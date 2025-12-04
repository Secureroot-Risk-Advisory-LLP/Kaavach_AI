import { useEffect, useState } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Bell, CheckCircle2, Circle, Flame, Trophy } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { useSelector } from "react-redux"
import { notificationService } from "@/services/notificationService"
import { initSocket, getSocket } from "@/utils/socket"

// Map backend notification types → icons
const iconMap = {
  reward: Trophy,
  badge: CheckCircle2,
  streak: Flame,
  default: Circle,
}

export function NotificationDropdown({ onViewAll }) {
  const { user } = useSelector((state) => state.auth)
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const unreadCount = items.filter((n) => !n.read).length

  // Load notifications initially
  const loadNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications()
      setItems(res.data)
    } catch (e) {
      console.error("Notification load error:", e)
    }
  }

  // Mark single notification read
  const markRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
    } catch (e) {
      toast.error("Failed to mark read")
    }
  }

  // Mark ALL notifications read
  const markAll = async () => {
    try {
      await notificationService.markAllRead()
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (e) {
      toast.error("Failed to mark all read")
    }
  }

  // SOCKET LISTENER
  useEffect(() => {
    if (!user) return

    // 👉 Step 3: Initialize socket for this user
    const socket = initSocket(user._id)

    loadNotifications()

    const handler = (payload) => {
      toast.success(payload.title)
      setItems((prev) => [payload, ...prev])
    }

    socket.on("notification", handler)

    return () => {
      socket.off("notification", handler)
    }
  }, [user])

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-[1.5rem] justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        className="z-50 w-[320px] rounded-2xl border border-white/10 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl"
      >
        {/* HEADER */}
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
          Notifications
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              className="text-[10px] uppercase tracking-wide text-muted-foreground hover:text-cyan-300"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-xs text-muted-foreground">
              You’re up to date. Stay sharp, agent.
            </div>
          )}

          {items.map((item) => {
            const Icon = iconMap[item.type] ?? iconMap.default
            return (
              <div
                key={item._id}
                className={cn(
                  "rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-xs shadow-inner transition hover:border-cyan-300/30",
                  !item.read && "border-cyan-300/40 bg-cyan-400/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white/10 p-2">
                    <Icon className="h-4 w-4 text-cyan-200" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <p className="text-sm text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.body}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!item.read && (
                    <button
                      onClick={() => markRead(item._id)}
                      className="text-[10px] px-2 py-1 rounded bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-200"
                    >
                      Mark
                    </button>
                  )}
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    className="mt-2 inline-block text-[11px] text-cyan-300 hover:underline"
                  >
                    Open →
                  </a>
                )}
              </div>
            )
          })}
        </div>

        {/* FOOTER */}
        <Button
          variant="ghost"
          className="mt-3 w-full text-xs"
          onClick={onViewAll}
        >
          View all alerts
        </Button>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
