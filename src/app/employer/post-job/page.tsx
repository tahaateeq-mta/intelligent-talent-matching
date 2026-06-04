"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { EmployerProfile, WorkMode } from "@/types";

export default function PostJobPage() {
  const { userProfile } = useAuth();
  const employer = userProfile as EmployerProfile | null;
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [skillsString, setSkillsString] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [workMode, setWorkMode] = useState<WorkMode>("Hybrid");
  const [jobLocation, setJobLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employer?.uid) {
      alert("Employer profile is not loaded.");
      return;
    }

    const parsedSkills = skillsString
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    if (parsedSkills.length === 0) {
      alert("Please enter at least one required skill.");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "jobs"), {
        employerId: employer.uid,
        companyName: employer.companyName || employer.displayName || "Company",
        jobTitle,
        jobDescription,
        requiredEducation,
        requiredSkills: parsedSkills,
        yearsOfExperience: Number(yearsOfExperience),
        workMode,
        jobLocation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Job posted successfully.");
      router.push("/employer/jobs");
    } catch (err) {
      console.error(err);
      alert("Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="space-y-6 rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Post New Job
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purple-300/70">
            Create a structured job posting for candidate matching.
          </p>
        </div>

        <form onSubmit={handlePostJob} className="space-y-5 text-slate-100">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Job Title
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-3.5 py-2 text-xs text-white placeholder:text-purple-300/30 focus:outline-none"
              placeholder="e.g. Software Engineer"
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
              placeholder="Describe responsibilities, requirements, and role expectations."
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
                placeholder="e.g. Bachelor Degree"
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
                placeholder="e.g. Sydney, NSW"
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
              placeholder="react, typescript, firebase"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
            />
            <p className="mt-1 text-[10px] text-purple-300/50">
              Separate skills using commas.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-primary py-3 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 disabled:opacity-50"
          >
            {submitting ? "Publishing Job..." : "Publish Job"}
          </button>
        </form>
      </div>
    </div>
  );
}