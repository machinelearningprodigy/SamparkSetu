import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-blue-500/20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-blue-950/30 z-0"></div>
      <div className="absolute inset-0 bg-[url('/abstract-grid-pattern.png')] bg-repeat opacity-5 z-0"></div>

      {/* Glowing borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      <div className="container relative mx-auto px-4 py-16 z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-1">
                SAMPARKSETU
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Bridging the void between lost possessions and their rightful owners through cutting-edge AI technology,
              secure blockchain verification, and a compassionate global community dedicated to reuniting what belongs
              together.
            </p>

            {/* App download section */}
            <div className="pt-4">
              <h4 className="text-white font-medium mb-4">Download Our App</h4>
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-1">GET IT ON</span>
                  <Link href="#" className="transition-transform hover:scale-105">
                    <Image
                      src="/apple-store.png"
                      alt="Download on the App Store"
                      width={160}
                      height={48}
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-1">DOWNLOAD ON THE</span>
                  <Link href="#" className="transition-transform hover:scale-105">
                    <Image
                      src="/play-store.png"
                      alt="Get it on Google Play"
                      width={160}
                      height={48}
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-6 pb-2 border-b border-slate-800">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Home
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/report/lost"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Report Lost Item
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/report/found"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Report Found Item
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Search
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Dashboard
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-medium mb-6 pb-2 border-b border-slate-800">Resources</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-pink-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  About Us
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Contact
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Privacy Policy
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-400 hover:text-white text-sm flex items-center group transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2 group-hover:scale-125 transition-transform"></div>
                  Terms & Conditions
                  <ArrowRight className="ml-1 w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h4 className="text-white font-medium mb-6 pb-2 border-b border-slate-800">Connect With Us</h4>

            {/* Contact info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 mr-3">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-400 text-sm">support@samparksetu.com</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/50 mr-3">
                  <Phone className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-slate-400 text-sm">+91 9085471314</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-900/50 mr-3">
                  <MapPin className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-slate-400 text-sm">Guwahati, India</span>
              </div>
            </div>

            {/* Social media */}
            <div className="mb-6">
              <h5 className="text-sm text-slate-300 mb-4">Follow Us</h5>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-900/50 to-blue-700/30 hover:from-blue-700/50 hover:to-blue-500/30 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <span className="absolute inset-0 rounded-full bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors"></span>
                  <Facebook className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </Link>
                <Link
                  href="#"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-900/50 to-cyan-700/30 hover:from-blue-700/50 hover:to-cyan-500/30 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <span className="absolute inset-0 rounded-full bg-cyan-600/10 group-hover:bg-cyan-600/20 transition-colors"></span>
                  <Twitter className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </Link>
                <Link
                  href="#"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-900/50 to-purple-700/30 hover:from-pink-700/50 hover:to-purple-500/30 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <span className="absolute inset-0 rounded-full bg-pink-600/10 group-hover:bg-pink-600/20 transition-colors"></span>
                  <Instagram className="h-5 w-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                </Link>
                <Link
                  href="#"
                  className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-900/50 to-slate-700/30 hover:from-slate-700/50 hover:to-slate-500/30 transition-all duration-300"
                  aria-label="GitHub"
                >
                  <span className="absolute inset-0 rounded-full bg-slate-600/10 group-hover:bg-slate-600/20 transition-colors"></span>
                  <Github className="h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="text-sm text-slate-300 mb-4">Subscribe to our newsletter</h5>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="bg-slate-900 border border-slate-800 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full text-slate-300"
                  />
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-r-md px-4 py-2 text-sm transition-all duration-300 flex items-center">
                    <span>Subscribe</span>
                    <CheckCircle2 className="ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} SamparkSetu Lost & Found. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
