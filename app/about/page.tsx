"use client"










import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlowingParticles } from "@/components/glowing-particles"
import { AnimatedHeading } from "@/components/animated-heading"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown, Award, Users, Target, Zap, Github, Linkedin, Mail, CheckCircle2 } from "lucide-react"
import Image from "next/image"
 
export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <div className="relative" ref={containerRef}>
        <GlowingParticles/>

        {/* About Us Section */}
        <section id="about" className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  About Us
                </h1>
                <div className="h-1 w-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-8"></div>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Learn about our mission, our team, and the story behind SamparkSetu's journey to reunite people with
                  their lost belongings.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {/* Our Genesis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-blue-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-300">Our Genesis</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      SamparkSetu emerged from a powerful realization: despite our hyper-connected world, the process of
                      recovering lost items remains fragmented and inefficient. Founded in 2023, we represent the
                      perfect fusion of cutting-edge technology with human compassion.
                    </p>
                  </div>
                </motion.div>

                {/* Our Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-purple-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-purple-300">Our Name</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      "SamparkSetu" combines two Sanskrit words: "Sampark" (connection) and "Setu" (bridge). This
                      perfectly encapsulates our purpose — building bridges between people and their lost possessions
                      while creating meaningful connections in the process.
                    </p>
                  </div>
                </motion.div>

                {/* Our Innovation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-cyan-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-cyan-300">Our Innovation</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      What sets SamparkSetu apart is our revolutionary approach to the age-old problem of lost and
                      found. Our AI-powered matching system analyzes patterns and probabilities beyond simple
                      descriptions, dramatically increasing recovery success rates. We've built security and privacy
                      into our core, ensuring the process is both effective and safe.
                    </p>
                  </div>
                </motion.div>

                {/* Our Community */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-green-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-300">Our Community</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Technology alone isn't enough. SamparkSetu is built on the foundation of community and trust. We
                      believe in the inherent goodness of people and their willingness to help others. Our platform
                      provides the infrastructure that enables this goodwill to flourish in the digital age.
                    </p>
                  </div>
                </motion.div>

                {/* Our Journey */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 h-full md:col-span-2"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-amber-500/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-amber-300">Our Journey</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Today, SamparkSetu serves thousands of users across India, with plans for global expansion. What
                      began as a project between two passionate individuals has evolved into a vibrant platform that
                      reunites people with cherished possessions daily. We're proud of our progress and excited about
                      the future as we continue to refine our technology, grow our community, and bridge more gaps
                      between the lost and found.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,29,149,0.15),transparent_70%)]" />
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div style={{ opacity, scale }} className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Our Mission & Vision
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-6">
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-300">Our Mission</h3>
                  <p className="text-slate-300 leading-relaxed">
                    SamparkSetu aims to revolutionize the lost and found experience by leveraging cutting-edge
                    technology to reunite people with their lost possessions. We believe that every item has a story and
                    a rightful owner, and our mission is to bridge the gap between loss and recovery through an
                    intuitive, secure, and community-driven platform.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/60 backdrop-blur-sm p-8 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="bg-purple-500/20 p-3 rounded-full w-fit mb-6">
                    <Zap className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-300">Our Vision</h3>
                  <p className="text-slate-300 leading-relaxed">
                    We envision a world where the stress and heartache of losing valuable items is minimized through our
                    innovative platform. SamparkSetu strives to create a global network of compassionate individuals who
                    help each other recover lost items, fostering a sense of community and trust. Our vision extends
                    beyond just recovery—we aim to redefine the entire lost and found experience.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 relative bg-gradient-to-b from-black to-slate-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Our Core Values
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              <p className="text-slate-300 max-w-3xl mx-auto">
                The principles that guide our innovation and service to the community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Award className="h-10 w-10 text-yellow-400" />,
                  title: "Integrity",
                  description:
                    "We uphold the highest standards of honesty and ethical conduct in all our operations and interactions.",
                },
                {
                  icon: <Users className="h-10 w-10 text-green-400" />,
                  title: "Community",
                  description:
                    "We believe in the power of community and collective effort to solve problems and create positive change.",
                },
                {
                  icon: <Zap className="h-10 w-10 text-blue-400" />,
                  title: "Innovation",
                  description:
                    "We continuously push the boundaries of technology to create more effective solutions for our users.",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all duration-300 text-center"
                >
                  <div className="bg-slate-800/50 p-4 rounded-full w-fit mx-auto mb-6">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">{value.title}</h3>
                  <p className="text-slate-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,29,149,0.15),transparent_70%)]" />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Meet Our Team
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              <p className="text-slate-300 max-w-3xl mx-auto">
                The brilliant minds behind SamparkSetu working tirelessly to reunite people with their lost items
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-900 p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden p-6">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-blue-500/30 group-hover:border-blue-500 transition-colors duration-300 shadow-lg shadow-blue-500/20">
                        <Image src="/rahulmishra.jpeg" alt="Rahul Mishra" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-1">Rahul Mishra</h3>
                      <p className="text-blue-400 font-medium mb-4">Developer & Technical Lead</p>

                      <p className="text-slate-300 text-center mb-6">
                        Visionary developer with expertise in cutting-edge technologies. Rahul leads the technical
                        architecture of SamparkSetu, bringing innovative solutions to complex problems.
                      </p>

                      <div className="flex space-x-4">
                        <a
                          href="https://github.com/machinelearningprodigy"
                          className="bg-slate-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Github className="h-5 w-5 text-white" />
                          <span className="sr-only">GitHub</span>
                        </a>
                        <a
                          href="https://www.linkedin.com/in/rahul-mishra-9a8826269"
                          className="bg-slate-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Linkedin className="h-5 w-5 text-white" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                          href="mailto:avaantivirus2021@gmail.com"
                          className="bg-slate-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Mail className="h-5 w-5 text-white" />
                          <span className="sr-only">Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-900/40 to-slate-900 p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden p-6">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-teal-500/30 group-hover:border-teal-500 transition-colors duration-300 shadow-lg shadow-teal-500/20">
                        <Image src="/amit.jpg" alt="Amit Bhowmik" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-1">Amit Bhowmik</h3>
                      <p className="text-teal-400 font-medium mb-4">Lead Backend Developer</p>

                      <p className="text-slate-300 text-center mb-6">
                        Expert backend architect with deep knowledge of scalable systems. Amit ensures SamparkSetu's
                        infrastructure is robust, secure, and performs flawlessly under any load.
                      </p>

                      <div className="flex space-x-4">
                        <a
                          href="#"
                          className="bg-slate-800 hover:bg-teal-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Github className="h-5 w-5 text-white" />
                          <span className="sr-only">GitHub</span>
                        </a>
                        <a
                          href="#"
                          className="bg-slate-800 hover:bg-teal-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Linkedin className="h-5 w-5 text-white" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                          href="#"
                          className="bg-slate-800 hover:bg-teal-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Mail className="h-5 w-5 text-white" />
                          <span className="sr-only">Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900 p-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden p-6">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-purple-500/30 group-hover:border-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/20">
                        <Image
                          src="/evankishylla.png"
                          alt="Evanki Shylla"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-1">Evanki Shylla</h3>
                      <p className="text-purple-400 font-medium mb-4">Content & Documentation Lead</p>

                      <p className="text-slate-300 text-center mb-6">
                        Creative storyteller and documentation expert. Evanki crafts compelling content and ensures that
                        SamparkSetu's vision is communicated clearly to our users.
                      </p>

                      <div className="flex space-x-4">
                        <a
                          href="https://github.com/Shylla01"
                          className="bg-slate-800 hover:bg-purple-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Github className="h-5 w-5 text-white" />
                          <span className="sr-only">GitHub</span>
                        </a>
                        <a
                          href="#"
                          className="bg-slate-800 hover:bg-purple-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Linkedin className="h-5 w-5 text-white" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                          href="mailto:shyllaevanki@gmail.com"
                          className="bg-slate-800 hover:bg-purple-600 p-2 rounded-full transition-colors duration-300"
                        >
                          <Mail className="h-5 w-5 text-white" />
                          <span className="sr-only">Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Our Journey
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
            </motion.div>

            <div className="max-w-4xl mx-auto relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>

              {/* Timeline items */}
              {[
                {
                  year: "2023",
                  title: "The Inception",
                  description:
                    "SamparkSetu was born from a simple idea: to create a platform that uses technology to reunite people with their lost possessions.",
                },
                {
                  year: "2024",
                  title: "Platform Launch",
                  description:
                    "After months of development and testing, we launched our platform with core features for reporting and finding lost items.",
                },
                {
                  year: "2025",
                  title: "Growing Community",
                  description:
                    "SamparkSetu continues to evolve with new features and a growing community of users helping each other recover lost items.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pl-12" : "pr-12 text-right"}`}>
                    <div className="bg-slate-900/60 backdrop-blur-sm p-6 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
                      <h3 className="text-xl font-bold text-blue-400 mb-1">{item.title}</h3>
                      <p className="text-slate-300">{item.description}</p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center z-10">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </div>

                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12"}`}>
                    <div className="text-3xl font-bold text-white opacity-30">{item.year}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-black"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,29,149,0.2),transparent_70%)]"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-lg p-10 rounded-2xl border border-slate-800 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Join Our Mission
              </h2>

              <p className="text-slate-300 mb-8 text-lg">
                Be part of a community that's making a difference. Together, we can help reunite people with their lost
                possessions and create meaningful connections.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <a
                  href="/login"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Get Started Today
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
