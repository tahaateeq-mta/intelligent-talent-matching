"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { JobApplication } from "@/types";

function formatDate(value: any) {
  if (!value) return "N/A";
  if (value?.seconds) return new Date(value.seconds * 1000).toLocaleDateString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "applications"));
        const list: JobApplication[] = [];

        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as JobApplication);
        });

        setApplications(list);
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Admin Applications
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          View all job applications submitted across the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        {loading ? (
          <p className="text-sm text-purple-300/60">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-sm italic text-purple-300/50">
            No applications found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-purple-950/60 text-xs font-bold uppercase tracking-widest text-brand-accent">
                  <th className="pb-4 pl-2">Candidate</th>
                  <th className="pb-4">Job</th>
                  <th className="pb-4">Company</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4 pr-2 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-950/30 text-purple-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-950/20">
                    <td className="py-4 pl-2">
                      <p className="font-bold text-white">{app.candidateName}</p>
                      <p className="text-xs text-purple-300/60">
                        {app.candidateEmail || "No email"}
                      </p>
                    </td>
                    <td className="py-4 text-purple-300">{app.jobTitle}</td>
                    <td className="py-4 text-purple-300">{app.companyName}</td>
                    <td className="py-4 text-purple-400/80">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <span className="rounded-full border border-purple-900/40 bg-purple-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-accent">
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