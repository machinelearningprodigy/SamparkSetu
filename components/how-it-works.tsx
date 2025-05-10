"use client"

import { motion } from "framer-motion"
import { FeatureCard } from "./feature-card"

export function HowItWorks() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-slate-950 opacity-50"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02]"></div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            How It Works
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our platform makes it easy to recover lost items through a simple three-step process
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="report"
            title="Report"
            description="Submit a lost or found item with details and images to our advanced database."
            index={0}
          />
          <FeatureCard
            icon="match"
            title="Match"
            description="Our AI-powered system finds potential matches based on item descriptions and locations."
            index={1}
          />
          <FeatureCard
            icon="connect"
            title="Connect"
            description="Chat securely with the other party and arrange to reclaim your lost item."
            index={2}
          />
        </div>

        {/* Statistics section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-slate-900/60 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-4xl font-bold text-blue-500 mb-2">98%</h3>
            <p className="text-slate-400">Success Rate</p>
          </motion.div>
          <motion.div
            className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-4xl font-bold text-purple-500 mb-2">24h</h3>
            <p className="text-slate-400">Average Recovery Time</p>
          </motion.div>
          <motion.div
            className="bg-slate-900/60 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-4xl font-bold text-green-500 mb-2">10k+</h3>
            <p className="text-slate-400">Items Recovered</p>
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700/50 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-300 italic mb-4">
            "I lost my laptop at the airport and thought I'd never see it again. Within 24 hours of reporting it on
            SAMPARKSETU, I was connected with the person who found it. The process was seamless!"
          </p>
          <p className="text-slate-400 font-medium">- Rahul M., Delhi</p>
        </motion.div>
      </div>
    </section>
  )
}
