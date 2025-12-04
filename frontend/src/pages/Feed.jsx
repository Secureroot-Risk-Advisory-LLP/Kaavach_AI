import { useState, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { formatDistanceToNow } from "date-fns"
import {
  Camera,
  Flame,
  Hash,
  Heart,
  ImagePlus,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react"
import toast from "react-hot-toast"

import { feedService } from "@/services/feedService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/ui/file-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const filterTabs = [
  { label: "Top", value: "top" },
  { label: "Recent", value: "recent" },
  { label: "Most Commented", value: "comments" },
]

const trendingHashtags = ["#zeroday", "#xss", "#bugbounty", "#cyberintel", "#patchtuesday"]

const Feed = () => {
  const { user, token } = useSelector((state) => state.auth)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("recent")
  const [typeFilter, setTypeFilter] = useState("all")
  const [commentText, setCommentText] = useState({})
  const [composer, setComposer] = useState({
    type: "general",
    title: "",
    content: "",
    tags: [],
    pollOptions: ["", ""],
    jobDetails: {
      position: "",
      location: "",
      salary: "",
      requirements: [],
    },
    media: null,
  })

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      setLoading(true)
      const data = await feedService.getFeed()
      setPosts(data.posts || [])
    } catch (error) {
      toast.error("Failed to fetch feed")
    } finally {
      setLoading(false)
    }
  }

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  const handleCreatePost = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...composer,
        type: composer.type === "poll" ? "general" : composer.type,
      }
      if (composer.media) {
        payload.image = await convertFileToBase64(composer.media)
      }
      if (composer.tags.length) {
        payload.tags = composer.tags
      }
      if (payload.pollOptions?.some((opt) => opt.trim())) {
        payload.poll = { options: composer.pollOptions.filter((opt) => opt.trim()) }
      }
      delete payload.media
      await feedService.createPost(payload)
      toast.success("Transmission published")
      setComposerOpen(false)
      setComposer({
        type: "general",
        title: "",
        content: "",
        tags: [],
        pollOptions: ["", ""],
        jobDetails: {
          position: "",
          location: "",
          salary: "",
          requirements: [],
        },
        media: null,
      })
      fetchFeed()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish")
    }
  }

  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Please login to engage")
      return
    }
    try {
      const updatedPost = await feedService.toggleLike(postId)
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)))
    } catch {
      toast.error("Unable to update like")
    }
  }

  const handleComment = async (postId) => {
    const text = commentText[postId]
    if (!text?.trim()) return
    try {
      const updatedPost = await feedService.addComment(postId, text)
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)))
      setCommentText((prev) => ({ ...prev, [postId]: "" }))
    } catch {
      toast.error("Unable to comment")
    }
  }

  const sortedPosts = useMemo(() => {
    const base = [...posts]
    if (typeFilter !== "all") {
      base.splice(
        0,
        base.length,
        ...posts.filter((post) => post.type === typeFilter)
      )
    }
    switch (activeFilter) {
      case "top":
        return base.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      case "comments":
        return base.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
      default:
        return base.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }, [posts, activeFilter, typeFilter])

  const isLiked = (post) => post.likes?.some((like) => like.user?._id === user?._id)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Community intel
            </p>
            <h1 className="text-3xl font-semibold text-white">Global feed</h1>
          </div>
          {token && (
            <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl rounded-3xl border-white/10 bg-[#050a1f]/95">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">Broadcast to the network</DialogTitle>
                </DialogHeader>
                <form className="space-y-6" onSubmit={handleCreatePost}>
                  <div className="flex flex-wrap gap-2">
                    {["general", "achievement", "job", "freelance", "poll"].map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={composer.type === type ? "default" : "ghost"}
                        className="rounded-full px-4 capitalize"
                        onClick={() => setComposer((prev) => ({ ...prev, type }))}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Title"
                    value={composer.title}
                    onChange={(e) => setComposer((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Share intel, drop updates, or brief the team..."
                    rows={4}
                    value={composer.content}
                    onChange={(e) => setComposer((prev) => ({ ...prev, content: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={composer.tags.join(", ")}
                    onChange={(e) =>
                      setComposer((prev) => ({
                        ...prev,
                        tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                      }))
                    }
                  />
                  {composer.type === "poll" && (
                    <div className="space-y-3 rounded-2xl border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Poll options</p>
                      {composer.pollOptions.map((option, idx) => (
                        <Input
                          key={idx}
                          value={option}
                          placeholder={`Option ${idx + 1}`}
                          onChange={(e) =>
                            setComposer((prev) => {
                              const next = [...prev.pollOptions]
                              next[idx] = e.target.value
                              return { ...prev, pollOptions: next }
                            })
                          }
                        />
                      ))}
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setComposer((prev) => ({
                            ...prev,
                            pollOptions: [...prev.pollOptions, ""],
                          }))
                        }
                      >
                        Add option
                      </Button>
                    </div>
                  )}
                  {(composer.type === "job" || composer.type === "freelance") && (
                    <div className="rounded-2xl border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Opportunity details</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Position"
                          value={composer.jobDetails.position}
                          onChange={(e) =>
                            setComposer((prev) => ({
                              ...prev,
                              jobDetails: { ...prev.jobDetails, position: e.target.value },
                            }))
                          }
                        />
                        <Input
                          placeholder="Location"
                          value={composer.jobDetails.location}
                          onChange={(e) =>
                            setComposer((prev) => ({
                              ...prev,
                              jobDetails: { ...prev.jobDetails, location: e.target.value },
                            }))
                          }
                        />
                        <Input
                          placeholder="Salary / Budget"
                          value={composer.jobDetails.salary}
                          onChange={(e) =>
                            setComposer((prev) => ({
                              ...prev,
                              jobDetails: { ...prev.jobDetails, salary: e.target.value },
                            }))
                          }
                        />
                        <Input
                          placeholder="Requirements (comma separated)"
                          value={composer.jobDetails.requirements.join(", ")}
                          onChange={(e) =>
                            setComposer((prev) => ({
                              ...prev,
                              jobDetails: {
                                ...prev.jobDetails,
                                requirements: e.target.value
                                  .split(",")
                                  .map((r) => r.trim())
                                  .filter(Boolean),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                  <FileUpload
                    label="Attach media"
                    helperText="PNG, JPG, PDF up to 10MB"
                    value={composer.media ? [composer.media] : []}
                    multiple={false}
                    onChange={(file) =>
                      setComposer((prev) => ({
                        ...prev,
                        media: Array.isArray(file) ? file[0] : file,
                      }))
                    }
                  />
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setComposerOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Publish</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {filterTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeFilter === tab.value ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setActiveFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            {["all", "general", "achievement", "job", "freelance"].map((type) => (
              <Badge
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <Card className="rounded-3xl border-white/10 bg-white/5 p-10 text-center text-muted-foreground">
            No transmissions match this filter.
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <Card key={post._id} className="rounded-3xl border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/20 text-center text-lg font-bold leading-[48px] text-cyan-200">
                    {post.author?.name?.[0]?.toUpperCase() ?? "K"}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-white">{post.author?.name || post.author?.companyName}</span>
                      <Badge variant="outline" className="capitalize">
                        {post.type}
                      </Badge>
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-white">{post.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/5">
                        <img src={post.image} alt="post attachment" className="h-auto w-full object-cover" />
                      </div>
                    )}
                    {post.jobDetails && (post.type === "job" || post.type === "freelance") && (
                      <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 p-4 text-xs text-muted-foreground sm:grid-cols-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Position</p>
                          <p className="text-white">{post.jobDetails.position || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Location</p>
                          <p className="text-white">{post.jobDetails.location || "Remote"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Budget</p>
                          <p className="text-white">{post.jobDetails.salary || "Confidential"}</p>
                        </div>
                      </div>
                    )}
                    {post.poll?.options && (
                      <div className="mt-4 space-y-2 rounded-2xl border border-white/10 p-4">
                        {post.poll.options.map((option, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="h-2 flex-1 rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-cyan-400/60" style={{ width: `${Math.random() * 70 + 20}%` }} />
                            </div>
                            <span className="text-xs text-white">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-sm text-muted-foreground">
                      <button
                        className={cn("flex items-center gap-2 transition", isLiked(post) && "text-rose-400")}
                        onClick={() => handleLike(post._id)}
                      >
                        <Heart className={cn("h-5 w-5", isLiked(post) && "fill-current")} /> {post.likes?.length || 0}
                      </button>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" /> {post.comments?.length || 0}
                      </div>
                      <button className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" /> Share
                      </button>
                    </div>
                    {token && (
                      <div className="mt-4 flex items-center gap-2">
                        <Input
                          placeholder="Leave a comment"
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleComment(post._id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                      {post.comments?.map((comment) => (
                        <div key={comment._id} className="flex gap-3 text-sm text-muted-foreground">
                          <div className="h-8 w-8 rounded-full bg-white/5 text-center text-xs font-semibold leading-8">
                            {comment.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground/70">
                              {comment.user?.name} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                            <p className="text-white">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <Card className="rounded-3xl border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Hash className="h-5 w-5 text-cyan-300" />
            Trending hashtags
          </div>
          <div className="mt-4 space-y-2">
            {trendingHashtags.map((tag) => (
              <div key={tag} className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{tag}</span>
                <Badge variant="outline">+{Math.floor(Math.random() * 40)}%</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Flame className="h-5 w-5 text-amber-300" />
            Mission signals
          </div>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-cyan-300" /> Media uploads enabled
            </p>
            <p className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-cyan-300" /> Polls + tagging live
            </p>
            <p className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-cyan-300" /> Daily spotlight soon
            </p>
          </div>
        </Card>
      </aside>
    </div>
  )
}

export default Feed

