"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import SuccessModal from "../components/SuccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { GuestRoute } from "@/components/GuestRoute";

const STEPS = [
  { id: 1, title: "Personal Information", shortTitle: "Personal" },
  { id: 2, title: "Contact Details", shortTitle: "Contact" },
  { id: 3, title: "Account Setup", shortTitle: "Account" },
] as const;

const step1Schema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or less")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be 50 characters or less")
    .required("Last name is required"),
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .test("age", "You must be at least 18 years old", (value) => {
      if (!value) return false;
      const today = new Date();
      const birth = new Date(value);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) return age - 1 >= 18;
      return age >= 18;
    }),
  ssn: Yup.string()
    .matches(/^\d{3}-?\d{2}-?\d{4}$/, "Enter a valid SSN (XXX-XX-XXXX)")
    .required("Social Security Number is required"),
});

const step2Schema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  phone: Yup.string()
    .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Enter a valid phone number")
    .required("Phone number is required"),
  street: Yup.string().min(3, "Enter a valid street address").required("Street address is required"),
  city: Yup.string().min(2, "Enter a valid city").required("City is required"),
  state: Yup.string().min(2, "Enter a valid state").required("State is required"),
  zip: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code")
    .required("ZIP code is required"),
});

const step3Schema = Yup.object().shape({
  accountType: Yup.string().oneOf(["checking", "savings"], "Please select an account type").required("Please select an account type"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
  agreeTerms: Yup.boolean().oneOf([true], "You must agree to the terms").required("You must agree to the terms"),
});

const getStepSchema = (step: number) => {
  switch (step) {
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    default:
      return Yup.object();
  }
};

const initialValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  ssn: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  accountType: "" as "" | "checking" | "savings",
  password: "",
  agreeTerms: false,
};

