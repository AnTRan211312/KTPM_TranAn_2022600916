// =============================
// CV DATA STRUCTURE
// =============================

export type CVPersonalInfo = {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    title: string; // VD: "Senior Software Engineer"
    summary: string;
    photoUrl?: string;
    linkedin?: string;
    github?: string;
    website?: string;
};

export type CVEducation = {
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
};

export type CVExperience = {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    highlights: string[];
};

export type CVSkill = {
    id: string;
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    category?: string;
};

export interface CVProject {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate?: string;
    endDate?: string;
}

export interface CVCertification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
}

export interface CVLanguage {
    id: string;
    name: string;
    proficiency: string;
}

export type CVData = {
    personalInfo: CVPersonalInfo;
    education: CVEducation[];
    experience: CVExperience[];
    skills: CVSkill[];
    projects: CVProject[];
    certifications: CVCertification[];
    languages: CVLanguage[];
};

// =============================
// API DTOs
// =============================

export interface CreateUserCVRequestDto {
    name: string;
    templateId: string;
    cvData: string; // JSON string of CVData
}

export interface UpdateUserCVRequestDto {
    id: number;
    name: string;
    templateId: string;
    cvData: string;
}

export interface UserCVResponseDto {
    id: number;
    name: string;
    templateId: string;
    cvData: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserCVSummaryDto {
    id: number;
    name: string;
    templateId: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

// =============================
// TEMPLATE TYPES
// =============================

export interface CVTemplate {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    primaryColor: string;
    fontFamily: string;
}

export const CV_TEMPLATES: CVTemplate[] = [
    {
        id: "modern",
        name: "Modern",
        description: "Clean, sidebar layout với màu sắc hiện đại",
        previewImage: "/templates/modern-preview.png",
        primaryColor: "#3B82F6",
        fontFamily: "Inter",
    },
    {
        id: "classic",
        name: "Classic",
        description: "Truyền thống, trang trọng, phù hợp mọi ngành",
        previewImage: "/templates/classic-preview.png",
        primaryColor: "#1F2937",
        fontFamily: "Times New Roman",
    },
    {
        id: "professional",
        name: "Professional",
        description: "ATS-friendly, tối giản, dễ đọc",
        previewImage: "/templates/professional-preview.png",
        primaryColor: "#059669",
        fontFamily: "Roboto",
    },
    {
        id: "creative",
        name: "Creative",
        description: "Sáng tạo, nổi bật, phù hợp ngành thiết kế",
        previewImage: "/templates/creative-preview.png",
        primaryColor: "#8B5CF6",
        fontFamily: "Poppins",
    },
];

// =============================
// INITIAL/DEFAULT CV DATA
// =============================

export const INITIAL_CV_DATA: CVData = {
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        title: "",
        summary: "",
        photoUrl: "",
        linkedin: "",
        github: "",
        website: "",
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
};
