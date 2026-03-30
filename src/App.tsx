import { useState, useEffect } from 'react'
import './App.css'

// Simple placeholder components
const AnnouncementBar = () => (
  <div className="bg-primary-600 text-white text-center py-2 text-sm">
    🚚 Free Shipping on All Orders | 🛡️ 1-Year Warranty
  </div>
)

const Navbar = () => (
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="container-custom">
      <div className="flex justify-between items-center h-16">
        <a href="/" className="text-2xl font-bold text-primary-600">
          CoolDrivePro
        </a>
        <div className="hidden md:flex space-x-8">
          <a href="#products" className="text-gray-700 hover:text-primary-600">Products</a>
          <a href="#features" className="text-gray-700 hover:text-primary-600">Features</a>
          <a href="#faq" className="text-gray-700 hover:text-primary-600">FAQ</a>
          <a href="/blog/" className="text-gray-700 hover:text-primary-600">Blog</a>
          <a href="#contact" className="text-gray-700 hover:text-primary-600">Contact</a>
        </div>
        <button className="btn-primary">Shop Now</button>
      </div>
    </div>
  </nav>
)

const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24 md:py-32">
    <div className="container-custom">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Parking Air Conditioner for Off-Grid Life & Mobile Comfort
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Professional-grade 12V and 24V DC parking air conditioners for semi trucks, RVs, 
            camper vans, and specialty vehicles. Stay cool without idling your engine.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary text-lg">Shop 12V AC Units</button>
            <button className="btn-secondary text-lg">View 24V Systems</button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
            <span>✓ Free US Shipping</span>
            <span>✓ 1-Year Warranty</span>
            <span>✓ Expert Support</span>
          </div>
        </div>
        <div className="relative">
          <div className="bg-gray-700 rounded-2xl aspect-video flex items-center justify-center">
            <span className="text-6xl">🚛❄️</span>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const ProductsSection = () => (
  <section id="products" className="section-padding bg-gray-50">
    <div className="container-custom">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
        DC Parking Air Conditioners
      </h2>
      <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
        Choose the right cooling solution for your vehicle. Our no-idle AC systems 
        keep you comfortable while saving fuel and reducing emissions.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Product 1 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-4xl">❄️</span>
          </div>
          <div className="p-6">
            <span className="text-primary-600 text-sm font-semibold">BEST SELLER</span>
            <h3 className="text-xl font-bold mt-2 mb-2">12V Top-Mounted Parking AC</h3>
            <p className="text-gray-600 mb-4">
              10,000 BTU cooling capacity for trucks and RVs. Easy roof installation.
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• 12V DC Operation</li>
              <li>• 10,000 BTU Cooling</li>
              <li>• Battery Protection</li>
              <li>• Quiet Operation</li>
            </ul>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary-600">$1,299</span>
              <button className="btn-primary">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* Product 2 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-4xl">🚐</span>
          </div>
          <div className="p-6">
            <span className="text-green-600 text-sm font-semibold">NEW</span>
            <h3 className="text-xl font-bold mt-2 mb-2">24V Mini-Split System</h3>
            <p className="text-gray-600 mb-4">
              12,000 BTU dual-zone cooling for large trucks and specialty vehicles.
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• 24V DC Operation</li>
              <li>• 12,000 BTU Cooling</li>
              <li>• Dual Zone Control</li>
              <li>• Heat + Cool</li>
            </ul>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary-600">$1,599</span>
              <button className="btn-primary">Add to Cart</button>
            </div>
          </div>
        </div>

        {/* Product 3 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-4xl">🔋</span>
          </div>
          <div className="p-6">
            <span className="text-orange-600 text-sm font-semibold">BUNDLE</span>
            <h3 className="text-xl font-bold mt-2 mb-2">AC + Battery Pack Combo</h3>
            <p className="text-gray-600 mb-4">
              Complete off-grid solution with lithium battery and solar charging.
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• 12V or 24V Options</li>
              <li>• 200Ah Lithium Battery</li>
              <li>• Solar Panel Ready</li>
              <li>• All-in-One Kit</li>
            </ul>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary-600">$2,499</span>
              <button className="btn-primary">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const FeaturesSection = () => (
  <section id="features" className="section-padding">
    <div className="container-custom">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why Choose CoolDrivePro?
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: '⚡', title: 'No-Idle Operation', desc: 'Run your AC without burning fuel' },
          { icon: '🔋', title: 'Battery Protection', desc: 'Smart low-voltage cutout' },
          { icon: '🔇', title: 'Quiet Running', desc: 'Under 55dB operation' },
          { icon: '🌡️', title: 'Rapid Cooling', desc: 'Feel the difference in minutes' },
          { icon: '🛠️', title: 'Easy Install', desc: 'Complete DIY kit included' },
          { icon: '📱', title: 'Smart Control', desc: 'Bluetooth app control' },
          { icon: '☀️', title: 'Solar Ready', desc: 'Compatible with solar panels' },
          { icon: '🛡️', title: '1-Year Warranty', desc: 'Full parts & labor coverage' },
        ].map((feature, i) => (
          <div key={i} className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="text-4xl mb-4 block">{feature.icon}</span>
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const faqs = [
    {
      q: 'What is a parking air conditioner?',
      a: 'A parking air conditioner is a 12V or 24V DC cooling system that runs off your vehicle\'s battery, allowing you to stay cool without idling the engine. It\'s perfect for truck drivers, RV owners, and anyone who needs climate control while parked.'
    },
    {
      q: 'How long will the AC run on battery power?',
      a: 'Runtime depends on your battery capacity and outside temperature. With a standard truck battery (200Ah), you can expect 4-6 hours of cooling. Adding a dedicated battery pack extends this to 8-12 hours.'
    },
    {
      q: 'Will it drain my truck battery?',
      a: 'Our systems include smart battery protection with automatic low-voltage cutout (typically 11.8V for 12V systems). This ensures you always have enough power to start your engine.'
    },
    {
      q: 'Can I install it myself?',
      a: 'Yes! Our kits include everything needed for DIY installation: mounting hardware, wiring harness, and detailed instructions. Most customers complete installation in 2-4 hours.'
    },
    {
      q: 'Do you ship internationally?',
      a: 'We currently ship to the US, Canada, and Mexico. For other countries, please contact us for shipping options.'
    }
  ]
  
  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="container-custom max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold"
              >
                {faq.q}
                <span className="text-primary-600">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Footer = () => (
  <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
    <div className="container-custom">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">CoolDrivePro</h3>
          <p className="text-sm mb-4">
            Professional-grade parking air conditioners for trucks, RVs, and mobile living.
          </p>
          <div className="flex gap-4">
            <span className="text-2xl cursor-pointer hover:text-white">📘</span>
            <span className="text-2xl cursor-pointer hover:text-white">📸</span>
            <span className="text-2xl cursor-pointer hover:text-white">🐦</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Products</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">12V AC Units</a></li>
            <li><a href="#" className="hover:text-white">24V AC Units</a></li>
            <li><a href="#" className="hover:text-white">Battery Packs</a></li>
            <li><a href="#" className="hover:text-white">Accessories</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Installation Guide</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Warranty</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📧 support@cooldrivepro.com</li>
            <li>📞 1-800-555-0123</li>
            <li>🕐 Mon-Fri 9AM-6PM EST</li>
          </ul>
        </div>
      </div>

      {/* Netlify Contact Form */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h4 className="text-white text-lg font-semibold mb-4">Get a Quote</h4>
        <form name="contact" method="POST" data-netlify="true" className="space-y-4">
          <input type="hidden" name="form-name" value="contact" />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input 
              type="tel" 
              name="phone" 
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Message *</label>
            <textarea 
              name="message" 
              rows={4} 
              required 
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary-500 focus:outline-none"
            ></textarea>
          </div>
          <button type="submit" className="btn-primary w-full md:w-auto">
            Send Message
          </button>
        </form>
      </div>
      
      <div className="border-t border-gray-800 pt-8 text-center text-sm">
        <p>&copy; 2024 CoolDrivePro. All rights reserved.</p>
      </div>
    </div>
  </footer>
)

function App() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <ProductsSection />
        <FeaturesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
