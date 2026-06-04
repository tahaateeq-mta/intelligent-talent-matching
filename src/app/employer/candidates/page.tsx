"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CandidateProfile } from "@/types";
import { searchCandidatesEngine } from "@/utils/searchEngine";

export default function SourcingEnginePage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Evaluation Filter Fields
  const [keyword, setKeyword] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [minExperience, setMinExperience] = useState<number | "">("");

  const fetchCandidatesPool = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "candidate"));
      const querySnap = await getDocs(q);
      const pool: CandidateProfile[] = [];
      
      querySnap.forEach((doc) => {
        const data = { uid: doc.id, ...doc.data() } as unknown as CandidateProfile;
        pool.push(data);
      });
      
      setCandidates(pool);
      setFilteredCandidates(pool);
    } catch (err) {
      console.error("Error sourcing candidate profiles from Firestore index:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesPool();
  }, []);

  useEffect(() => {
    const results = searchCandidatesEngine(candidates, keyword, {
      workMode,
      location,
      education,
      experience: minExperience === "" ? undefined : Number(minExperience)
    });
    setFilteredCandidates(results);
  }, [keyword, workMode, location, education, minExperience, candidates]);

  if (loading) {
    return (
      <div className="p-8 text-base font-semibold tracking-wide font-body text-purple-300 min-h-[50vh] flex items-center justify-center animate-pulse bg-[#0b041a]">
        Connecting to candidate capability clusters...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 transitions-theme text-slate-100 bg-[#0b041a] min-h-screen">
      <div className="border-b border-purple-950/40 pb-4">
        <h1 className="text-3xl font-bold font-heading tracking-tight text-white">Talent Sourcing Search Node</h1>
        <p className="text-sm font-semibold font-body tracking-wider text-purple-300/70 uppercase mt-1">Query enhanced profile indicators using keyword, filter adjustments, and typo approximations.</p>
      </div>

      {/* Post-Week 8 Compound Filter Matrix Panel */}
      <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 grid grid-cols-1 md:grid-cols-5 gap-4 font-body">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Fuzzy Keyword</label>
          <input type="text" placeholder="e.g. tpescript, node" className="w-full px-4 py-2 bg-[#0b041a] border border-purple-950 rounded-xl text-xs focus:outline-none text-white placeholder:text-purple-300/20" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Arrangement</label>
          <select className="w-full px-4 py-2 bg-[#0b041a] border border-purple-950 rounded-xl text-xs focus:outline-none text-white font-medium cursor-pointer" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            <option value="" className="bg-[#130b24]">Any Mode</option>
            <option value="Remote" className="bg-[#130b24]">Remote</option>
            <option value="On-site" className="bg-[#130b24]">On-site</option>
            <option value="Hybrid" className="bg-[#130b24]">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Location Hub</label>
          <input type="text" placeholder="e.g. Wollongong" className="w-full px-4 py-2 bg-[#0b041a] border border-purple-950 rounded-xl text-xs focus:outline-none text-white placeholder:text-purple-300/20" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Education Level</label>
          <input type="text" placeholder="e.g. Bachelor" className="w-full px-4 py-2 bg-[#0b041a] border border-purple-950 rounded-xl text-xs focus:outline-none text-white placeholder:text-purple-300/20" value={education} onChange={(e) => setEducation(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-1.5">Min Experience (Yrs)</label>
          <input type="number" min="0" placeholder="e.g. 2" className="w-full px-4 py-2 bg-[#0b041a] border border-purple-950 rounded-xl text-xs focus:outline-none text-white placeholder:text-purple-300/20" value={minExperience} onChange={(e) => setMinExperience(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
      </div>

      {/* Sourced Pool Cards Container Grid */}
      <div className="space-y-4 font-body">
        <h2 className="text-xl font-bold font-heading text-white tracking-wide">Sourced Capability Profiles ({filteredCandidates.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCandidates.map((c) => (
            <div key={c.uid} className="bg-[#130b24] border border-purple-900/30 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col justify-between animate-fade-in">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white tracking-tight">{c.displayName}</h3>
                    <p className="text-xs font-bold text-brand-accent mt-0.5">{c.education?.level} <span className="text-purple-300/40 font-medium">in {c.education?.fieldOfStudy}</span></p>
                  </div>
                  
                  {/* FIXED: Applied explicit inline styles with !important keyword injections to solve text formatting bleeding */}
                  <span 
                    style={{ backgroundColor: '#2e1065', color: '#c084fc !important', borderColor: '#4c1d95' }}
                    className="text-[10px] font-black border px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-widest"
                  >
                    {c.yearsOfExperience} Yrs Exp
                  </span>
                </div>
                
                <div className="text-xs text-purple-200 space-y-1 bg-[#0b041a] border border-purple-950/40 p-3 rounded-xl font-medium">
                  <p><span className="text-purple-300/40">📍 Pref Location:</span> <strong className="text-white">{c.preferredLocation || "Not declared"}</strong></p>
                  <p><span className="text-purple-300/40">💼 Working Type:</span> <strong className="text-white">{c.preferredWorkingMode}</strong></p>
                </div>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.skills?.map((skill) => (
                    <span key={skill} className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-900/50 px-2.5 py-0.5 rounded-lg font-bold font-mono uppercase tracking-wide">{skill}</span>
                  ))}
                </div>
              </div>
              
              {c.resumeUrl && (
                <div className="pt-3 border-t border-purple-950/40 mt-1">
                  <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="block text-center bg-brand-primary hover:bg-violet-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg cursor-pointer">
                    Review Attachment Asset ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}