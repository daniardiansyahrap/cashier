import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Selamat datang, {session.user?.name}!</p>
      <p className="text-sm text-gray-600 mt-2">
        Email: {session.user?.email}
      </p>
      <p className="text-sm text-gray-600">
        Role: {(session.user as any).role}
      </p>
    </div>
  );
}