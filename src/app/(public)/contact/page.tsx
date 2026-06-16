import ContactForm from "@/components/common/ContactForm";

export default function Contact() {
  return (
    <section className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">
        Have a question or feedback? Reach out to us using the form below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <ContactForm />
        </div>
        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-lg mb-1"><i className="fas fa-envelope text-blue-700 mr-2"></i>Email</h3>
            <p className="text-gray-500">support@civicsetu.gov.in</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1"><i className="fas fa-phone text-blue-700 mr-2"></i>Phone</h3>
            <p className="text-gray-500">1800-123-4567 (Toll Free)</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1"><i className="fas fa-map-marker-alt text-blue-700 mr-2"></i>Address</h3>
            <p className="text-gray-500">Ministry of Urban Development<br />New Delhi — 110001<br />India</p>
          </div>
        </div>
      </div>
    </section>
  );
}
