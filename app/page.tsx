"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Search, AlertTriangle, CheckCircle, ArrowRight, FileText, Scan, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Item } from "@/lib/database.types"

import { SnowEffect } from "@/components/snow-effect"
import { GlowingParticles } from "@/components/glowing-particles"
import { AnimatedText } from "@/components/animated-text"
import { AnimatedButton } from "@/components/animated-button"
import { SearchBar } from "@/components/search-bar"
import { SectionHeading } from "@/components/section-heading"
import { AnimatedCard } from "@/components/animated-card"
import { ViewAllButton } from "@/components/view-all-button"
import { FeatureCard } from "@/components/feature-card"
import { ProcessFlow } from "@/components/process-flow"
import { AnimatedHeading } from "@/components/animated-heading"

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

  const handleQuickSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white">
      <Navbar />

      {/* Hero Section with Background Video and Animations */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop className="w-full h-full object-cover opacity-30">
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-city-11748-large.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>

        {/* Snow Effect */}
        <SnowEffect />

        {/* Glowing Particles */}
        <GlowingParticles />

        {/* Hero Content */}
        <div className="container mx-auto px-4 z-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <AnimatedText
                text="Lost Something?"
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
                delay={0.2}
              />
              <br />
              <AnimatedText
                text="Found Something?"
                className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500"
                delay={0.4}
              />
              <br />
              <AnimatedText text="Let's Reunite!" className="text-white" delay={0.6} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto"
            >
              Report lost or found items and connect with the rightful owner through our advanced matching system.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <AnimatedButton
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-none"
                glowColor="rgba(239, 68, 68, 0.5)"
              >
                <Link href="/report/lost">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Report a Lost Item
                </Link>
              </AnimatedButton>

              <AnimatedButton
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 border-none"
                glowColor="rgba(16, 185, 129, 0.5)"
              >
                <Link href="/report/found">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Report a Found Item
                </Link>
              </AnimatedButton>

              <AnimatedButton
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-none"
                glowColor="rgba(79, 70, 229, 0.5)"
              >
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search Items
                </Link>
              </AnimatedButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          >
            <ArrowRight className="h-6 w-6 rotate-90 text-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Search Bar - Enhanced with animations */}
      <section className="py-16 bg-slate-900/50 backdrop-blur-lg relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/0 to-transparent"></div>

          {/* Animated lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
              }}
              animate={{
                x: ["-100%", "100%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeading>Quick Search</SectionHeading>
          <SearchBar onSearch={handleQuickSearch} />
        </div>
      </section>

      {/* Recent Listings - Enhanced with animated cards */}
      <section className="py-16 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900/30 to-transparent"></div>

          {/* Animated dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-500/20"
              style={{
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionHeading>Recent Lost & Found Listings</SectionHeading>

          {isLoading ? (
            <div className="flex justify-center">
              <motion.div
                className="relative w-16 h-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-blue-500"></div>
                <motion.div
                  className="absolute inset-4 rounded-full bg-indigo-500"
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                ></motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <AnimatedCard
                    id={item.id}
                    image={
                      item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=200&width=300"
                    }
                    name={item.name}
                    category={item.category}
                    date={item.date}
                    location={item.location}
                    type={item.type as "lost" | "found"}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <ViewAllButton href="/search" />
        </div>
      </section>

      {/* How It Works - ENHANCED SECTION */}
      <section className="py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          {/* Radial gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-slate-900/50 to-black/80"></div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>

          {/* Animated stars/particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: 1 + Math.random() * 2,
                height: 1 + Math.random() * 2,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.8, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced heading */}
          <AnimatedHeading>How It Works</AnimatedHeading>

          {/* Feature cards with process flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <FeatureCard
              icon={<FileText />}
              title="Report"
              description="Submit a lost or found item with details and images to our advanced database."
              color="blue"
              index={0}
            />

            <FeatureCard
              icon={<Scan />}
              title="Match"
              description="Our AI-powered system finds potential matches based on item descriptions and locations."
              color="purple"
              index={1}
            />

            <FeatureCard
              icon={<MessageSquare />}
              title="Connect"
              description="Chat securely with the other party and arrange to reclaim your lost item."
              color="green"
              index={2}
            />
          </div>

          {/* Process flow visualization */}
          <ProcessFlow />

          {/* Statistics */}
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="p-6 rounded-xl bg-blue-900/20 backdrop-blur-sm border border-blue-500/30">
              <motion.div
                className="text-4xl font-bold text-blue-400 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                98%
              </motion.div>
              <p className="text-slate-300">Success Rate</p>
            </div>

            <div className="p-6 rounded-xl bg-purple-900/20 backdrop-blur-sm border border-purple-500/30">
              <motion.div
                className="text-4xl font-bold text-purple-400 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
              >
                24h
              </motion.div>
              <p className="text-slate-300">Average Recovery Time</p>
            </div>

            <div className="p-6 rounded-xl bg-green-900/20 backdrop-blur-sm border border-green-500/30">
              <motion.div
                className="text-4xl font-bold text-green-400 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
              >
                10k+
              </motion.div>
              <p className="text-slate-300">Items Recovered</p>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            className="mt-16 p-8 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-indigo-500/20 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-yellow-400 text-xl mx-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Number.POSITIVE_INFINITY }}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <p className="text-slate-300 italic mb-4">
              "I lost my laptop at the airport and thought I'd never see it again. Within 24 hours of posting on
              SAMPARKSETU, I was connected with the person who found it. This platform is a lifesaver!"
            </p>
            <p className="text-white font-semibold">- Rahul M., Delhi</p>
          </motion.div>
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
