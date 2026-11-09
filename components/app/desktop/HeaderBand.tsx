"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Search,
    Store,
    ChevronDown,
    RefreshCw,
    Bell,
} from "lucide-react";

function getGreeting(d = new Date()) {
    const h = d.getHours();
    if (h >= 4 && h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
}

export function HeaderBand({
    userName,
    outletName,
    lastRefreshTime,
    notifications,
}: {
    userName: string;
    outletName: string;
    lastRefreshTime: string;
    notifications: { type: "warning" | "info" | "success"; title: string; desc: string }[];
}) {
    const [greeting, setGreeting] = useState("Selamat datang");
    const [dateBlock, setDateBlock] = useState({ day: "", month: "" });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showNotif, setShowNotif] = useState(false);

    const bellRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const d = new Date();
        setGreeting(getGreeting(d));
        setDateBlock({
            day: d.getDate().toString(),
            month: d.toLocaleDateString("id-ID", { month: "short" }),
        });
    }, []);

    // Handle outside click & ESC
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                showNotif &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                bellRef.current &&
                !bellRef.current.contains(e.target as Node)
            ) {
                setShowNotif(false);
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && showNotif) {
                setShowNotif(false);
                bellRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [showNotif]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulasi loading
        setTimeout(() => {
            setIsRefreshing(false);
            // TODO: router.refresh() atau refetch data
        }, 700);
    };

    const notifCount = notifications.length;
    const firstName = userName.split(" ")[0];

    return (
        <header className="hidden lg:block relative h-[124px] rounded-br-[40px] bg-gradient-to-r from-[#0b1438] via-[#16265e] to-[#1e2f78] shadow-sm">
            <div className="mx-auto w-full max-w-[1320px] px-7">
                <div className="flex items-center justify-between gap-5 pt-[18px]">

                    {/* KIRI */}
                    <div className="flex items-center gap-[13px]">
                        {/* Blok Tanggal */}
                        <div className="w-[46px] h-[50px] rounded-lg bg-white/10 border-t-[3px] border-[#f97316] flex flex-col items-center justify-center leading-none text-white shrink-0">
                            <span className="text-[20px] font-extrabold">{dateBlock.day}</span>
                            <span className="text-[10px] font-semibold text-[#a7b0d4] mt-[3px]">{dateBlock.month}</span>
                        </div>

                        {/* Sapaan & Konteks */}
                        <div className="min-w-0">
                            <h1 className="text-[19px] font-extrabold tracking-[-0.02em] text-white leading-tight truncate">
                                {greeting}, {firstName}
                            </h1>
                            <p className="text-[11.5px] text-[#a7b0d4] truncate mt-0.5">
                                {outletName} · belum ada penjualan hari ini
                            </p>
                        </div>
                    </div>

                    {/* KANAN */}
                    <div className="flex items-center gap-[9px] relative shrink-0">
                        {/* Pencarian */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-[14px] text-[#94a3b8]" strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Cari produk atau nomor nota"
                                className="h-[34px] w-[280px] rounded-lg bg-white pl-9 pr-10 text-[11.5px] text-[#0b1230] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#c2410c]/50"
                            />
                            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#d9dcea] px-1.5 text-[10px] font-medium text-[#64748b] pointer-events-none">
                                /
                            </kbd>
                        </div>

                        {/* Pil Outlet */}
                        <button className="h-[34px] rounded-lg bg-[#243063] hover:bg-[#2e3b78] px-3 flex items-center gap-[7px] text-[11.5px] font-bold text-white transition-colors">
                            <Store className="size-[14px]" strokeWidth={1.9} />
                            <span className="max-w-[120px] truncate">{outletName}</span>
                            <ChevronDown className="size-[14px] opacity-70" strokeWidth={2.5} />
                        </button>

                        {/* Tombol Segarkan (Simpel) */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="size-[34px] rounded-lg bg-[#243063] hover:bg-[#2e3b78] grid place-items-center text-white transition-colors aria-busy:opacity-70 relative group"
                            aria-label="Segarkan data"
                            title={`Data terakhir ${lastRefreshTime}`}
                        >
                            <RefreshCw className={`size-[15px] ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={1.9} />

                            {/* Tooltip Custom (Muncul saat hover) */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap z-50">
                                Segarkan · {lastRefreshTime}
                            </div>
                        </button>

                        {/* Lonceng */}
                        <button
                            ref={bellRef}
                            onClick={() => setShowNotif(!showNotif)}
                            className="relative size-[34px] rounded-lg bg-[#243063] hover:bg-[#2e3b78] grid place-items-center transition-colors"
                            aria-expanded={showNotif}
                            aria-haspopup="true"
                        >
                            <Bell className="size-[15px] text-white" strokeWidth={1.9} />
                            {notifCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-[#f97316] text-[9.5px] font-extrabold leading-4 text-white border-2 border-[#0f1842] text-center px-0.5">
                                    {notifCount}
                                </span>
                            )}
                        </button>

                        {/* Popover Pemberitahuan */}
                        {showNotif && (
                            <div
                                ref={popoverRef}
                                className="absolute right-0 top-11 w-[310px] z-20 rounded-[10px] bg-white border border-[#dde1ec] px-4 py-3.5 shadow-[0_20px_40px_-16px_rgba(11,18,48,0.45)]"
                            >
                                <h3 className="text-[12.5px] font-extrabold text-[#0b1230] pb-[9px] border-b border-[#eceef4]">
                                    Pemberitahuan
                                </h3>
                                <div className="flex flex-col">
                                    {notifications.length === 0 ? (
                                        <div className="flex gap-2.5 py-[11px] last:pb-0.5">
                                            <div className="w-[3px] rounded bg-[#16a34a] shrink-0 self-stretch" />
                                            <div>
                                                <div className="text-[12px] font-bold text-[#0b1230]">Tidak ada pemberitahuan baru</div>
                                                <div className="text-[11px] text-[#757895] mt-0.5">Kami kabari bila ada yang perlu kamu lihat.</div>
                                            </div>
                                        </div>
                                    ) : (
                                        notifications.map((notif, i) => (
                                            <div key={i} className="flex gap-2.5 py-[11px] border-b border-dashed border-[#e3e6ef] last:border-0 last:pb-0.5">
                                                <div
                                                    className={`w-[3px] rounded shrink-0 self-stretch ${notif.type === "warning" ? "bg-[#f97316]" : notif.type === "info" ? "bg-[#1d4ed8]" : "bg-[#16a34a]"
                                                        }`}
                                                />
                                                <div>
                                                    <div className="text-[12px] font-bold text-[#0b1230]">{notif.title}</div>
                                                    <div className="text-[11px] text-[#757895] mt-0.5 leading-snug">{notif.desc}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}