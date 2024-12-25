import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-green-500 text-white py-8 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Smart-Health</h3>
          <p>Fresh, local produce delivered to your doorstep.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-green-200">Home</Link></li>
            <li><Link href="/products" className="hover:text-green-200">Products</Link></li>
            <li><Link href="/about" className="hover:text-green-200">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-green-200">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <p>123 Farm Road, Greenville, GV 12345</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: info@smart-health.com</p>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-8 border-t border-green-400 text-center">
        <p>&copy; 2024 Smart-Health. All rights reserved.</p>
      </div>
    </footer>
  )
}

