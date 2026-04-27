"use client";

import { createContext, useContext, ReactNode } from "react";

type Role = "admin" | "staff" | null;

const RoleContext = createContext<Role>(null);

export function AdminRoleProvider({ role, children }: { role: Role; children: ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useAdminRole(): Role {
  return useContext(RoleContext);
}

export function useIsAdmin(): boolean {
  return useContext(RoleContext) === "admin";
}

interface GateProps {
  /** Show children only when current role matches (default: "admin"). */
  role?: "admin" | "staff";
  /** Optional fallback to render for users who do NOT pass the gate. */
  fallback?: ReactNode;
  children: ReactNode;
}

export function AdminGate({ role = "admin", fallback = null, children }: GateProps) {
  const current = useContext(RoleContext);
  if (current !== role) return <>{fallback}</>;
  return <>{children}</>;
}
