"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Search,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  X,
  HandshakeIcon,
  Mail,
  Compass,
} from "lucide-react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

export function Sidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const profileRef = doc(db, "profiles", user.uid)
        const profileSnapshot = await getDoc(profileRef)

        if (profileSnapshot.exists()) {
          setProfile({
            id: profileSnapshot.id,
            ...profileSnapshot.data(),
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch unread message count
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      try {
        const messagesQuery = query(
          collection(db, "messages"),
          where("receiver_id", "==", user.uid),
          where("read", "==", false),
          where("category", "==", "inbox"),
        )

        const querySnapshot = await getDocs(messagesQuery)
        setUnreadCount(querySnapshot.size)
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    fetchUnreadCount()

    // Set up interval to check for new messages
    const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Close mobile sidebar when path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Search",
      icon: Search,
      href: "/search",
    },
    {
      title: "Discover",
      icon: Compass,
      href: "/dashboard/discover",
    },
    {
      title: "Lost Items",
      icon: AlertTriangle,
      href: "/dashboard/lost",
    },
    {
      title: "Found Items",
      icon: CheckCircle,
      href: "/dashboard/found",
    },
    {
      title: "Matches",
      icon: HandshakeIcon,
      href: "/dashboard/matches",
    },
    {
      title: "Messages",
      icon: Mail,
      href: "/dashboard/messages",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      title: "Chat",
      icon: MessageSquare,
      href: "/dashboard/chat",
    },
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            SAMPARKSETU
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 flex flex-col items-center text-center border-b border-slate-800">
        <Avatar className="h-20 w-20 mb-3 border-2 border-slate-700">
          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700 text-white text-xl">
            {profile?.username ? profile.username.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-medium text-white">{profile?.full_name || user?.displayName || "User"}</h3>
          <p className="text-sm text-slate-400">@{profile?.username || "username"}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                  isActive
                    ? "text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"}`}
                />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Help & Support */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <h4 className="font-medium text-white">Need Help?</h4>
          </div>
          <p className="text-sm text-slate-400 mb-3">Having trouble with the platform? Contact our support team.</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Contact Support
          </Button>
        </div>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  // Mobile toggle button
  const mobileToggle = isMobile && (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg h-12 w-12"
      onClick={() => setIsOpen(true)}
    >
      <Menu className="h-6 w-6" />
    </Button>
  )

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && <div className="hidden md:block w-64 h-screen sticky top-0">{sidebarContent}</div>}

      {/* Mobile sidebar */}
      {isMobile && (
        <>
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-40"
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-y-0 left-0 z-50 w-64"
                >
                  {sidebarContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          {mobileToggle}
        </>
      )}
    </>
  )
}
