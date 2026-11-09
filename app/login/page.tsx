"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email atau sandi salah");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0b1230]">Masuk ke Cashier</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan email dan sandi akun Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="mt-1 h-11"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Sandi</Label>
              {/* LINK LUPA SANDI DI SINI */}
              <Link href="/forgot-password" className="text-xs font-semibold text-[#c2410c] hover:underline">
                Lupa sandi?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-[#c2410c] hover:bg-[#a83a0a] text-white font-bold text-base mt-2" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-[#0b1230] hover:underline">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}