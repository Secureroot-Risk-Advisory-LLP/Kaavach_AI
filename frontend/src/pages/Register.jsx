import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck, Building2, Lock, Mail, Shield, User } from "lucide-react"
import toast from "react-hot-toast"

import { loginSuccess } from "@/store/slices/authSlice"
import { authService } from "@/services/authService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schema = z
  .object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Valid email required"),
    role: z.enum(["hacker", "company"]),
    companyName: z.string().optional(),
    companyWebsite: z.string().url().optional().or(z.literal("")),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "hacker",
      companyName: "",
      companyWebsite: "",
      password: "",
      confirmPassword: "",
    },
  })

  const watchRole = form.watch("role")

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      const { confirmPassword, ...payload } = values
      const data = await authService.register(payload)
      dispatch(loginSuccess({ user: data, token: data.token }))
      toast.success("Welcome aboard, agent.")
      if (data.role === "hacker") navigate("/dashboard/hacker")
      else if (data.role === "company") {
        navigate("/dashboard/company")
        toast.success("Company access pending admin verification")
      } else navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#01030f] px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.2),_transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 p-8">
          <CardContent className="space-y-8 p-0">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-cyan-200">Kaavach Elite</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">
                Create your security profile
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Choose your role, link your company, and activate AI copilots instantly.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "Hacker HQ", desc: "Advanced analytics, XP, streaks, and rewards." },
                { title: "Company Shield", desc: "Program orchestration and triage automation." },
                { title: "Marketplace", desc: "Sell tools, publish writeups, hire elite hunters." },
                { title: "AI Copilot", desc: "Suggest CVSS, summaries, and fix templates." },
              ].map((item) => (
                <div key={item.title} className="glass-panel rounded-2xl p-4">
                  <BadgeCheck className="mb-3 h-6 w-6 text-cyan-300" />
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-black/40 p-2">
          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <Shield className="mx-auto h-12 w-12 text-cyan-400" />
              <p className="mt-2 text-xs uppercase tracking-[0.5em] text-cyan-200">Access Request</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Provision identity</h2>
            </div>

            <Form methods={form} onSubmit={handleSubmit} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Jane Operator" className="pl-11" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="agent@kaavach.ai" className="pl-11" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hacker">Hacker / Researcher</SelectItem>
                        <SelectItem value="company">Company / Organization</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchRole === "company" && (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Acme Defense" className="pl-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-11" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Provisioning..." : "Create elite account"}
              </Button>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already verified?{" "}
              <Link to="/login" className="text-cyan-300 underline-offset-4 hover:underline">
                Return to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register

