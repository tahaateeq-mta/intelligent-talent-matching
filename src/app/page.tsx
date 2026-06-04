"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
        Intelligent Talent Matching Platform
      </h1>
      <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
        An advanced, algorithmically driven multi-actor workspace implementing vector profile matches, fuzzy typo constraints, and role authentication security.
      </p>

      {userProfile ? (
        <div className="bg-white border rounded-xl p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Authenticated Session Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            Logged in as <span className="font-medium text-slate-800">{userProfile.displayName}</span> ({userProfile.role})
          </p>
          <Link
            href={`/${userProfile.role}/dashboard`}
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition"
          >
            Enter Role Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-lg transition"
          >
            Access Account Workspace
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-slate-50 text-slate-700 font-medium px-8 py-3 border rounded-lg transition"
          >
            Register Profile
          </Link>
        </div>
      )}
    </div>
  );
}