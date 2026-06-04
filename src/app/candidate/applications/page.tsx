"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { JobApplication } from "@/types";

function formatDate(value: any) {
  if (!value) return "N/A";

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

export default function CandidateApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [user?.uid]);

  const fetchApplications = async () => {
    if (!user?.uid) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "applications"),
        where("candidateId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const appList: JobApplication[] = [];

      querySnapshot.forEach((docSnap) => {
        appList.push({ id: docSnap.id, ...docSnap.data() } as JobApplication);
      });

      setApplications(appList);
    } catch (err) {
      console.error("Error fetching candidate applications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          My Applications
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Track your submitted job applications and employer responses.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        {loading ? (
          <p className="text-sm text-purple-300/60">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-sm italic text-purple-300/50">
            No applications submitted yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-purple-950/60 text-xs font-bold uppercase tracking-widest text-brand-accent">
                  <th className="pb-4 pl-2">Job Title</th>
                  <th className="pb-4">Company</th>
                  <th className="pb-4">Applied Date</th>
                  <th className="pb-4 pr-2 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-950/30 text-purple-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-950/20">
                    <td className="py-4 pl-2 font-bold text-white">
                      {app.jobTitle}
                    </td>
                    <td className="py-4 font-semibold text-purple-300">
                      {app.companyName}
                    </td>
                    <td className="py-4 text-purple-400/80">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          app.status === "Shortlisted"
                            ? "border-green-900/50 bg-green-950/50 text-green-400"
                            : app.status === "Rejected"
                            ? "border-red-900/50 bg-red-950/50 text-red-400"
                            : app.status === "Reviewed"
                            ? "border-amber-900/50 bg-amber-950/50 text-amber-400"
                            : "border-purple-900/40 bg-purple-950 text-brand-accent"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}