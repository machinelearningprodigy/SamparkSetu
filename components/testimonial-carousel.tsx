"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Star, MapPin, Package } from "lucide-react"

type Testimonial = {
  id: number
  name: string
  location: string
  rating: number
  itemType: string
  text: string
  avatar?: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rahul M.",
    location: "Delhi",
    rating: 5,
    itemType: "Laptop",
    text: "I lost my laptop at the airport and thought I'd never see it again. Within 24 hours of posting on SAMPARKSETU, I was connected with the person who found it. This platform is a lifesaver!",
    avatar: "/diverse-group.png",
  },
  {
    id: 2,
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    itemType: "Wallet",
    text: "Lost my wallet with all my IDs during a train journey. Posted on SAMPARKSETU and someone had found it! The secure chat feature made it easy to arrange a meetup. Highly recommend!",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: 3,
    name: "Amit K.",
    location: "Bangalore",
    rating: 4,
    itemType: "Phone",
    text: "My phone slipped out of my pocket during a cab ride. I thought it was gone forever, but SAMPARKSETU's AI matching system connected me with the next passenger who found it. Amazing service!",
    avatar: "/thoughtful-man.png",
  },
  {
    id: 4,
    name: "Sneha R.",
    location: "Chennai",
    rating: 5,
    itemType: "Camera",
    text: "Left my expensive DSLR camera at a coffee shop. Posted details on SAMPARKSETU and was matched with the shop manager who had kept it safe. The verification process gave me peace of mind.",
    avatar: "/woman-with-glasses.png",
  },
  {
    id: 5,
    name: "Vikram J.",
    location: "Hyderabad",
    rating: 5,
    itemType: "Backpack",
    text: "My backpack with important documents was left on a bus. Thanks to SAMPARKSETU's quick matching algorithm, I was able to recover it within hours. The location tracking feature was incredibly helpful!",
    avatar: "/indian-man.png",
  },
  {
    id: 6,
    name: "Meera P.",
    location: "Kolkata",
    rating: 4,
    itemType: "Jewelry",
    text: "Lost a family heirloom necklace at a wedding. Was devastated until someone posted it on SAMPARKSETU. The secure verification process ensured I could prove ownership. Forever grateful!",
    avatar: "/serene-indian-woman.png",
  },
  {
    id: 7,
    name: "Arjun T.",
    location: "Pune",
    rating: 5,
    itemType: "Keys",
    text: "Dropped my house and car keys while jogging in the park. Posted on SAMPARKSETU and was connected with a fellow jogger who had picked them up. The platform's chat feature made coordination seamless.",
    avatar: "/young-man-contemplative.png",
  },
  {
    id: 8,
    name: "Divya M.",
    location: "Ahmedabad",
    rating: 5,
    itemType: "Tablet",
    text: "My iPad was left in a restaurant. Posted details on SAMPARKSETU and was matched with the staff who had found it. The platform's notification system kept me updated throughout the process.",
    avatar: "/young-woman-smiling.png",
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  // Handle autoplay
  useEffect(() => {
    if (isAutoplay) {
      autoplayRef.current = setInterval(() => {
        nextTestimonial()
      }, 5000) // Change testimonial every 5 seconds
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [isAutoplay, currentIndex])

  // Pause autoplay on hover
  const handleMouseEnter = () => setIsAutoplay(false)
  const handleMouseLeave = () => setIsAutoplay(true)

  return (
    <div className="relative">
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">What Our Users Say</h3>

      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Testimonial cards */}
        <div className="relative h-[400px] md:h-[300px]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={testimonials[currentIndex].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 p-6 md:p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl"
            >
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* User info */}
                <div className="flex flex-col items-center md:w-1/4">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500/30 p-1">
                      {testimonials[currentIndex].avatar ? (
                        <img
                          src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                          alt={testimonials[currentIndex].name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-slate-800"></div>
                  </div>

                  <h4 className="text-lg font-semibold text-white">{testimonials[currentIndex].name}</h4>

                  <div className="flex items-center text-slate-400 text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{testimonials[currentIndex].location}</span>
                  </div>

                  <div className="flex items-center text-slate-400 text-sm mt-1">
                    <Package className="w-3 h-3 mr-1" />
                    <span>{testimonials[currentIndex].itemType}</span>
                  </div>

                  <div className="flex mt-3">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: i < testimonials[currentIndex].rating ? [1, 1.2, 1] : 1 }}
                        transition={{
                          duration: 0.5,
                          delay: i * 0.1,
                          repeat: i < testimonials[currentIndex].rating ? 1 : 0,
                          repeatDelay: 3,
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            i < testimonials[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Testimonial text */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="relative">
                    <div className="absolute -top-6 -left-2 text-5xl text-indigo-500/20">"</div>
                    <p className="text-slate-300 italic text-lg relative z-10">{testimonials[currentIndex].text}</p>
                    <div className="absolute -bottom-6 -right-2 text-5xl text-indigo-500/20">"</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-indigo-500 w-6" : "bg-slate-600 hover:bg-slate-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevTestimonial}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors duration-300"
          aria-label="Previous testimonial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors duration-300"
          aria-label="Next testimonial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
