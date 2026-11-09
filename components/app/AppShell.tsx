"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Clock,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { SidebarDesktop } from "./desktop/SidebarDesktop";
import { HeaderBand } from "./desktop/HeaderBand";

const MENU_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/kasir", label: "Kasir", icon: ShoppingCart },
  { href: "/transaksi", label: "Riwayat", icon: Clock },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/stok", label: "Stok", icon: Layers },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/kasir", label: "Kasir", icon: ShoppingCart, isFAB: true },
  { href: "/stok", label: "Stok", icon: Layers },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export function AppShell({
  children,
  userName,
  userRole,
  outletName,
  trialDaysLeft,
  notifications,
  header,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  outletName: string;
  trialDaysLeft: number;
  notifications: { type: "warning" | "info" | "success"; title: string; desc: string }[];
  header?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);

  useEffect(() => {
    const openMenu = () => setMobileMenuOpen(true);
    window.addEventListener("openMobileMenu", openMenu);

    const handleToggleNav = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail: unknown = event.detail;
      if (
        typeof detail !== "object" ||
        detail === null ||
        !("hidden" in detail) ||
        typeof detail.hidden !== "boolean"
      ) return;
      setHideBottomNav(detail.hidden);
    };
    window.addEventListener("toggleBottomNav", handleToggleNav);

    return () => {
      window.removeEventListener("openMobileMenu", openMenu);
      window.removeEventListener("toggleBottomNav", handleToggleNav);
    };
  }, []);

  const isDashboard = pathname === "/dashboard";
  // Tambahin pengecekan buat halaman transaksi/riwayat biar full width
  const isFullWidthPage = pathname === "/kasir" || pathname === "/transaksi" || pathname === "/riwayat";
  
  const firstName = userName.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-[#f6f7fb] text-[#0b1230] text-xs">
      
      {/* === DESKTOP SIDEBAR === */}
      <SidebarDesktop
        userName={userName}
        userRole={userRole}
        trialDaysLeft={trialDaysLeft}
      />

      {/* === MAIN AREA === */}
      <main className={`min-w-0 flex-1 pb-28 lg:pb-8 bg-[#f6f7fb] ${isDashboard ? "lg:bg-[#e9eef6]" : ""} ${pathname === "/kasir" || pathname === "/transaksi" ? "lg:pb-0 lg:h-screen" : ""}`}>
        
        {/* === DESKTOP HEADER BAND (Khusus Dashboard Desktop) === */}
        {isDashboard && (
          <HeaderBand
            userName={userName}
            outletName={outletName}
            lastRefreshTime="13.28"
            notifications={notifications}
          />
        )}

        {/* === MOBILE HEADER (Hanya di Beranda) === */}
        {isDashboard && (
          <div className="lg:hidden relative">
            {header}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="fixed top-5 right-4 z-[100] size-9 rounded-xl bg-white/15 backdrop-blur-md grid place-items-center text-white border border-white/10"
              aria-label="Buka menu"
            >
              <Menu className="size-5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* === KONTEN === */}
        <div
          className={`w-full ${
            isFullWidthPage
              ? "lg:max-w-full lg:px-0"
              : `lg:mx-auto lg:max-w-[1320px] lg:px-7 ${isDashboard ? "lg:-mt-10 pb-10" : "pt-0 pb-0"}`
          } relative z-[1]`}
        >
          {children}
        </div>
      </main>

      {/* === MOBILE DRAWER (Menu Samping) === */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-[#0b1437] text-white z-[110] lg:hidden flex flex-col">
            <div className="px-6 py-6 flex items-center justify-between">
              <img
                src="/logo-full.png"
                alt="Cashier"
                className="h-9 object-contain"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="size-9 rounded-lg bg-white/10 grid place-items-center"
                aria-label="Tutup menu"
              >
                <X className="size-5" strokeWidth={1.9} />
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] font-semibold ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={1.9} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <div className="px-2 mb-3">
                <div className="text-[13px] font-bold truncate">
                  {firstName}
                </div>
                <div className="text-[11px] text-[#869fc2]">{userRole}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === MOBILE BOTTOM NAV (Auto-Hide) === */}
      {!hideBottomNav && (
        <nav className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-cx-line z-[80] animate-in slide-in-from-bottom-full duration-200">
          <div className="grid grid-cols-5 max-w-lg mx-auto pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.isFAB) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-1 -mt-6"
                  >
                    <div className="size-[52px] rounded-[18px] bg-cx-cta shadow-cx-fab grid place-items-center active:scale-[0.95] transition-transform">
                      <Icon className="size-6 text-white" strokeWidth={2} />
                    </div>
                    <span
                      className={`text-[10.5px] font-semibold ${
                        isActive ? "text-cx-orange-d" : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex flex-col items-center gap-1 py-2"
                >
                  <Icon
                    className={`size-5 ${
                      isActive ? "text-cx-blue" : "text-slate-400"
                    }`}
                    strokeWidth={1.9}
                  />
                  <span
                    className={`text-[10.5px] font-semibold ${
                      isActive ? "text-cx-blue" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}