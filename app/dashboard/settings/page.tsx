"use client";

import { useState, useEffect } from "react";
import { getAuthHeader, reauthenticateAndUpdatePassword } from "@/lib/auth/client";
import { useAuthStore } from "@/store/auth";

type TabId = "profile" | "security";

type Address = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
} | null;

type ProfileUser = {
  uid: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: Address;
  avatarUrl?: string | null;
};

export default function SettingsPage() {
  const storeUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState<TabId>("profile");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Change password (Security tab)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const user = storeUser as ProfileUser | null;

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      const addr = user.address;
      if (addr && typeof addr === "object") {
        setAddress(addr.street ?? "");
        setCity(addr.city ?? "");
        setState(addr.state ?? "");
        setZipCode(addr.zip ?? "");
      } else {
        setAddress("");
        setCity("");
        setState("");
        setZipCode("");
      }
    }
  }, [user?.uid, user?.firstName, user?.lastName, user?.email, user?.phone, user?.address]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];

  const inputClass =
    "h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-base text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20";
  const labelClass = "text-sm font-medium text-[#314158]";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setSaving(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
          address: {
            street: address.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zipCode.trim(),
          },
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setSaveMessage({ type: "error", text: json.error || "Failed to save" });
        return;
      }
      if (json.data) setUser(json.data);
      setSaveMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = [firstName, lastName].map((s) => s.trim()[0]).filter(Boolean).join("").toUpperCase() || "?";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setChangingPassword(true);
    try {
      await reauthenticateAndUpdatePassword(currentPassword, newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172B]">Settings</h1>

      <div className="flex gap-1 border-b border-[#E2E8F0]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-4 pb-4 pt-2 text-sm font-medium transition ${
              tab === t.id ? "text-[#155DFC]" : "text-[#62748E] hover:text-[#314158]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#155DFC]" />
            )}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] p-6">
            <h2 className="text-lg font-semibold text-[#0F172B]">Profile Information</h2>
            <p className="mt-1 text-sm text-[#62748E]">Update your personal details</p>
          </div>
          <div className="p-6">
            {saveMessage && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                  saveMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            <div className="mb-8 flex items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#155DFC]">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-white">{initials}</span>
                )}
              </div>
              <div>
                <p className="text-sm text-[#62748E]">Account number: {user?.accountNumber ?? "—"}</p>
              </div>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSaveProfile}>
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
                  readOnly
                  className={inputClass + " bg-[#F8FAFC] cursor-not-allowed"}
                  placeholder="email@example.com"
                  title="Email cannot be changed here"
                />
                <p className="text-xs text-[#94A3B8]">Email cannot be changed from this page.</p>
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
                  disabled={saving}
                  className="h-11 rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#1247d4] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#F1F5F9] p-6">
              <h2 className="text-lg font-semibold text-[#0F172B]">Change Password</h2>
              <p className="mt-1 text-sm text-[#62748E]">Update your password to keep your account secure</p>
            </div>
            <form className="p-6" onSubmit={handleChangePassword}>
              {passwordMessage && (
                <div
                  className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                    passwordMessage.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}
              <div className="flex max-w-md flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="currentPassword" className={labelClass}>
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="newPassword" className={labelClass}>
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="h-11 w-fit rounded-xl bg-[#155DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#1247d4] disabled:opacity-50"
                >
                  {changingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>

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
                  <p className="mt-1 text-sm text-[#62748E]">Add an extra layer of security (coming soon)</p>
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
                    <p className="text-sm font-medium text-[#0F172B]">Current device</p>
                    <p className="text-xs text-[#62748E]">This session · Active</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#016630]">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
