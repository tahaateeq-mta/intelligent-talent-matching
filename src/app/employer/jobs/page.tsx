"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { JobPosting } from "@/types";

export default function EmployerJobsPage() {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [userProfile?.uid]);

  const fetchJobs = async () => {
    if (!userProfile?.uid) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "jobs"),
        where("employerId", "==", userProfile.uid)
      );

      const snapshot = await getDocs(q);
      const list: JobPosting[] = [];

      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as JobPosting);
      });

      setJobs(list);
    } catch (err) {
      console.error("Error loading employer jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId?: string) => {
    if (!jobId) return;

    const confirmed = confirm("Delete this job posting?");
    if (!confirmed) return;

    await deleteDoc(doc(db, "jobs", jobId));
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8 text-slate-100">
      <div className="flex flex-col justify-between gap-4 border-b border-purple-950/40 pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            My Job Postings
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
            View and manage jobs created by your company.
          </p>
        </div>

        <Link
          href="/employer/post-job"
          className="rounded-xl bg-brand-primary px-5 py-3 text-xs font-bold text-white hover:bg-violet-600"
        >
          Post New Job
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-purple-300/60">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 text-sm italic text-purple-300/50">
          No jobs posted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{job.jobTitle}</h2>
                  <p className="mt-1 text-xs font-bold text-brand-accent">
                    {job.companyName}{" "}
                    <span className="font-medium text-purple-300/70">
                      • {job.jobLocation} ({job.workMode})
                    </span>
                  </p>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-purple-200/70">
                    {job.jobDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-purple-900/40 bg-[#0b041a] px-2 py-1 text-[10px] font-bold uppercase text-purple-300">
                      {job.requiredEducation}
                    </span>
                    <span className="rounded-lg border border-purple-900/40 bg-[#0b041a] px-2 py-1 text-[10px] font-bold uppercase text-purple-300">
                      {job.yearsOfExperience} yrs experience
                    </span>

                    {job.requiredSkills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-violet-900/40 bg-violet-950/30 px-2 py-1 font-mono text-[10px] font-bold uppercase text-brand-accent"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/employer/jobs/${job.id}/edit`}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="rounded-xl border border-red-900/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}