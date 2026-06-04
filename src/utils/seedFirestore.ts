import { db } from "@/config/firebase";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";

export async function seedFirestoreMockData() {
  const batch = writeBatch(db);

  // ==========================================
  // 1. SEED USERS POOL ('users' collection)
  // ==========================================
  const usersRef = collection(db, "users");

  const mockUsers = [
    {
      uid: "plxoyc23j9R9LPqrx1vbhIHuGdd3",
      email: "admin@platform.com",
      displayName: "Admin",
      role: "admin",
      isMember: true,
      createdAt: serverTimestamp()
    },
    {
      uid: "J5Cg0Mg7HxMxGqYgzZISVSrvgLp2",
      email: "talent@ciscoworkspaces.com.au",
      displayName: "Cisco Regional Sourcing",
      role: "employer",
      isMember: false,
      companyName: "Cisco Systems Australasia",
      industry: "Network Architecture & Security",
      location: "Wollongong, NSW",
      companySize: "5000+ employees",
      createdAt: serverTimestamp()
    },
    {
      uid: "SjEX53ThuXfpVqhwNPRGNKtV5Ug2",
      email: "hiring@cyberdyne.com",
      displayName: "Cyberdyne Solutions (HR)",
      role: "employer",
      isMember: true,
      companyName: "Cyberdyne Solutions",
      industry: "Software Engineering & AI",
      location: "Sydney, NSW",
      companySize: "100-500 employees",
      createdAt: serverTimestamp()
    },
    {
      uid: "WC3UwOYYfeSYflCwURMl69NGfxR2",
      email: "s.connor@cloudnet.com",
      displayName: "Sarah Connor",
      role: "candidate",
      isMember: true,
      contactInfo: { phone: "+61 491 570 156", city: "Sydney" },
      education: { level: "Master of Systems Engineering", fieldOfStudy: "Information Technology" },
      yearsOfExperience: 6,
      workExperience: [
        { company: "Cyberdyne Solutions", role: "Systems Architect", duration: "4 Years" }
      ],
      skills: ["cisco", "firewalls", "routing", "gns3", "next.js"],
      preferredWorkingMode: "On-site",
      preferredLocation: "Wollongong, NSW",
      resumeUrl: "",
      createdAt: serverTimestamp()
    },
    {
      uid: "WFmHiBTOg9Tv1nfbDoYsRbb5Sqp1",
      email: "alex.mercer@uowmail.edu.au",
      displayName: "Alex Mercer",
      role: "candidate",
      isMember: false,
      contactInfo: { phone: "+61 412 345 678", city: "Wollongong" },
      education: { level: "Bachelor of Computer Science", fieldOfStudy: "Network Engineering" },
      yearsOfExperience: 3,
      workExperience: [
        { company: "UOW Tech Support Hub", role: "Junior Network Operator", duration: "2 Years" }
      ],
      skills: ["cisco", "gns3", "routing", "react", "typescript"],
      preferredWorkingMode: "Hybrid",
      preferredLocation: "Wollongong, NSW",
      resumeUrl: "",
      createdAt: serverTimestamp()
    },
    {
      uid: "INECX6yXbOYBvVNcMvbERzTs5KG2",
      email: "abdullahmumtazkhan24@gmail.com",
      displayName: "Abdullah Khan",
      role: "employer",
      isMember: false,
      companyName: "Khan Global Infrastructure",
      industry: "Cloud Infrastructure",
      location: "Sydney, NSW",
      companySize: "11-50 employees",
      createdAt: serverTimestamp()
    },
    {
      uid: "nCg0ZOlroiVPgHOzH3WMdooVXL82",
      email: "tahaateeq82@gmail.com",
      displayName: "Muhammad Taha",
      role: "candidate",
      isMember: false,
      contactInfo: { phone: "+61 400 000 000", city: "Sydney" },
      education: { level: "Bachelor of Information Technology", fieldOfStudy: "Web Development" },
      yearsOfExperience: 2,
      workExperience: [
        { company: "Freelance Labs", role: "Frontend UI Developer", duration: "1.5 Years" }
      ],
      skills: ["next.js", "react", "tailwind", "firebase"],
      preferredWorkingMode: "Remote",
      preferredLocation: "Sydney, NSW",
      resumeUrl: "",
      createdAt: serverTimestamp()
    }
  ];

  mockUsers.forEach((user) => {
    const userDocRef = doc(usersRef, user.uid);
    batch.set(userDocRef, user);
  });

  // ==========================================
  // 2. SEED JOB POSTINGS ('jobs' collection)
  // ==========================================
  const jobsRef = collection(db, "jobs");
  
  const mockJobs = [
    {
      id: "job_lead_network",
      employerId: "J5Cg0Mg7HxMxGqYgzZISVSrvgLp2", // Cleanly links to Cisco Regional Sourcing
      companyName: "Cisco Systems Australasia",
      jobTitle: "Lead Network Engineer",
      jobDescription: "Oversee automated campus backbone infrastructure provisioning. Must have advanced experience deploying core routing profiles, security policy validation rules, and GNS3 visual network simulations.",
      requiredEducation: "Bachelor of Network Engineering / Computer Science",
      requiredSkills: ["cisco", "gns3", "routing", "firewalls", "typescript"],
      yearsOfExperience: 5,
      workMode: "Hybrid",
      jobLocation: "Wollongong, NSW",
      createdAt: serverTimestamp()
    },
    {
      id: "job_junior_dev",
      employerId: "SjEX53ThuXfpVqhwNPRGNKtV5Ug2", // Cleanly links to Cyberdyne Solutions
      companyName: "Cyberdyne Solutions",
      jobTitle: "Junior Full-Stack Developer",
      jobDescription: "Assist engineering squads in maintaining Next.js application modules. Build out responsive frontend interface views using Tailwind CSS and integrate Firebase auth middleware modules.",
      requiredEducation: "Diploma of Information Technology",
      requiredSkills: ["next.js", "react", "typescript", "firebase"],
      yearsOfExperience: 1,
      workMode: "Remote",
      jobLocation: "Sydney, NSW",
      createdAt: serverTimestamp()
    }
  ];

  mockJobs.forEach((job) => {
    const jobDocRef = doc(jobsRef, job.id);
    const { id, ...jobPayload } = job;
    batch.set(jobDocRef, jobPayload);
  });

  // ==========================================
  // 3. SEED APPLICATIONS ('applications' collection)
  // ==========================================
  const appsRef = collection(db, "applications");

  const mockApps = [
    {
      id: "app_transaction_01",
      jobId: "job_lead_network",
      candidateId: "WFmHiBTOg9Tv1nfbDoYsRbb5Sqp1", // Alex Mercer
      candidateName: "Alex Mercer",
      jobTitle: "Lead Network Engineer",
      companyName: "Cisco Systems Australasia",
      status: "Reviewed",
      appliedAt: serverTimestamp()
    },
    {
      id: "app_transaction_02",
      jobId: "job_junior_dev",
      candidateId: "WC3UwOYYfeSYflCwURMl69NGfxR2", // Sarah Connor
      candidateName: "Sarah Connor",
      jobTitle: "Junior Full-Stack Developer",
      companyName: "Cyberdyne Solutions",
      status: "Shortlisted",
      appliedAt: serverTimestamp()
    }
  ];

  mockApps.forEach((app) => {
    const appDocRef = doc(appsRef, app.id);
    const { id, ...appPayload } = app;
    batch.set(appDocRef, appPayload);
  });

  await batch.commit();
  console.log("🚀 Master index synced perfectly with Auth matrix definitions!");
}