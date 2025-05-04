"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Terms and Conditions
            </h1>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Last Updated: March 21, 2025</p>
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

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer
                  Notice and any or all Agreements:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>"Client", "You" and "Your"</strong> refers to you, the person accessing this website and
                    accepting the Company's terms and conditions.
                  </li>
                  <li>
                    <strong>"The Company", "Ourselves", "We", "Our" and "Us"</strong> refers to SamparkSetu.
                  </li>
                  <li>
                    <strong>"Party", "Parties", or "Us"</strong> refers to both the Client and ourselves, or either the
                    Client or ourselves.
                  </li>
                  <li>
                    <strong>"Platform"</strong> refers to the SamparkSetu website, mobile applications, and any other
                    platforms we may offer.
                  </li>
                  <li>
                    <strong>"Content"</strong> refers to all information, data, text, software, music, sound,
                    photographs, graphics, video, messages, or other materials that are posted, uploaded, or otherwise
                    transmitted via the Platform.
                  </li>
                </ul>
                <p>
                  All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the
                  process of our assistance to the Client in the most appropriate manner, whether by formal meetings of
                  a fixed duration, or any other means, for the express purpose of meeting the Client's needs in respect
                  of provision of the Company's stated services/products, in accordance with and subject to, prevailing
                  law of India.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>License to Use Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Unless otherwise stated, SamparkSetu and/or its licensors own the intellectual property rights for all
                  material on the Platform. All intellectual property rights are reserved.
                </p>
                <p>
                  You may view and/or print pages from the Platform for your own personal use subject to restrictions
                  set in these terms and conditions.
                </p>
                <p>You must not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Republish material from the Platform</li>
                  <li>Sell, rent, or sub-license material from the Platform</li>
                  <li>Reproduce, duplicate, or copy material from the Platform</li>
                  <li>
                    Redistribute content from the Platform (unless content is specifically made for redistribution)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  When you create an account with us, you guarantee that the information you provide is accurate,
                  complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the
                  immediate termination of your account on the Platform.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password, including but
                  not limited to the restriction of access to your computer and/or account. You agree to accept
                  responsibility for any and all activities or actions that occur under your account and/or password.
                </p>
                <p>
                  You must notify us immediately upon becoming aware of any breach of security or unauthorized use of
                  your account.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>User Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our Platform allows you to post, link, store, share and otherwise make available certain information,
                  text, graphics, videos, or other material. You are responsible for the Content that you post on or
                  through the Platform, including its legality, reliability, and appropriateness.
                </p>
                <p>By posting Content on or through the Platform, You represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The Content is yours (you own it) and/or you have the right to use it and the right to grant us the
                    rights and license as provided in these Terms.
                  </li>
                  <li>
                    The posting of your Content on or through the Platform does not violate the privacy rights,
                    publicity rights, copyrights, contract rights or any other rights of any person or entity.
                  </li>
                </ul>
                <p>We reserve the right to terminate the account of any user found to be infringing on a copyright.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You may use our Platform only for lawful purposes and in accordance with these Terms. You agree not to
                  use the Platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>In any way that violates any applicable national or international law or regulation.</li>
                  <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                  <li>
                    To transmit, or procure the sending of, any advertising or promotional material, including any "junk
                    mail", "chain letter," "spam," or any other similar solicitation.
                  </li>
                  <li>
                    To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other
                    person or entity.
                  </li>
                  <li>
                    To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Platform,
                    or which, as determined by us, may harm the Company or users of the Platform or expose them to
                    liability.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  In no event shall SamparkSetu, nor its directors, employees, partners, agents, suppliers, or
                  affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to or use of or inability to access or use the Platform;</li>
                  <li>Any conduct or content of any third party on the Platform;</li>
                  <li>Any content obtained from the Platform; and</li>
                  <li>
                    Unauthorized access, use or alteration of your transmissions or content, whether based on warranty,
                    contract, tort (including negligence) or any other legal theory, whether or not we have been
                    informed of the possibility of such damage.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your use of the Platform is at your sole risk. The Platform is provided on an "AS IS" and "AS
                  AVAILABLE" basis. The Platform is provided without warranties of any kind, whether express or implied,
                  including, but not limited to, implied warranties of merchantability, fitness for a particular
                  purpose, non-infringement or course of performance.
                </p>
                <p>SamparkSetu, its subsidiaries, affiliates, and its licensors do not warrant that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The Platform will function uninterrupted, secure or available at any particular time or location;
                  </li>
                  <li>Any errors or defects will be corrected;</li>
                  <li>The Platform is free of viruses or other harmful components; or</li>
                  <li>The results of using the Platform will meet your requirements.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  These Terms shall be governed and construed in accordance with the laws of India, without regard to
                  its conflict of law provisions.
                </p>
                <p>
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                  rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the
                  remaining provisions of these Terms will remain in effect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
                  What constitutes a material change will be determined at our sole discretion.
                </p>
                <p>
                  By continuing to access or use our Platform after any revisions become effective, you agree to be
                  bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use
                  the Platform.
                </p>
                <p>If you have any questions about these Terms, please contact us at legal@samparksetu.com.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

