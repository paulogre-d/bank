"use client";

import { useState } from "react";

type TabId = "profile" | "security";

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const [firstName, setFirstName] = useState("David");
  const [lastName, setLastName] = useState("Vwaire");
  const [email, setEmail] = useState("david.vwaire@email.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [dateOfBirth, setDateOfBirth] = useState("1990-03-15");
  const [address, setAddress] = useState("123 Main Street");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [zipCode, setZipCode] = useState("94102");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];

  const inputClass =
    "h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-base text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20";
  const labelClass = "text-sm font-medium text-[#314158]";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172B]">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E8F0]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-4 pb-4 pt-2 text-sm font-medium transition ${
              tab === t.id
                ? "text-[#155DFC]"
                : "text-[#62748E] hover:text-[#314158]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#155DFC]" />
            )}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] p-6">
            <h2 className="text-lg font-semibold text-[#0F172B]">Profile Information</h2>
            <p className="mt-1 text-sm text-[#62748E]">Update your personal details</p>
          </div>
          <div className="p-6">
            {/* Avatar */}
            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
                <span className="text-2xl font-semibold text-[#64748B]">
                  {firstName[0]}
                  {lastName[0]}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#314158] transition hover:bg-[#F8FAFC]"
                >
                  Change Photo
                </button>
                <p className="mt-2 text-xs text-[#94A3B8]">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className={labelClass}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className={labelClass}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="mb-4 text-base font-semibold text-[#0F172B]">Address</h3>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="address" className={labelClass}>
                      Street Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="city" className={labelClass}>
                        City
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                        placeholder="City"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="state" className={labelClass}>
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass}
                        placeholder="State"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="zipCode" className={labelClass}>
                        ZIP Code
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className={inputClass}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#F1F5F9] pt-6">
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#F1F5F9] p-6">
              <h2 className="text-lg font-semibold text-[#0F172B]">Change Password</h2>
              <p className="mt-1 text-sm text-[#62748E]">Update your password to keep your account secure</p>
            </div>
            <form className="p-6">
              <div className="flex flex-col gap-6 max-w-md">
                <div className="flex flex-col gap-2">
                  <label htmlFor="currentPassword" className={labelClass}>
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className={inputClass}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="newPassword" className={labelClass}>
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className={inputClass}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className={inputClass}
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 w-fit rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
                  <svg
                    className="h-6 w-6 text-[#155DFC]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#0F172B]">Two-Factor Authentication</h2>
                  <p className="mt-1 text-sm text-[#62748E]">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled((v) => !v)}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  twoFactorEnabled ? "bg-[#155DFC]" : "bg-[#E2E8F0]"
                }`}
                aria-label="Toggle 2FA"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                    twoFactorEnabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#F1F5F9] p-6">
              <h2 className="text-lg font-semibold text-[#0F172B]">Active Sessions</h2>
              <p className="mt-1 text-sm text-[#62748E]">Manage devices where you&apos;re logged in</p>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              <div className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9]">
                    <svg
                      className="h-5 w-5 text-[#64748B]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172B]">Chrome on MacOS</p>
                    <p className="text-xs text-[#62748E]">San Francisco, CA · Current session</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#016630]">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9]">
                    <svg
                      className="h-5 w-5 text-[#64748B]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172B]">Safari on iPhone</p>
                    <p className="text-xs text-[#62748E]">San Francisco, CA · Last active 2 days ago</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-[#DC2626] hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
