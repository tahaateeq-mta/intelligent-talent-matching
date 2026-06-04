"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/config/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CandidateProfile, JobApplication } from "@/types";

export default function CandidateDashboard() {
  const { userProfile, refreshProfile } = useAuth();
  const candidate = userProfile as CandidateProfile;

  // Structural Core Fields
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [eduLevel, setEduLevel] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [yearsExp, setYearsExp] = useState(0);

  // Week 8 Requirements Fields
  const [skillsString, setSkillsString] = useState("");
  const [prefMode, setPrefMode] = useState<"Remote" | "On-site" | "Hybrid">("Hybrid");
  const [prefLocation, setPrefLocation] = useState("");

  // Work Experience Sub-Array States
  const [workHistory, setWorkHistory] = useState<Array<{ company: string; role: string; duration: string }>>([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDuration, setNewDuration] = useState("");

  // Application Tracking state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (candidate) {
      setPhone(candidate.contactInfo?.phone || "");
      setCity(candidate.contactInfo?.city || "");
      setEduLevel(candidate.education?.level || "");
      setFieldOfStudy(candidate.education?.fieldOfStudy || "");
      setYearsExp(candidate.yearsOfExperience || 0);
      setSkillsString(candidate.skills?.join(", ") || "");
      setPrefMode(candidate.preferredWorkingMode || "Hybrid");
      setPrefLocation(candidate.preferredLocation || "");
      setWorkHistory(candidate.workExperience || []);
      fetchApplications();
    }
  }, [userProfile]);

  const fetchApplications = async () => {
    if (!candidate?.uid) return;
    try {
      const q = query(collection(db, "applications"), where("candidateId", "==", candidate.uid));
      const querySnapshot = await getDocs(q);
      const appList: JobApplication[] = [];
      querySnapshot.forEach((doc) => {
        appList.push({ id: doc.id, ...doc.data() } as JobApplication);
      });
      setApplications(appList);
    } catch (err) {
      console.error("Error fetching applications ledger:", err);
    }
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole || !newDuration) return;
    const updatedHistory = [...workHistory, { company: newCompany, role: newRole, duration: newDuration }];
    setWorkHistory(updatedHistory);
    setNewCompany("");
    setNewRole("");
    setNewDuration("");
  };

  const handleRemoveExperience = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !candidate?.uid) return;

    if (file.type !== "application/pdf" && file.type !== "application/msword" && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      alert("Invalid format type. Please upload a PDF or DOCX file.");
      return;
    }

    setUploading(true);
    try {
      const fileRef = ref(storage, `resumes/${candidate.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      await updateDoc(doc(db, "users", candidate.uid), {
        resumeUrl: downloadUrl
      });
      await refreshProfile();
      alert("Resume successfully uploaded.");
    } catch (err) {
      console.error(err);
      alert("Failed to upload resume asset.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    const parsedSkills = skillsString
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter((skill) => skill !== "");

    try {
      const docRef = doc(db, "users", candidate.uid);
      await updateDoc(docRef, {
        contactInfo: { phone, city },
        education: { level: eduLevel, fieldOfStudy },
        yearsOfExperience: Number(yearsExp),
        skills: parsedSkills,
        preferredWorkingMode: prefMode,
        preferredLocation: prefLocation,
        workExperience: workHistory
      });

      await refreshProfile();
      setMessage("Profile parameters successfully updated.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to sync profile changes.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen text-slate-100 bg-[#0b041a]">
      {/* Dynamic Header Node */}
      <div className="border-b border-purple-950/40 pb-4">
        <h1 className="text-4xl font-bold font-heading tracking-tight text-white">Candidate Profile Workspace</h1>
        <p className="text-sm font-semibold font-body tracking-wider text-purple-300/70 uppercase mt-2">Manage vector inputs and track employment application pipelines.</p>
      </div>

      {message && (
        <div className="bg-purple-900/30 text-brand-accent text-sm font-semibold p-4 rounded-xl border border-purple-500/30 shadow-inner animate-fade-in font-body">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#0b041a]">
        {/* Core Vector Form Mapping Sheet */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-2 space-y-8 bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-8 transition-all duration-300">
          <div>
            <h2 className="text-2xl font-bold font-heading text-white mb-1">Biographical & Curricular Vectors</h2>
            <p className="text-xs text-purple-300/60 font-body">Core professional registry configuration parameters</p>
            <div className="h-[1px] bg-purple-950/50 w-full mt-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Phone Number</label>
              <input type="text" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Residential City</label>
              <input type="text" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Education Attainment Level</label>
              <input type="text" placeholder="e.g. Bachelor of Computer Science" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary placeholder:text-purple-300/20" value={eduLevel} onChange={(e) => setEduLevel(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Major / Field of Study</label>
              <input type="text" placeholder="e.g. Network Engineering" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary placeholder:text-purple-300/20" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Total Years of Professional Experience</label>
              <input type="number" min="0" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary" value={yearsExp} onChange={(e) => setYearsExp(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-heading text-white mb-1">Target Match Constraints</h2>
            <p className="text-xs text-purple-300/60 font-body">Algorithmic weighting metrics filtering active platform jobs</p>
            <div className="h-[1px] bg-purple-950/50 w-full mt-3" />
          </div>
          
          <div className="space-y-6 font-body">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Professional Skills (Comma Separated)</label>
              <input type="text" placeholder="react, typescript, routing, gns3, cisco" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary placeholder:text-purple-300/20" value={skillsString} onChange={(e) => setSkillsString(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Preferred Working Mode</label>
                <select className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary cursor-pointer text-white" value={prefMode} onChange={(e) => setPrefMode(e.target.value as any)}>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">Preferred Target Location</label>
                <input type="text" placeholder="e.g. Sydney, NSW" className="w-full px-4 py-3 bg-[#0b041a] border border-purple-950 text-white rounded-xl text-sm focus:outline-none focus:border-brand-primary placeholder:text-purple-300/20" value={prefLocation} onChange={(e) => setPrefLocation(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pt-4 font-body">
            <button type="submit" disabled={updating} className="btn-premium w-full bg-brand-primary hover:bg-purple-600 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
              {updating ? "Syncing Workspace Layer..." : "Commit Profile Core Parameters"}
            </button>
          </div>
        </form>

        {/* Side Panels */}
        <div className="space-y-6 font-body bg-[#0b041a]">
          <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white border-b border-purple-950/40 pb-2">Resume Document Storage</h3>
            <div className="space-y-3">
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0b041a] file:text-brand-accent file:border file:border-purple-950 hover:file:bg-purple-950" />
              {uploading && <p className="text-xs font-semibold text-brand-accent animate-pulse">Processing upload streaming structure...</p>}
              {candidate?.resumeUrl && (
                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-brand-accent hover:text-white mt-1">
                  View Currently Linked CV Asset ↗
                </a>
              )}
            </div>
          </div>

          <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold font-heading text-white border-b border-purple-950/40 pb-2">Work Experience Log</h3>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {workHistory.length === 0 ? (
                <p className="text-xs text-purple-300/40 font-medium italic py-2">No structural history elements declared.</p>
              ) : (
                workHistory.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0b041a] p-3 rounded-xl border border-purple-950">
                    <div>
                      <p className="font-bold text-white text-sm">{w.role}</p>
                      <p className="text-xs text-purple-300/50 font-medium mt-0.5">{w.company} • {w.duration}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveExperience(idx)} className="text-purple-400 hover:text-red-400 font-bold text-sm px-2">✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-purple-950/40 space-y-3">
              <input type="text" placeholder="Company Name" className="w-full text-xs px-3.5 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl focus:outline-none text-white placeholder:text-purple-300/20" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} />
              <input type="text" placeholder="Job Title Role" className="w-full text-xs px-3.5 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl focus:outline-none text-white placeholder:text-purple-300/20" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
              <input type="text" placeholder="Duration (e.g. 1 Year)" className="w-full text-xs px-3.5 py-2.5 bg-[#0b041a] border border-purple-950 rounded-xl focus:outline-none text-white placeholder:text-purple-300/20" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
              <button type="button" onClick={handleAddExperience} className="w-full bg-[#0b041a] hover:bg-brand-deep border border-purple-900/40 text-brand-accent text-xs font-bold py-2.5 rounded-xl">
                Push Experience Array Node
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Tracking Table */}
      <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-8 font-body">
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Job Application Pipeline Ledger</h2>
        <p className="text-xs text-purple-300/50 mb-6">Real-time gateway history trace monitoring application metrics status.</p>
        
        {applications.length === 0 ? (
          <p className="text-sm text-purple-300/40 font-medium italic py-4">No application transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-brand-accent uppercase tracking-widest border-b border-purple-950/60 text-xs font-bold">
                  <th className="pb-4 pl-2">Position Title</th>
                  <th className="pb-4">Company Entity</th>
                  <th className="pb-4">Submission Date</th>
                  <th className="pb-4 pr-2 text-right">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/20 text-purple-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-950/20">
                    <td className="py-4 pl-2 font-bold text-white text-base">{app.jobTitle}</td>
                    <td className="py-4 text-purple-300 font-semibold">{app.companyName}</td>
                    <td className="py-4 text-purple-400/80">
                      {app.appliedAt ? new Date((app.appliedAt as any).seconds * 1000).toLocaleDateString() : "Just Now"}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === "Shortlisted" ? "bg-green-950/50 text-green-400 border border-green-900/50" :
                        app.status === "Rejected" ? "bg-red-950/50 text-red-400 border border-red-900/50" :
                        app.status === "Reviewed" ? "bg-amber-950/50 text-amber-400 border border-amber-900/50" : "bg-purple-950 text-brand-accent border border-purple-900/40"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}