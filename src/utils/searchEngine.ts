import { CandidateProfile, JobPosting } from "@/types";

export function getLevenshteinDistance(a: string, b: string): number {
  const first = a.toLowerCase();
  const second = b.toLowerCase();

  const matrix: number[][] = [];

  for (let i = 0; i <= second.length; i++) matrix[i] = [i];
  for (let j = 0; j <= first.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= second.length; i++) {
    for (let j = 1; j <= first.length; j++) {
      if (second.charAt(i - 1) === first.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[second.length][first.length];
}

interface SearchFilters {
  workMode?: string;
  location?: string;
  experience?: number;
  education?: string;
  skill?: string;
}

function normalise(value?: string) {
  return (value || "").toLowerCase().trim();
}

function tokenize(value: string) {
  return normalise(value)
    .split(/[\s,.\-/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function matchFuzzyTokens(searchableText: string, searchKeyword: string): boolean {
  const cleanKeyword = normalise(searchKeyword);
  const cleanTarget = normalise(searchableText);

  if (!cleanKeyword) return true;
  if (cleanTarget.includes(cleanKeyword)) return true;

  const inputTokens = tokenize(cleanKeyword);
  const targetTokens = tokenize(cleanTarget);

  return inputTokens.some((inputWord) => {
    return targetTokens.some((targetWord) => {
      if (targetWord.includes(inputWord) || inputWord.includes(targetWord)) {
        return true;
      }

      if (inputWord.length < 3 || targetWord.length < 3) {
        return inputWord === targetWord;
      }

      const allowedDistance =
        inputWord.length <= 5 ? 1 : inputWord.length <= 8 ? 2 : 3;

      return getLevenshteinDistance(inputWord, targetWord) <= allowedDistance;
    });
  });
}

export function searchJobsEngine(
  jobs: JobPosting[],
  keyword: string,
  filters: SearchFilters
): JobPosting[] {
  return jobs.filter((job) => {
    if (filters.workMode && job.workMode !== filters.workMode) return false;

    if (
      typeof filters.experience === "number" &&
      job.yearsOfExperience > filters.experience
    ) {
      return false;
    }

    if (
      filters.location &&
      !normalise(job.jobLocation).includes(normalise(filters.location))
    ) {
      return false;
    }

    if (
      filters.education &&
      !normalise(job.requiredEducation).includes(normalise(filters.education))
    ) {
      return false;
    }

    if (
      filters.skill &&
      !job.requiredSkills?.some((skill) =>
        normalise(skill).includes(normalise(filters.skill))
      )
    ) {
      return false;
    }

    const searchableText = [
      job.jobTitle,
      job.jobDescription,
      job.companyName,
      job.jobLocation,
      job.requiredEducation,
      job.workMode,
      ...(job.requiredSkills || []),
    ].join(" ");

    return matchFuzzyTokens(searchableText, keyword);
  });
}

export function searchCandidatesEngine(
  candidates: CandidateProfile[],
  keyword: string,
  filters: SearchFilters
): CandidateProfile[] {
  return candidates.filter((candidate) => {
    if (
      filters.workMode &&
      candidate.preferredWorkingMode !== filters.workMode
    ) {
      return false;
    }

    if (
      typeof filters.experience === "number" &&
      candidate.yearsOfExperience < filters.experience
    ) {
      return false;
    }

    if (
      filters.location &&
      !normalise(candidate.preferredLocation).includes(normalise(filters.location))
    ) {
      return false;
    }

    if (
      filters.education &&
      !normalise(candidate.education?.level).includes(normalise(filters.education))
    ) {
      return false;
    }

    if (
      filters.skill &&
      !candidate.skills?.some((skill) =>
        normalise(skill).includes(normalise(filters.skill))
      )
    ) {
      return false;
    }

    const searchableText = [
      candidate.displayName,
      candidate.email,
      candidate.contactInfo?.city,
      candidate.education?.level,
      candidate.education?.fieldOfStudy,
      candidate.preferredWorkingMode,
      candidate.preferredLocation,
      ...(candidate.skills || []),
      ...(candidate.workExperience || []).map(
        (work) => `${work.company} ${work.role} ${work.duration}`
      ),
    ].join(" ");

    return matchFuzzyTokens(searchableText, keyword);
  });
}