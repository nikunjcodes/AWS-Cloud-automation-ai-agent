"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Cloud,
  Code2,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mountain,
  Settings,
  Terminal,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
          expanded ? "w-64" : "w-16",
          className,
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="p-3 flex items-center justify-center border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            {expanded && <h2 className="text-lg font-semibold tracking-tight">Cloud Navigator</h2>}
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            <div className="py-2">
              {!expanded && <div className="h-px w-full bg-border/60 my-2" />}
              {expanded && (
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">OVERVIEW</h2>
              )}
              <div className="space-y-1">
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                  expanded={expanded}
                />
                <NavItem
                  href="/projects"
                  icon={<FileText className="h-5 w-5" />}
                  label="Projects"
                  active={pathname === "/projects"}
                  expanded={expanded}
                />
                <NavItem
                  href="/deployments"
                  icon={<Cloud className="h-5 w-5" />}
                  label="Deployments"
                  active={pathname === "/deployments"}
                  expanded={expanded}
                />
                <NavItem
                  href="/analytics"
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Analytics"
                  active={pathname === "/analytics"}
                  expanded={expanded}
                />
              </div>
            </div>

            <div className="py-2">
              {!expanded && <div className="h-px w-full bg-border/60 my-2" />}
              {expanded && (
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">AUTOMATION</h2>
              )}
              <div className="space-y-1">
                <NavItem
                  href="/chat"
                  icon={<MessageSquare className="h-5 w-5" />}
                  label="AI Assistant"
                  active={pathname === "/chat"}
                  expanded={expanded}
                />
                <NavItem
                  href="/resources"
                  icon={<Database className="h-5 w-5" />}
                  label="Resources"
                  active={pathname === "/resources"}
                  expanded={expanded}
                />
                <NavItem
                  href="/terraform"
                  icon={<Code2 className="h-5 w-5" />}
                  label="Terraform"
                  active={pathname === "/terraform"}
                  expanded={expanded}
                />
                <NavItem
                  href="/console"
                  icon={<Terminal className="h-5 w-5" />}
                  label="Console"
                  active={pathname === "/console"}
                  expanded={expanded}
                />
              </div>
            </div>

            <div className="py-2">
              {!expanded && <div className="h-px w-full bg-border/60 my-2" />}
              {expanded && (
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">ACCOUNT</h2>
              )}
              <div className="space-y-1">
                <NavItem
                  href="/team"
                  icon={<Users className="h-5 w-5" />}
                  label="Team"
                  active={pathname === "/team"}
                  expanded={expanded}
                />
                <NavItem
                  href="/billing"
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Billing"
                  active={pathname === "/billing"}
                  expanded={expanded}
                />
                <NavItem
                  href="/settings"
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                  active={pathname === "/settings"}
                  expanded={expanded}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  expanded: boolean
}

function NavItem({ href, icon, label, active, expanded }: NavItemProps) {
  return (
    <Link href={href}>
      {expanded ? (
        <Button variant={active ? "secondary" : "ghost"} size="sm" className="w-full justify-start h-10">
          <span className="mr-2">{icon}</span>
          {label}
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={active ? "secondary" : "ghost"} size="icon" className="h-10 w-10">
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )}
    </Link>
  )
}

