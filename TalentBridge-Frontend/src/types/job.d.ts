
// =============================
// MAIN INTERFACE
// =============================
export type JobStatus = "ACTIVE" | "EXPIRED" | "PAUSED" | "DRAFT";

export interface Job {
  id: number;
  name: string;
  location: string;
  salary: number;
  quantity: number;
  level: "INTERN" | "FRESHER" | "MIDDLE" | "SENIOR" | "LEADER";
  description: string;
  startDate: string;
  endDate: string;
  status: JobStatus;
  company: CompanySummary;
  skills: SkillSummary[];
}

export interface JobUpsertDto {
  name: string;
  location: string;
  salary: number;
  quantity: number;
  level: "INTERN" | "FRESHER" | "MIDDLE" | "SENIOR" | "LEADER";
  description: string;
  startDate: string;
  endDate: string;
  status: JobStatus;
  company: {
    id: number;
  } | null;
  skills: {
    id: number;
  }[];
}

// =============================
// SECONDARY INTERFACE
// =============================
export interface CompanySummary {
  id: number;
  name: string;
  address: string;
  logoUrl?: string;
}

export interface SkillSummary {
  id: number;
  name: string;
}
