"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authAPI } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { firebaseErrorToMessage } from "@/utils/constants";

export default function LoginPage() {
  const router = useRouter();
  const { refreshToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await cred.user.getIdToken();
      try {
        const res = await authAPI.firebaseLogin(idToken);
        localStorage.setItem("user", JSON.stringify(res.user));
      } catch { /* backend down, Firebase-only session */ }
      await refreshToken();
      router.push("/citizen");
    } catch (err: unknown) {
      setError(firebaseErrorToMessage((err as { code?: string }).code || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      try {
        const res = await authAPI.firebaseLogin(idToken);
        localStorage.setItem("user", JSON.stringify(res.user));
      } catch { /* */ }
      await refreshToken();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      router.push(user.role === "admin" ? "/admin" : "/citizen");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") return;
      setError(firebaseErrorToMessage(code || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center">Welcome Back</h3>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}

        <button type="button" onClick={handleGoogleLogin} disabled={loading}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center mb-4"><hr className="flex-1 border-gray-300" /><span className="px-3 text-gray-400 text-sm">or</span><hr className="flex-1 border-gray-300" /></div>

        <form onSubmit={handleEmailLogin}>
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="w-full mb-3 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange}
            className="w-full mb-4 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50 font-medium transition">
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Don&apos;t have an account? <Link href="/signup" className="text-blue-700 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </section>
  );
}
