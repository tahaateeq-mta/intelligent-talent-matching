import type { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = "candidate" | "employer" | "admin";
export type WorkMode = "Remote" | "On-site" | "Hybrid";
export type MembershipType = "FREE" | "PREMIUM";
export type ApplicationStatus =
  | "Pending"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected";

export type FirebaseDate = FieldValue | Timestamp | Date;

export interface BaseUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isMember: boolean;
  membershipType?: MembershipType;
  createdAt: FirebaseDate;
}

export interface CandidateProfile extends BaseUser {
  role: "candidate";
  contactInfo: {
    phone: string;
    city: string;
  };
  education: {
    level: string;
    fieldOfStudy: string;
  };
  yearsOfExperience: number;
  workExperience: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
  skills: string[];
  preferredWorkingMode: WorkMode;
  preferredLocation: string;
  resumeUrl?: string;
  updatedAt?: FirebaseDate;
}

export interface EmployerProfile extends BaseUser {
  role: "employer";
  companyName: string;
  companyDetails: string;
  location: string;
  updatedAt?: FirebaseDate;
}

export interface JobPosting {
  id?: string;
  employerId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  requiredEducation: string;
  requiredSkills: string[];
  yearsOfExperience: number;
  workMode: WorkMode;
  jobLocation: string;
  createdAt: FirebaseDate;
  updatedAt?: FirebaseDate;
}

export interface JobApplication {
  id?: string;
  jobId: string;
  employerId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: FirebaseDate;
  updatedAt?: FirebaseDate;
}

export interface RecommendationResult<T = JobPosting | CandidateProfile> {
  item: T;
  score: number;
  reasons: string[];
}

export interface MembershipRecord {
  id?: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  isMember: boolean;
  membershipType: MembershipType;
  updatedAt: FirebaseDate;
}