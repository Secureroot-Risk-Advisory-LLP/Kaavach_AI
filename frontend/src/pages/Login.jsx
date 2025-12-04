import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Shield, Lock, Mail, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"

import { loginSuccess } from "@/store/slices/authSlice"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      const data = await authService.login(values.email, values.password)
      dispatch(loginSuccess({ user: data, token: data.token }))
      toast.success("Welcome back, operative.")
      if (data.role === "hacker") navigate("/dashboard/hacker")
      else if (data.role === "company") navigate("/dashboard/company")
      else if (data.role === "admin") navigate("/dashboard/admin")
      else navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#010310] px-4 py-12 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl border border-white/10 p-10">
          <div className="mb-10 flex items-center gap-3 text-cyan-200">
            <Shield className="h-10 w-10" />
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                Kaavach AI
              </p>
              <h1 className="text-3xl font-semibold text-white">Mission Access</h1>
            </div>
          </div>
          <ul className="space-y-8 text-sm text-muted-foreground">
            <li className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
              <div>
                <p className="text-base font-semibold text-white">Enterprise Secure Login</p>
                <p>Zero-trust access control with full audit trails.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-cyan-300" />
              <div>
                <p className="text-base font-semibold text-white">Adaptive MFA</p>
                <p>Device reputation + OTP for sensitive actions.</p>
              </div>
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-white/10 px-3 py-1">SOC 2 Ready</span>
            <span className="rounded-full border border-white/10 px-3 py-1">AES-256</span>
            <span className="rounded-full border border-white/10 px-3 py-1">ISO 27001</span>
          </div>
        </div>

        <Card className="rounded-3xl border-white/10 bg-black/40 p-2">
          <CardContent className="p-8">
            <div className="mb-6 space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Authenticate</p>
              <h2 className="text-3xl font-semibold text-white">Enter the command center</h2>
              <p className="text-sm text-muted-foreground">
                Use your secure credentials to access Kaavach AI.
              </p>
            </div>

            <Form methods={form} onSubmit={handleSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="agent@kaavach.ai" className="pl-11" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passphrase</FormLabel>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Securing session..." : "Enter Secure Mode"}
              </Button>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link className="text-cyan-300 underline-offset-4 hover:underline" to="/register">
                Request access
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login

