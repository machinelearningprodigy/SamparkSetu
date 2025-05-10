"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { GlowingParticles } from "@/components/glowing-particles"
import {
  Shield,
  FileText,
  Database,
  Share2,
  Lock,
  UserCheck,
  Baby,
  RefreshCw,
  MessageSquare,
  Info,
  Check,
  Users,
  Server,
  Eye,
} from "lucide-react"

export default function PrivacyPolicyPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />
      <GlowingParticles />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Privacy Policy
            </h1>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full my-6"></div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              We value your privacy and are committed to protecting your personal data. This policy explains how we
              collect, use, and safeguard your information.
            </p>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                    <Info className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-blue-400">Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <p>
                      <span className="text-blue-400 font-medium">Last Updated:</span> March 21, 2025
                    </p>
                  </div>
                  <p>
                    Welcome to SamparkSetu. We respect your privacy and are committed to protecting your personal data.
                    This privacy policy will inform you about how we look after your personal data when you visit our
                    website and tell you about your privacy rights and how the law protects you.
                  </p>
                  <p>
                    This privacy policy applies to all users of SamparkSetu's services, including our website, mobile
                    applications, and any other platforms we may offer.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <Database className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-purple-400">Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We collect several types of information from and about users of our platform, including:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Personal Identifiers:</span> Such as name, email
                        address, phone number, and username.
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Account Information:</span> Login credentials,
                        account preferences, and profile information.
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Lost and Found Item Data:</span> Information about
                        items you report as lost or found.
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Communications:</span> Messages sent through our
                        platform between users.
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Technical Data:</span> IP address, browser
                        information, device details, and access patterns.
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Eye className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Usage Data:</span> Information about how you use
                        our website, products, and services.
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-cyan-400">How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">We use the information we collect for various purposes, including:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To provide and maintain our service",
                      },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To match lost items with found items",
                      },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To facilitate communication between users",
                      },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To notify you about changes to our service",
                      },
                      { icon: <Check className="w-3.5 h-3.5 text-cyan-400" />, text: "To provide customer support" },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To gather analysis to improve our service",
                      },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To monitor the usage of our service",
                      },
                      {
                        icon: <Check className="w-3.5 h-3.5 text-cyan-400" />,
                        text: "To detect, prevent and address technical issues",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div>{item.text}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-green-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/20">
                    <Share2 className="w-6 h-6 text-green-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-green-400">Data Sharing and Disclosure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>We may share your personal information in the following situations:</p>
                  <div className="space-y-3">
                    {[
                      {
                        title: "With Other Users",
                        icon: <Users className="w-3.5 h-3.5 text-green-400" />,
                        text: "When you report a lost or found item, certain information may be visible to other users to facilitate matching and recovery.",
                      },
                      {
                        title: "With Service Providers",
                        icon: <Server className="w-3.5 h-3.5 text-green-400" />,
                        text: "We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us.",
                      },
                      {
                        title: "For Business Transfers",
                        icon: <RefreshCw className="w-3.5 h-3.5 text-green-400" />,
                        text: "We may share your information in connection with any merger, sale of company assets, financing, or acquisition.",
                      },
                      {
                        title: "With Your Consent",
                        icon: <Check className="w-3.5 h-3.5 text-green-400" />,
                        text: "We may disclose your personal information for any other purpose with your consent.",
                      },
                      {
                        title: "Legal Requirements",
                        icon: <FileText className="w-3.5 h-3.5 text-green-400" />,
                        text: "We may disclose your information where required to do so by law or in response to valid requests by public authorities.",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-1">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-green-400 font-medium mb-1">{item.title}</h4>
                          <p className="text-slate-300">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/20">
                    <Lock className="w-6 h-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-amber-400">Data Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-amber-500/20 rounded-lg bg-amber-500/5">
                    <p className="text-center">
                      We have implemented appropriate technical and organizational security measures designed to protect
                      the security of any personal information we process. However, please also remember that we cannot
                      guarantee that the internet itself is 100% secure.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: "Encryption", text: "All data in transit and at rest is encrypted" },
                      { title: "Access Controls", text: "Strict controls limit who can access your data" },
                      { title: "Regular Audits", text: "We perform security audits to identify vulnerabilities" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-slate-800/50 text-center hover:bg-slate-800/70 transition-colors"
                      >
                        <h4 className="text-amber-400 font-medium mb-2">{item.title}</h4>
                        <p className="text-sm">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-pink-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30 shadow-lg shadow-pink-500/20">
                    <UserCheck className="w-6 h-6 text-pink-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-pink-400">Your Data Protection Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Depending on your location, you may have certain rights regarding your personal information, such
                    as:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      "The right to access your information",
                      "The right to rectification",
                      "The right to object",
                      "The right of restriction",
                      "The right to data portability",
                      "The right to withdraw consent",
                    ].map((right, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-pink-400" />
                        </div>
                        <div>{right}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20 text-center mt-4">
                    <p>
                      To exercise any of these rights, please contact us at{" "}
                      <span className="text-pink-400 font-medium">privacy@samparksetu.com</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                    <Baby className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-blue-400">Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p>
                      Our service is not intended for use by children under the age of 13. We do not knowingly collect
                      personally identifiable information from children under 13. If you are a parent or guardian and
                      you are aware that your child has provided us with personal data, please contact us.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <RefreshCw className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-purple-400">Changes to This Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                    new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy
                    Policy.
                  </p>
                  <p>
                    You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                    Policy are effective when they are posted on this page.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                    <MessageSquare className="w-6 h-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-cyan-400">Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>If you have any questions about this Privacy Policy, please contact us:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg flex flex-col items-center text-center hover:bg-slate-800/70 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h4 className="text-cyan-400 font-medium mb-1">By Email</h4>
                      <p className="text-sm">privacy@samparksetu.com</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg flex flex-col items-center text-center hover:bg-slate-800/70 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h4 className="text-cyan-400 font-medium mb-1">By Contact Form</h4>
                      <p className="text-sm">samparksetu.com/contact</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg flex flex-col items-center text-center hover:bg-slate-800/70 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h4 className="text-cyan-400 font-medium mb-1">By Mail</h4>
                      <p className="text-sm">SamparkSetu HQ, 123 Tech Park, Cyber City, Gurugram, 122002</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 inline-block">
              <p className="text-slate-300">
                Last Policy Update: <span className="text-blue-400 font-medium">March 21, 2025</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
