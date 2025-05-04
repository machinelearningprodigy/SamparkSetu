import Link from "next/link"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              SAMPARKSETU
            </h3>
            <p className="text-slate-400 text-sm">
              The next level sci-fi themed lost and found platform connecting people with their lost items through
              advanced technology and community support.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/report/lost" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link href="/report/found" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
            <p className="mt-4 text-slate-400 text-sm">Subscribe to our newsletter for updates</p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-slate-900 border border-slate-800 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-md px-3 py-2 text-sm transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} SamparkSetu Lost & Found. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

