"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/auth/admin";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await adminLogin({ email, password });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid admin credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#155DFC]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 40 40"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M10 15C10 12.2 12.2 10 15 10H25C27.8 10 30 12.2 30 15V25C30 27.8 27.8 30 25 30H15C12.2 30 10 27.8 10 25V15Z" />
                <path d="M18 21L20 23L24 19" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0F172B]">VyrBank Admin</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-[#0F172B]">Admin Sign In</h1>
          <p className="mb-6 text-sm text-[#62748E]">Access the admin dashboard</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#314158]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vyrbank.com"
                className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#314158]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172B] font-bold text-white transition hover:bg-[#1E293B] disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
              {!isSubmitting && (
                <Image src="/images/icon-arrow-right.svg" alt="" width={16} height={16} />
              )}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-[#94A3B8]">
            Admin account must be manually created in Firebase Console
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#155DFC] hover:underline">
            ← Back to VyrBank
          </Link>
        </p>
      </div>
    </div>
  );
}
