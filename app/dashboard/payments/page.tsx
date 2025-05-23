"use client"

import { useState } from "react"
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
  Filter,
  Search,
} from "lucide-react"
import { format } from "date-fns"
import { DirectPaymentModal } from "@/components/direct-payment-modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for transactions
const mockTransactions = [
  {
    id: "tx_1234567890",
    createdAt: new Date(2023, 4, 15),
    itemName: "iPhone 13 Pro",
    amount: 1100.0,
    type: "sent",
    status: "SUCCESS",
    orderId: "order_123456789",
    recipient: "Akash Sharma",
    description: "Payment for found iPhone 13 Pro",
  },
  {
    id: "tx_2345678901",
    createdAt: new Date(2023, 4, 10),
    itemName: "MacBook Air M1",
    amount: 2500.0,
    type: "received",
    status: "SUCCESS",
    orderId: "order_234567890",
    recipient: "Priya Patel",
    description: "Payment received for MacBook Air",
  },
  {
    id: "tx_3456789012",
    createdAt: new Date(2023, 4, 5),
    itemName: "Sony WH-1000XM4",
    amount: 350.0,
    type: "sent",
    status: "PENDING",
    orderId: "order_345678901",
    recipient: "Vikram Singh",
    description: "Payment for found headphones",
  },
  {
    id: "tx_4567890123",
    createdAt: new Date(2023, 3, 28),
    itemName: "Apple Watch Series 7",
    amount: 450.0,
    type: "sent",
    status: "FAILED",
    orderId: "order_456789012",
    recipient: "Neha Gupta",
    description: "Payment attempt for Apple Watch",
  },
  {
    id: "tx_5678901234",
    createdAt: new Date(2023, 3, 20),
    itemName: "iPad Pro 11-inch",
    amount: 900.0,
    type: "received",
    status: "SUCCESS",
    orderId: "order_567890123",
    recipient: "Rahul Verma",
    description: "Payment received for iPad Pro",
  },
  {
    id: "tx_6789012345",
    createdAt: new Date(2023, 3, 15),
    itemName: "Samsung Galaxy S22",
    amount: 800.0,
    type: "sent",
    status: "SUCCESS",
    orderId: "order_678901234",
    recipient: "Ananya Desai",
    description: "Payment for found Samsung phone",
  },
]

export default function PaymentsPage() {
  const { user } = useAuth()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (activeTab === "sent" && transaction.type !== "sent") return false
    if (activeTab === "received" && transaction.type !== "received") return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.itemName.toLowerCase().includes(query) ||
        transaction.recipient.toLowerCase().includes(query) ||
        transaction.orderId.toLowerCase().includes(query)
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your payment history and transactions</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button>
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
          <Select defaultValue="newest">
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
              {filteredTransactions.length > 0 ? (
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
                              <div className="font-medium">{transaction.itemName}</div>
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
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
                  <p className="text-slate-500 mb-4">Try adjusting your search or filter criteria</p>
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
              {filteredTransactions.length > 0 ? (
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
                            <td className="p-4 align-middle font-medium">{transaction.itemName}</td>
                            <td className="p-4 align-middle">{transaction.recipient}</td>
                            <td className="p-4 align-middle">₹{transaction.amount.toFixed(2)}</td>
                            <td className="p-4 align-middle">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4 align-middle">
                              <Button variant="outline" size="sm">
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
              {filteredTransactions.length > 0 ? (
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
                            <td className="p-4 align-middle font-medium">{transaction.itemName}</td>
                            <td className="p-4 align-middle">{transaction.recipient}</td>
                            <td className="p-4 align-middle">₹{transaction.amount.toFixed(2)}</td>
                            <td className="p-4 align-middle">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4 align-middle">
                              <Button variant="outline" size="sm">
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
                    <p className="font-medium text-lg">{selectedTransaction.itemName}</p>
                    <p className="text-slate-500">{selectedTransaction.description}</p>
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
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Download Receipt
                  </Button>
                  {selectedTransaction.status === "PENDING" && (
                    <Button>
                      <CheckCircle className="mr-2 h-4 w-4" /> Confirm Receipt
                    </Button>
                  )}
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
        onPaymentComplete={() => {
          setIsPaymentModalOpen(false)
        }}
      />
    </div>
  )
}
