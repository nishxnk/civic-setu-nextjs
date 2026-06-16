import Hero from "@/components/home/Hero";
import Link from "next/link";

const features = [
  { icon: "fa-file-alt", title: "Report Issues", desc: "Submit civic complaints with photos and location details." },
  { icon: "fa-tasks", title: "Track Progress", desc: "Monitor the status of your complaints in real-time." },
  { icon: "fa-chart-line", title: "Data Analytics", desc: "Government bodies get insights to improve services." },
  { icon: "fa-road", title: "Road Damage AI", desc: "AI-powered road damage detection from images." },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
                <i className={`fas ${f.icon} text-4xl text-blue-700 mb-4`}></i>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-gray-600 mb-6">
            Report civic issues in your area and help build better infrastructure for everyone.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-700 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-800 transition"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>
    </>
  );
}
