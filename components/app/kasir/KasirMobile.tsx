"use client";

import { useState, useEffect } from "react";
import { Search, ScanBarcode, ShoppingCart, Minus, Plus, Trash2, Menu, ChevronUp, ArrowRight, Wallet } from "lucide-react";
import { rupiah } from "@/lib/format";

type Produk = { id: string; nama: string; sku: string | null; barcode: string | null; hargaJual: number; satuan: string; categoryId: string | null; stocks?: { qty: number }[] };
type Kategori = { id: string; nama: string };
type CartItem = { productId: string; namaProduk: string; harga: number; qty: number };

export function KasirMobile({
  produk, kategori, cart, addToCart, updateQty, removeFromCart, clearCart, total, onBayar
}: {
  produk: Produk[]; kategori: Kategori[]; cart: CartItem[]; addToCart: (p: Produk) => void; updateQty: (id: string, qty: number) => void; removeFromCart: (id: string) => void; clearCart: () => void; total: number; onBayar: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [uangDiterima, setUangDiterima] = useState("");
  const [kembalian, setKembalian] = useState(0);

  // Auto-hide bottom nav pas keranjang kebuka
  useEffect(() => {
    if (cartOpen) {
      window.dispatchEvent(new CustomEvent("toggleBottomNav", { detail: { hidden: true } }));
    } else {
      window.dispatchEvent(new CustomEvent("toggleBottomNav", { detail: { hidden: false } }));
    }
  }, [cartOpen]);

  const filtered = produk.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat ? p.categoryId === selectedCat : true;
    return matchSearch && matchCat;
  });

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  function handleUang(val: string) {
    setUangDiterima(val);
    const num = parseInt(val) || 0;
    if (num >= total) setKembalian(num - total);
    else setKembalian(0);
  }

  function handleBayar() {
    if (parseInt(uangDiterima) < total) {
      alert("Uang yang diterima kurang dari total tagihan!");
      return;
    }
    setCartOpen(false);
    onBayar();
    setUangDiterima("");
    setKembalian(0);
  }

  return (
    <div className="lg:hidden flex h-full min-h-0 flex-col bg-[#f6f7fb] relative overflow-hidden -mt-1">

      {/* HEADER NAVY */}
      <div className="bg-cx-hero px-4 pt-5 pb-6 rounded-b-3xl shadow-sm z-10 shrink-0 relative -mt-1">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("openMobileMenu"))}
          className="absolute top-5 right-4 z-20 size-9 rounded-xl bg-white/10 grid place-items-center text-white hover:bg-white/20 transition-colors"
        >
          <Menu className="size-5" strokeWidth={2} />
        </button>
        <h1 className="text-white text-xl font-extrabold mb-1 pr-12">Kasir</h1>
        <p className="text-[#a7b0d4] text-[11px] mb-4">Scan barcode, cari produk, atau pilih kategori</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk (nama / SKU / barcode)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-4 bg-white border-none rounded-xl text-sm focus:outline-none"
            />
          </div>
          <button className="size-11 bg-[#c2410c] rounded-xl grid place-items-center shrink-0 shadow-lg shadow-orange-500/30">
            <ScanBarcode className="size-5 text-white" />
          </button>
        </div>
      </div>

      {/* FILTER KATEGORI */}
      <div className="px-4 py-3 shrink-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
          
          {kategori.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedCat(k.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${selectedCat === k.id ? "bg-[#c2410c] text-white shadow-md" : "bg-white text-[#0b1230] border border-[#dde1ec]"
                }`}
            >
              {k.nama}
            </button>
          ))}
          <div className="shrink-0 text-[10px] text-[#757895] ml-auto pl-2">
            {filtered.length} produk
          </div>
        </div>
      </div>

      {/* GRID PRODUK */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-32">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => {
            const qtyInCart = cart.find((c) => c.productId === p.id)?.qty || 0;
            const stok = p.stocks?.[0]?.qty || 0;
            
            // Logika Status Stok
            const isHabis = stok <= 0;
            const isRendah = stok > 0 && stok < 5;
            
            // Tombol disable kalau stok habis, ATAU kalau qty di keranjang udah nyamain stok
            const isMaxStock = qtyInCart >= stok;
            const disableAdd = isHabis || isMaxStock;
            
            return (
              <div
                key={p.id}
                className={`relative flex flex-col text-left p-3 bg-white border rounded-2xl transition-all shadow-sm ${
                  qtyInCart > 0
                    ? "border-[#c2410c] shadow-[0_2px_10px_rgba(194,65,12,0.1)]"
                    : "border-[#dde1ec]"
                }`}
              >
                <div className="font-bold text-[13px] text-[#0b1230] line-clamp-2 mb-0.5">{p.nama}</div>
                <div className="text-[10px] text-[#757895] mb-3">SKU: {p.sku || "-"}</div>
                <div className="text-[14px] font-extrabold text-[#c2410c] mt-auto">{rupiah(p.hargaJual)}</div>

                <div className="flex justify-between items-center mt-3 h-8">
                  {/* Status Stok */}
                  <div className={`text-[10px] font-semibold ${
                    isHabis ? "text-red-500" : isRendah ? "text-orange-500" : "text-[#757895]"
                  }`}>
                    {isHabis ? (
                      "Stok Habis"
                    ) : (
                      <>
                        {isRendah && <span className="inline-block size-1.5 rounded-full bg-orange-500 mr-1 mb-0.5" />}
                        Stok {stok}
                      </>
                    )}
                  </div>

                  {/* KONTROL QTY */}
                  {qtyInCart > 0 ? (
                    <div className="flex items-center h-8 w-[76px] bg-white border border-[#dde1ec] rounded-lg px-1">
                      <button 
                        onClick={() => updateQty(p.id, qtyInCart - 1)} 
                        className="size-6 grid place-items-center text-slate-500 hover:bg-slate-100 rounded shrink-0"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-[12px] font-bold flex-1 text-center text-[#0b1230]">
                        {qtyInCart}
                      </span>
                      <button 
                        onClick={() => addToCart(p)} 
                        disabled={disableAdd}
                        className={`size-6 grid place-items-center rounded shrink-0 transition-colors ${
                          disableAdd 
                            ? "text-slate-300 cursor-not-allowed" 
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={isHabis}
                      className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                        isHabis 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                          : "bg-gradient-to-br from-orange-500 to-[#ea580c] text-white shadow-md shadow-orange-500/25 hover:brightness-95"
                      }`}
                    >
                      <Plus className="size-4" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING CART BAR */}
      {cart.length > 0 && !cartOpen && (
        <div className="fixed bottom-[72px] left-4 right-4 bg-[#0b1230] text-white rounded-2xl p-3 shadow-2xl flex items-center justify-between z-40 animate-in slide-in-from-bottom-2 border border-white/10">
          <button onClick={() => setCartOpen(true)} className="flex items-center gap-3 text-left">
            <div className="relative">
              <ShoppingCart className="size-6 text-white" />
              <span className="absolute -top-2 -right-2 size-4 bg-[#c2410c] text-white text-[9px] font-bold rounded-full grid place-items-center">
                {totalQty}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1">
                {totalQty} item <ChevronUp className="size-3 text-slate-300" strokeWidth={2.5} />
              </div>
              <div className="text-sm font-extrabold">{rupiah(total)}</div>
            </div>
          </button>
          <button onClick={() => setCartOpen(true)} className="group inline-flex items-center gap-2 bg-[#c2410c] hover:bg-[#a83a0a] text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 whitespace-nowrap transition-colors">
            Lihat Keranjang <ArrowRight className="size-4 scale-x-115 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* BOTTOM SHEET KERANJANG */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />

          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">

            {/* Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 shrink-0" onClick={() => setCartOpen(false)}>
              <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Header Drawer */}
            <div className="px-5 pb-3 flex justify-between items-center border-b border-[#f6f7fb] shrink-0">
              <h2 className="font-extrabold text-xl text-[#0b1230]">Keranjang</h2>
              <div className="flex items-center gap-3">
                <span className="bg-[#f6f7fb] text-[#757895] text-[11px] font-bold px-2.5 py-1 rounded-md">{totalQty} item</span>
                <button onClick={clearCart} className="text-xs font-bold text-[#c2410c] flex items-center gap-1.5 hover:underline">
                  <Trash2 className="size-4" /> Kosongkan
                </button>
              </div>
            </div>

            {/* List Item */}
            <div className="overflow-y-auto px-5 py-3 space-y-0 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center border-b border-[#f6f7fb] py-4 last:border-0">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-[#0b1230] mb-0.5">{item.namaProduk}</div>
                    <div className="text-xs text-[#757895]">{rupiah(item.harga)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white border border-[#dde1ec] rounded-lg p-1">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="size-7 grid place-items-center text-slate-500 hover:bg-slate-100 rounded">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="size-7 grid place-items-center text-slate-500 hover:bg-slate-100 rounded">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="w-20 text-right font-extrabold text-sm text-[#0b1230]">
                      {rupiah(item.harga * item.qty)}
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Pembayaran */}
            <div className="p-5 pb-8 border-t border-[#f6f7fb] bg-white rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] shrink-0 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#0b1230]">Total tagihan</span>
                <span className="text-2xl font-extrabold text-[#c2410c]">{rupiah(total)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Uang diterima</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={uangDiterima}
                      onChange={(e) => handleUang(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#dde1ec] rounded-xl text-sm font-bold focus:outline-none focus:border-[#c2410c]"
                      placeholder="0"
                    />
                  </div>
                </div>

                {kembalian > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Kembalian</span>
                    <span className="font-extrabold text-green-600">{rupiah(kembalian)}</span>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => handleUang("15000")} className="h-9 bg-[#f6f7fb] text-[#0b1230] text-[11px] font-bold rounded-lg border border-[#dde1ec]">Rp 15.000</button>
                  <button onClick={() => handleUang("20000")} className="h-9 bg-[#f6f7fb] text-[#0b1230] text-[11px] font-bold rounded-lg border border-[#dde1ec]">Rp 20.000</button>
                  <button onClick={() => handleUang("50000")} className="h-9 bg-[#f6f7fb] text-[#0b1230] text-[11px] font-bold rounded-lg border border-[#dde1ec]">Rp 50.000</button>
                  <button onClick={() => handleUang("100000")} className="h-9 bg-[#f6f7fb] text-[#0b1230] text-[11px] font-bold rounded-lg border border-[#dde1ec]">Rp 100.000</button>
                </div>

                <button
                  onClick={handleBayar}
                  disabled={parseInt(uangDiterima) < total}
                  className="w-full h-12 mt-2 bg-[#c2410c] text-white font-bold rounded-xl text-base shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Wallet className="size-5" /> Bayar sekarang
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}