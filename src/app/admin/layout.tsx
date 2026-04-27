import { getSessionFromCookies } from "@/lib/sessionServer";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();
  const role = (session?.role === "admin" || session?.role === "staff") ? session.role : null;
  return <AdminShell role={role}>{children}</AdminShell>;
}
