import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  BadgeAlert,
  BadgeCheck,
  ChevronRight,
  Globe,
  Layers,
  Map,
  Search,
  ShieldHalf,
} from "lucide-react"
import toast from "react-hot-toast"

import { programService } from "@/services/programService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const severityLevels = ["low", "medium", "high", "critical"]
const programTypes = ["public", "private"]
const tagOptions = ["web", "api", "mobile", "iot", "cloud", "appsec", "cloudsec"]
const lastUpdatedOptions = [
  { label: "Any time", value: "any" },
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
]

const Programs = () => {
  const [programs, setPrograms] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    severity: [],
    types: [],
    tags: [],
    reward: [0, 50000],
    lastUpdated: "any",
  })
  const observerRef = useRef(null)

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    loadPrograms(1, false)
  }, [filters.status])

  useEffect(() => {
    if (!hasMore || loading) return
    const sentinel = observerRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadPrograms(page + 1, true)
        }
      },
      { threshold: 1 }
    )
    if (sentinel) observer.observe(sentinel)
    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [page, hasMore, loading])

  const loadPrograms = async (targetPage, append) => {
    try {
      append ? setIsFetchingMore(true) : setLoading(true)
      const payload = {
        page: targetPage,
        limit: 6,
        severity: filters.severity.join(","),
      }
      if (filters.status !== "all") {
        payload.status = filters.status
      }
      const data = await programService.getPrograms(payload)
      setPrograms((prev) => (append ? [...prev, ...(data.programs || [])] : data.programs || []))
      setPage(targetPage)
      setHasMore(targetPage < (data.totalPages || 1))
    } catch (error) {
      toast.error("Unable to load programs")
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
    }
  }

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesSearch =
        !filters.search ||
        program.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        program.description?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesSeverity =
        filters.severity.length === 0 ||
        program.severityLevels?.some((sev) => filters.severity.includes(sev))

      const rewardMin = program.rewardRange?.min || 0
      const rewardMax = program.rewardRange?.max || 0
      const matchesReward =
        rewardMin <= filters.reward[1] && rewardMax >= filters.reward[0]

      const matchesType =
        filters.types.length === 0 || filters.types.includes(program.visibility || "public")

      const matchesTags =
        filters.tags.length === 0 ||
        program.tags?.some((tag) => filters.tags.includes(tag.toLowerCase()))

      const matchesLastUpdated = (() => {
        if (filters.lastUpdated === "any") return true
        const map = { "24h": 1, "7d": 7, "30d": 30 }
        const days = map[filters.lastUpdated]
        const updatedAt = program.updatedAt || program.createdAt
        if (!updatedAt || !days) return true
        const diff =
          (Date.now() - new Date(updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
        return diff <= days
      })()

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesReward &&
        matchesType &&
        matchesTags &&
        matchesLastUpdated
      )
    })
  }, [programs, filters])

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key]
      const next = current.includes(value)
      return {
        ...prev,
        [key]: next ? current.filter((item) => item !== value) : [...current, value],
      }
    })
  }

  const getStatusVariant = (status) => (status === "active" ? "success" : "outline")

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Programs</p>
          <h1 className="text-3xl font-semibold text-white">Live bounty missions</h1>
          <p className="text-sm text-muted-foreground">
            Filter by severity, tags, reward tiers, and program visibility.
          </p>
        </div>
        <Button onClick={() => loadPrograms(1, false)} variant="outline">
          Refresh directory
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="glass-panel rounded-3xl border-white/10 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-300" />
            <p className="text-sm font-semibold text-white">Advanced filters</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Active", value: "active" },
                  { label: "Archived", value: "inactive" },
                  { label: "All", value: "all" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={filters.status === option.value ? "default" : "ghost"}
                    className="rounded-full px-4 text-xs"
                    onClick={() => setFilters((prev) => ({ ...prev, status: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Program, company, tag"
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Severity focus
              </label>
              <div className="flex flex-wrap gap-2">
                {severityLevels.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={filters.severity.includes(level) ? "default" : "ghost"}
                    className="rounded-full px-4 text-xs capitalize"
                    onClick={() => toggleFilter("severity", level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Reward range
              </label>
              <Slider
                min={0}
                max={100000}
                step={1000}
                value={filters.reward}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, reward: value }))}
              />
              <p className="text-xs text-muted-foreground">
                ${filters.reward[0].toLocaleString()} - ${filters.reward[1].toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Program type
              </label>
              <div className="space-y-2">
                {programTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm capitalize">
                    <Checkbox
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => toggleFilter("types", type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter("tags", tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Last updated
              </label>
              <div className="grid gap-2">
                {lastUpdatedOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <span>{option.label}</span>
                    <input
                      type="radio"
                      className="accent-cyan-400"
                      checked={filters.lastUpdated === option.value}
                      onChange={() => setFilters((prev) => ({ ...prev, lastUpdated: option.value }))}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-40 rounded-3xl" />
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="glass-panel rounded-3xl border-white/10 p-10 text-center text-muted-foreground">
              No programs match the current filters.
            </div>
          ) : (
            <>
              {filteredPrograms.map((program) => (
                <motion.div
                  key={program._id}
                  className="glass-panel flex flex-col gap-4 rounded-3xl border-white/10 p-6 md:flex-row"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusVariant(program.status)}>
                        {program.status?.toUpperCase()}
                      </Badge>
                      {program.visibility && (
                        <Badge variant="outline" className="uppercase">
                          {program.visibility}
                        </Badge>
                      )}
                    </div>
                    <Link to={`/programs/${program._id}`}>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{program.title}</h2>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {program.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ShieldHalf className="h-4 w-4 text-cyan-300" />
                        {program.severityLevels?.join(" • ")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Globe className="h-4 w-4 text-cyan-300" />
                        {program.createdBy?.companyName || program.createdBy?.name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BadgeAlert className="h-4 w-4 text-cyan-300" />$
                        {program.rewardRange?.min?.toLocaleString()} - $
                        {program.rewardRange?.max?.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {program.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="capitalize">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:w-56">
                    <div className="rounded-2xl border border-white/10 p-4 text-sm">
                      <p className="text-muted-foreground">Scope coverage</p>
                      <p className="text-xl font-semibold text-white">{program.scope?.length || "Global"}</p>
                      <p className="text-xs text-muted-foreground">
                        Includes {program.scope?.allowed?.length || 0} assets
                      </p>
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/programs/${program._id}`}>
                        View mission
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <div ref={observerRef} className="py-6 text-center text-sm text-muted-foreground">
                  {isFetchingMore ? "Loading more programs..." : "Scroll to load more"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Programs

