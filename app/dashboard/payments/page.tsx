"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Download,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { DirectPaymentModal } from "@/components/direct-payment-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

// Define transaction type
interface Transaction {
  id: string
  createdAt: Date
  itemName?: string
  amount: number
  type: "sent" | "received"
  status: string
  orderId: string
  recipient: string
  description?: string
  paymentMethod?: string
  recipientEmail?: string
  userId?: string
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("newest")

  useEffect(() => {
    if (!user) return

    const fetchTransactions = async () => {
      try {
        setIsLoading(true)

        // Query for payments where the user is either the sender or recipient
        const sentQuery = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const receivedQuery = query(
          collection(db, "payments"),
          where("recipientId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)])

        const sentTransactions = sentSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            itemName: data.itemName || "Payment",
            amount: Number.parseFloat(data.amount) || 0,
            type: "sent",
            status: data.status || "PENDING",
            orderId: data.orderId || "",
            recipient: data.recipientName || data.recipientEmail || "Recipient",
            description: data.purpose || data.description || "",
            paymentMethod: data.paymentMethod || "Online",
            recipientEmail: data.recipientEmail || "",
          } as Transaction
        })

        const receivedTransactions = receivedSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            itemName: data.itemName || "Payment",
            amount: Number.parseFloat(data.amount) || 0,
            type: "received",
            status: data.status || "PENDING",
            orderId: data.orderId || "",
            recipient: data.userName || data.userEmail || "Sender",
            description: data.purpose || data.description || "",
            paymentMethod: data.paymentMethod || "Online",
          } as Transaction
        })

        // Combine and sort transactions
        const allTransactions = [...sentTransactions, ...receivedTransactions]

        // Sort based on selected order
        if (sortOrder === "newest") {
          allTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } else if (sortOrder === "oldest") {
          allTransactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        } else if (sortOrder === "highest") {
          allTransactions.sort((a, b) => b.amount - a.amount)
        } else if (sortOrder === "lowest") {
          allTransactions.sort((a, b) => a.amount - b.amount)
        }

        setTransactions(allTransactions)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction history",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, toast, sortOrder])

