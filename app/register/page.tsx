"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SuccessModal from "../components/SuccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { GuestRoute } from "@/components/GuestRoute";

const STEPS = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Contact Details" },
  { id: 3, title: "Account Setup" },
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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const inputClassName =
    "h-[50px] w-full rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] py-3 px-4 text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC]";
  const inputErrorClassName =
    "h-[50px] w-full rounded-[14px] border-2 border-red-500 bg-[#F8FAFC] py-3 px-4 text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC]";
  const labelClassName = "block text-sm font-semibold text-[#314158] mb-2";

  return (
    <GuestRoute>
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#F1F5F9] bg-white">
        <div className="mx-auto flex max-w-[1490px] items-center justify-center px-5 py-4 lg:px-20">
          <Link href="/" className="flex items-center gap-2">
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
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 lg:px-20 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
          {/* Left sidebar */}
          <div>
            <h1 className="mb-2 text-2xl font-bold text-[#0F172B]">Open your account</h1>
            <p className="mb-8 text-base text-[#45556C]">
              It only takes a few minutes to join over 2 million VyrBank members.
            </p>
            <div className="space-y-2">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${step === s.id ? "bg-slate-100" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
              <div className="mb-2 flex items-center gap-2">
                <Image src="/images/icon-triple-a.svg" alt="" width={20} height={20} className="shrink-0" />
                <span className="font-bold text-[#155DFC]">Safe & Secure</span>
              </div>
              <p className="text-sm text-[#155DFC]/90">
                Your information is encrypted with bank-level security. We never share your data
                without your permission.
              </p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
            <Formik
              initialValues={initialValues}
              validationSchema={getStepSchema(step)}
              onSubmit={async (values, { setSubmitting }) => {
                if (step < 3) {
                  setStep(step + 1);
                  setSubmitting(false);
                } else {
                  // Final submit - call API
                  setIsSubmitting(true);
                  setError(null);
                  try {
                    const result = await register({
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
                      accountType: values.accountType,
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
                <Form className="space-y-6">
                  {/* Step 1 */}
                  {step === 1 && (
                    <>
                      <h2 className="mb-6 text-2xl font-bold text-[#0F172B]">Personal Information</h2>
                      <div className="grid gap-6 sm:grid-cols-2">
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
                        <p className="mt-2 text-xs text-[#90A1B9]">
                          We need this to verify your identity as required by federal law.
                        </p>
                        <ErrorMessage name="ssn" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <button
                        type="submit"
                        className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4]"
                      >
                        Next Step
                        <Image src="/images/icon-arrow-right.svg" alt="" width={16} height={16} />
                      </button>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <>
                      <h2 className="mb-6 text-2xl font-bold text-[#0F172B]">Contact Details</h2>
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
                      <div className="grid gap-6 sm:grid-cols-3">
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
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-base font-semibold text-[#0F172B] hover:text-[#155DFC]"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex h-[50px] min-w-[180px] items-center justify-center gap-2 rounded-[14px] bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4]"
                        >
                          Next Step
                          <Image src="/images/icon-arrow-right.svg" alt="" width={16} height={16} />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <>
                      <h2 className="mb-6 text-2xl font-bold text-[#0F172B]">Account Setup</h2>
                      <div>
                        <label className={`${labelClassName} mb-3`}>Account Type</label>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setFieldValue("accountType", "checking")}
                            className={`rounded-2xl border-2 p-6 text-left transition ${
                              values.accountType === "checking"
                                ? "border-[#155DFC] bg-[#EFF6FF]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <h3 className="mb-2 font-bold text-[#0F172B]">Total Checking</h3>
                            <p className="text-sm text-[#45556C]">
                              No monthly service fee with direct deposit. Access to thousands of ATMs.
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFieldValue("accountType", "savings")}
                            className={`rounded-2xl border-2 p-6 text-left transition ${
                              values.accountType === "savings"
                                ? "border-[#155DFC] bg-[#EFF6FF]"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <h3 className="mb-2 font-bold text-[#0F172B]">High Yield Savings</h3>
                            <p className="text-sm text-[#45556C]">
                              Earn 4.50% APY on your savings. No minimum balance required.
                            </p>
                          </button>
                        </div>
                        {errors.accountType && (
                          <p className="mt-1 text-xs text-red-500">{errors.accountType}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClassName}>Create Password</label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3 flex h-[50px] w-8 items-center justify-center">
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
                            className={`pl-12 ${errors.password && touched.password ? inputErrorClassName : inputClassName}`}
                          />
                        </div>
                        <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <div>
                        <label className="flex cursor-pointer items-start gap-3">
                          <Field
                            name="agreeTerms"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-[#E2E8F0] text-[#155DFC] focus:ring-[#155DFC]"
                          />
                          <span className="text-sm text-[#45556C]">
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
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-base font-semibold text-[#0F172B] hover:text-[#155DFC]"
                          disabled={isSubmitting}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex h-[50px] min-w-[180px] items-center justify-center gap-2 rounded-[14px] bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Account'}
                        </button>
                      </div>
                    </>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#45556C]">
          Already have an account?{" "}
          <Link href="/#login" className="font-semibold text-[#155DFC] hover:underline">
            Log in
          </Link>
        </p>
      </main>

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
