import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowUpRight,
  Award,
  Building2,
  Globe2,
  Layers,
  Shield,
  Star,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Home = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const heroStats = [
    { label: "Programs live", value: "312", detail: "+28 in last 30 days" },
    { label: "Rewards issued", value: "$2.7M", detail: "Distributed to hackers" },
    { label: "Average SLA", value: "48h", detail: "Response time" },
  ]

  const showcase = [
    { title: "Marketplace", path: "/marketplace", desc: "Buy & sell tooling, templates, and playbooks." },
    { title: "Writeups Hub", path: "/writeups", desc: "Deep-dive research drops from elite hunters." },
    { title: "Job Board", path: "/jobs", desc: "Freelance and full-time security missions." },
    { title: "Dark Web Intel", path: "/breach-alerts", desc: "Mock breach alerts and posture scoring." },
  ]

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/80 to-black px-6 py-12 md:px-12">

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">

          <div className="space-y-6">
            <Badge variant="outline" className="text-xs uppercase tracking-wide text-cyan-200">
              Enterprise bug bounty cloud
            </Badge>

            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Operate a HackerOne-caliber bounty program with AI copilots.
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl">
              Kaavach AI unifies program management, automation, analytics and cyberpunk UI in one platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              {!user && (
                <>
                  <Button size="lg" onClick={() => navigate("/register")}>Create your account</Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/login")}
                    className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    Login <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {user && (
                <>
                  <Button size="lg" onClick={() => navigate(`/dashboard/${user.role}`)}>
                    Go to Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/programs")}
                    className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    Explore Programs <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Card */}
          <Card className="rounded-3xl border-white/10 bg-white/5 p-6">
            <CardContent className="space-y-4 p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Live signal</p>
                  <h3 className="text-2xl font-semibold text-white">Threat Pulse</h3>
                </div>
                <Star className="h-10 w-10 text-amber-300" />
              </div>

              <div className="space-y-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-xs uppercase text-muted-foreground">{stat.label}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-white">{stat.value}</span>
                      <span className="text-xs text-emerald-300">{stat.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-white/10 bg-gradient-to-br from-cyan-500/15 to-blue-600/10 p-6">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">Kaavach surfaces</h3>
              <Badge variant="outline" className="text-xs">New in v2.0</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {showcase.map((card) => (
                <div
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="cursor-pointer rounded-2xl border border-white/10 p-4 hover:bg-white/10 transition"
                >
                  <p className="text-lg font-semibold text-white">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="glass-panel flex flex-col justify-between rounded-3xl border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Next-gen security</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">
              Deploy the premium bounty stack
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Kaavach AI ships with real-time sockets, AI copilots, enterprise workflows and cyberglass UI.
            </p>
          </div>

          {!user && (
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/register")}>
              Activate your program
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
