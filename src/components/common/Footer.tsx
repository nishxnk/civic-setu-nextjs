import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <i className="fas fa-landmark text-2xl text-yellow-400"></i>
              <span className="text-xl font-bold">CivicSetu</span>
            </div>
            <p className="text-sm">
              A Government of India initiative for transparent and efficient civic issue resolution.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-yellow-400">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li>
              <li><Link href="/complaint" className="hover:text-yellow-400">Report Issue</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-yellow-400">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><i className="fas fa-envelope mr-2"></i> support@civicsetu.gov.in</li>
              <li><i className="fas fa-phone mr-2"></i> 1800-123-4567</li>
              <li><i className="fas fa-map-marker-alt mr-2"></i> New Delhi, India</li>
            </ul>
          </div>
        </div>
        <hr className="border-gray-700 my-6" />
        <div className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} CivicSetu — Government of India. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
