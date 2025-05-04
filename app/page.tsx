"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileCheckIcon as FileReport,
  Scan,
  MessageSquare,
} from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Item } from "@/lib/database.types"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentListings, setRecentListings] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const itemsQuery = query(collection(db, "items"), orderBy("created_at", "desc"), limit(4))

        const querySnapshot = await getDocs(itemsQuery)
        const items: Item[] = []

        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as Item)
        })

        setRecentListings(items)
      } catch (error) {
        console.error("Error fetching recent listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentListings()
  }, [])

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white">
      <Navbar />

      {/* Hero Section with Background Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop className="w-full h-full object-cover opacity-40">
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-city-11748-large.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Lost Something? Found Something?
              </span>
              <br />
              <span className="text-white">Let's Reunite!</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Report lost or found items and connect with the rightful owner through our advanced matching system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Link href="/report/lost">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Report a Lost Item
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Link href="/report/found">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Report a Found Item
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Search Items
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ArrowRight className="h-6 w-6 rotate-90" />
        </motion.div>
      </section>

      {/* Quick Search Bar */}
      <section className="py-16 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Quick Search</h2>
            <form onSubmit={handleQuickSearch} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search for lost or found items"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Recent Lost & Found Listings</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={
                        item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=200&width=300"
                      }
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                        item.type === "lost" ? "bg-red-600 text-white" : "bg-green-600 text-white"
                      }`}
                    >
                      {item.type === "lost" ? "Lost" : "Found"}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <div className="text-sm text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">Category:</span> {item.category}
                    </div>
                    <div className="text-sm text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">Date:</span> {item.date}
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      <span className="font-medium text-slate-300">Location:</span> {item.location}
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/items/${item.id}`}>View Details</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/search">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-900/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileReport className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Report</h3>
              <p className="text-slate-400">
                Submit a lost or found item with details and images to our advanced database.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scan className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Match</h3>
              <p className="text-slate-400">
                Our AI-powered system finds potential matches based on item descriptions and locations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-slate-400">
                Chat securely with the other party and arrange to reclaim your lost item.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900"></div>
          <div className="h-full w-full bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find What You've Lost?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users who have successfully recovered their lost items through our platform.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/login">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
