"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { JobPosting, WorkMode } from "@/types";

export default function EditEmployerJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [skillsString, setSkillsString] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [workMode, setWorkMode] = useState<WorkMode>("Hybrid");
  const [jobLocation, setJobLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    if (!jobId) return;

    setLoading(true);

    try {
      const docRef = doc(db, "jobs", jobId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Job not found.");
        router.push("/employer/jobs");
        return;
      }

      const job = { id: docSnap.id, ...docSnap.data() } as JobPosting;

      setJobTitle(job.jobTitle || "");
      setJobDescription(job.jobDescription || "");
      setRequiredEducation(job.requiredEducation || "");
      setSkillsString(job.requiredSkills?.join(", ") || "");
      setYearsOfExperience(job.yearsOfExperience || 0);
      setWorkMode(job.workMode || "Hybrid");
      setJobLocation(job.jobLocation || "");
    } catch (err) {
      console.error("Error fetching job:", err);
      alert("Failed to load job.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId) return;

    const parsedSkills = skillsString
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    if (parsedSkills.length === 0) {
      alert("Please enter at least one required skill.");
      return;
    }

    setSaving(true);

    try {
      await updateDoc(doc(db, "jobs", jobId), {
        jobTitle,
        jobDescription,
        requiredEducation,
        requiredSkills: parsedSkills,
        yearsOfExperience: Number(yearsOfExperience),
        workMode,
        jobLocation,
        updatedAt: serverTimestamp(),
      });

      alert("Job updated successfully.");
      router.push("/employer/jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm font-semibold text-slate-400">
        Loading job details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8 text-slate-100">
      <div className="space-y-6 rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Edit Job Posting
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purple-300/70">
            Update job details used for search and candidate recommendations.
          </p>
        </div>

        <form onSubmit={handleUpdateJob} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Job Title
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Job Description
            </label>
            <textarea
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs leading-relaxed text-white placeholder:text-purple-300/30 focus:outline-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                Required Education
              </label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
                value={requiredEducation}
                onChange={(e) => setRequiredEducation(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                Required Experience
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white focus:outline-none"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                Work Mode
              </label>
              <select
                className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white focus:outline-none"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                Job Location
              </label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Required Skills
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
            />
            <p className="mt-1 text-[10px] text-purple-300/50">
              Separate skills using commas.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 md:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-primary py-3 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/employer/jobs")}
              className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}