"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { GlowingParticles } from "@/components/glowing-particles"
import {
  FileText,
  Users,
  AlertCircle,
  UserX,
  FileCode,
  Gavel,
  Pencil,
  MessageSquareWarning,
  ShieldAlert,
  Scroll,
  BookOpen,
} from "lucide-react"

export default function TermsPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black overflow-hidden relative">
      <GlowingParticles />
      <Navbar />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Terms and Conditions
            </h1>
            <div className="h-1 w-40 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6"></div>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Please read these terms carefully before using SamparkSetu. By accessing or using our platform, you agree
              to be bound by these terms and our Privacy Policy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Introduction */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="col-span-1 md:col-span-2"
            >
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Scroll className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl text-blue-400">Introduction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    Last Updated: <span className="text-blue-400">March 21, 2025</span>
                  </p>
                  <p>
                    Welcome to SamparkSetu. These terms and conditions outline the rules and regulations for the use of
                    SamparkSetu's website and services.
                  </p>
                  <p>
                    By accessing this website or using our services, we assume you accept these terms and conditions in
                    full. Do not continue to use SamparkSetu's website or services if you do not accept all of the terms
                    and conditions stated on this page.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Definitions */}
            <motion.div custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <BookOpen className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-2xl text-purple-400">Definitions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer
                    Notice and any or all Agreements:
                  </p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-purple-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                      </div>
                      <span>
                        <span className="font-semibold text-purple-300">"Client", "You" and "Your"</span> refers to you,
                        the person accessing this website and accepting the Company's terms and conditions.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-purple-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                      </div>
                      <span>
                        <span className="font-semibold text-purple-300">
                          "The Company", "Ourselves", "We", "Our" and "Us"
                        </span>{" "}
                        refers to SamparkSetu.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-purple-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                      </div>
                      <span>
                        <span className="font-semibold text-purple-300">"Platform"</span> refers to the SamparkSetu
                        website, mobile applications, and any other platforms we may offer.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* License to Use Platform */}
            <motion.div custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <FileCode className="h-6 w-6 text-cyan-500" />
                  </div>
                  <CardTitle className="text-2xl text-cyan-400">License to Use Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Unless otherwise stated, SamparkSetu and/or its licensors own the intellectual property rights for
                    all material on the Platform. All intellectual property rights are reserved.
                  </p>
                  <p>
                    You may view and/or print pages from the Platform for your own personal use subject to restrictions
                    set in these terms and conditions.
                  </p>
                  <p>You must not:</p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-cyan-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                      </div>
                      <span>Republish material from the Platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-cyan-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                      </div>
                      <span>Sell, rent, or sub-license material from the Platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-cyan-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                      </div>
                      <span>Reproduce, duplicate, or copy material from the Platform</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Accounts */}
            <motion.div custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-green-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl text-green-400">User Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    When you create an account with us, you guarantee that the information you provide is accurate,
                    complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in
                    the immediate termination of your account on the Platform.
                  </p>
                  <p>
                    You are responsible for maintaining the confidentiality of your account and password, including but
                    not limited to the restriction of access to your computer and/or account. You agree to accept
                    responsibility for any and all activities or actions that occur under your account and/or password.
                  </p>
                  <p>
                    We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders
                    at our sole discretion.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Content */}
            <motion.div custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <FileText className="h-6 w-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-2xl text-amber-400">User Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our Platform allows you to post, link, store, share and otherwise make available certain
                    information, text, graphics, videos, or other material. You are responsible for the Content that you
                    post on or through the Platform, including its legality, reliability, and appropriateness.
                  </p>
                  <p>By posting Content on or through the Platform, You represent and warrant that:</p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-amber-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                      </div>
                      <span>
                        The Content is yours (you own it) and/or you have the right to use it and the right to grant us
                        the rights and license as provided in these Terms.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-amber-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                      </div>
                      <span>
                        The posting of your Content on or through the Platform does not violate the privacy rights,
                        publicity rights, copyrights, contract rights or any other rights of any person or entity.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prohibited Uses */}
            <motion.div custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-red-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <UserX className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-2xl text-red-400">Prohibited Uses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    You may use our Platform only for lawful purposes and in accordance with these Terms. You agree not
                    to use the Platform:
                  </p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-red-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                      </div>
                      <span>In any way that violates any applicable national or international law or regulation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-red-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                      </div>
                      <span>
                        For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-red-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                      </div>
                      <span>
                        To transmit, or procure the sending of, any advertising or promotional material, including any
                        "junk mail", "chain letter," "spam," or any other similar solicitation.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div custom={6} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <ShieldAlert className="h-6 w-6 text-indigo-500" />
                  </div>
                  <CardTitle className="text-2xl text-indigo-400">Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    In no event shall SamparkSetu, nor its directors, employees, partners, agents, suppliers, or
                    affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                    including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                    resulting from:
                  </p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-indigo-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                      </div>
                      <span>Your access to or use of or inability to access or use the Platform;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-indigo-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                      </div>
                      <span>Any conduct or content of any third party on the Platform;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-indigo-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                      </div>
                      <span>Any content obtained from the Platform; and</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Disclaimer */}
            <motion.div custom={7} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <AlertCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-2xl text-orange-400">Disclaimer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Your use of the Platform is at your sole risk. The Platform is provided on an "AS IS" and "AS
                    AVAILABLE" basis. The Platform is provided without warranties of any kind, whether express or
                    implied, including, but not limited to, implied warranties of merchantability, fitness for a
                    particular purpose, non-infringement or course of performance.
                  </p>
                  <p>SamparkSetu, its subsidiaries, affiliates, and its licensors do not warrant that:</p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-orange-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                      </div>
                      <span>
                        The Platform will function uninterrupted, secure or available at any particular time or
                        location;
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 text-orange-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                      </div>
                      <span>Any errors or defects will be corrected;</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Governing Law */}
            <motion.div custom={8} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Gavel className="h-6 w-6 text-teal-500" />
                  </div>
                  <CardTitle className="text-2xl text-teal-400">Governing Law</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to
                    its conflict of law provisions.
                  </p>
                  <p>
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of
                    those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the
                    remaining provisions of these Terms will remain in effect.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Changes to Terms */}
            <motion.div
              custom={9}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="col-span-1 md:col-span-2"
            >
              <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 overflow-hidden group hover:border-pink-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                    <Pencil className="h-6 w-6 text-pink-500" />
                  </div>
                  <CardTitle className="text-2xl text-pink-400">Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                    revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
                    What constitutes a material change will be determined at our sole discretion.
                  </p>
                  <p>
                    By continuing to access or use our Platform after any revisions become effective, you agree to be
                    bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to
                    use the Platform.
                  </p>
                  <div className="mt-6 p-4 border border-pink-500/30 rounded-lg bg-pink-500/10">
                    <p className="flex items-center gap-2">
                      <MessageSquareWarning className="h-5 w-5 text-pink-400" />
                      <span>
                        If you have any questions about these Terms, please contact us at{" "}
                        <a href="mailto:legal@samparksetu.com" className="text-pink-400 hover:underline">
                          legal@samparksetu.com
                        </a>
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-400">Last updated: March 21, 2025 • SamparkSetu © 2025 • All Rights Reserved</p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
