"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { Search, ChevronRight, Store, Clock, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// --- TIPE DATA ---
type TransactionItem = {
  id: string;
  namaProduk: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
};

type Transaksi = {
  id: string;
  nomor: string;
  subtotal: number;
  diskon: number;
  total: number;
  metodeBayar: string;
  bayar: number;
  kembalian: number;
  status: string;
  catatan: string | null;
  createdAt: string;
  items: TransactionItem[];
};

// --- HELPER FORMAT ---
function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function formatTanggalHeader(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatJam(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d).replace(":", ".");
}

function metodeLabel(m: string) {
  const map: Record<string, string> = {
    cash: "Tunai",
    qris: "QRIS",
    debit: "Debit",
    transfer: "Transfer",
  };
  return map[m] || m;
}

export default function RiwayatPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Transaksi | null>(null);
  
  const [filterWaktu, setFilterWaktu] = useState("semua");
  const [filterMetode, setFilterMetode] = useState("semua");

  async function fetchTransaksi() {
    setLoading(true);
    try {
      const res = await fetch("/api/transaksi");
      const data = await res.json();
      setTransaksi(data);
    } catch (err) {
      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const filtered = transaksi.filter((t) => {
    const matchSearch = t.nomor.toLowerCase().includes(search.toLowerCase());
    const matchMetode = filterMetode === "semua" ? true : t.metodeBayar === filterMetode;
    let matchWaktu = true;
    if (filterWaktu === "hari-ini") {
      const today = new Date().toDateString();
      const tgl = new Date(t.createdAt).toDateString();
      matchWaktu = today === tgl;
    }
    return matchSearch && matchMetode && matchWaktu;
  });

  const groupedTransaksi = filtered.reduce((groups, item) => {
    const date = formatTanggalHeader(item.createdAt);
    if (!groups[date]) {
      groups[date] = { items: [], totalHarian: 0, count: 0 };
    }
    groups[date].items.push(item);
    groups[date].totalHarian += item.total;
    groups[date].count += 1;
    return groups;
  }, {} as Record<string, { items: Transaksi[]; totalHarian: number; count: number }>);

  const totalOmset = transaksi.reduce((s, t) => s + t.total, 0);
  const totalItem = transaksi.reduce((s, t) => s + t.items.reduce((sum, i) => sum + i.qty, 0), 0);
  const rataRata = transaksi.length > 0 ? totalOmset / transaksi.length : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:overflow-hidden lg:pb-0">
      
      {/* HEADER NAVY */}
      <div className="w-full bg-gradient-to-r from-[#0b1438] via-[#16265e] to-[#1e2f78] pt-8 pb-16 px-6 lg:px-8 text-white lg:shrink-0 lg:rounded-tl-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Riwayat transaksi</h1>
            <p className="text-[#a7b0d4] text-sm mt-1">Daftar semua transaksi yang pernah terjadi</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Store className="size-4" /> Outlet Utama <ChevronRight className="size-4 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="w-full px-4 lg:px-8 -mt-8 relative z-10 max-w-full lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:pb-7">
        
        {/* SUMMARY CARDS (Mobile: 2x2, Desktop: 1x4) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden mb-6 lg:shrink-0">
          <div className="p-4 lg:p-5">
            <div className="text-[11px] lg:text-xs font-semibold text-slate-500 mb-1">Transaksi</div>
            <div className="text-xl lg:text-2xl font-extrabold text-[#0b1230]">{transaksi.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">semua waktu</div>
          </div>
          <div className="p-4 lg:p-5">
            <div className="text-[11px] lg:text-xs font-semibold text-slate-500 mb-1">Total penjualan</div>
            <div className="text-xl lg:text-2xl font-extrabold text-[#0b1230]">{formatRupiah(totalOmset)}</div>
            <div className="text-[10px] text-slate-400 mt-1">semua waktu</div>
          </div>
          <div className="p-4 lg:p-5">
            <div className="text-[11px] lg:text-xs font-semibold text-slate-500 mb-1">Item terjual</div>
            <div className="text-xl lg:text-2xl font-extrabold text-[#0b1230]">{totalItem}</div>
            <div className="text-[10px] text-slate-400 mt-1">semua waktu</div>
          </div>
          <div className="p-4 lg:p-5">
            <div className="text-[11px] lg:text-xs font-semibold text-slate-500 mb-1">Rata-rata per transaksi</div>
            <div className="text-xl lg:text-2xl font-extrabold text-[#0b1230]">{formatRupiah(rataRata)}</div>
            <div className="text-[10px] text-slate-400 mt-1">semua waktu</div>
          </div>
        </div>

        {/* TABEL & FILTER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          
          {/* Header Filter & Pills */}
          <div className="p-4 lg:p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-50 lg:shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-[#0b1230]">Daftar transaksi</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-md">{filtered.length}</span>
            </div>
            
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 w-full xl:w-auto">
              
              <div className="flex flex-wrap gap-1">
                {["Hari ini", "7 hari", "30 hari", "Semua"].map((w) => (
                  <button 
                    key={w}
                    onClick={() => setFilterWaktu(w === "Semua" ? "semua" : w.toLowerCase().replace(" ", "-"))}
                    className={`px-3 py-1.5 text-[11px] lg:text-xs font-bold rounded-lg transition-all border ${filterWaktu === (w === "Semua" ? "semua" : w.toLowerCase().replace(" ", "-")) ? "bg-slate-100 border-slate-200 text-[#0b1230]" : "bg-white border-transparent text-slate-500 hover:bg-slate-50"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {["Semua metode", "Tunai", "QRIS"].map((m) => (
                  <button 
                    key={m}
                    onClick={() => setFilterMetode(m === "Semua metode" ? "semua" : m.toLowerCase())}
                    className={`px-3 py-1.5 text-[11px] lg:text-xs font-bold rounded-lg transition-all border ${filterMetode === (m === "Semua metode" ? "semua" : m.toLowerCase()) ? "bg-slate-100 border-slate-200 text-[#0b1230]" : "bg-white border-transparent text-slate-500 hover:bg-slate-50"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  placeholder="Cari nomor nota" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 w-full md:w-[200px] text-sm bg-white border-slate-200 focus-visible:ring-[#c2410c]"
                />
              </div>

            </div>
          </div>

          {/* DATA STATE */}
          {loading ? (
            <div className="p-10 text-center text-slate-500 lg:flex-1">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 lg:min-h-0 lg:flex-1">
              <div className="w-full max-w-2xl space-y-4 mb-8">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center gap-4 py-3 border-b border-dashed border-slate-200">
                     <div className="size-6 bg-slate-100 rounded-md shrink-0" />
                     <div className="h-3 bg-slate-100 rounded w-1/4" />
                     <div className="h-3 bg-slate-100 rounded w-12 ml-auto" />
                   </div>
                ))}
              </div>
              <h3 className="font-bold text-[#0b1230] text-base mb-1">Nota pertama akan tercatat di sini</h3>
              <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">Setiap penjualan di Kasir langsung muncul di riwayat.</p>
              <Link href="/kasir">
                <button className="bg-[#c2410c] hover:bg-[#a83a0a] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
                  Buka Kasir
                </button>
              </Link>
            </div>
          ) : (
            <div className="w-full lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
              
              {/* ======================================================== */}
              {/* VERSI DESKTOP (TABEL) - HANYA MUNCUL DI LAYAR LG KE ATAS */}
              {/* ======================================================== */}
              <div className="hidden lg:block lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 border-y border-slate-100 tracking-wider lg:sticky lg:top-0 lg:z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold w-[35%]">No. struk</th>
                      <th className="px-6 py-3 font-semibold w-[15%]">Waktu</th>
                      <th className="px-6 py-3 font-semibold w-[15%]">Item</th>
                      <th className="px-6 py-3 font-semibold w-[15%]">Metode</th>
                      <th className="px-6 py-3 font-semibold text-right w-[20%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedTransaksi).map(([tanggal, group]) => (
                      <Fragment key={tanggal}>
                        <tr className="bg-white">
                          <td className="px-6 pt-6 pb-2 font-bold text-[#0b1230] text-sm">
                            {tanggal}
                          </td>
                          <td colSpan={3}></td>
                          <td className="px-6 pt-6 pb-2 text-right text-xs text-slate-400 font-medium">
                            {group.count} transaksi · {formatRupiah(group.totalHarian)}
                          </td>
                        </tr>
                        
                        {group.items.map((t) => (
                          <tr 
                            key={t.id} 
                            onClick={() => setSelected(t)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors group border-b border-slate-50 last:border-0"
                          >
                            <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-[#0b1230]">{t.nomor}</td>
                            <td className="px-6 py-3.5 text-slate-500">{formatJam(t.createdAt)}</td>
                            <td className="px-6 py-3.5 text-slate-500">
                              {t.items.reduce((s, item) => s + item.qty, 0)} item
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                                t.metodeBayar === 'cash' ? ' text-[#16a34a]' : 
                                t.metodeBayar === 'qris' ? ' text-blue-600' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {metodeLabel(t.metodeBayar)}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-[13px] text-[#0b1230]">
                              <div className="flex justify-between items-center">
                                {formatRupiah(t.total)}
                                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ======================================================== */}
              {/* VERSI MOBILE (CARD LIST) - HANYA MUNCUL DI LAYAR KECIL */}
              {/* ======================================================== */}
              <div className="block lg:hidden">
                {Object.entries(groupedTransaksi).map(([tanggal, group]) => (
                  <div key={tanggal} className="mb-2">
                    {/* Header Tanggal Mobile */}
                    <div className="bg-slate-50 px-4 py-3 border-y border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-[#0b1230] text-sm">{tanggal}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {group.count} transaksi · {formatRupiah(group.totalHarian)}
                      </span>
                    </div>

                    {/* List Card Transaksi */}
                    <div className="divide-y divide-slate-100">
                      {group.items.map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => setSelected(t)}
                          className="p-4 active:bg-slate-50 cursor-pointer flex flex-col gap-3 transition-colors"
                        >
                          {/* Baris 1: No Struk & Total */}
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-[13px] text-[#0b1230]">{t.nomor}</span>
                            <span className="font-extrabold text-[14px] text-[#0b1230]">{formatRupiah(t.total)}</span>
                          </div>
                          
                          {/* Baris 2: Jam, Item, Metode */}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" /> {formatJam(t.createdAt)}
                            </span>
                            <span>•</span>
                            <span>{t.items.reduce((s, item) => s + item.qty, 0)} item</span>
                            <span>•</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.metodeBayar === 'cash' ? ' text-[#16a34a]' : 
                              t.metodeBayar === 'qris' ? ' text-blue-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {metodeLabel(t.metodeBayar)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Pagination (Sama untuk mobile & desktop) */}
              <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 lg:shrink-0">
                <div>Menampilkan {filtered.length} transaksi</div>
                <div className="flex gap-1">
                  <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronLeft className="size-4" /></button>
                  <button className="size-8 flex items-center justify-center rounded-lg bg-[#0b1230] text-white font-bold">1</button>
                  <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronRight className="size-4" /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG DETAIL (SAMA SEPERTI SEBELUMNYA) */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#0b1230]">Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 mt-2">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500">Nomor Transaksi</div>
                <div className="font-mono font-bold text-[#0b1230] text-lg">{selected.nomor}</div>
                <div className="text-xs text-slate-500 mt-1">{formatTanggalHeader(selected.createdAt)} • {formatJam(selected.createdAt)}</div>
              </div>

              <div>
                <div className="text-sm font-bold text-[#0b1230] mb-3">Item yang dibeli:</div>
                <div className="space-y-3 max-h-[40vh] overflow-auto pr-2 scrollbar-thin">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <div className="font-bold text-[#0b1230]">{item.namaProduk}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.qty} × {formatRupiah(item.harga)}</div>
                      </div>
                      <div className="font-bold text-[#0b1230]">{formatRupiah(item.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-[#0b1230]">{formatRupiah(selected.subtotal)}</span>
                </div>
                {selected.diskon > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-medium">Diskon</span>
                    <span className="font-bold">- {formatRupiah(selected.diskon)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                  <span className="font-bold text-[#0b1230]">Total</span>
                  <span className="text-xl font-extrabold text-[#c2410c]">{formatRupiah(selected.total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-slate-500 font-medium">Metode Bayar</span>
                  <span className="font-bold text-[#0b1230]">{metodeLabel(selected.metodeBayar)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Bayar</span>
                  <span className="font-bold text-[#0b1230]">{formatRupiah(selected.bayar)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Kembalian</span>
                  <span className="font-bold text-[#0b1230]">{formatRupiah(selected.kembalian)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}