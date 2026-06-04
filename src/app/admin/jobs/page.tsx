"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { JobPosting } from "@/types";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "jobs"));
        const list: JobPosting[] = [];

        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as JobPosting);
        });

        setJobs(list);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Admin Jobs
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          View all job postings across the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        {loading ? (
          <p className="text-sm text-purple-300/60">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm italic text-purple-300/50">No jobs found.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-purple-900/30 bg-[#0b041a] p-5"
              >
                <h2 className="text-lg font-bold text-white">{job.jobTitle}</h2>
                <p className="mt-1 text-xs font-bold text-brand-accent">
                  {job.companyName}{" "}
                  <span className="font-medium text-purple-300/70">
                    • {job.jobLocation} ({job.workMode})
                  </span>
                </p>
                <p className="mt-3 text-sm leading-6 text-purple-200/70">
                  {job.jobDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}