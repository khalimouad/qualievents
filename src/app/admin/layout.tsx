import { getSessionFromCookies } from "@/lib/sessionServer";
import AdminShell from "./AdminShell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  if (session?.role === "scanner") {
    redirect("/scan");
  }
  const role = (session?.role === "admin" || session?.role === "staff") ? session.role : null;
  return <AdminShell role={role}>{children}</AdminShell>;
}
