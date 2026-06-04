"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { CandidateProfile, JobApplication, JobPosting } from "@/types";
import { searchJobsEngine } from "@/utils/searchEngine";

export default function CandidateJobSearchPage() {
  const { user, userProfile } = useAuth();
  const candidate = userProfile as CandidateProfile | null;

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [maxExperience, setMaxExperience] = useState<number | "">("");

  useEffect(() => {
    fetchJobs();
    fetchExistingApplications();
  }, [user?.uid]);

  useEffect(() => {
    const results = searchJobsEngine(jobs, keyword, {
      workMode,
      location,
      experience: maxExperience === "" ? undefined : Number(maxExperience),
    });

    setFilteredJobs(results);
  }, [keyword, workMode, location, maxExperience, jobs]);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobList: JobPosting[] = [];

      querySnapshot.forEach((docSnap) => {
        jobList.push({ id: docSnap.id, ...docSnap.data() } as JobPosting);
      });

      setJobs(jobList);
      setFilteredJobs(jobList);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingApplications = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, "applications"),
        where("candidateId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const jobIds = querySnapshot.docs
        .map((docSnap) => docSnap.data() as JobApplication)
        .map((app) => app.jobId);

      setAppliedJobIds(jobIds);
    } catch (err) {
      console.error("Error fetching existing applications:", err);
    }
  };

  const handleApply = async (job: JobPosting) => {
    if (!user || !candidate || !job.id) return;

    if (appliedJobIds.includes(job.id)) {
      alert("You have already applied for this job.");
      return;
    }

    try {
      await addDoc(collection(db, "applications"), {
        jobId: job.id,
        employerId: job.employerId,
        candidateId: user.uid,
        candidateName: candidate.displayName || user.displayName || "Candidate",
        candidateEmail: candidate.email || user.email || "",
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        status: "Pending",
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAppliedJobIds((prev) => [...prev, job.id as string]);
      alert(`Application for ${job.jobTitle} submitted successfully.`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm font-semibold tracking-wide text-slate-400">
        Loading job listings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Advanced Job Search
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purple-300/70">
          Search jobs using keywords, filters, and fuzzy matching.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl md:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            Keyword Search
          </label>
          <input
            type="text"
            placeholder="e.g. software engineer"
            className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            Work Mode
          </label>
          <select
            className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white focus:outline-none"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Sydney"
            className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            Max Experience
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 5"
            className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
            value={maxExperience}
            onChange={(e) =>
              setMaxExperience(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold tracking-wide text-white">
          Available Jobs ({filteredJobs.length})
        </h2>

        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 text-center text-xs font-medium italic text-purple-300/50">
            No matching jobs found. Try changing your keyword or filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => {
              const alreadyApplied = job.id ? appliedJobIds.includes(job.id) : false;

              return (
                <div
                  key={job.id}
                  className="flex flex-col justify-between gap-5 rounded-2xl border border-purple-900/30 border-l-4 border-l-brand-primary bg-[#130b24] p-5 shadow-2xl transition hover:-translate-y-0.5 hover:border-brand-accent/50 md:flex-row md:items-center"
                >
                  <div className="flex-1 space-y-1.5">
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      {job.jobTitle}
                    </h3>

                    <p className="text-xs font-bold text-brand-accent">
                      {job.companyName}{" "}
                      <span className="font-medium text-purple-300/70">
                        • {job.jobLocation} ({job.workMode})
                      </span>
                    </p>

                    <p className="max-w-3xl text-xs font-medium leading-relaxed text-purple-200/70">
                      {job.jobDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <span className="rounded-lg border border-purple-900/40 bg-[#0b041a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        Exp Req: {job.yearsOfExperience} yrs
                      </span>

                      {job.requiredSkills?.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-violet-900/40 bg-violet-950/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-brand-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApply(job)}
                    disabled={alreadyApplied}
                    className="w-full shrink-0 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 md:w-auto"
                  >
                    {alreadyApplied ? "Already Applied" : "Submit Application"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}