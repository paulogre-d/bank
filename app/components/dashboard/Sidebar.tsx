"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/loans", label: "Loans" },
  { href: "/dashboard/transfers", label: "Transfers" },
  { href: "/dashboard/cards", label: "Cards" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#155DFC" : "#0F172B";
  const icons: Record<string, React.ReactNode> = {
    Dashboard: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V9.16667C2.5 9.6269 2.8731 10 3.33333 10H7.5C7.96024 10 8.33333 9.6269 8.33333 9.16667V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.6665 2.5H12.4998C12.0396 2.5 11.6665 2.8731 11.6665 3.33333V5.83333C11.6665 6.29357 12.0396 6.66667 12.4998 6.66667H16.6665C17.1267 6.66667 17.4998 6.29357 17.4998 5.83333V3.33333C17.4998 2.8731 17.1267 2.5 16.6665 2.5Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.6665 10H12.4998C12.0396 10 11.6665 10.3731 11.6665 10.8333V16.6667C11.6665 17.1269 12.0396 17.5 12.4998 17.5H16.6665C17.1267 17.5 17.4998 17.1269 17.4998 16.6667V10.8333C17.4998 10.3731 17.1267 10 16.6665 10Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 13.3333H3.33333C2.8731 13.3333 2.5 13.7063 2.5 14.1666V16.6666C2.5 17.1268 2.8731 17.4999 3.33333 17.4999H7.5C7.96024 17.4999 8.33333 17.1268 8.33333 16.6666V14.1666C8.33333 13.7063 7.96024 13.3333 7.5 13.3333Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Accounts: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8333 5.83333V3.33333C15.8333 3.11232 15.7455 2.90036 15.5893 2.74408C15.433 2.5878 15.221 2.5 15 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667C2.5 4.60869 2.67559 5.03262 2.98816 5.34518C3.30072 5.65774 3.72464 5.83333 4.16667 5.83333H16.6667C16.8877 5.83333 17.0996 5.92113 17.2559 6.07741C17.4122 6.23369 17.5 6.44565 17.5 6.66667V10M17.5 10H15C14.558 10 14.134 10.1756 13.8215 10.4882C13.5089 10.8007 13.3333 11.2246 13.3333 11.6667C13.3333 12.1087 13.5089 12.5326 13.8215 12.8452C14.134 13.1577 14.558 13.3333 15 13.3333H17.5C17.721 13.3333 17.933 13.2455 18.0893 13.0893C18.2455 12.933 18.3333 12.721 18.3333 12.5V10.8333C18.3333 10.6123 18.2455 10.4004 18.0893 10.2441C17.933 10.0878 17.721 10 17.5 10Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 4.16675V15.8334C2.5 16.2754 2.67559 16.6994 2.98816 17.0119C3.30072 17.3245 3.72464 17.5001 4.16667 17.5001H16.6667C16.8877 17.5001 17.0996 17.4123 17.2559 17.256C17.4122 17.0997 17.5 16.8878 17.5 16.6667V13.3334" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Loans: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.6665 5H3.33317C2.4127 5 1.6665 5.74619 1.6665 6.66667V13.3333C1.6665 14.2538 2.4127 15 3.33317 15H16.6665C17.587 15 18.3332 14.2538 18.3332 13.3333V6.66667C18.3332 5.74619 17.587 5 16.6665 5Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.0002 11.6666C10.9206 11.6666 11.6668 10.9204 11.6668 9.99992C11.6668 9.07944 10.9206 8.33325 10.0002 8.33325C9.07969 8.33325 8.3335 9.07944 8.3335 9.99992C8.3335 10.9204 9.07969 11.6666 10.0002 11.6666Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10H5.00833M15 10H15.0083" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Transfers: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3335 2.5L16.6668 5.83333L13.3335 9.16667" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.6668 5.83325H3.3335" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.66683 17.4999L3.3335 14.1666L6.66683 10.8333" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.3335 14.1667H16.6668" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Cards: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.6665 4.16675H3.33317C2.4127 4.16675 1.6665 4.91294 1.6665 5.83341V14.1667C1.6665 15.0872 2.4127 15.8334 3.33317 15.8334H16.6665C17.587 15.8334 18.3332 15.0872 18.3332 14.1667V5.83341C18.3332 4.91294 17.587 4.16675 16.6665 4.16675Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1.6665 8.33325H18.3332" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Analytics: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.4999 9.99993C17.9599 9.99993 18.3374 9.62577 18.2915 9.16827C18.0994 7.25507 17.2516 5.46718 15.8918 4.1077C14.532 2.74822 12.7439 1.9008 10.8307 1.7091C10.3724 1.66327 9.99902 2.04077 9.99902 2.50077V9.16743C9.99902 9.38845 10.0868 9.60041 10.2431 9.75669C10.3994 9.91297 10.6113 10.0008 10.8324 10.0008L17.4999 9.99993Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.6752 13.2417C17.145 14.4955 16.3158 15.6002 15.2601 16.4595C14.2043 17.3187 12.9541 17.9063 11.6189 18.1707C10.2836 18.4352 8.90386 18.3685 7.6003 17.9766C6.29673 17.5846 5.10903 16.8793 4.14102 15.9223C3.17302 14.9653 2.45419 13.7857 2.04737 12.4867C1.64055 11.1877 1.55814 9.8088 1.80734 8.47059C2.05653 7.13238 2.62975 5.87559 3.47688 4.81009C4.324 3.74459 5.41924 2.90283 6.66684 2.3584" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Settings: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.1833 1.66675H9.81667C9.37464 1.66675 8.95072 1.84234 8.63816 2.1549C8.3256 2.46746 8.15 2.89139 8.15 3.33341V3.48341C8.1497 3.77569 8.07255 4.06274 7.92628 4.31578C7.78002 4.56882 7.56978 4.77895 7.31667 4.92508L6.95834 5.13341C6.70497 5.2797 6.41756 5.35671 6.125 5.35671C5.83244 5.35671 5.54503 5.2797 5.29167 5.13341L5.16667 5.06675C4.78422 4.84613 4.32987 4.78628 3.90334 4.90034C3.47681 5.01439 3.11296 5.29303 2.89167 5.67508L2.70833 5.99175C2.48772 6.37419 2.42787 6.82855 2.54192 7.25508C2.65598 7.68161 2.93461 8.04546 3.31667 8.26675L3.44167 8.35008C3.69356 8.49551 3.90302 8.70432 4.04921 8.95577C4.1954 9.20723 4.27325 9.49256 4.275 9.78341V10.2084C4.27617 10.5021 4.19971 10.7909 4.05337 11.0455C3.90703 11.3001 3.69601 11.5116 3.44167 11.6584L3.31667 11.7334C2.93461 11.9547 2.65598 12.3186 2.54192 12.7451C2.42787 13.1716 2.48772 13.626 2.70833 14.0084L2.89167 14.3251C3.11296 14.7071 3.47681 14.9858 3.90334 15.0998C4.32987 15.2139 4.78422 15.154 5.16667 14.9334L5.29167 14.8667C5.54503 14.7205 5.83244 14.6435 6.125 14.6435C6.41756 14.6435 6.70497 14.7205 6.95834 14.8667L7.31667 15.0751C7.56978 15.2212 7.78002 15.4313 7.92628 15.6844C8.07255 15.9374 8.1497 16.2245 8.15 16.5167V16.6667C8.15 17.1088 8.3256 17.5327 8.63816 17.8453C8.95072 18.1578 9.37464 18.3334 9.81667 18.3334H10.1833C10.6254 18.3334 11.0493 18.1578 11.3618 17.8453C11.6744 17.5327 11.85 17.1088 11.85 16.6667V16.5167C11.8503 16.2245 11.9275 15.9374 12.0737 15.6844C12.22 15.4313 12.4302 15.2212 12.6833 15.0751L13.0417 14.8667C13.295 14.7205 13.5824 14.6435 13.875 14.6435C14.1676 14.6435 14.455 14.7205 14.7083 14.8667L14.8333 14.9334C15.2158 15.154 15.6701 15.2139 16.0967 15.0998C16.5232 14.9858 16.887 14.7071 17.1083 14.3251L17.2917 14.0001C17.5123 13.6176 17.5721 13.1633 17.4581 12.7367C17.344 12.3102 17.0654 11.9464 16.6833 11.7251L16.5583 11.6584C16.304 11.5116 16.093 11.3001 15.9466 11.0455C15.8003 10.7909 15.7238 10.5021 15.725 10.2084V9.79175C15.7238 9.49806 15.8003 9.20929 15.9466 8.95466C16.093 8.70003 16.304 8.48859 16.5583 8.34175L16.6833 8.26675C17.0654 8.04546 17.344 7.68161 17.4581 7.25508C17.5721 6.82855 17.5123 6.37419 17.2917 5.99175L17.1083 5.67508C16.887 5.29303 16.5232 5.01439 16.0967 4.90034C15.6701 4.78628 15.2158 4.84613 14.8333 5.06675L14.7083 5.13341C14.455 5.2797 14.1676 5.35671 13.875 5.35671C13.5824 5.35671 13.295 5.2797 13.0417 5.13341L12.6833 4.92508C12.4302 4.77895 12.22 4.56882 12.0737 4.31578C11.9275 4.06274 11.8503 3.77569 11.85 3.48341V3.33341C11.85 2.89139 11.6744 2.46746 11.3618 2.1549C11.0493 1.84234 10.6254 1.66675 10.1833 1.66675Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

interface SidebarProps {
  onMenuClick?: () => void;
  onLinkClick?: () => void;
}

export default function Sidebar({ onMenuClick, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#E2E8F0] bg-white">
      {/* Logo + Hamburger */}
      <div className="flex h-[88px] items-center gap-3 pl-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[#45556C] transition hover:bg-[#F1F5F9] hover:text-[#0F172B]"
          aria-label="Toggle sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
          <Image
            src="/Container.svg"
            alt="Vertex Premium"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#1D293D]" style={{ letterSpacing: "-0.025em" }}>
          Vertex Premium
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-4 pt-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex h-12 items-center gap-3 rounded-[10px] px-4 transition ${
                isActive
                  ? "bg-[#EFF6FF]"
                  : "hover:bg-[#F8FAFC]"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <NavIcon name={item.label} active={isActive} />
              </span>
              <span
                className={`text-base font-normal ${
                  isActive ? "text-[#1447E6]" : "text-[#0F172B]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-[#F1F5F9] px-4 pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex h-12 w-full items-center gap-3 rounded-[10px] px-4 text-left transition hover:bg-[#F8FAFC]"
        >
          <Image
            src="/images/sidebar/sign-out.svg"
            alt=""
            width={20}
            height={20}
            className="opacity-80"
          />
          <span className="text-base font-normal text-[#62748E]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