  const handleSortChange = (value: string) => {
    setSortOrder(value)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "sent" && transaction.type !== "sent") return false
    if (activeTab === "received" && transaction.type !== "received") return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.itemName?.toLowerCase().includes(query) ||
        false ||
        transaction.recipient.toLowerCase().includes(query) ||
        transaction.orderId.toLowerCase().includes(query) ||
        transaction.description?.toLowerCase().includes(query) ||
        false
      )
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handlePaymentComplete = () => {
    // Refresh the transaction list
    if (user) {
      setIsLoading(true)
      // The useEffect will handle the refresh when isLoading changes
    }
  }

  const downloadTransactionReceipt = (transaction: Transaction) => {
    // Create a receipt-like text
    const receiptContent = `
TRANSACTION RECEIPT
-------------------
Transaction ID: ${transaction.id}
Order ID: ${transaction.orderId}
Date: ${format(transaction.createdAt, "MMM dd, yyyy HH:mm:ss")}
Type: ${transaction.type === "sent" ? "Payment Sent" : "Payment Received"}
Amount: ₹${transaction.amount.toFixed(2)}
Status: ${transaction.status}
${transaction.type === "sent" ? "Recipient" : "From"}: ${transaction.recipient}
${transaction.description ? `Description: ${transaction.description}` : ""}
Payment Method: ${transaction.paymentMethod || "Online"}
    `

    // Create a blob and download
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${transaction.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your payment history and transactions</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> Make Payment
          </Button>
          <Button
            onClick={() => {
              // Export all transactions as CSV
              if (transactions.length === 0) {
                toast({
                  title: "No Data",
                  description: "There are no transactions to export",
                })
                return
              }

              const headers = ["Date", "Type", "Amount", "Status", "Recipient", "Description", "Order ID"]
              const csvContent = [
                headers.join(","),
                ...transactions.map((t) =>
                  [
                    format(t.createdAt, "yyyy-MM-dd"),
                    t.type,
                    t.amount.toFixed(2),
                    t.status,
                    `"${t.recipient.replace(/"/g, '""')}"`,
                    `"${(t.description || "").replace(/"/g, '""')}"`,
                    t.orderId,
                  ].join(","),
                ),
              ].join("\n")

              const blob = new Blob([csvContent], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "payment-history.csv"
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export History
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest amount</SelectItem>
              <SelectItem value="lowest">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your payment transactions for item exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 transition-colors dark:bg-slate-800">
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <span>Date</span>
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Amount
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Type
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="p-4 align-middle">{format(transaction.createdAt, "MMM dd, yyyy")}</td>
                            <td className="p-4 align-middle font-medium">
                              <div className="font-medium">{transaction.itemName || "Payment"}</div>
                              <div className="text-sm text-slate-500">{transaction.recipient}</div>
                            </td>
                            <td className="p-4 align-middle">₹{transaction.amount.toFixed(2)}</td>
                            <td className="p-4 align-middle">
                              <Badge variant={transaction.type === "sent" ? "outline" : "secondary"}>
                                {transaction.type === "sent" ? "Payment Sent" : "Payment Received"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4 align-middle">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setSelectedTransaction(transaction)}
                                >
                                  <span className="sr-only">View details</span>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => downloadTransactionReceipt(transaction)}
                                >
                                  <span className="sr-only">Download receipt</span>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md bg-slate-50 dark:bg-slate-800">
                  <CreditCard className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No transactions found</h3>
                  <p className="text-slate-500 mb-4">
                    {searchQuery ? "Try adjusting your search or filter criteria" : "You haven't made any payments yet"}
                  </p>
                  <Button onClick={() => setIsPaymentModalOpen(true)}>Make a Payment</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Payments</CardTitle>
              <CardDescription>Payments you've made for item claims</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 transition-colors dark:bg-slate-800">
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Date
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Recipient
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Amount
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="p-4 align-middle">{format(transaction.createdAt, "MMM dd, yyyy")}</td>
                            <td className="p-4 align-middle font-medium">{transaction.itemName || "Payment"}</td>
                            <td className="p-4 align-middle">{transaction.recipient}</td>
                            <td className="p-4 align-middle">₹{transaction.amount.toFixed(2)}</td>
                            <td className="p-4 align-middle">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4 align-middle">
                              <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md bg-slate-50 dark:bg-slate-800">
                  <CreditCard className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No sent payments</h3>
                  <p className="text-slate-500">Your sent payments will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Payments</CardTitle>
              <CardDescription>Payments you've received for your items</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 transition-colors dark:bg-slate-800">
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Date
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            From
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Amount
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Status
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="p-4 align-middle">{format(transaction.createdAt, "MMM dd, yyyy")}</td>
                            <td className="p-4 align-middle font-medium">{transaction.itemName || "Payment"}</td>
                            <td className="p-4 align-middle">{transaction.recipient}</td>
                            <td className="p-4 align-middle">₹{transaction.amount.toFixed(2)}</td>
                            <td className="p-4 align-middle">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4 align-middle">
                              <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md bg-slate-50 dark:bg-slate-800">
                  <CreditCard className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No received payments</h3>
                  <p className="text-slate-500">Your received payments will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Transaction Details</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedTransaction(null)}>
                  <span className="sr-only">Close</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </Button>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-500">Transaction ID</p>
                    <p className="font-medium">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="font-medium">{format(selectedTransaction.createdAt, "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Item Details</h3>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-medium text-lg">{selectedTransaction.itemName || "Payment"}</p>
                    <p className="text-slate-500">{selectedTransaction.description || "No description provided"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-medium">₹{selectedTransaction.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Platform Fee (10%)</span>
                        <span className="font-medium">₹{(selectedTransaction.amount * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">₹{(selectedTransaction.amount * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {selectedTransaction.type === "sent" ? "Recipient" : "Sender"} Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium">{selectedTransaction.recipient}</span>
                      </div>
                      {selectedTransaction.recipientEmail && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium">{selectedTransaction.recipientEmail}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order ID</span>
                        <span className="font-medium">{selectedTransaction.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Type</span>
                        <span className="font-medium">
                          {selectedTransaction.type === "sent" ? "Outgoing" : "Incoming"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={() => downloadTransactionReceipt(selectedTransaction)}>
                    <FileText className="mr-2 h-4 w-4" /> Download Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Learn about our payment process and platform fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-950">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Platform Fee Information</h3>
                <p className="text-blue-600 dark:text-blue-400">
                  Our platform charges a 10% fee on all successful transactions between parties exchanging items. This
                  fee helps us maintain the platform and provide secure payment processing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Secure Payments</h4>
                  <p className="text-sm text-slate-500">
                    All payments are processed securely through Cashfree payment gateway
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Instant Transfers</h4>
                  <p className="text-sm text-slate-500">
                    Payments are processed instantly and securely between parties
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-2">Payment Protection</h4>
                  <p className="text-sm text-slate-500">Your payments are protected until item exchange is confirmed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <DirectPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  )
}
