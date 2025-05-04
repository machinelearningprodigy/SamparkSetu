"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, SearchIcon, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "wallets", label: "Wallets & Purses" },
  { value: "keys", label: "Keys" },
  { value: "documents", label: "Documents" },
  { value: "jewelry", label: "Jewelry" },
  { value: "clothing", label: "Clothing" },
  { value: "bags", label: "Bags & Luggage" },
  { value: "pets", label: "Pets" },
  { value: "other", label: "Other" },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialType = searchParams.get("type") || "all"

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [type, setType] = useState(initialType)
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const fetchResults = async () => {
    setIsLoading(true)

    try {
      const itemsQuery = collection(db, "items")
      const constraints = []

      // Build query constraints
      if (category && category !== "all") {
        constraints.push(where("category", "==", category))
      }

      if (type && type !== "all") {
        constraints.push(where("type", "==", type))
      }

      if (dateRange) {
        const formattedDate = format(dateRange, "yyyy-MM-dd")
        constraints.push(where("date", ">=", formattedDate))
      }

      // Apply constraints and order by created_at
      const finalQuery = query(itemsQuery, ...constraints, orderBy("created_at", "desc"))

      const querySnapshot = await getDocs(finalQuery)

      let items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Filter by search query if provided (client-side filtering since Firestore doesn't support full-text search)
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase()
        items = items.filter(
          (item) =>
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery) ||
            item.location?.toLowerCase().includes(lowerQuery),
        )
      }

      setResults(items)
    } catch (error) {
      console.error("Error fetching search results:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [searchQuery, category, type, dateRange])

  const resetFilters = () => {
    setCategory("all")
    setType("all")
    setDateRange(undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Search Lost & Found Items</h1>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-2 mb-8">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(category !== "all" || type !== "all" || dateRange) && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(category !== "all" ? 1 : 0) + (type !== "all" ? 1 : 0) + (dateRange ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900/70 backdrop-blur-lg border border-slate-800 rounded-lg p-4 mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Filters</h2>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="lost">Lost Items</SelectItem>
                      <SelectItem value="found">Found Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date (From)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange ? format(dateRange, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateRange} onSelect={setDateRange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
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
          ) : (
            <div className="text-center py-16 bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-lg">
              <div className="flex justify-center mb-4">
                <SearchIcon className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">No items found</h3>
              <p className="text-slate-400 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
