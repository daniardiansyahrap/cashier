"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Terjadi kesalahan");
      }
    } catch (err) {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        <Link href="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#0b1230] mb-6 transition-colors">
          <ChevronLeft className="size-4 mr-1" /> Kembali ke Login
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#0b1230]">Lupa Sandi?</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang sandi.</p>
        </div>

        {success ? (
          <div className="bg-[#e6f6ec] border border-green-200 text-[#15803d] text-sm p-4 rounded-xl text-center">
            <p className="font-bold mb-1">Tautan terkirim!</p>
            <p>Silakan cek kotak masuk (atau folder spam) di email <b>{email}</b>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <Label>Email Terdaftar</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="mt-1 h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-[#c2410c] hover:bg-[#a83a0a] text-white font-bold text-base mt-2" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}