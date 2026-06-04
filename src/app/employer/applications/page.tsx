"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ApplicationStatus, JobApplication } from "@/types";

function formatDate(value: any) {
  if (!value) return "N/A";
  if (value?.seconds) return new Date(value.seconds * 1000).toLocaleDateString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
}

export default function EmployerApplicationsPage() {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [userProfile?.uid]);

  const fetchApplications = async () => {
    if (!userProfile?.uid) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "applications"),
        where("employerId", "==", userProfile.uid)
      );

      const snapshot = await getDocs(q);
      const list: JobApplication[] = [];

      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as JobApplication);
      });

      setApplications(list);
    } catch (err) {
      console.error("Error loading employer applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    setUpdatingId(applicationId);

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        status,
        updatedAt: serverTimestamp(),
      });

      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update application status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Employer Applications
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Review candidate applications and update their status.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        {loading ? (
          <p className="text-sm text-purple-300/60">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-sm italic text-purple-300/50">
            No candidate applications received yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-purple-950/60 text-xs font-bold uppercase tracking-widest text-brand-accent">
                  <th className="pb-4 pl-2">Candidate</th>
                  <th className="pb-4">Job</th>
                  <th className="pb-4">Applied Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-purple-950/30 text-purple-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-950/20">
                    <td className="py-4 pl-2">
                      <p className="font-bold text-white">{app.candidateName}</p>
                      <p className="text-xs text-purple-300/60">
                        {app.candidateEmail || "No email recorded"}
                      </p>
                    </td>

                    <td className="py-4 font-semibold text-purple-300">
                      {app.jobTitle}
                    </td>

                    <td className="py-4 text-purple-400/80">
                      {formatDate(app.appliedAt)}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full border border-purple-900/40 bg-purple-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-accent">
                        {app.status}
                      </span>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <select
                        disabled={updatingId === app.id}
                        value={app.status}
                        onChange={(e) =>
                          app.id &&
                          updateStatus(app.id, e.target.value as ApplicationStatus)
                        }
                        className="rounded-xl border border-purple-950 bg-[#0b041a] px-3 py-2 text-xs font-semibold text-white focus:outline-none disabled:opacity-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
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