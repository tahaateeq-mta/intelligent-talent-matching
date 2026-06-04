"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type NavLink = {
  name: string;
  href: string;
};

const navLinks: Record<string, NavLink[]> = {
  candidate: [
    { name: "Dashboard", href: "/candidate/dashboard" },
    { name: "My Profile", href: "/candidate/profile" },
    { name: "Job Search", href: "/candidate/jobs" },
    { name: "Recommendations", href: "/candidate/recommendations" },
    { name: "My Applications", href: "/candidate/applications" },
  ],
  employer: [
    { name: "Dashboard", href: "/employer/dashboard" },
    { name: "Company Profile", href: "/employer/profile" },
    { name: "My Jobs", href: "/employer/jobs" },
    { name: "Post New Job", href: "/employer/post-job" },
    { name: "Search Candidates", href: "/employer/candidates" },
    { name: "Recommendations", href: "/employer/recommendations" },
    { name: "Applications", href: "/employer/applications" },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Users", href: "/admin/users" },
    { name: "Jobs", href: "/admin/jobs" },
    { name: "Applications", href: "/admin/applications" },
    { name: "Memberships", href: "/admin/memberships" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const role = userProfile.role?.toLowerCase();
  const links = navLinks[role] || [];

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-violet-950/40 bg-brand-deep p-4 text-slate-100 shadow-xl md:block">
      <div className="mb-6 px-3">
        <p className="font-body text-[11px] font-bold uppercase tracking-widest text-brand-accent/70">
          Navigation
        </p>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-4 py-3 font-body text-xs font-semibold tracking-wide transition-all duration-300 ${
                isActive
                  ? "translate-x-1 bg-brand-primary text-white shadow-md shadow-purple-950/50"
                  : "text-slate-300 hover:translate-x-0.5 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}