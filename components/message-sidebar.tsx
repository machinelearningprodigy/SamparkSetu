"use client"

import { useRouter } from "next/navigation"
import { Archive, CircleAlert, Inbox, MailPlus, MessageSquare, Star, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageSidebarProps {
  activeTab: string
  unreadCount: number
  archivedCount: number
  spamCount: number
  starredCount: number
  trashCount: number
  onTabChange: (tab: string) => void
  userData: any
}

export function MessageSidebar({
  activeTab,
  unreadCount,
  archivedCount,
  spamCount,
  starredCount,
  trashCount,
  onTabChange,
  userData,
}: MessageSidebarProps) {
  const router = useRouter()

  return (
    <div className="h-full border-r border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 w-64">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
      </div>

      <div className="px-3 py-4">
        <h3 className="mb-3 px-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Mailboxes</h3>
        <div className="space-y-1">
          {/* Inbox */}
          <button
            onClick={() => onTabChange("inbox")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all ${
              activeTab === "inbox"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4" />
              <span className="font-medium">Inbox</span>
            </div>
            {unreadCount > 0 && <Badge className="bg-blue-600 text-white text-xs px-2 py-1">{unreadCount}</Badge>}
          </button>

          {/* Sent */}
          <button
            onClick={() => onTabChange("sent")}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${
              activeTab === "sent"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <MailPlus className="h-4 w-4" />
            <span className="font-medium">Sent</span>
          </button>

          <button
            onClick={() => onTabChange("starred")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all ${
              activeTab === "starred"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4" />
              <span className="font-medium">Starred</span>
            </div>
            {starredCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {starredCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => onTabChange("archived")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all ${
              activeTab === "archived"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4" />
              <span className="font-medium">Archived</span>
            </div>
            {archivedCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {archivedCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => onTabChange("spam")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all ${
              activeTab === "spam"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <CircleAlert className="h-4 w-4" />
              <span className="font-medium">Spam</span>
            </div>
            {spamCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {spamCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => onTabChange("trash")}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all ${
              activeTab === "trash"
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash className="h-4 w-4" />
              <span className="font-medium">Trash</span>
            </div>
            {trashCount > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {trashCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Categories section with improved styling */}
      <div className="px-3 py-4 border-t border-slate-800">
        <h3 className="mb-3 px-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Categories</h3>
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Lost Items</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Found Items</span>
          </button>
        </div>
      </div>

      {/* User profile at bottom with improved styling */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-slate-700">
            <AvatarImage src={userData?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
              {userData?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-white truncate">{userData?.username || "User"}</span>
            <span className="text-xs text-slate-400 truncate">{userData?.email || ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
