import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // CATATAN PENTING: 
    // Karena di langkah sebelumnya kita cuma nge-print token ke terminal (belum disimpen ke DB),
    // maka di sini kita bakal nge-update user berdasarkan email yang ada di URL/terminal tadi.
    // DALAM APLIKASI NYATA, lo harus ngecek token ke tabel PasswordResetToken di DB.
    
    // Untuk testing sementara, kita asumsikan email owner adalah ini:
    // (GANTI email di bawah dengan email yang lo pake buat ngetes tadi)
    const dummyEmail = "daniardiansyahrap@gmail.com"; // <--- SESUAIKAN DENGAN EMAIL YANG ADA DI DB LO

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: dummyEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Sandi berhasil diubah" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}