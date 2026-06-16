import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Civic Issue Resolution Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Report, track, and resolve civic issues in your community. Our platform
          connects citizens with government departments for faster resolution.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/complaint"
            className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-md font-semibold hover:bg-yellow-300 transition"
          >
            Report an Issue
          </Link>
          <Link
            href="/about"
            className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
