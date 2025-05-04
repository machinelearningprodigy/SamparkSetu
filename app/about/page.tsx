"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Aanya Sharma",
      role: "Founder & CEO",
      bio: "With over 10 years of experience in community building and tech innovation, Aanya founded SamparkSetu with a vision to reunite people with their lost belongings using cutting-edge technology.",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Vikram Mehta",
      role: "CTO",
      bio: "Vikram leads our technical team, bringing expertise in AI and machine learning to create our advanced matching algorithms that help connect lost items with their owners.",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Priya Patel",
      role: "Head of Operations",
      bio: "Priya ensures that our platform runs smoothly, overseeing customer support and implementing processes that make finding and reporting items as seamless as possible.",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Arjun Singh",
      role: "Community Manager",
      bio: "Arjun works directly with our user community, gathering feedback and ensuring that SamparkSetu continues to meet the needs of the people we serve.",
      avatar: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              About SamparkSetu
            </h1>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 mb-12">
              <CardContent className="pt-6">
                <p className="text-lg mb-6">
                  SamparkSetu, which means "Connection Bridge" in Hindi, was founded with a simple yet powerful mission:
                  to reunite people with their lost belongings and create meaningful connections in the process.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-white">Our Mission</h2>
                <p className="mb-6">
                  At SamparkSetu, we believe that every lost item has a story and an owner who misses it. Our mission is
                  to leverage technology to bridge the gap between lost items and their owners, making the process of
                  recovering lost belongings efficient, secure, and accessible to everyone.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-white">Our Vision</h2>
                <p className="mb-6">
                  We envision a world where the stress and heartache of losing valuable items is minimized through a
                  supportive community platform powered by cutting-edge technology. We aim to be the most trusted lost
                  and found service globally, known for our integrity, innovation, and impact.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-white">Our Story</h2>
                <p className="mb-6">
                  SamparkSetu was born from a personal experience. Our founder, Aanya Sharma, lost a cherished family
                  heirloom while traveling and experienced firsthand the frustration and inefficiency of traditional
                  lost and found systems. This sparked the idea for a modern, technology-driven platform that could make
                  reconnecting people with their lost items simpler and more effective.
                </p>
                <p className="mb-6">
                  Launched in 2023, SamparkSetu has already helped thousands of people recover their lost items, from
                  everyday essentials like keys and wallets to irreplaceable sentimental items. Our sci-fi inspired
                  design reflects our commitment to using advanced technology to solve everyday problems.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-white">Our Technology</h2>
                <p className="mb-6">
                  SamparkSetu employs sophisticated matching algorithms that analyze item descriptions, locations, and
                  images to suggest potential matches between lost and found items. Our secure messaging system allows
                  users to communicate safely while protecting their privacy. We're constantly innovating and improving
                  our platform based on user feedback and technological advancements.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800 h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-slate-900/70 backdrop-blur-lg border-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl">Join Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  We're always looking for passionate individuals to join our team and help us in our mission to reunite
                  people with their lost items. If you're interested in working with us, check out our careers page or
                  reach out to us directly.
                </p>
                <p>Together, we can create a world where losing something doesn't mean losing it forever.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

