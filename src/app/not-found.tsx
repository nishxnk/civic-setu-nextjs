import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-blue-700">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
