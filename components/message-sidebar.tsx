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
    <div className="h-full border-r border-slate-800 bg-slate-900/70 w-64">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <h2 className="text-lg font-bold">Messages</h2>
        </div>
      </div>

      <div className="px-3 py-2">
        <h3 className="mb-2 px-4 text-sm font-semibold">Mailboxes</h3>
        <div className="space-y-1">
          <button
            onClick={() => onTabChange("inbox")}
            className={`flex w-full items-center justify-between rounded-md px-4 py-2 ${
              activeTab === "inbox"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
            </div>
            {unreadCount > 0 && <Badge className="bg-blue-600 text-white">{unreadCount}</Badge>}
          </button>

          <button
            onClick={() => onTabChange("sent")}
            className={`flex w-full items-center gap-3 rounded-md px-4 py-2 ${
              activeTab === "sent" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <MailPlus className="h-4 w-4" />
            <span>Sent</span>
          </button>

          <button
            onClick={() => onTabChange("starred")}
            className={`flex w-full items-center justify-between rounded-md px-4 py-2 ${
              activeTab === "starred"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </div>
            {starredCount > 0 && <Badge variant="outline">{starredCount}</Badge>}
          </button>

          <button
            onClick={() => onTabChange("archived")}
            className={`flex w-full items-center justify-between rounded-md px-4 py-2 ${
              activeTab === "archived"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4" />
              <span>Archived</span>
            </div>
            {archivedCount > 0 && <Badge variant="outline">{archivedCount}</Badge>}
          </button>

          <button
            onClick={() => onTabChange("spam")}
            className={`flex w-full items-center justify-between rounded-md px-4 py-2 ${
              activeTab === "spam" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <CircleAlert className="h-4 w-4" />
              <span>Spam</span>
            </div>
            {spamCount > 0 && <Badge variant="outline">{spamCount}</Badge>}
          </button>

          <button
            onClick={() => onTabChange("trash")}
            className={`flex w-full items-center justify-between rounded-md px-4 py-2 ${
              activeTab === "trash"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash className="h-4 w-4" />
              <span>Trash</span>
            </div>
            {trashCount > 0 && <Badge variant="outline">{trashCount}</Badge>}
          </button>
        </div>
      </div>

      <div className="mt-6 px-3 py-2">
        <h3 className="mb-2 px-4 text-sm font-semibold">Categories</h3>
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-slate-400 hover:bg-slate-800/50 hover:text-white">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Lost Items</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-slate-400 hover:bg-slate-800/50 hover:text-white">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Found Items</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{userData?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userData?.username || "User"}</span>
            <span className="text-xs text-slate-400">{userData?.email || ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
