"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Search, MessageSquare, LogOut, Settings, Menu, X, AlertTriangle, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileIcon } from "@/components/profile-icon"

export function Navbar() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position to adjust navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/report/lost", label: "Report Lost", icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
    { href: "/report/found", label: "Report Found", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
    { href: "/search", label: "Search", icon: <Search className="h-4 w-4 mr-2" /> },
    { href: "/chat", label: "Chat", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ]

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "bg-black/40 backdrop-blur-md border-slate-800/40 shadow-lg shadow-purple-900/10"
          : "bg-black/20 backdrop-blur-sm border-slate-800/20",
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.span
              className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              SAMPARKSETU
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <motion.div key={link.href} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={link.href}
                  className="text-sm flex items-center text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-300"
                >
                  {link.icon}
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="focus:outline-none">
                    <ProfileIcon isLoggedIn={true} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/80 backdrop-blur-lg border-slate-700/50">
                  <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700/50" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer w-full text-slate-300 hover:text-white focus:text-white"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer w-full text-slate-300 hover:text-white focus:text-white"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700/50" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-slate-300 hover:text-white focus:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-purple-900/20 hover:shadow-purple-900/40 backdrop-blur-sm border border-white/10 transition-all duration-300"
                >
                  <Link href="/login">Login / Sign Up</Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {user ? (
              <ProfileIcon isLoggedIn={true} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} size="sm" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="text-slate-300 hover:text-white"
              >
                <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-black/90 backdrop-blur-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center py-2 text-base text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center py-2 text-base text-slate-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center py-2 text-base text-slate-300 hover:text-white w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Link
                    href="/login"
                    className={cn(
                      "flex items-center justify-center py-2 mt-2 text-base text-white",
                      "bg-gradient-to-r from-blue-600 to-purple-600 rounded-md",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login / Sign Up
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
