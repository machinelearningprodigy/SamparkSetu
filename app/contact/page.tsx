"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { motion } from "framer-motion"
import { sendContactEmail } from "@/app/actions/contact-actions"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users,
  HelpCircle,
} from "lucide-react"
import { GlowingParticles } from "@/components/glowing-particles"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setFormStatus("idle")

      const result = await sendContactEmail(formData)

      if (result.success) {
        setFormStatus("success")
        toast({
          title: "Message Sent Successfully",
          description: "Thank you for reaching out! We'll get back to you soon.",
          variant: "default",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        setFormStatus("error")
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      setFormStatus("error")
      toast({
        title: "Message Failed to Send",
        description: error instanceof Error ? error.message : "Please try again later or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black overflow-hidden relative">
      <Navbar />
      <GlowingParticles className="absolute inset-0 z-0" />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Get In Touch
              </h1>
              <div className="h-1 w-32 md:w-48 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Have questions or feedback? We'd love to hear from you. Our team is always ready to help!
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Mail className="h-6 w-6 text-blue-400" />,
                title: "Email Us",
                content: (
                  <>
                    <p className="text-slate-300">
                      For general inquiries:
                      <br />
                      <a
                        href="mailto:info@samparksetu.com"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        info@samparksetu.com
                      </a>
                    </p>
                    <p className="text-slate-300 mt-2">
                      For support:
                      <br />
                      <a
                        href="mailto:support@samparksetu.com"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        support@samparksetu.com
                      </a>
                    </p>
                  </>
                ),
                color: "from-blue-600/20 to-blue-900/20",
                borderColor: "border-blue-500/30",
                hoverBorderColor: "group-hover:border-blue-400",
                glowColor: "group-hover:shadow-blue-500/20",
              },
              {
                icon: <Phone className="h-6 w-6 text-purple-400" />,
                title: "Call Us",
                content: (
                  <>
                    <p className="text-slate-300">
                      Customer Support:
                      <br />
                      <a href="tel:+919876543210" className="text-purple-400 hover:text-purple-300 transition-colors">
                        +91 9876 543 210
                      </a>
                    </p>
                    <p className="text-slate-300 mt-2">
                      Office:
                      <br />
                      <a href="tel:+911234567890" className="text-purple-400 hover:text-purple-300 transition-colors">
                        +91 1234 567 890
                      </a>
                    </p>
                  </>
                ),
                color: "from-purple-600/20 to-purple-900/20",
                borderColor: "border-purple-500/30",
                hoverBorderColor: "group-hover:border-purple-400",
                glowColor: "group-hover:shadow-purple-500/20",
              },
              {
                icon: <MapPin className="h-6 w-6 text-pink-400" />,
                title: "Visit Us",
                content: (
                  <p className="text-slate-300">
                    SamparkSetu Headquarters
                    <br />
                    123 Tech Park, Cyber City
                    <br />
                    Gurugram, Haryana 122002
                    <br />
                    India
                  </p>
                ),
                color: "from-pink-600/20 to-pink-900/20",
                borderColor: "border-pink-500/30",
                hoverBorderColor: "group-hover:border-pink-400",
                glowColor: "group-hover:shadow-pink-500/20",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="group"
              >
                <div
                  className={`h-full rounded-xl bg-gradient-to-br ${item.color} backdrop-blur-lg border ${item.borderColor} ${item.hoverBorderColor} transition-all duration-300 p-6 hover:translate-y-[-5px] ${item.glowColor} hover:shadow-xl`}
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-slate-800/50 mr-3">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  </div>
                  <div>{item.content}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 order-2 lg:order-1"
            >
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:shadow-blue-900/10">
                <h2 className="text-2xl font-bold mb-6 text-white">How Can We Help?</h2>

                <div className="space-y-6">
                  {[
                    {
                      icon: <MessageSquare className="h-5 w-5 text-blue-400" />,
                      title: "General Inquiries",
                      description: "Questions about our platform, services, or company information.",
                    },
                    {
                      icon: <Users className="h-5 w-5 text-purple-400" />,
                      title: "Partnership Opportunities",
                      description: "Interested in collaborating with SamparkSetu? Let's discuss possibilities.",
                    },
                    {
                      icon: <HelpCircle className="h-5 w-5 text-pink-400" />,
                      title: "Technical Support",
                      description: "Need help with the platform? Our team is ready to assist you.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 mr-4 p-2.5 rounded-full bg-slate-800/80 border border-slate-700/50 shadow-lg">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{item.title}</h3>
                        <p className="text-slate-300 mt-1">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-blue-300 flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>We typically respond to all inquiries within 24-48 hours during business days.</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-3 order-1 lg:order-2"
            >
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:shadow-purple-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                <h2 className="text-2xl font-bold mb-6 text-white relative z-10">Send Us a Message</h2>

                {formStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Message Sent Successfully!</h3>
                    <p className="text-green-300 mb-4">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button
                      onClick={() => setFormStatus("idle")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          Name <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                            required
                            className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 pl-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <Users className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your.email@example.com"
                            required
                            className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 pl-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <Mail className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">
                        Subject
                      </Label>
                      <div className="relative">
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="What is your message about?"
                          className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 pl-10"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">
                        Message <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Your message..."
                        rows={6}
                        required
                        className="bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {formStatus === "error" && (
                      <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-red-300">
                          There was an error sending your message. Please try again or contact us directly via email.
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    question: "How quickly will I receive a response?",
                    answer: "We aim to respond to all inquiries within 24-48 hours during business days.",
                  },
                  {
                    question: "I need urgent help with my account. What should I do?",
                    answer:
                      "For urgent account-related issues, please contact our support team directly at support@samparksetu.com or call our customer support line.",
                  },
                  {
                    question: "Do you offer partnerships or collaborations?",
                    answer:
                      "Yes, we're open to partnerships and collaborations. Please send your proposal to partnerships@samparksetu.com with details about your organization and ideas for collaboration.",
                  },
                  {
                    question: "Is my data secure when I contact you?",
                    answer:
                      "Absolutely. All communications through our contact form are encrypted and your personal information is handled according to our Privacy Policy.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 hover:bg-slate-800/50 transition-colors duration-300"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">{item.question}</h3>
                    <p className="text-slate-300">{item.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <Toaster />
    </div>
  )
}
