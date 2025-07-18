"use client"
 
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { calculatePlatformFee, calculateTotalAmount } from "@/lib/payment-utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { CreditCard, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface DirectPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete?: () => void
}

export function DirectPaymentModal({ isOpen, onClose, onPaymentComplete }: DirectPaymentModalProps) {
  const [amount, setAmount] = useState<number>(100)
  const [purpose, setPurpose] = useState<string>("")
  const [recipientEmail, setRecipientEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [paymentUrl, setPaymentUrl] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [orderId, setOrderId] = useState<string>("")
  const { toast } = useToast()
  const { user } = useAuth()

  const platformFee = calculatePlatformFee(amount)
  const totalAmount = calculateTotalAmount(amount)

  const handleCreatePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment",
        variant: "destructive",
      })
      return
    }

    if (!recipientEmail) {
      toast({
        title: "Recipient Required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Create payment record in Firestore first
      const paymentData = {
        amount: totalAmount,
        baseAmount: amount,
        platformFee: platformFee,
        purpose,
        recipientEmail,
        userId: user.uid,
        userName: user.displayName || "",
        userEmail: user.email || "",
        userPhone: user.phoneNumber || "",
        status: "PENDING",
        type: "direct",
        createdAt: serverTimestamp(),
      }

      // Add to Firestore
      const paymentRef = await addDoc(collection(db, "payments"), paymentData)

      // Now create the payment with Cashfree
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          purpose,
          recipientEmail,
          paymentId: paymentRef.id,
          userId: user.uid,
          userName: user.displayName || "",
          userEmail: user.email || "",
          userPhone: user.phoneNumber || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Update the payment record with order ID
      await fetch("/api/payment/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user ? `Bearer ${await user.getIdToken()}` : "",
        },
        body: JSON.stringify({
          paymentId: paymentRef.id,
          orderId: data.order_id,
          paymentLink: data.payment_link,
        }),
      })

      // Store the order ID for polling
      setOrderId(data.order_id)

      // Get the payment URL
      if (data.payment_link) {
        setPaymentUrl(data.payment_link)
        window.open(data.payment_link, "_blank")

        // Start polling for payment status
        pollPaymentStatus(data.order_id)
      } else {
        throw new Error("No payment link received")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const pollPaymentStatus = async (orderId: string) => {
    try {
      setPaymentStatus("pending")

      // Poll every 5 seconds for up to 5 minutes
      const maxAttempts = 60
      let attempts = 0

      const checkStatus = async () => {
        if (attempts >= maxAttempts) {
          setPaymentStatus("timeout")
          setIsLoading(false)
          return
        }

        attempts++

        try {
          const response = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: user ? `Bearer ${await user.getIdToken()}` : "",
            },
            body: JSON.stringify({
              orderId,
            }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            const paymentData = data.data
            if (paymentData && paymentData.length > 0) {
              if (paymentData[0].payment_status === "SUCCESS") {
                setPaymentStatus("success")
                setIsLoading(false)
                if (onPaymentComplete) onPaymentComplete()
                return
              } else if (paymentData[0].payment_status === "FAILED") {
                setPaymentStatus("failed")
                setIsLoading(false)
                return
              }
            }
          }

          // Continue polling
          setTimeout(checkStatus, 5000)
        } catch (error) {
          console.error("Error checking payment status:", error)
          setTimeout(checkStatus, 5000)
        }
      }

      // Start polling
      checkStatus()
    } catch (error) {
      console.error("Error in payment status polling:", error)
      setPaymentStatus("error")
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAmount(100)
    setPurpose("")
    setRecipientEmail("")
    setPaymentStatus("")
    setPaymentUrl("")
    setOrderId("")
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl">Make a Payment</DialogTitle>
          <DialogDescription>Send a payment to another user or service</DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-slate-400 text-center mb-4">Your payment has been processed successfully.</p>
            <Button onClick={handleClose} className="w-full">
              Continue
            </Button>
          </div>
        ) : paymentStatus === "failed" || paymentStatus === "error" ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-slate-400 text-center mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <Button onClick={() => setPaymentStatus("")} className="w-full">
              Try Again
            </Button>
          </div>
        ) : paymentStatus === "pending" ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-slate-400 text-center mb-4">
              Please complete the payment in the opened window. This page will update automatically.
            </p>
            {paymentUrl && (
              <Button onClick={() => window.open(paymentUrl, "_blank")} variant="outline" className="w-full mb-2">
                Open Payment Window
              </Button>
            )}
            <Button onClick={handleClose} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (INR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Payment Purpose (Optional)</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="What is this payment for?"
                  className="bg-slate-800 border-slate-700 min-h-[80px]"
                />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Base Amount:</span>
                  <span>₹{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Platform Fee (10%):</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 my-2"></div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-md text-sm text-blue-300">
                <p>
                  The platform charges a 10% fee to facilitate secure transactions and provide protection for both
                  parties.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose} className="sm:w-auto w-full">
                Cancel
              </Button>
              <Button
                onClick={handleCreatePayment}
                disabled={isLoading || amount <= 0 || !recipientEmail}
                className="sm:w-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Proceed to Payment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
