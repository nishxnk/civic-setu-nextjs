"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
        <h3 className="text-xl font-bold text-gray-700">Thank You!</h3>
        <p className="text-gray-500 mt-2">Your message has been received. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text" name="name" placeholder="Your Name" value={form.name}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        required
      />
      <input
        type="email" name="email" placeholder="Your Email" value={form.email}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        required
      />
      <textarea
        name="message" placeholder="Your Message" value={form.message} rows={5}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        required
      />
      <button
        type="submit"
        className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium"
      >
        Send Message
      </button>
    </form>
  );
}