// Animation variants
const pageEntrance = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const stepTransition = {
  type: "tween" as const,
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const inputClassName =
    "h-11 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 px-4 text-base text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC] sm:h-[50px] sm:rounded-[14px]";
  const inputErrorClassName =
    "h-11 min-h-[44px] w-full rounded-xl border-2 border-red-500 bg-[#F8FAFC] py-3 px-4 text-base text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC] sm:h-[50px] sm:rounded-[14px]";
  const labelClassName = "block text-sm font-semibold text-[#314158] mb-1.5 sm:mb-2";

  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <GuestRoute>
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 border-b border-[#F1F5F9] bg-white/95 backdrop-blur-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mx-auto flex max-w-[1490px] items-center px-4 py-3 sm:px-6 sm:py-4 lg:px-20">
          {/* Mobile: back arrow */}
          <Link
            href="/"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#45556C] transition hover:bg-[#F1F5F9] hover:text-[#0F172B] sm:mr-4 lg:hidden"
            aria-label="Back to home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Container.svg" alt="Vertex Premium" width={40} height={40} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
            <span className="text-lg font-bold text-[#0F172B] sm:text-xl">Vertex Premium</span>
          </Link>
        </div>
      </motion.header>

      <motion.main
        className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-20 lg:py-16"
        {...pageEntrance}
      >
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[320px_1fr] lg:gap-12">
          {/* Mobile: compact step indicator */}
          <div className="lg:hidden">
            <h1 className="mb-1 text-xl font-bold text-[#0F172B]">Open your account</h1>
            <p className="mb-4 text-sm text-[#45556C]">
              Join over 2 million members in a few minutes.
            </p>

            {/* Progress bar */}
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-bold text-[#155DFC]">Step {step} of {STEPS.length}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-[#155DFC]"
                  initial={false}
                  animate={{ width: `${progressPercent === 0 ? 8 : progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step pills */}
            <div className="flex gap-2">
              {STEPS.map((s) => (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => step > s.id && goToStep(s.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-center transition ${
                    step === s.id
                      ? "border-[#155DFC] bg-[#EFF6FF] shadow-sm"
                      : step > s.id
                        ? "border-[#00C950]/40 bg-[#F0FDF4]"
                        : "border-[#E2E8F0] bg-white"
                  }`}
                  whileTap={step > s.id ? { scale: 0.97 } : undefined}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step > s.id ? "bg-[#00C950] text-white" : step === s.id ? "bg-[#155DFC] text-white" : "bg-slate-200 text-[#45556C]"
                    }`}
                  >
                    {step > s.id ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </span>
                  <span className={`text-xs font-semibold ${step === s.id ? "text-[#0F172B]" : "text-[#45556C]"}`}>
                    {s.shortTitle}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop: left sidebar */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="mb-2 text-2xl font-bold text-[#0F172B]">Open your account</h1>
            <p className="mb-8 text-base text-[#45556C]">
              It only takes a few minutes to join over 2 million Vertex Premium members.
            </p>
            <div className="space-y-2">
              {STEPS.map((s) => (
                <motion.div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${step === s.id ? "bg-slate-100" : ""}`}
                  animate={step === s.id ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      step > s.id ? "bg-[#00C950]" : step === s.id ? "bg-[#155DFC]" : "bg-slate-200"
                    }`}
                  >
                    {step > s.id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-bold ${step === s.id ? "text-white" : "text-[#45556C]"}`}>
                        {s.id}
                      </span>
                    )}
                  </div>
                  <span className={`text-base font-medium ${step === s.id ? "font-bold text-[#0F172B]" : "text-[#45556C]"}`}>
                    {s.title}
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-8 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Image src="/images/icon-triple-a.svg" alt="" width={20} height={20} className="shrink-0" />
                <span className="font-bold text-[#155DFC]">Safe & Secure</span>
              </div>
              <p className="text-sm text-[#155DFC]/90">
                Your information is encrypted with bank-level security. We never share your data
                without your permission.
              </p>
            </motion.div>
          </motion.div>

          {/* Form card */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:rounded-3xl sm:p-6 md:p-8 lg:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Formik
              initialValues={initialValues}
              validationSchema={getStepSchema(step)}
              onSubmit={async (values, { setSubmitting }) => {
                if (step < 3) {
                  goToStep(step + 1);
                  setSubmitting(false);
                } else {
                  setIsSubmitting(true);
                  setError(null);
                  try {
                    await register({
                      firstName: values.firstName,
                      lastName: values.lastName,
                      dateOfBirth: values.dateOfBirth,
                      ssn: values.ssn,
                      email: values.email,
                      phone: values.phone,
                      address: {
                        street: values.street,
                        city: values.city,
                        state: values.state,
                        zip: values.zip,
                      },
                      accountType: (values.accountType === "checking" || values.accountType === "savings" ? values.accountType : "checking"),
                      password: values.password,
                    });
                    setShowSuccessModal(true);
                    setSubmitting(false);
                    setIsSubmitting(false);
                  } catch (err: any) {
                    setError(err.message || 'Registration failed. Please try again.');
                    setSubmitting(false);
                    setIsSubmitting(false);
                  }
                }
              }}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form>
                  <AnimatePresence mode="wait" custom={direction}>
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={stepTransition}
                        className="space-y-3 sm:space-y-5"
                      >
                        <h2 className="text-lg font-bold text-[#0F172B] sm:text-2xl">Personal Information</h2>
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
                          <div>
                            <label className={labelClassName}>First Name</label>
                            <Field
                              name="firstName"
                              placeholder="Enter your first name"
                              className={errors.firstName && touched.firstName ? inputErrorClassName : inputClassName}
                            />
                            <ErrorMessage name="firstName" component="p" className="mt-1 text-xs text-red-500" />
                          </div>
                          <div>
                            <label className={labelClassName}>Last Name</label>
                            <Field
                              name="lastName"
                              placeholder="Enter your last name"
                              className={errors.lastName && touched.lastName ? inputErrorClassName : inputClassName}
                            />
                            <ErrorMessage name="lastName" component="p" className="mt-1 text-xs text-red-500" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClassName}>Date of Birth</label>
                          <Field
                            name="dateOfBirth"
                            type="date"
                            className={errors.dateOfBirth && touched.dateOfBirth ? inputErrorClassName : inputClassName}
                          />
                          <ErrorMessage name="dateOfBirth" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className={labelClassName}>Social Security Number</label>
                          <Field
                            name="ssn"
                            type="password"
                            placeholder="XXX-XX-XXXX"
                            className={errors.ssn && touched.ssn ? inputErrorClassName : inputClassName}
                          />
                          <p className="mt-1.5 text-xs text-[#90A1B9]">
                            Required by federal law to verify your identity.
                          </p>
                          <ErrorMessage name="ssn" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <motion.button
                          type="submit"
                          className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4] sm:h-[50px] sm:rounded-[14px]"
                          whileTap={{ scale: 0.98 }}
                        >
                          Next Step
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={stepTransition}
                        className="space-y-3 sm:space-y-5"
                      >
                        <h2 className="text-lg font-bold text-[#0F172B] sm:text-2xl">Contact Details</h2>
                        <div>
                          <label className={labelClassName}>Email Address</label>
                          <Field
                            name="email"
                            type="email"
                            placeholder="jane@example.com"
                            className={errors.email && touched.email ? inputErrorClassName : inputClassName}
                          />
                          <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className={labelClassName}>Phone Number</label>
                          <Field
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            className={errors.phone && touched.phone ? inputErrorClassName : inputClassName}
                          />
                          <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className={labelClassName}>Street Address</label>
                          <Field
                            name="street"
                            placeholder="123 Main St"
                            className={errors.street && touched.street ? inputErrorClassName : inputClassName}
                          />
                          <ErrorMessage name="street" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-5">
                          <div>
                            <label className={labelClassName}>City</label>
                            <Field
                              name="city"
                              placeholder="City"
                              className={errors.city && touched.city ? inputErrorClassName : inputClassName}
                            />
                            <ErrorMessage name="city" component="p" className="mt-1 text-xs text-red-500" />
                          </div>
                          <div>
                            <label className={labelClassName}>State</label>
                            <Field
                              name="state"
                              placeholder="State"
                              className={errors.state && touched.state ? inputErrorClassName : inputClassName}
                            />
                            <ErrorMessage name="state" component="p" className="mt-1 text-xs text-red-500" />
                          </div>
                          <div>
                            <label className={labelClassName}>Zip</label>
                            <Field
                              name="zip"
                              placeholder="Zip"
                              className={errors.zip && touched.zip ? inputErrorClassName : inputClassName}
                            />
                            <ErrorMessage name="zip" component="p" className="mt-1 text-xs text-red-500" />
                          </div>
                        </div>
                        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <motion.button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#0F172B] transition hover:bg-slate-50 sm:min-h-0 sm:border-0 sm:px-0 sm:hover:bg-transparent sm:hover:text-[#155DFC]"
                            whileTap={{ scale: 0.97 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:hidden">
                              <path d="M19 12H5" />
                              <path d="M12 19l-7-7 7-7" />
                            </svg>
                            Back
                          </motion.button>
                          <motion.button
                            type="submit"
                            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4] sm:h-[50px] sm:min-w-[180px] sm:w-auto sm:rounded-[14px]"
                            whileTap={{ scale: 0.98 }}
                          >
                            Next Step
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={stepTransition}
                        className="space-y-3 sm:space-y-5"
                      >
                        <h2 className="text-lg font-bold text-[#0F172B] sm:text-2xl">Account Setup</h2>
                        <div>
                          <label className={`${labelClassName} mb-2 sm:mb-3`}>Account Type</label>
                          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
                            <motion.button
                              type="button"
                              onClick={() => setFieldValue("accountType", "checking")}
                              className={`rounded-xl border-2 p-3.5 text-left transition sm:rounded-2xl sm:p-6 ${
                                values.accountType === "checking"
                                  ? "border-[#155DFC] bg-[#EFF6FF]"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h3 className="mb-1 text-sm font-bold text-[#0F172B] sm:mb-2 sm:text-base">Total Checking</h3>
                              <p className="text-xs text-[#45556C] sm:text-sm">
                                No monthly service fee with direct deposit. Access to thousands of ATMs.
                              </p>
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => setFieldValue("accountType", "savings")}
                              className={`rounded-xl border-2 p-3.5 text-left transition sm:rounded-2xl sm:p-6 ${
                                values.accountType === "savings"
                                  ? "border-[#155DFC] bg-[#EFF6FF]"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h3 className="mb-1 text-sm font-bold text-[#0F172B] sm:mb-2 sm:text-base">High Yield Savings</h3>
                              <p className="text-xs text-[#45556C] sm:text-sm">
                                Earn 4.50% APY on your savings. No minimum balance required.
                              </p>
                            </motion.button>
                          </div>
                          {errors.accountType && (
                            <p className="mt-1 text-xs text-red-500">{errors.accountType}</p>
                          )}
                        </div>
                        <div>
                          <label className={labelClassName}>Create Password</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3 flex h-11 w-8 items-center justify-center sm:h-[50px]">
                              <Image
                                src="/images/icon-password.svg"
                                alt=""
                                width={16}
                                height={25}
                                className="shrink-0 opacity-70"
                              />
                            </div>
                            <Field
                              name="password"
                              type="password"
                              placeholder="Create a strong password"
                              className={`pl-11 sm:pl-12 ${errors.password && touched.password ? inputErrorClassName : inputClassName}`}
                            />
                          </div>
                          <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className="flex cursor-pointer items-start gap-3">
                            <Field
                              name="agreeTerms"
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#155DFC] focus:ring-[#155DFC]"
                            />
                            <span className="text-xs text-[#45556C] sm:text-sm">
                              I agree to the{" "}
                              <a href="#" className="font-semibold text-[#155DFC] hover:underline">
                                Terms of Service
                              </a>
                              ,{" "}
                              <a href="#" className="font-semibold text-[#155DFC] hover:underline">
                                Privacy Policy
                              </a>
                              , and{" "}
                              <a href="#" className="font-semibold text-[#155DFC] hover:underline">
                                Electronic Disclosure
                              </a>
                            </span>
                          </label>
                          <ErrorMessage name="agreeTerms" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        {error && (
                          <motion.div
                            className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <p className="text-sm text-red-600">{error}</p>
                          </motion.div>
                        )}
                        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <motion.button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#0F172B] transition hover:bg-slate-50 disabled:opacity-50 sm:min-h-0 sm:border-0 sm:px-0 sm:hover:bg-transparent sm:hover:text-[#155DFC]"
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.97 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:hidden">
                              <path d="M19 12H5" />
                              <path d="M12 19l-7-7 7-7" />
                            </svg>
                            Back
                          </motion.button>
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[50px] sm:min-w-[180px] sm:w-auto sm:rounded-[14px]"
                            whileTap={{ scale: 0.98 }}
                          >
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>

        <motion.p
          className="mt-5 text-center text-sm text-[#45556C] sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Already have an account?{" "}
          <Link href="/#login" className="font-semibold text-[#155DFC] hover:underline">
            Log in
          </Link>
        </motion.p>
      </motion.main>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Account Created!"
        message="We've sent a welcome email with your account number. Check your inbox and use it to sign in."
        actionLabel="Continue to Sign In"
        actionHref="/#login"
      />
    </div>
    </GuestRoute>
  );
}
