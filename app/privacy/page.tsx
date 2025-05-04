"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Privacy Policy
            </h1>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Last Updated: March 21, 2025</p>
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

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We collect several types of information from and about users of our platform, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Identifiers:</strong> Such as name, email address, phone number, and username.
                  </li>
                  <li>
                    <strong>Account Information:</strong> Login credentials, account preferences, and profile
                    information.
                  </li>
                  <li>
                    <strong>Lost and Found Item Data:</strong> Information about items you report as lost or found,
                    including descriptions, images, locations, and dates.
                  </li>
                  <li>
                    <strong>Communications:</strong> Messages sent through our platform between users regarding lost and
                    found items.
                  </li>
                  <li>
                    <strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone
                    setting, browser plug-in types and versions, operating system and platform, and other technology on
                    the devices you use to access our platform.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our website, products, and services.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To match lost items with found items</li>
                  <li>To facilitate communication between users regarding lost and found items</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>To protect the security and integrity of our platform</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Data Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We may share your personal information in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>With Other Users:</strong> When you report a lost or found item, certain information (such
                    as item description, location, and your contact method) may be visible to other users to facilitate
                    matching and recovery.
                  </li>
                  <li>
                    <strong>With Service Providers:</strong> We may share your information with third-party vendors,
                    service providers, contractors, or agents who perform services for us or on our behalf.
                  </li>
                  <li>
                    <strong>For Business Transfers:</strong> We may share or transfer your information in connection
                    with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of
                    all or a portion of our business to another company.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> We may disclose your personal information for any other purpose
                    with your consent.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose your information where required to do so by law
                    or in response to valid requests by public authorities.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We have implemented appropriate technical and organizational security measures designed to protect the
                  security of any personal information we process. However, please also remember that we cannot
                  guarantee that the internet itself is 100% secure.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Your Data Protection Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access, update, or delete your information</li>
                  <li>The right to rectification (to correct or update your information)</li>
                  <li>The right to object (to processing of your information)</li>
                  <li>The right of restriction (to request that we restrict processing)</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p>To exercise any of these rights, please contact us at privacy@samparksetu.com.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our service is not intended for use by children under the age of 13. We do not knowingly collect
                  personally identifiable information from children under 13. If you are a parent or guardian and you
                  are aware that your child has provided us with personal data, please contact us.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-8">
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
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

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>By email: privacy@samparksetu.com</li>
                  <li>By visiting the contact page on our website: samparksetu.com/contact</li>
                  <li>By mail: SamparkSetu Headquarters, 123 Tech Park, Cyber City, Gurugram, Haryana 122002, India</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

