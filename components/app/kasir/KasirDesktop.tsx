"use client";

import { useState } from "react";
import { Search, Plus, Minus, ShoppingCart, Trash2, ScanBarcode } from "lucide-react";
import { rupiah } from "@/lib/format";

type Produk = { 
  id: string; 
  nama: string; 
  sku: string | null; 
  barcode: string | null; 
  hargaJual: number; 
  satuan: string; 
  categoryId: string | null; 
  stocks?: { qty: number }[] 
};
type Kategori = { id: string; nama: string };
type CartItem = { productId: string; namaProduk: string; harga: number; qty: number };

// Helper untuk membuat nama produk & kategori menjadi Title Case (Huruf Kapital Setiap Kata)
function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function KasirDesktop({
  produk, kategori, cart, addToCart, updateQty, removeFromCart, clearCart, total, onBayar
}: {
  produk: Produk[]; 
  kategori: Kategori[]; 
  cart: CartItem[]; 
  addToCart: (p: Produk) => void; 
  updateQty: (id: string, qty: number) => void; 
  removeFromCart: (id: string) => void; 
  clearCart: () => void; 
  total: number; 
  onBayar: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const filtered = produk.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat ? p.categoryId === selectedCat : true;
    return matchSearch && matchCat;
  });

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="hidden lg:flex h-screen overflow-hidden bg-[#e9eef6]">
      
      {/* KIRI: Grid Produk & Header Navy */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Navy */}
        <div className="bg-gradient-to-r from-[#0b1438] to-[#1e2f78] px-8 pt-6 pb-6 rounded-br-[40px] shadow-sm relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-white text-2xl font-extrabold tracking-tight">Kasir</h1>
              <p className="text-[#a7b0d4] text-xs mt-1">Scan barcode, cari produk, atau pilih kategori</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk (nama / SKU / barcode)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[52px] pl-12 pr-12 bg-white border-none rounded-xl text-sm focus:outline-none shadow-lg"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-[#f1f2f8] rounded-lg grid place-items-center hover:bg-slate-200 transition-colors">
              <ScanBarcode className="size-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Area Konten Bawah (Filter & Grid) */}
        <div className="flex-1 overflow-y-auto p-8 pt-3">
          
          {/* Filter Kategori */}
          <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-none items-center py-1">
            
            {kategori.map((k) => (
              <button
                key={k.id}
                onClick={() => setSelectedCat(k.id)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedCat === k.id ? "bg-[#c2410c] text-white shadow-md" : "bg-white text-[#0b1230] border border-[#dde1ec] hover:border-[#c2410c]"
                }`}
              >
                {toTitleCase(k.nama)}
              </button>
            ))}
            <div className="text-xs font-medium text-[#757895] ml-auto pl-4 shrink-0">
              {filtered.length} produk
            </div>
          </div>

          {/* Grid Produk */}
          <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filtered.map((p) => {
              const qtyInCart = cart.find((c) => c.productId === p.id)?.qty || 0;
              const stok = p.stocks?.[0]?.qty || 0;
              
              const isHabis = stok <= 0;
              const isRendah = stok > 0 && stok < 5;
              const isMaxStock = qtyInCart >= stok;
              const disableAdd = isHabis || isMaxStock;

              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col p-4 bg-white rounded-xl transition-all shadow-sm border ${
                    qtyInCart > 0 ? "border-[#c2410c] ring-1 ring-[#c2410c]" : "border-[#dde1ec]"
                  }`}
                >
                  <div className="font-bold text-[14px] text-[#0b1230] line-clamp-2 mb-1" title={toTitleCase(p.nama)}>
                    {toTitleCase(p.nama)}
                  </div>
                  <div className="text-[11px] text-[#757895] mb-4">SKU: {p.sku || "-"}</div>
                  
                  <div className="text-[15px] font-extrabold text-[#c2410c] mt-auto">{rupiah(p.hargaJual)}</div>
                  
                  <div className="flex justify-between items-end mt-3 h-8">
                    <div className={`text-[11px] font-semibold ${
                      isHabis ? "text-red-500" : isRendah ? "text-orange-500" : "text-[#757895]"
                    }`}>
                      {isHabis ? (
                        "Stok Habis"
                      ) : (
                        <>
                          {isRendah && <span className="inline-block size-2 rounded-full bg-orange-500 mr-1.5 mb-0.5" />}
                          Stok {stok}
                        </>
                      )}
                    </div>
                    
                    {qtyInCart > 0 ? (
                      <div className="flex items-center h-8 w-[80px] bg-white border border-[#dde1ec] rounded-lg px-1 shadow-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQty(p.id, qtyInCart - 1); }} 
                          className="size-6 grid place-items-center text-slate-500 hover:bg-slate-100 rounded shrink-0"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-[13px] font-bold flex-1 text-center text-[#0b1230]">{qtyInCart}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (!disableAdd) addToCart(p); }} 
                          disabled={disableAdd}
                          className={`size-6 grid place-items-center rounded shrink-0 transition-colors ${
                            disableAdd ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { if (!isHabis) addToCart(p); }}
                        disabled={isHabis}
                        className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                          isHabis ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#c2410c] text-white hover:bg-[#a83a0a] shadow-md"
                        }`}
                      >
                        <Plus className="size-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KANAN: Panel Keranjang Desktop */}
      <div className="relative z-20 w-[400px] shrink-0 p-3">
        <div className="h-full min-h-0 bg-white rounded-2xl border border-[#dde1ec] flex flex-col shadow-[0_12px_36px_-12px_rgba(11,18,48,0.28)] overflow-hidden">
        
          <div className="p-5 border-b border-[#dde1ec] flex justify-between items-center shrink-0">
            <h2 className="font-extrabold text-xl text-[#0b1230] flex items-center gap-2">
              Keranjang <span className="bg-[#f6f7fb] text-[#757895] text-[11px] font-bold px-2 py-0.5 rounded-md">{totalQty} item</span>
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs font-bold text-[#c2410c] hover:underline flex items-center gap-1.5">
                <Trash2 className="size-4" /> Kosongkan
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-[#757895] text-sm flex flex-col items-center">
                <ShoppingCart className="size-12 text-slate-200 mb-3" />
                Keranjang masih kosong.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center border-b border-[#f6f7fb] pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-[#0b1230] mb-0.5">{toTitleCase(item.namaProduk)}</div>
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
                    <div className="w-16 text-right font-extrabold text-sm text-[#0b1230]">
                      {rupiah(item.harga * item.qty)}
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-[#dde1ec] bg-white shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[#0b1230]">Total tagihan</span>
              <span className="text-2xl font-extrabold text-[#c2410c]">{rupiah(total)}</span>
            </div>

            <button 
              onClick={onBayar} 
              disabled={cart.length === 0}
              className="w-full h-12 mt-2 bg-[#c2410c] text-white font-bold rounded-xl text-base shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingCart className="size-5" /> Bayar sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}