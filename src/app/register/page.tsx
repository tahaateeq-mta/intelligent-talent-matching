"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Base user model initialization 
      const baseUserPayload = {
        uid,
        email,
        displayName,
        role,
        isMember: false, // Defaulting system to standard tier restriction bounds
        createdAt: serverTimestamp(),
      };

      // Set empty structure profiles to prevent database parsing errors later
      let structuredPayload = {};
      if (role === "candidate") {
        structuredPayload = {
          ...baseUserPayload,
          contactInfo: { phone: "", city: "" },
          education: { level: "", fieldOfStudy: "" },
          yearsOfExperience: 0,
          workExperience: [],
          skills: [],
          preferredWorkingMode: "Hybrid",
          preferredLocation: "",
        };
      } else {
        structuredPayload = {
          ...baseUserPayload,
          companyName: displayName,
          companyDetails: "",
          location: "",
        };
      }

      await setDoc(doc(db, "users", uid), structuredPayload);
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected registration error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#0b041a] transitions-theme">
      <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-8 max-w-md w-full transition-all duration-300 ease-out">
        <h1 className="text-3xl font-bold font-heading tracking-tight text-white mb-1">Create Workspace</h1>
        <p className="text-xs font-semibold font-body tracking-wide text-purple-300/60 uppercase tracking-wider mb-6">Initialize your structural system access node</p>

        {error && (
          <div className="bg-red-950/40 text-red-400 text-xs font-medium p-3.5 rounded-xl mb-5 border border-red-900/40 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 font-body">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Full Name / Corporate Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              className="w-full px-4 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl text-sm focus:outline-none transition-all placeholder:text-purple-300/20 text-white"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl text-sm focus:outline-none transition-all placeholder:text-purple-300/20 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Security Password</label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl text-sm focus:outline-none transition-all placeholder:text-purple-300/20 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">System Operational Role</label>
            <select
              className="w-full px-4 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl text-sm focus:outline-none transition-all text-white font-medium cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="candidate" className="bg-[#130b24]">Candidate Workspace</option>
              <option value="employer" className="bg-[#130b24]">Employer / Company Workspace</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-premium w-full bg-brand-primary hover:bg-violet-600 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {submitting ? "Provisioning Profile..." : "Complete Workspace Setup"}
            </button>
          </div>
        </form>

        <p className="text-xs font-medium font-body text-center text-slate-400 mt-6 tracking-wide">
          Already verified?{" "}
          <Link href="/login" className="text-brand-accent font-bold hover:text-[#c084fc] transition-colors duration-200 ml-1">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}