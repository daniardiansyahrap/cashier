"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

// Kita pisah komponen karena useSearchParams butuh Suspense di Next.js 14
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Sandi minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi sandi tidak cocok");
      return;
    }

    setLoading(true);

    try {
      // Nanti kita bikin API-nya di langkah selanjutnya
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000); // 3 detik kemudian lempar ke login
      } else {
        setError(data.error || "Gagal mereset sandi");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500 font-bold mb-4">Token tidak valid atau tidak ditemukan.</p>
        <Link href="/forgot-password" className="text-[#c2410c] font-semibold hover:underline">
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <Link href="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#0b1230] mb-6 transition-colors">
        <ChevronLeft className="size-4 mr-1" /> Kembali ke Login
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0b1230]">Buat Sandi Baru</h1>
        <p className="text-slate-500 text-sm mt-1">Silakan masukkan sandi baru Anda. Pastikan mudah diingat.</p>
      </div>

      {success ? (
        <div className="bg-[#e6f6ec] border border-green-200 text-[#15803d] text-sm p-4 rounded-xl text-center">
          <p className="font-bold mb-1">Sandi berhasil diubah!</p>
          <p>Anda akan diarahkan ke halaman login dalam 3 detik...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <Label>Sandi Baru</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label>Ulangi Sandi Baru</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-[#c2410c] hover:bg-[#a83a0a] text-white font-bold text-base mt-2" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Sandi Baru"}
          </Button>
        </form>
      )}
    </div>
  );
}

// Ini pembungkus utamanya
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <Suspense fallback={<div className="text-slate-500">Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}