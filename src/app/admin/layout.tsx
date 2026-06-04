"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== "admin")) {
      router.push("/login");
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== "admin") {
    return <div className="p-8 font-medium text-slate-500">Evaluating access authorization matrix...</div>;
  }

  return <div className="pl-64 min-h-screen bg-slate-50 w-full">{children}</div>;
}