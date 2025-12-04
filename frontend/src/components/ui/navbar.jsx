import { useMemo } from "react"
import {
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import { logout } from "@/store/slices/authSlice"

export function Navbar({
  onToggleSidebar,
  profile,
  notifications = [],
  onViewAllNotifications,
  onToggleTheme,
  theme = "dark",
}) {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const summary = useMemo(
    () => ({
      level: profile?.level ?? "Tier 2",
      streak: profile?.streak ?? 6,
      points: profile?.xp ?? 1280,
    }),
    [profile]
  )

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-black/60 via-slate-900/70 to-black/40 px-4 py-3 backdrop-blur-2xl">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Active Clearance</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            {summary.level}
            <Badge variant="success" className="text-[10px] tracking-wide">
              {summary.streak}-day streak
            </Badge>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* THEME SWITCH */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="hidden md:flex"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* XP Badge */}
        {user && (
          <motion.div
            className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            {summary.points} XP
          </motion.div>
        )}

        {/* If NOT logged in → login + register */}
        {!user && (
          <>
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-sm flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" /> Login
            </Button>

            <Button
              onClick={() => navigate("/register")}
              className="text-sm flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
            >
              <UserPlus className="h-4 w-4" /> Register
            </Button>
          </>
        )}

        {/* Logged-in UI */}
        {user && (
          <>
            {/* Notifications */}
            <NotificationDropdown onViewAll={onViewAllNotifications} />

            {/* PROFILE BUBBLE (FIXED) */}
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 cursor-pointer hover:bg-white/10 transition"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 text-center text-sm font-bold leading-8">
                {profile?.name?.[0] ?? "K"}
              </div>

              <div className="hidden md:block text-xs leading-tight">
                <p className="font-semibold text-foreground">
                  {profile?.name ?? "Kaavach Agent"}
                </p>
                <p className="text-muted-foreground capitalize">
                  {profile?.role ?? "hacker"}
                </p>
              </div>
            </div>

            {/* LOGOUT */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
