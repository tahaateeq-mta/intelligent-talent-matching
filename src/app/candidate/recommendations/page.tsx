"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { JobPosting, CandidateProfile } from "@/types";

export default function CandidateRecommendationsPage() {
  const { userProfile } = useAuth();
  const candidate = userProfile as CandidateProfile;

  const [recommendedJobs, setRecommendedJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (candidate && candidate.role === "candidate") {
      fetchAndRankJobs();
    }
  }, [userProfile]);

  const fetchAndRankJobs = async () => {
    try {
      // 1. Download all platform jobs
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const allJobs: JobPosting[] = [];
      querySnapshot.forEach((doc) => {
        allJobs.push({ id: doc.id, ...doc.data() } as JobPosting);
      });

      // 2. Map and score jobs using vector alignment metrics
      const scoredJobs = allJobs.map((job) => {
        let score = 0;

        // Vector A: Aligning Skills Matrix (10 points per exact array token match)
        const candidateSkills = candidate.skills || [];
        const matchedSkills = job.requiredSkills.filter(skill => 
          candidateSkills.includes(skill.toLowerCase())
        );
        score += matchedSkills.length * 10;

        // Vector B: Working Mode Arrangement Preference (15 points)
        if (job.workMode === candidate.preferredWorkingMode) {
          score += 15;
        }

        // Vector C: Geographic Location Match (20 points)
        if (job.jobLocation?.toLowerCase().trim() === candidate.preferredLocation?.toLowerCase().trim()) {
          score += 20;
        }

        // Vector D: Experience Capability Verification (5 points baseline validation)
        if (candidate.yearsOfExperience >= job.yearsOfExperience) {
          score += 5;
        }

        return { job, score };
      });

      // 3. Sort descending based on calculated weighting criteria
      let rankedResult = scoredJobs
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.job);

      // 4. Enforce Tier Access Restrictions (Post-Week 8 requirements)
      if (!candidate.isMember) {
        rankedResult = rankedResult.slice(0, 10); // Capping non-members to Top 10 elements max
      }

      setRecommendedJobs(rankedResult);
    } catch (err) {
      console.error("Error processing recommendation engines logic:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobPosting) => {
    if (!candidate || !job.id) return;

    try {
      await addDoc(collection(db, "applications"), {
        jobId: job.id,
        candidateId: candidate.uid,
        candidateName: candidate.displayName || "Anonymous Candidate",
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        status: "Pending",
        appliedAt: serverTimestamp()
      });
      alert(`Application for ${job.jobTitle} successfully logged into the processing stream!`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit matching recommendation pipeline application.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-sm font-semibold tracking-wide font-body text-slate-400 min-h-[50vh] flex items-center justify-center animate-pulse">
        Running vector alignment profile matching engines...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 transitions-theme">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm font-body">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-900">Intelligent Matching Matrix</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Algorithmic recommendations generated natively from capability profiles.</p>
        </div>
        
        {/* Visual Badge confirming tier restriction handling */}
        <div className="text-left md:text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            candidate?.isMember ? "bg-green-50 text-green-700 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-100"
          }`}>
            {candidate?.isMember ? "Premium Tier: Unlimited Stream" : "Standard Tier: Capped at Top 10"}
          </span>
          <p className="text-[10px] font-medium text-slate-400 mt-1">Managed globally via platform sovereign controls.</p>
        </div>
      </div>

      <div className="space-y-4 font-body">
        <h2 className="text-base font-bold font-heading text-slate-800 tracking-wide">Your Recommended Opportunities ({recommendedJobs.length})</h2>
        {recommendedJobs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-xs font-medium italic">
            No synchronized job matches located. Expand your skills or adjust metrics inside your profile workspace.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendedJobs.map((job, index) => (
              <div key={job.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-l-4 border-l-brand-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out animate-fade-in">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-violet-50 text-brand-primary px-2 py-0.5 rounded-lg uppercase border border-violet-100/40">
                      Rank #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold font-heading text-slate-900 tracking-tight">{job.jobTitle}</h3>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{job.companyName} • <span className="text-slate-400 font-medium">{job.jobLocation} ({job.workMode})</span></p>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(job)}
                  className="btn-premium w-full md:w-auto bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shrink-0 whitespace-nowrap"
                >
                  Apply Instantly
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}