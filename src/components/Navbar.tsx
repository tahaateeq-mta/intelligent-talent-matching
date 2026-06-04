"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-violet-950/50 bg-brand-deep px-6 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-brand-accent"
        >
          IntelligentTalent
        </Link>

        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-accent">
          Prototype
        </span>
      </div>

      <div className="flex items-center gap-6">
        {userProfile ? (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold tracking-wide text-white">
                {userProfile.displayName || userProfile.email || "User"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent/80">
                {userProfile.role} Account
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-300 transition-all duration-300 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-xs font-bold tracking-wide text-slate-300 transition-colors duration-300 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-violet-600 active:translate-y-0"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}