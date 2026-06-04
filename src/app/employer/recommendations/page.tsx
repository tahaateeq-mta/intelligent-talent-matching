"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CandidateProfile, EmployerProfile, JobPosting } from "@/types";

type CandidateMatch = {
  candidate: CandidateProfile;
  score: number;
  reasons: string[];
};

function normalise(value?: string) {
  return (value || "").toLowerCase().trim();
}

function calculateCandidateScore(
  candidate: CandidateProfile,
  job: JobPosting
): CandidateMatch {
  let score = 0;
  const reasons: string[] = [];

  const jobSkills = (job.requiredSkills || []).map(normalise);
  const candidateSkills = (candidate.skills || []).map(normalise);

  const matchingSkills = candidateSkills.filter((skill) =>
    jobSkills.includes(skill)
  );

  if (matchingSkills.length > 0) {
    score += matchingSkills.length * 10;
    reasons.push(`${matchingSkills.length} skill match(es)`);
  }

  if (candidate.preferredWorkingMode === job.workMode) {
    score += 15;
    reasons.push("Work mode matches");
  }

  if (normalise(candidate.preferredLocation) === normalise(job.jobLocation)) {
    score += 20;
    reasons.push("Location matches");
  }

  if (candidate.yearsOfExperience >= job.yearsOfExperience) {
    score += 10;
    reasons.push("Experience requirement met");
  }

  if (
    candidate.education?.level &&
    normalise(candidate.education.level).includes(normalise(job.requiredEducation))
  ) {
    score += 10;
    reasons.push("Education requirement matches");
  }

  if (reasons.length === 0) {
    reasons.push("Low profile similarity");
  }

  return { candidate, score, reasons };
}

export default function EmployerRecommendationsPage() {
  const { userProfile } = useAuth();
  const employer = userProfile as EmployerProfile | null;

  const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployerJobs();
  }, [employer?.uid]);

  useEffect(() => {
    if (selectedJobId) {
      calculateMatchesForJob(selectedJobId);
    } else {
      setMatches([]);
    }
  }, [selectedJobId, myJobs, employer?.isMember]);

  const fetchEmployerJobs = async () => {
    if (!employer?.uid) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "jobs"),
        where("employerId", "==", employer.uid)
      );

      const snap = await getDocs(q);
      const jobList: JobPosting[] = [];

      snap.forEach((docSnap) => {
        jobList.push({ id: docSnap.id, ...docSnap.data() } as JobPosting);
      });

      setMyJobs(jobList);

      if (jobList.length > 0) {
        setSelectedJobId(jobList[0].id || "");
      }
    } catch (err) {
      console.error("Error loading employer jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchesForJob = async (jobId: string) => {
    const targetJob = myJobs.find((job) => job.id === jobId);
    if (!targetJob) return;

    try {
      const q = query(collection(db, "users"), where("role", "==", "candidate"));
      const snap = await getDocs(q);
      const candidates: CandidateProfile[] = [];

      snap.forEach((docSnap) => {
        candidates.push({ uid: docSnap.id, ...docSnap.data() } as CandidateProfile);
      });

      let rankedMatches = candidates
        .map((candidate) => calculateCandidateScore(candidate, targetJob))
        .sort((a, b) => b.score - a.score);

      if (!employer?.isMember) {
        rankedMatches = rankedMatches.slice(0, 10);
      }

      setMatches(rankedMatches);
    } catch (err) {
      console.error("Error calculating candidate recommendations:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm font-semibold text-slate-400">
        Loading recommendation engine...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8 text-slate-100">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-purple-900/30 bg-[#130b24] p-6 shadow-2xl md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Candidate Recommendations
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purple-300/70">
            View ranked candidate matches for your selected job posting.
          </p>
        </div>

        <span
          className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            employer?.isMember
              ? "border-green-900/50 bg-green-950/40 text-green-300"
              : "border-amber-900/50 bg-amber-950/40 text-amber-300"
          }`}
        >
          {employer?.isMember
            ? "Premium: Unlimited Candidates"
            : "Free: Top 10 Candidates"}
        </span>
      </div>

      {myJobs.length === 0 ? (
        <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 text-center text-xs font-medium italic text-purple-300/50">
          You must publish a job before viewing candidate recommendations.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="max-w-xs">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Select Job
            </label>

            <select
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs font-bold text-white focus:outline-none"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {myJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold tracking-wide text-white">
              Ranked Candidates ({matches.length})
            </h2>

            {matches.map((match, index) => (
              <div
                key={match.candidate.uid}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-purple-900/30 border-l-4 border-l-brand-primary bg-[#130b24] p-5 shadow-2xl transition hover:-translate-y-0.5 hover:border-brand-accent/50 md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-violet-900/40 bg-violet-950/30 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-accent">
                      Rank #{index + 1}
                    </span>

                    <span className="rounded-lg border border-purple-900/40 bg-[#0b041a] px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      Score: {match.score}
                    </span>

                    <h3 className="text-base font-bold tracking-tight text-white">
                      {match.candidate.displayName}
                    </h3>
                  </div>

                  <p className="text-xs font-semibold text-purple-300/70">
                    {match.candidate.education?.level} •{" "}
                    <span className="font-bold text-brand-accent">
                      {match.candidate.education?.fieldOfStudy}
                    </span>{" "}
                    • {match.candidate.yearsOfExperience} yrs experience
                  </p>

                  <p className="text-xs text-purple-300/60">
                    Match reason: {match.reasons.join(", ")}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {match.candidate.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-purple-900/40 bg-[#0b041a] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-purple-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {match.candidate.resumeUrl && (
                  <a
                    href={match.candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full shrink-0 rounded-xl bg-brand-primary px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 md:w-auto"
                  >
                    View Resume ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}