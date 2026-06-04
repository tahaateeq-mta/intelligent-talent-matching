"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { BaseUser } from "@/types";

export default function AdminMembershipsPage() {
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: BaseUser[] = [];

      snapshot.forEach((docSnap) => {
        const user = { uid: docSnap.id, ...docSnap.data() } as BaseUser;
        if (user.role !== "admin") list.push(user);
      });

      setUsers(list);
    } catch (err) {
      console.error("Error loading memberships:", err);
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

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8 text-slate-100">
      <div className="border-b border-purple-950/40 pb-5">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Admin Memberships
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-purple-300/70">
          Manage membership access for candidates and employers.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-[#130b24] p-8 shadow-2xl">
        {loading ? (
          <p className="text-sm text-purple-300/60">Loading memberships...</p>
        ) : users.length === 0 ? (
          <p className="text-sm italic text-purple-300/50">
            No candidate or employer users found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div
                key={user.uid}
                className="rounded-2xl border border-purple-900/30 bg-[#0b041a] p-5"
              >
                <h2 className="font-bold text-white">
                  {user.displayName || "Unnamed User"}
                </h2>
                <p className="mt-1 text-xs text-purple-300/70">{user.email}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-accent">
                  {user.role}
                </p>

                <button
                  disabled={updatingId === user.uid}
                  onClick={() => toggleMembership(user.uid, !!user.isMember)}
                  className={`mt-4 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 ${
                    user.isMember
                      ? "border-green-900/50 bg-green-950/40 text-green-300"
                      : "border-purple-900/50 bg-purple-950/40 text-brand-accent"
                  }`}
                >
                  {user.isMember
                    ? "Premium: Unlimited Recommendations"
                    : "Free: Top 10 Recommendations"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}