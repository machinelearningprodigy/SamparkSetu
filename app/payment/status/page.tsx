"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const orderId = searchParams.get("order_id")
  const itemId = searchParams.get("item_id")

  useEffect(() => {
    if (!orderId || !itemId) {
      setStatus("failed")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            itemId,
          }),
        })

        const data = await response.json()

        if (response.ok && data && data.length > 0) {
          setPaymentDetails(data[0])

          if (data[0].payment_status === "SUCCESS") {
            setStatus("success")
          } else {
            setStatus("failed")
          }
        } else {
          setStatus("failed")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("failed")
      }
    }

    verifyPayment()
  }, [orderId, itemId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6">
                {status === "loading" ? (
                  <>
                    <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
                    <p className="text-slate-400 text-center mb-6">
                      Please wait while we verify your payment status...
                    </p>
                  </>
                ) : status === "success" ? (
                  <>
                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                    <p className="text-slate-400 text-center mb-6">
                      Your payment has been processed successfully. You can now proceed with the item exchange.
                    </p>

                    {paymentDetails && (
                      <div className="w-full bg-slate-800/50 p-4 rounded-md space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Order ID:</span>
                          <span className="font-mono">{paymentDetails.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Amount:</span>
                          <span>₹{Number.parseFloat(paymentDetails.order_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Payment Method:</span>
                          <span>{paymentDetails.payment_method || "Online"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Date:</span>
                          <span>{new Date(paymentDetails.payment_time || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                    <p className="text-slate-400 text-center mb-6">
                      There was an issue processing your payment. Please try again.
                    </p>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={itemId ? `/items/${itemId}` : "/dashboard"}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Item
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href="/dashboard/chat">Continue to Chat</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
