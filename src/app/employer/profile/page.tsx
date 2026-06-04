"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { EmployerProfile } from "@/types";

export default function EmployerProfilePage() {
  const { userProfile, refreshProfile } = useAuth();
  const employer = userProfile as EmployerProfile | null;

  const [companyName, setCompanyName] = useState("");
  const [companyDetails, setCompanyDetails] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (employer) {
      setCompanyName(employer.companyName || "");
      setCompanyDetails(employer.companyDetails || "");
      setLocation(employer.location || "");
    }
  }, [employer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employer?.uid) return;

    setSaving(true);
    setMessage("");

    try {
      await updateDoc(doc(db, "users", employer.uid), {
        companyName,
        companyDetails,
        location,
        displayName: companyName || employer.displayName,
        updatedAt: serverTimestamp(),
      });

      await refreshProfile();
      setMessage("Company profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update company profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8 text-slate-100">
      <div className="space-y-6 rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Company Profile
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purple-300/70">
            Manage company information used for job postings and matching.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-900/30 p-4 text-sm font-semibold text-brand-accent">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Company Name
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-4 py-3 text-sm text-white placeholder:text-purple-300/30 focus:outline-none"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Company Details
            </label>
            <textarea
              rows={5}
              required
              className="w-full resize-none rounded-xl border border-purple-950 bg-[#0b041a] px-4 py-3 text-sm text-white placeholder:text-purple-300/30 focus:outline-none"
              value={companyDetails}
              onChange={(e) => setCompanyDetails(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Company Location
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-purple-950 bg-[#0b041a] px-4 py-3 text-sm text-white placeholder:text-purple-300/30 focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-brand-primary py-3 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}