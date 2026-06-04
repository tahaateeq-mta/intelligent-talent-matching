"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CandidateProfile } from "@/types";

export default function CandidateDashboard() {
  const { userProfile } = useAuth();
  const candidate = userProfile as CandidateProfile | null;

  return (
    <div className="min-h-screen space-y-8 bg-[#0b041a] p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Candidate Dashboard
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Manage your profile, search jobs, view recommendations, and track applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Membership
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {candidate?.isMember ? "Premium" : "Free"}
          </h2>
          <p className="mt-2 text-xs text-purple-300/60">
            {candidate?.isMember
              ? "Unlimited recommendations enabled."
              : "Top 10 recommendation limit applied."}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Skills
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {candidate?.skills?.length || 0}
          </h2>
          <p className="mt-2 text-xs text-purple-300/60">
            Skills used for job matching.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Experience
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {candidate?.yearsOfExperience || 0} years
          </h2>
          <p className="mt-2 text-xs text-purple-300/60">
            Used for recommendation ranking.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Preferred Mode
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {candidate?.preferredWorkingMode || "Not set"}
          </h2>
          <p className="mt-2 text-xs text-purple-300/60">
            Work mode preference.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link
          href="/candidate/profile"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">Complete Profile</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            Add education, skills, work experience, preferred mode, and resume.
          </p>
        </Link>

        <Link
          href="/candidate/jobs"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">Search Jobs</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            Use keyword search, filters, and fuzzy search to find jobs.
          </p>
        </Link>

        <Link
          href="/candidate/recommendations"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">View Recommendations</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            See jobs matched with your profile and membership status.
          </p>
        </Link>
      </div>
    </div>
  );
}