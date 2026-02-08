"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const loginSchema = Yup.object().shape({
  accountNumber: Yup.string()
    .length(12, "Account number must be exactly 12 digits")
    .matches(/^\d+$/, "Account number must contain only digits")
    .required("Account number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const initialValues = {
  accountNumber: "",
  password: "",
  rememberMe: false,
};

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const inputClassName =
    "h-12 w-full min-h-[44px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-3 text-base text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC] sm:h-[50px] sm:rounded-[14px] sm:pl-12";
  const inputErrorClassName =
    "h-12 w-full min-h-[44px] rounded-xl border-2 border-red-500 bg-[#F8FAFC] py-3 pl-11 pr-3 text-base text-[#0F172B] placeholder:text-[#90A1B9] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC] sm:h-[50px] sm:rounded-[14px] sm:pl-12";

  return (
    <>
    {isSubmitting && <LoadingOverlay />}
    <div
      id="login"
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:rounded-3xl sm:p-8 md:p-10"
    >
      <h2 className="mb-1 text-lg font-bold text-[#0F172B] sm:mb-2 sm:text-2xl">Welcome Back</h2>
      <p className="mb-3 text-sm text-[#45556C] sm:mb-6 sm:text-base">Securely login to your account</p>
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setError(null);
          setIsSubmitting(true);
          try {
            await login({
              accountNumber: values.accountNumber,
              password: values.password,
            });
            // Redirect to dashboard on success
            router.push('/dashboard');
          } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials and try again.');
            setSubmitting(false);
            setIsSubmitting(false);
          }
        }}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched }) => (
          <Form className="space-y-3 sm:space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314158]">Account Number</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex h-12 w-8 items-center justify-center sm:h-[50px]">
                  <Image
                    src="/images/icon-account.svg"
                    alt=""
                    width={25}
                    height={25}
                    className="shrink-0 opacity-70"
                  />
                </div>
                <Field
                  name="accountNumber"
                  type="text"
                  placeholder="Enter your account number"
                  className={
                    errors.accountNumber && touched.accountNumber ? inputErrorClassName : inputClassName
                  }
                />
              </div>
              <ErrorMessage
                name="accountNumber"
                component="p"
                className="text-xs text-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#314158]">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex h-12 w-8 items-center justify-center sm:h-[50px]">
                  <Image
                    src="/images/icon-password.svg"
                    alt=""
                    width={25}
                    height={25}
                    className="shrink-0 opacity-70"
                  />
                </div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className={errors.password && touched.password ? inputErrorClassName : inputClassName}
                />
              </div>
              <ErrorMessage name="password" component="p" className="text-xs text-red-500" />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <Field
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#155DFC] focus:ring-[#155DFC]"
                />
                <span className="text-sm font-semibold text-[#45556C]">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[#155DFC] hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 font-bold text-white shadow-sm transition hover:bg-[#1248d4] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[50px] sm:rounded-[14px]"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              {!isSubmitting && <Image src="/images/icon-arrow-right.svg" alt="" width={16} height={16} />}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-3 text-center text-xs text-[#90A1B9] sm:mt-6">
        By logging in, you agree to our Terms and Privacy Policy.
      </p>
      <p className="mt-0.5 text-center text-xs text-[#90A1B9] sm:mt-1">Protected by reCAPTCHA.</p>
    </div>
    </>
  );
}
