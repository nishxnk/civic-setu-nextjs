export default function About() {
  return (
    <section className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">About CivicSetu</h1>
      <div className="prose max-w-none text-gray-700 space-y-4">
        <p className="text-lg">
          CivicSetu is a Government of India initiative under the Digital India program,
          designed to bridge the gap between citizens and civic authorities.
        </p>
        <p>
          Our platform enables citizens to report civic issues such as road damage,
          water supply problems, sanitation concerns, street lighting failures, and
          traffic issues — all from a single portal.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Our Mission</h2>
        <p>
          To create transparent, efficient, and accountable civic governance by
          empowering citizens with digital tools for issue reporting and tracking.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>AI-powered road damage detection from uploaded images</li>
          <li>Real-time complaint tracking with unique tracking numbers</li>
          <li>Department-wise categorization for faster resolution</li>
          <li>Comprehensive analytics for government authorities</li>
          <li>Secure authentication with Google sign-in</li>
        </ul>
      </div>
    </section>
  );
}
