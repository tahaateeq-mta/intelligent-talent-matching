"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Extract structural role target parameter to route user dynamically
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        
        // FIX: Added direct routing branch check for administrative access nodes
        if (profile.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push(`/${profile.role}/dashboard`);
        }
      } else {
        setError("User metadata registry mapping missing.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid account credentials entered.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#0b041a] transitions-theme">
      <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-8 max-w-md w-full transition-all duration-300 ease-out">
        <h1 className="text-3xl font-bold font-heading tracking-tight text-white mb-1">Welcome Back</h1>
        <p className="text-xs font-semibold font-body tracking-wide text-purple-300/60 uppercase tracking-wider mb-6">Log in to manage your matching workspace</p>

        {error && (
          <div className="bg-red-950/40 text-red-400 text-xs font-medium p-3.5 rounded-xl mb-5 border border-red-900/40 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-body">
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
            <label className="block text-[11px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Account Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl text-sm focus:outline-none transition-all placeholder:text-purple-300/20 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-premium w-full bg-brand-primary hover:bg-violet-600 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {submitting ? "Authenticating Session..." : "Secure Login"}
            </button>
          </div>
        </form>

        <p className="text-xs font-medium font-body text-center text-slate-400 mt-6 tracking-wide">
          New to the workspace?{" "}
          <Link href="/register" className="text-brand-accent font-bold hover:text-[#c084fc] transition-colors duration-200 ml-1">
            Register Profile
          </Link>
        </p>
      </div>
    </div>
  );
}