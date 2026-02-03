"use client";

import Image from "next/image";
import LoginForm from "./components/LoginForm";
import { GuestRoute } from "@/components/GuestRoute";

export default function Home() {
  return (
    <GuestRoute>
    <div className="min-h-screen bg-white">
      {/* Header - styled per Figma node 735-3542 */}
      <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1490px] items-center justify-between px-5 py-4 sm:px-8 lg:px-20">
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#155DFC]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 40 40"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 15C10 12.2 12.2 10 15 10H25C27.8 10 30 12.2 30 15V25C30 27.8 27.8 30 25 30H15C12.2 30 10 27.8 10 25V15Z" />
                <path d="M18 21L20 23L24 19" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#0F172B]">VyrBank</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]"
            >
              Features
            </a>
            <a
              href="#products"
              className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]"
            >
              Products
            </a>
            <a
              href="#login"
              className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="rounded-lg bg-[#0F172B] px-6 py-3 text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#1a2744]"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[600px] overflow-hidden px-5 py-16 sm:px-8 lg:min-h-[700px] lg:px-20 lg:py-24">
          {/* Background image with dark overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-background.png"
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/20" aria-hidden />
          </div>
          <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
                Banking for the{" "}
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Digital Age
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/95 drop-shadow-sm">
                Experience secure, seamless, and smart banking designed for your lifestyle. Join over
                2 million users trusting VyrBank.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm">
                  <Image
                    src="/images/icon-triple-a.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span className="font-medium text-[#314158]">Triple A Rating</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm">
                  <Image
                    src="/images/icon-2m-users.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span className="font-medium text-[#314158]">2M+ Users</span>
                </div>
              </div>
            </div>

            {/* Login Card */}
            <LoginForm />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-[#0F172B] sm:text-4xl">
                Why choose VyrBank?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#45556C]">
                We provide the tools you need to manage your financial life with ease and security.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  ),
                  title: "Mobile First Banking",
                  description:
                    "Bank on the go with our award-winning mobile app. Deposit checks, pay friends, and manage cards instantly.",
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                  ),
                  title: "Instant Global Transfers",
                  description:
                    "Send money internationally with competitive exchange rates and zero hidden fees. It's fast and secure.",
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  ),
                  title: "Smart Financial Analytics",
                  description:
                    "Track your spending, set budgets, and achieve your financial goals with our AI-powered insights.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-[#0F172B]">{feature.title}</h3>
                  <p className="mb-6 text-base leading-relaxed text-[#45556C]">
                    {feature.description}
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-base font-bold text-[#155DFC] hover:underline"
                  >
                    Learn more
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="bg-[#F8FAFC] px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#155DFC]">
                Our Products
              </p>
              <h2 className="mb-4 text-3xl font-bold text-[#0F172B] sm:text-4xl">
                Financial Solutions for Everyone
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#45556C]">
                Whether you&apos;re saving for the future, buying a home, or growing your business, we
                have the right products for you.
              </p>
            </div>
            <div className="space-y-20">
              {[
                {
                  image: "/images/checking-accounts.png",
                  category: "Personal Banking",
                  title: "Checking Accounts",
                  description:
                    "Enjoy fee-free checking with access to over 50,000 ATMs nationwide. Early direct deposit included.",
                  features: ["No monthly fees", "Get paid 2 days early", "Overdraft protection"],
                },
                {
                  image: "/images/home-loans.png",
                  category: "Lending",
                  title: "Home Loans",
                  description:
                    "Find your dream home with our competitive mortgage rates and personalized guidance.",
                  features: ["Low down payment options", "Fast pre-approval", "Refinancing available"],
                },
                {
                  image: "/images/credit-cards.png",
                  category: "Credit",
                  title: "Credit Cards",
                  description:
                    "Earn up to 3% cash back on every purchase. No annual fee and introductory 0% APR.",
                  features: ["Unlimited cash back", "Travel rewards", "Purchase protection"],
                },
                {
                  image: "/images/business-solutions.png",
                  category: "Business",
                  title: "Business Solutions",
                  description:
                    "Scale your business with tailored financial solutions, from payroll to capital loans.",
                  features: ["Business checking", "Merchant services", "Commercial lending"],
                },
              ].map((product, i) => (
                <div
                  key={product.title}
                  className={`flex flex-col gap-8 rounded-2xl bg-white shadow-xl lg:flex-row lg:gap-12 ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-2xl lg:h-[400px] lg:flex-1">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
                    <span className="mb-4 inline-flex w-fit rounded-full bg-[#DBEAFE] px-3 py-1 text-sm font-bold text-[#155DFC]">
                      {product.category}
                    </span>
                    <h3 className="mb-4 text-3xl font-bold text-[#0F172B]">{product.title}</h3>
                    <p className="mb-6 text-lg text-[#45556C]">{product.description}</p>
                    <ul className="mb-8 space-y-3">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <Image
                            src="/images/icon-check.svg"
                            alt=""
                            width={20}
                            height={20}
                            className="shrink-0"
                          />
                          <span className="text-base text-[#314158]">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#"
                      className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-[#155DFC] bg-white px-8 py-3 text-base font-bold text-[#155DFC] transition hover:bg-[#155DFC] hover:text-white"
                    >
                      Explore Options
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#155DFC] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-20">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M12 12h.01" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold">VyrBank</span>
                </div>
                <p className="max-w-sm text-white/90">
                  VyrBank is a modern financial institution dedicated to providing secure, accessible,
                  and innovative banking solutions for everyone.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Products</h4>
                <ul className="space-y-3">
                  {["Checking", "Savings", "Loans", "Credit Cards", "Investments"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/90 hover:text-white hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Company</h4>
                <ul className="space-y-3">
                  {["About Us", "Careers", "Press", "Blog", "Contact"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/90 hover:text-white hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-bold">Support</h4>
                <ul className="space-y-3">
                  {["Help Center", "Security", "Privacy", "Terms", "Accessibility"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/90 hover:text-white hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-16 border-t border-white/20 pt-8">
              <p className="text-center text-sm text-white/80">
                © 2026 VyrBank, N.A. Member FDIC. Equal Housing Lender.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </GuestRoute>
  );
}
