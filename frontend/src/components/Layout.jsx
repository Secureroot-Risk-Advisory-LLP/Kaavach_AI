// frontend/src/components/Layout.jsx
import { Outlet, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ActivitySquare,
  Bug,
  Building2,
  Compass,
  Cpu,
  GraduationCap,
  Home,
  Layers,
  LineChart,
  ListChecks,
  Shield,
  UsersRound,
  User   // ✅ FIXED
} from "lucide-react"


import { Sidebar } from "@/components/ui/sidebar"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toggleTheme } from "@/store/slices/themeSlice"

const Layout = () => {
  const { user } = useSelector((state) => state.auth)
  const { theme } = useSelector((state) => state.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const navSections = useMemo(() => {
    const role = user?.role

    return [
      {
        label: "Explore",
        items: [
          { label: "Home", to: "/", icon: Home },
          { label: "Programs", to: "/programs", icon: Compass },
          { label: "Feed", to: "/feed", icon: Layers },
          { label: "Leaderboard", to: "/leaderboard", icon: LineChart },
        ],
      },

      {
        label: "Dashboards",
        items: [
          role === "hacker" && { label: "Hacker HQ", to: "/dashboard/hacker", icon: Bug },
          role === "company" && { label: "Company Ops", to: "/dashboard/company", icon: Building2 },
          role === "admin" && { label: "Admin Command", to: "/dashboard/admin", icon: Shield },
        ].filter(Boolean),
      },

      {
        label: "Analytics",
        items: [
          role === "hacker" && { label: "My Analytics", to: "/analytics/hacker", icon: ActivitySquare },
          role === "company" && { label: "Company Analytics", to: "/analytics/company", icon: LineChart },
          role === "admin" && { label: "Admin Analytics", to: "/analytics/admin", icon: LineChart },
        ].filter(Boolean),
      },

      // ✅ FIXED: all routes here match App.jsx exactly
      {
  label: "Intelligence",
  items: [
    { label: "My Profile", to: "/profile", icon: UsersRound },
    { label: "Knowledge Base", to: "/kb", icon: GraduationCap },
    { label: "Marketplace", to: "/marketplace", icon: Layers },
    { label: "Writeups", to: "/writeups", icon: Bug },
    { label: "Job Board", to: "/jobs", icon: UsersRound },
    { label: "Breach Alerts", to: "/breach-alerts", icon: Shield },
  ],
},

  ,
    ]
  }, [user])

  const quickStats = [
    { label: "Programs Live", value: "124", trend: "+8%", color: "text-cyan-300" },
    { label: "Reports Today", value: "312", trend: "+21%", color: "text-emerald-300" },
    { label: "Avg bounty", value: "$1.8k", trend: "+5%", color: "text-amber-300" },
  ]

  const shellProfile = {
    name: user?.name ?? "Agent Zero",
    role: user?.role ?? "hacker",
    xp: user?.xp ?? 1260,
    level: user?.tier ?? "Tier 2",
    streak: user?.streak ?? 3,
  }

  return (
    <div className="relative flex min-h-screen bg-[#020617] text-foreground">
      {/* SIDEBAR – desktop */}
      <Sidebar sections={navSections} className="hidden lg:flex" />

      <div className="flex w-full flex-col lg:pl-0">
        {/* NAVBAR */}
        <Navbar
          profile={shellProfile}
          notifications={[]}
          onToggleSidebar={() => setSidebarOpen(true)}
          onToggleTheme={() => dispatch(toggleTheme())}
          onViewAllNotifications={() => navigate("/notifications")}
          theme={theme}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
            {/* QUICK STATS */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="glass-panel rounded-2xl border border-white/5 p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-xs uppercase text-muted-foreground">{stat.label}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className={cn("text-3xl font-semibold", stat.color)}>{stat.value}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {stat.trend}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </section>

            {/* HERO PANEL */}
            <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/5 p-6">
              <motion.div
                className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] font-black text-white/5 hidden xl:block pointer-events-none select-none"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 20 }}
              >
                KAAVACH
              </motion.div>

              <div className="relative space-y-4">
                <Badge variant="outline" className="text-xs">
                  Mission Control
                </Badge>

                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                  Elite Threat Intelligence & Bug Bounty Command Center
                </h1>

                <p className="max-w-3xl text-sm text-muted-foreground">
                  Operate with precision. Launch programs, manage reports, and command intelligence in a
                  next-gen cyber interface.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate("/programs")}>Explore Programs</Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        shellProfile.role === "company"
                          ? "/dashboard/company"
                          : shellProfile.role === "admin"
                          ? "/dashboard/admin"
                          : "/dashboard/hacker"
                      )
                    }
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* PAGE CONTENT */}
            <section className="rounded-3xl border border-white/5 bg-white/5 p-4 min-h-[400px]">
              <Outlet />
            </section>
          </div>
        </main>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden">
          <div className="absolute inset-y-0 left-0 w-72">
            <Sidebar sections={navSections} className="h-full" />
          </div>
          <button
            className="absolute inset-0"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

export default Layout
