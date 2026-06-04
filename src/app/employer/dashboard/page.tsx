"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function EmployerDashboard() {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState({
    jobsCount: 0,
    applicantsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerMetrics = async () => {
      if (!userProfile?.uid) return;

      setLoading(true);

      try {
        const jobsQ = query(
          collection(db, "jobs"),
          where("employerId", "==", userProfile.uid)
        );
        const jobsSnapshot = await getDocs(jobsQ);

        const appsQ = query(
          collection(db, "applications"),
          where("employerId", "==", userProfile.uid)
        );
        const appsSnapshot = await getDocs(appsQ);

        setMetrics({
          jobsCount: jobsSnapshot.size,
          applicantsCount: appsSnapshot.size,
        });
      } catch (err) {
        console.error("Failed to fetch employer metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerMetrics();
  }, [userProfile?.uid]);

  const tierName = userProfile?.isMember ? "Premium Tier" : "Standard Tier";

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-8 bg-[#0b041a] p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          {userProfile?.displayName || "Employer"} Dashboard
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Manage job postings, review candidates, and monitor applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
            Active Job Listings
          </h3>
          <p className="text-4xl font-extrabold text-white">
            {loading ? "..." : metrics.jobsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
            Total Applications
          </h3>
          <p className="text-4xl font-extrabold text-white">
            {loading ? "..." : metrics.applicantsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
            Membership Access
          </h3>
          <span
            className={`inline-block rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
              userProfile?.isMember
                ? "border-amber-900/60 bg-amber-950/40 text-amber-300"
                : "border-purple-900/60 bg-purple-950/50 text-brand-accent"
            }`}
          >
            {tierName}
          </span>
          <p className="mt-3 text-xs text-purple-300/60">
            {userProfile?.isMember
              ? "Unlimited candidate recommendations enabled."
              : "Top 10 recommendation limit applied."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link
          href="/employer/profile"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">Company Profile</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            Update company information used in job postings and search.
          </p>
        </Link>

        <Link
          href="/employer/post-job"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">Post New Job</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            Create a new vacancy with skills, education, experience, and location.
          </p>
        </Link>

        <Link
          href="/employer/applications"
          className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-brand-accent/50"
        >
          <h3 className="text-xl font-bold text-white">Review Applications</h3>
          <p className="mt-2 text-sm text-purple-300/60">
            View candidate applications and update application status.
          </p>
        </Link>
      </div>
    </div>
  );
}