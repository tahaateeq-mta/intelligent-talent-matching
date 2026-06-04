"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { BaseUser } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: BaseUser[] = [];

      snapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as BaseUser);
      });

      setUsers(list);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleMembership = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);

    try {
      await updateDoc(doc(db, "users", userId), {
        isMember: !currentStatus,
        membershipType: !currentStatus ? "PREMIUM" : "FREE",
        updatedAt: serverTimestamp(),
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.uid === userId
            ? {
                ...user,
                isMember: !currentStatus,
                membershipType: !currentStatus ? "PREMIUM" : "FREE",
              }
            : user
        )
      );
    } catch (err) {
      console.error("Error updating membership:", err);
      alert("Failed to update membership.");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-sm font-semibold text-purple-300">
        Loading users...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-6 bg-[#0b041a] p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Admin User Management
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Manage platform users, roles, and membership access.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-purple-900/30 bg-[#130b24] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-purple-950/60 bg-[#1c1236]/40 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 pr-6">Membership</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-950/20 text-purple-200">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-purple-950/10">
                  <td className="p-4 pl-6 font-bold text-white">
                    {user.displayName || "Unnamed User"}
                  </td>

                  <td className="p-4 text-purple-300/80">{user.email}</td>

                  <td className="p-4">
                    <span className="rounded-full border border-purple-900/40 bg-purple-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4 pr-6">
                    {user.role !== "admin" ? (
                      <button
                        disabled={updatingId === user.uid}
                        onClick={() => toggleMembership(user.uid, !!user.isMember)}
                        className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50 ${
                          user.isMember
                            ? "border-green-900/50 bg-green-950/40 text-green-300"
                            : "border-purple-900/50 bg-purple-950/40 text-brand-accent"
                        }`}
                      >
                        {user.isMember ? "Premium Member" : "Free User"}
                      </button>
                    ) : (
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Admin Access
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
  );
}