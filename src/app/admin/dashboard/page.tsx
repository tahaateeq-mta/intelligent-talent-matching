"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { seedFirestoreMockData } from "@/utils/seedFirestore";

interface UserRegistryNode {
  uid: string;
  displayName?: string;
  email?: string;
  role?: 'admin' | 'candidate' | 'employer';
  isMember?: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, apps: 0 });
  const [userList, setUserList] = useState<UserRegistryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const computeMetrics = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const jobsSnap = await getDocs(collection(db, "jobs"));
      const appsSnap = await getDocs(collection(db, "applications"));

      // Process and set the granular user list for the ledger array matrix
      const processedUsers: UserRegistryNode[] = [];
      usersSnap.forEach((doc) => {
        processedUsers.push({ uid: doc.id, ...doc.data() } as UserRegistryNode);
      });
      setUserList(processedUsers);

      setStats({
        users: usersSnap.size,
        jobs: jobsSnap.size,
        apps: appsSnap.size
      });
    } catch (err) {
      console.error("Administrative metrics gathering failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    computeMetrics();
  }, []);

  const toggleMembershipTier = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isMember: !currentStatus
      });
      alert("User access restriction tier modified successfully.");
      computeMetrics(); // Re-fetch combined values to sync both states
    } catch (err) {
      console.error(err);
      alert("Failed to modify target firestore access parameters.");
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedFirestoreMockData();
      alert("Database mockup registries injected successfully! Reloading metrics...");
      await computeMetrics();
    } catch (err) {
      console.error(err);
      alert("Seeder pipeline blocked. Check browser console logs.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-base font-semibold tracking-wide font-body text-purple-300 min-h-[50vh] flex items-center justify-center animate-pulse bg-[#0b041a]">
        Connecting to system telemetry streams...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 transitions-theme text-slate-100 bg-[#0b041a] min-h-screen">
      
      {/* 1. TOP MAIN HEADER FRAME */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-purple-950/40 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-white">Platform Operations Dashboard</h1>
          <p className="text-sm font-semibold font-body tracking-wide text-purple-300/70 uppercase tracking-wider mt-1">Real-time macro analytics overview monitoring ecosystem volume thresholds.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-center">
          {/* SYSTEM MOCK DATA INJECTOR */}
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="btn-premium bg-brand-primary hover:bg-violet-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-purple-950/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {seeding ? "Injecting Registries..." : "Inject System Mock Data"}
          </button>
        </div>
      </div>

      {/* 2. THREE-COLUMN METRICS MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 hover:shadow-purple-950/20 hover:-translate-y-0.5 transition-all duration-300 ease-out border-t-4 border-t-brand-primary">
          <h3 className="text-xs font-bold font-body text-brand-accent uppercase tracking-widest mb-2">Registered Users</h3>
          <p className="text-4xl font-extrabold font-body tracking-tight text-white">{stats.users}</p>
        </div>
        
        <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 hover:shadow-purple-950/20 hover:-translate-y-0.5 transition-all duration-300 ease-out border-t-4 border-t-violet-400">
          <h3 className="text-xs font-bold font-body text-brand-accent uppercase tracking-widest mb-2">Active Job Ads</h3>
          <p className="text-4xl font-extrabold font-body tracking-tight text-white">{stats.jobs}</p>
        </div>
        
        <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl p-6 hover:shadow-purple-950/20 hover:-translate-y-0.5 transition-all duration-300 ease-out border-t-4 border-t-purple-500">
          <h3 className="text-xs font-bold font-body text-brand-accent uppercase tracking-widest mb-2">Applications Processed</h3>
          <p className="text-4xl font-extrabold font-body tracking-tight text-white">{stats.apps}</p>
        </div>
      </div>

      {/* 3. DYNAMIC ECOSYSTEM USER MANAGEMENT LEDGER SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Ecosystem User Management Ledger</h2>
          <p className="text-xs font-semibold font-body tracking-wide text-purple-300/50 uppercase tracking-wider mt-0.5">
            Audit system accounts and alter dynamic membership permissions constraints instantly.
          </p>
        </div>

        <div className="bg-[#130b24] border border-purple-900/30 shadow-2xl rounded-2xl overflow-hidden font-body">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1c1236]/40 text-purple-300/70 uppercase tracking-widest text-[10px] font-bold border-b border-purple-950/60">
                  <th className="py-4 pl-6">Account Identifier Name</th>
                  <th className="py-4">Email Coordinates</th>
                  <th className="py-4">System Structural Role</th>
                  <th className="py-4 pr-6 text-left">Access Tier Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/20 font-medium text-purple-200">
                {userList.map((user) => (
                  <tr key={user.uid} className="hover:bg-purple-950/10 transition-colors">
                    
                    {/* FIXED USER NAME */}
                    <td style={{ color: '#ffffff !important' }} className="py-4.5 pl-6 font-bold text-sm text-white">
                      {user.displayName || "Anonymous Workspace Member"}
                    </td>

                    <td className="py-4.5 text-purple-300/80 font-medium">
                      {user.email}
                    </td>

                    {/* FIXED ROLE BADGES */}
                    <td className="py-4.5">
                      <span 
                        style={{ 
                          backgroundColor: user.role === 'admin' ? '#3b0764' : user.role === 'employer' ? '#1e1b4b' : '#020617', 
                          color: (user.role === 'admin' ? '#d8b4fe' : user.role === 'employer' ? '#a5b4fc' : '#cbd5e1') + ' !important', 
                          borderColor: user.role === 'admin' ? '#581c87' : user.role === 'employer' ? '#312e81' : '#1e293b' 
                        }}
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                      >
                        {user.role || "candidate"}
                      </span>
                    </td>

                    {/* FIXED ACCESS CHIPS */}
                    <td className="py-4.5 pr-6 text-left">
                      {user.role !== 'admin' ? (
                        <button 
                          onClick={() => toggleMembershipTier(user.uid, !!user.isMember)}
                          style={{ 
                            backgroundColor: user.isMember ? '#022c22' : '#1e1035', 
                            color: (user.isMember ? '#34d399' : '#c084fc') + ' !important', 
                            borderColor: user.isMember ? '#064e3b' : '#4c1d95' 
                          }}
                          className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all transform active:scale-95 cursor-pointer"
                        >
                          {user.isMember ? "★ Premium Member (Unlimited)" : "Standard Tier (Capped 10)"}
                        </button>
                      ) : (
                        <span 
                          style={{ backgroundColor: '#111827', color: '#9ca3af !important', borderColor: '#374151' }}
                          className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                        >
                          System Sovereign Access
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}