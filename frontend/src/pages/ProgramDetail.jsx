import { useState, useEffect, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  Compass,
  Globe,
  MapPinned,
  Shield,
  Target,
  Users2,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { programService } from "@/services/programService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const getSeverityPalette = {
  low: "#34d399",
  medium: "#fb923c",
  high: "#f97316",
  critical: "#ef4444",
}

const ProgramDetail = () => {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true)
        const data = await programService.getProgram(id)
        setProgram(data)
      } catch (error) {
        toast.error("Failed to fetch program details")
        navigate("/programs")
      } finally {
        setLoading(false)
      }
    }
    fetchProgram()
  }, [id, navigate])

  const scopeMatrix = useMemo(() => {
    if (!program) {
      return {
        allowed: [],
        disallowed: [],
      }
    }
    const fallbackDomain = program.createdBy?.companyName?.toLowerCase().replace(/\s+/g, "") || "target"
    return {
      allowed: program.scope?.allowed ?? [`*.${fallbackDomain}.com`, `api.${fallbackDomain}.com`, `login.${fallbackDomain}.com`],
      disallowed: program.scope?.disallowed ?? [`internal.${fallbackDomain}.com`, `admin.${fallbackDomain}.com`],
    }
  }, [program])

  const rewardHistogram = useMemo(() => {
    if (!program) return []
    const { rewardRange } = program
    const min = rewardRange?.min ?? 0
    const max = rewardRange?.max ?? 0
    const tiers = program.severityLevels?.length
      ? program.severityLevels
      : ["low", "medium", "high", "critical"]

    return tiers.map((tier, idx) => ({
      severity: tier.toUpperCase(),
      reward: Math.round(min + ((max - min) * (idx + 1)) / tiers.length),
      fill: getSeverityPalette[tier] ?? "#38bdf8",
    }))
  }, [program])

  const activityTimeline = useMemo(() => {
    if (!program) return []
    return Array.from({ length: 6 }).map((_, idx) => ({
      month: `M${idx + 1}`,
      reports: Math.floor(Math.random() * 12) + 3,
      accepted: Math.floor(Math.random() * 8) + 1,
    }))
  }, [program])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Program not found</p>
        <Button asChild className="mt-4">
          <Link to="/programs">Back to programs</Link>
        </Button>
      </div>
    )
  }

  const companyMeta = {
    name: program.createdBy?.companyName || program.createdBy?.name || "Confidential Org",
    reputation: program.createdBy?.reputationScore ?? 92,
    responseSLA: program.createdBy?.avgResponseHours ?? 36,
    bountyFloor: program.rewardRange?.min ?? 0,
    bountyCeil: program.rewardRange?.max ?? 0,
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="w-fit gap-2" asChild>
        <Link to="/programs">
          <ArrowLeft className="h-4 w-4" />
          Back to programs
        </Link>
      </Button>

      <section className="glass-panel rounded-4xl border border-white/5 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="outline" className="uppercase text-xs tracking-[0.4em]">
              {program.visibility ?? "PUBLIC"}
            </Badge>
            <h1 className="text-4xl font-semibold text-white">{program.title}</h1>
            <p className="text-sm text-muted-foreground">
              {companyMeta.name} • Launched {new Date(program.createdAt).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant={program.status === "active" ? "success" : "warning"}>{program.status}</Badge>
              <Badge variant="outline" className="text-xs">
                {program.severityLevels?.join(" • ") || "All severities"}
              </Badge>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reward band</p>
            <p className="text-3xl font-semibold text-white">
              ${companyMeta.bountyFloor.toLocaleString()} – ${companyMeta.bountyCeil.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Avg response {companyMeta.responseSLA}h</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-cyan-300" />
              Severity vs reward
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="severity" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartTooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.2)",
                  }}
                />
                <Bar dataKey="reward" radius={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users2 className="h-5 w-5 text-cyan-300" />
              Activity timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTimeline}>
                <defs>
                  <linearGradient id="reports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartTooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.2)",
                  }}
                />
                <Area type="monotone" dataKey="reports" stroke="#06b6d4" fillOpacity={1} fill="url(#reports)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-cyan-300" />
              Reputation indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase text-muted-foreground">Org reputation</p>
              <p className="mt-1 text-3xl font-semibold text-white">{companyMeta.reputation}/100</p>
              <p className="text-xs text-muted-foreground">Consistent payouts & fast acknowledgements</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase text-muted-foreground">Reward reliability</p>
              <div className="mt-2 flex items-center gap-2 text-emerald-300">
                <BadgeCheck className="h-5 w-5" />
                Guaranteed within 7 business days
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase text-muted-foreground">Scope freshness</p>
              <div className="mt-2 flex items-center gap-2 text-cyan-200">
                <Target className="h-5 w-5" />
                Updated {new Date(program.updatedAt || program.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Compass className="h-5 w-5 text-cyan-300" />
              Scope intel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-white/0 p-6">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Allowed assets</p>
                  <p className="text-2xl font-semibold text-white">{scopeMatrix.allowed.length}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Out-of-scope</p>
                  <p className="text-2xl font-semibold text-white">{scopeMatrix.disallowed.length}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Allowed targets</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {scopeMatrix.allowed.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-cyan-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Disallowed</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {scopeMatrix.disallowed.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-rose-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 p-5">
              <p className="text-xs uppercase text-muted-foreground">Scope heatmap</p>
              <div className="cyber-grid mt-3 h-48 rounded-2xl border border-white/10">
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-muted-foreground">
                  {companyMeta.name} attack surface
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-cyan-300" />
              Company dossier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mission brief</p>
              <ReactMarkdown className="prose prose-invert mt-2 max-w-none text-sm">
                {program.description || "No description provided."}
              </ReactMarkdown>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Rules of engagement</p>
              <ReactMarkdown className="prose prose-invert mt-2 max-w-none text-sm">
                {program.rules || "Refer to company policy."}
              </ReactMarkdown>
            </div>
            {user?.role === "hacker" && program.status === "active" && (
              <Button className="w-full rounded-2xl text-base" onClick={() => navigate("/dashboard/hacker")}>
                Submit a report
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default ProgramDetail

