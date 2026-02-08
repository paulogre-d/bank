"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./components/LoginForm";
import { GuestRoute } from "@/components/GuestRoute";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeInUpVariant = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  const features = [
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
  ];

  const products = [
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
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSupportToast, setShowSupportToast] = useState(false);

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSupportToast(true);
    setTimeout(() => setShowSupportToast(false), 4000);
  };

  return (
    <GuestRoute>
      <div className="min-h-screen overflow-x-hidden bg-white">
        {/* Header */}
        <motion.header
          className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/95 backdrop-blur-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto flex max-w-[1490px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-20">
            <a href="#" className="flex min-w-0 shrink-0 items-center gap-2">
              <Image src="/Container.svg" alt="Vertex Premium" width={40} height={40} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
              <span className="truncate text-lg font-bold text-[#0F172B] sm:text-xl">Vertex Premium</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex lg:gap-8">
              <a href="#features" className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]">
                Features
              </a>
              <a href="#products" className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]">
                Products
              </a>
              <a href="#login" className="text-base font-medium text-[#45556C] transition hover:text-[#0F172B]">
                Sign In
              </a>
              <a
                href="/register"
                className="min-h-[44px] shrink-0 rounded-lg bg-[#0F172B] px-5 py-2.5 text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#1a2744] sm:px-6 sm:py-3"
              >
                Get Started
              </a>
            </nav>
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#45556C] transition hover:bg-[#F1F5F9] hover:text-[#0F172B] md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
          {/* Mobile menu overlay & panel */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 z-[60] bg-black/40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden
                />
                {/* Slide-in panel from right */}
                <motion.div
                  className="fixed right-0 top-0 z-[70] flex h-screen w-[280px] max-w-[85vw] flex-col border-l border-[#E2E8F0] bg-white shadow-xl md:hidden"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-[#45556C] transition hover:bg-[#F1F5F9] hover:text-[#0F172B]"
                    aria-label="Close menu"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                  <nav className="flex flex-1 flex-col justify-center px-6 py-6">
                    <a href="#features" className="min-h-[44px] py-3 text-base font-medium text-[#45556C] hover:text-[#0F172B]" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#products" className="min-h-[44px] py-3 text-base font-medium text-[#45556C] hover:text-[#0F172B]" onClick={() => setMobileMenuOpen(false)}>Products</a>
                    <a href="#login" className="min-h-[44px] py-3 text-base font-medium text-[#45556C] hover:text-[#0F172B]" onClick={() => setMobileMenuOpen(false)}>Sign In</a>
                    <a href="/register" className="mt-2 min-h-[44px] rounded-lg bg-[#0F172B] px-4 py-3 text-center text-base font-bold text-white" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.header>

        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-14 md:px-8 lg:px-20 lg:py-24">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero-background.png"
                alt=""
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 sm:bg-black/25" aria-hidden />
            </div>
            <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16">
              <motion.div
                className="flex flex-col items-center text-center lg:items-start lg:justify-center lg:text-left"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.h1
                  className="mb-2 text-[1.75rem] font-bold leading-[1.2] text-white drop-shadow-md sm:mb-4 sm:text-4xl sm:leading-tight md:text-5xl lg:text-6xl"
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                >
                  Banking for the{" "}
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Digital Age
                  </span>
                </motion.h1>
                <motion.p
                  className="mb-5 max-w-md text-[0.938rem] leading-relaxed text-white/90 drop-shadow-sm sm:mb-8 sm:max-w-xl sm:text-lg lg:mx-0"
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Experience secure, seamless, and smart banking designed for your lifestyle. Join over
                  2 million users trusting Vertex Premium.
                </motion.p>
                <motion.div
                  className="flex flex-wrap justify-center gap-2.5 sm:justify-start sm:gap-4"
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div
                    className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3"
                    whileHover={{ scale: 1.03, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Image src="/images/icon-triple-a.svg" alt="" width={18} height={18} className="shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-xs font-medium text-[#314158] sm:text-base">Triple A Rating</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm sm:gap-3 sm:rounded-xl sm:px-5 sm:py-3"
                    whileHover={{ scale: 1.03, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Image src="/images/icon-2m-users.svg" alt="" width={18} height={18} className="shrink-0 sm:h-5 sm:w-5" />
                    <span className="text-xs font-medium text-[#314158] sm:text-base">2M+ Users</span>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <LoginForm />
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <motion.div
                className="mb-8 text-center sm:mb-12"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-3 text-2xl font-bold text-[#0F172B] sm:mb-4 sm:text-3xl md:text-4xl">
                  Why choose Vertex Premium?
                </h2>
                <p className="mx-auto max-w-2xl text-base text-[#45556C] sm:text-lg">
                  We provide the tools you need to manage your financial life with ease and security.
                </p>
              </motion.div>
              <motion.div
                className="grid gap-6 sm:gap-8 md:grid-cols-3"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-60px" }}
                variants={staggerContainer}
                transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                    variants={fadeInUpVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] sm:mb-6 sm:h-14 sm:w-14">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[#0F172B] sm:mb-3 sm:text-xl">{feature.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-[#45556C] sm:mb-6 sm:text-base">{feature.description}</p>
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
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Products Section */}
          <section id="products" className="bg-[#F8FAFC] px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <motion.div
                className="mb-10 text-center sm:mb-16"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#155DFC] sm:text-sm">
                  Our Products
                </p>
                <h2 className="mb-3 text-2xl font-bold text-[#0F172B] sm:mb-4 sm:text-3xl md:text-4xl">
                  Financial Solutions for Everyone
                </h2>
                <p className="mx-auto max-w-2xl text-base text-[#45556C] sm:text-lg">
                  Whether you&apos;re saving for the future, buying a home, or growing your business, we
                  have the right products for you.
                </p>
              </motion.div>
              <div className="space-y-12 sm:space-y-16 lg:space-y-20">
                {products.map((product, i) => (
                  <motion.div
                    key={product.title}
                    className={`flex flex-col gap-6 rounded-2xl bg-white shadow-xl sm:gap-8 lg:flex-row lg:gap-12 ${
                      i % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -48 : 48 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-2xl sm:h-64 md:h-72 lg:h-[400px] lg:flex-1">
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
                    <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 lg:p-8 xl:p-12">
                      <span className="mb-3 inline-flex w-fit rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#155DFC] sm:text-sm">
                        {product.category}
                      </span>
                      <h3 className="mb-2 text-2xl font-bold text-[#0F172B] sm:mb-4 sm:text-3xl">{product.title}</h3>
                      <p className="mb-4 text-base text-[#45556C] sm:mb-6 sm:text-lg">{product.description}</p>
                      <ul className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
                        {product.features.map((f) => (
                          <li key={f} className="flex items-center gap-3">
                            <Image
                              src="/images/icon-check.svg"
                              alt=""
                              width={20}
                              height={20}
                              className="shrink-0"
                            />
                            <span className="text-sm text-[#314158] sm:text-base">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <motion.a
                        href="#"
                        className="inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-[#155DFC] bg-white px-6 py-2.5 text-sm font-bold text-[#155DFC] transition hover:bg-[#155DFC] hover:text-white sm:px-8 sm:py-3 sm:text-base"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Explore Options
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <motion.footer
            className="bg-[#155DFC] text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-20 lg:py-16">
              <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16">
                <div className="text-center md:text-left">
                  <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                    <Image src="/Container.svg" alt="" width={40} height={40} className="h-9 w-9 rounded-lg sm:h-10 sm:w-10" />
                    <span className="text-xl font-bold sm:text-2xl">Vertex Premium</span>
                  </div>
                  <p className="mx-auto max-w-sm text-sm text-white/90 sm:text-base md:mx-0">
                    Vertex Premium Bank is a modern financial institution dedicated to providing secure, accessible,
                    and innovative banking solutions for everyone.
                  </p>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-bold sm:mb-4">Products</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {["Checking", "Savings", "Loans", "Credit Cards", "Investments"].map((link) => (
                      <li key={link}>
                        <a href="#" className="block min-h-[44px] py-1 text-sm text-white/90 hover:text-white hover:underline sm:min-h-0 sm:py-0">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-bold sm:mb-4">Company</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {["About Us", "Careers", "Press", "Blog", "Contact"].map((link) => (
                      <li key={link}>
                        <a href="#" className="block min-h-[44px] py-1 text-sm text-white/90 hover:text-white hover:underline sm:min-h-0 sm:py-0">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-bold sm:mb-4">Support</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {["Help Center", "Security", "Privacy", "Terms", "Accessibility"].map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          onClick={handleSupportClick}
                          className="block min-h-[44px] py-1 text-sm text-white/90 hover:text-white hover:underline sm:min-h-0 sm:py-0"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-10 border-t border-white/20 pt-6 sm:mt-16 sm:pt-8">
                <p className="text-center text-xs text-white/80 sm:text-sm">
                  © 2026 Vertex Premium Bank, N.A. Member FDIC. Equal Housing Lender.
                </p>
              </div>
            </div>
          </motion.footer>
        </main>

        {/* Support Toast */}
        <AnimatePresence>
          {showSupportToast && (
            <motion.div
              className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:items-center sm:gap-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#0F172B]">Need help?</p>
                  <p className="mt-0.5 text-sm text-[#45556C]">
                    Reach us at{" "}
                    <a href="mailto:support@vertexpremium.com" className="font-semibold text-[#155DFC] hover:underline">
                      support@vertexpremium.com
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSupportToast(false)}
                  className="shrink-0 rounded-lg p-1 text-[#90A1B9] transition hover:bg-slate-100 hover:text-[#0F172B]"
                  aria-label="Dismiss"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GuestRoute>
  );
}
