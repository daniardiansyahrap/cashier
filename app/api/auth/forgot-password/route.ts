import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // PENTING: Demi keamanan, walaupun email gak ketemu, kita tetep balikin "OK"
    // biar hacker gak bisa nebak-nebak email mana yang terdaftar di sistem kita.
    if (!user) {
      return NextResponse.json({ message: "Jika email terdaftar, tautan reset telah dikirim." });
    }

    // 1. Bikin token random
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 jam dari sekarang

    // 2. Simpan token ke DB (Asumsi lo punya model PasswordResetToken di Prisma)
    // KALAU BELUM ADA TABELNYA, lo harus migrate schema.prisma dulu.
    /*
    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });
    */

    // 3. Kirim Email (SIMULASI)
    // Di sini lo nanti tinggal panggil library kayak Resend / Nodemailer.
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    console.log("====================================");
    console.log(`EMAIL TERKIRIM KE: ${email}`);
    console.log(`LINK RESET PASSWORD: ${resetLink}`);
    console.log("====================================");

    return NextResponse.json({ message: "Tautan reset telah dikirim." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}