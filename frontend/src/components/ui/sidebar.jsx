import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Sidebar({ sections = [], collapsed = false, className }) {
  return (
    <aside
      className={cn(
        "flex h-full w-72 flex-col border-r border-white/5 bg-black/30 px-4 py-6 backdrop-blur-2xl",
        collapsed && "w-20",
        className
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-black text-slate-900"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        >
          K
        </motion.div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">
              KAAVACH
            </p>
            <p className="text-xs uppercase text-white">AI SECURITY HUB</p>
          </div>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto pr-2">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                {section.label}
              </p>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-white",
                      isActive && "bg-white/10 text-white shadow-neon-ring"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 text-cyan-300" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-cyan-500/10 px-2 text-[10px] uppercase text-cyan-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}

