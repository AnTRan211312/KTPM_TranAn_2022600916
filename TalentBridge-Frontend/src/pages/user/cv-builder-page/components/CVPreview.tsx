import type { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface CVPreviewProps {
    cvData: CVData;
    templateId: string;
}

export function CVPreview({ cvData, templateId }: CVPreviewProps) {
    switch (templateId) {
        case "modern":
            return <ModernTemplate data={cvData} />;
        case "classic":
            return <ClassicTemplate data={cvData} />;
        case "professional":
            return <ProfessionalTemplate data={cvData} />;
        case "creative":
            return <CreativeTemplate data={cvData} />;
        default:
            return <ModernTemplate data={cvData} />;
    }
}

// ============================================
// MODERN TEMPLATE - Two column layout with sidebar
// ============================================
function ModernTemplate({ data }: { data: CVData }) {
    const { personalInfo, experience, education, skills } = data;

    return (
        <div style={{
            width: "595px",
            minHeight: "842px",
            fontSize: "11px",
            backgroundColor: "#ffffff",
            color: "#1f2937",
            fontFamily: "Inter, sans-serif"
        }}>
            <div style={{ display: "flex", minHeight: "842px" }}>
                {/* Sidebar */}
                <div
                    style={{
                        width: "200px",
                        backgroundColor: "#1e40af",
                        color: "#ffffff",
                        padding: "24px"
                    }}
                >
                    {/* Photo placeholder */}
                    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", width: "96px", height: "96px", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                        <span style={{ fontSize: "36px", fontWeight: "bold", color: "#ffffff" }}>
                            {personalInfo.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                    </div>

                    {/* Contact */}
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.3)", paddingBottom: "8px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff" }}>
                            Liên hệ
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {personalInfo.email && (
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#ffffff" }}>
                                    <Mail size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px", wordBreak: "break-all" }}>{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo.phone && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                                    <Phone size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px" }}>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo.address && (
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#ffffff" }}>
                                    <MapPin size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px" }}>{personalInfo.address}</span>
                                </div>
                            )}
                            {personalInfo.linkedin && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                                    <Linkedin size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px", wordBreak: "break-all" }}>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                                </div>
                            )}
                            {personalInfo.github && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                                    <Github size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px", wordBreak: "break-all" }}>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
                                </div>
                            )}
                            {personalInfo.website && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}>
                                    <Globe size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "10px", wordBreak: "break-all" }}>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <h3 style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.3)", paddingBottom: "8px", marginBottom: "12px", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff" }}>
                                Kỹ năng
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {skills.slice(0, 10).map((skill) => (
                                    <div key={skill.id}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#ffffff", marginBottom: "4px" }}>
                                            <span>{skill.name}</span>
                                        </div>
                                        <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "9999px" }}>
                                            <div
                                                style={{
                                                    height: "100%",
                                                    backgroundColor: "#ffffff",
                                                    borderRadius: "9999px",
                                                    width: skill.level === "Expert" ? "100%" :
                                                        skill.level === "Advanced" ? "75%" :
                                                            skill.level === "Intermediate" ? "50%" : "25%"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: "24px", backgroundColor: "#ffffff" }}>
                    {/* Name & Title */}
                    <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px" }}>
                        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
                            {personalInfo.fullName || "Họ và tên"}
                        </h1>
                        <p style={{ fontSize: "16px", fontWeight: 500, color: "#2563eb", marginTop: "4px", margin: "4px 0 0" }}>
                            {personalInfo.title || "Chức danh"}
                        </p>
                    </div>

                    {/* Summary */}
                    {personalInfo.summary && (
                        <div style={{ marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#374151", marginBottom: "8px", letterSpacing: "0.025em" }}>
                                Giới thiệu
                            </h2>
                            <p style={{ fontSize: "11px", lineHeight: 1.625, color: "#4b5563", margin: 0 }}>
                                {personalInfo.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#374151", marginBottom: "12px", letterSpacing: "0.025em" }}>
                                Kinh nghiệm làm việc
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {experience.slice(0, 4).map((exp) => (
                                    <div key={exp.id} style={{ position: "relative", paddingLeft: "16px" }}>
                                        <div style={{ position: "absolute", left: 0, top: "6px", height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#2563eb" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <span style={{ fontWeight: "bold", color: "#1f2937" }}>
                                                    {exp.position || "Vị trí"}
                                                </span>
                                                <span style={{ color: "#6b7280" }}>
                                                    {" | "}{exp.company || "Công ty"}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: "10px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                                                {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
                                            </span>
                                        </div>
                                        {exp.description && (
                                            <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#374151", marginBottom: "12px", letterSpacing: "0.025em" }}>
                                Học vấn
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {education.slice(0, 3).map((edu) => (
                                    <div key={edu.id} style={{ position: "relative", paddingLeft: "16px" }}>
                                        <div style={{ position: "absolute", left: 0, top: "6px", height: "8px", width: "8px", borderRadius: "9999px", backgroundColor: "#2563eb" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <span style={{ fontWeight: "bold", color: "#1f2937" }}>
                                                    {edu.degree || "Bằng cấp"}
                                                </span>
                                                <span style={{ color: "#6b7280" }}> - {edu.field}</span>
                                            </div>
                                            <span style={{ fontSize: "10px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                                                {edu.startDate} - {edu.current ? "Hiện tại" : edu.endDate}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "10px", color: "#6b7280", margin: 0 }}>{edu.school}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// CLASSIC TEMPLATE - Traditional single column
// ============================================
function ClassicTemplate({ data }: { data: CVData }) {
    const { personalInfo, experience, education, skills } = data;

    return (
        <div style={{
            width: "595px",
            minHeight: "842px",
            fontSize: "11px",
            backgroundColor: "#ffffff",
            padding: "32px",
            color: "#111827",
            fontFamily: "'Times New Roman', Times, serif"
        }}>
            {/* Header */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #111827", paddingBottom: "16px", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#111827", margin: 0 }}>
                    {personalInfo.fullName || "Họ và tên"}
                </h1>
                <p style={{ fontSize: "16px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>
                    {personalInfo.title || "Chức danh"}
                </p>
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", fontSize: "10px", color: "#6b7280", marginTop: "12px" }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo.address && <span>• {personalInfo.address}</span>}
                    {personalInfo.linkedin && <span>• LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                    {personalInfo.github && <span>• GitHub: {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                    {personalInfo.website && <span>• Web: {personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
                <div style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#1f2937", marginBottom: "8px", letterSpacing: "0.05em" }}>
                        Mục tiêu nghề nghiệp
                    </h2>
                    <p style={{ fontSize: "11px", lineHeight: 1.625, color: "#4b5563", margin: 0 }}>{personalInfo.summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#1f2937", marginBottom: "12px", letterSpacing: "0.05em" }}>
                        Kinh nghiệm làm việc
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {experience.slice(0, 4).map((exp) => (
                            <div key={exp.id}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div>
                                        <span style={{ fontWeight: "bold", color: "#1f2937" }}>{exp.position}</span>
                                        <span style={{ color: "#4b5563" }}> | {exp.company}</span>
                                    </div>
                                    <span style={{ fontSize: "10px", color: "#6b7280" }}>
                                        {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#1f2937", marginBottom: "12px", letterSpacing: "0.05em" }}>
                        Học vấn
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {education.slice(0, 3).map((edu) => (
                            <div key={edu.id} style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <span style={{ fontWeight: "bold", color: "#1f2937" }}>{edu.school}</span>
                                    <span style={{ color: "#4b5563" }}> | {edu.degree}, {edu.field}</span>
                                </div>
                                <span style={{ fontSize: "10px", color: "#6b7280" }}>
                                    {edu.startDate} - {edu.current ? "Hiện tại" : edu.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#1f2937", marginBottom: "12px", letterSpacing: "0.05em" }}>
                        Kỹ năng
                    </h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {skills.map((skill) => (
                            <span
                                key={skill.id}
                                style={{ borderRadius: "4px", border: "1px solid #d1d5db", padding: "2px 8px", fontSize: "10px", color: "#374151" }}
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// PROFESSIONAL TEMPLATE (ATS-Friendly)
// ============================================
function ProfessionalTemplate({ data }: { data: CVData }) {
    const { personalInfo, experience, education, skills } = data;

    return (
        <div style={{
            width: "595px",
            minHeight: "842px",
            fontSize: "11px",
            backgroundColor: "#ffffff",
            padding: "32px",
            color: "#1f2937",
            fontFamily: "Roboto, Arial, sans-serif"
        }}>
            {/* Header */}
            <div style={{ borderBottom: "2px solid #059669", paddingBottom: "16px", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#047857", margin: 0 }}>
                    {personalInfo.fullName || "Họ và tên"}
                </h1>
                <p style={{ fontSize: "16px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>
                    {personalInfo.title || "Chức danh"}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "10px", color: "#4b5563", marginTop: "12px" }}>
                    {personalInfo.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Mail size={12} /> {personalInfo.email}
                        </span>
                    )}
                    {personalInfo.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={12} /> {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo.address && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} /> {personalInfo.address}
                        </span>
                    )}
                    {personalInfo.linkedin && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Linkedin size={12} /> {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                    )}
                    {personalInfo.github && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Github size={12} /> {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                    )}
                    {personalInfo.website && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Globe size={12} /> {personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                    )}
                </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
                <section style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#047857", borderBottom: "1px solid #a7f3d0", paddingBottom: "4px", marginBottom: "8px" }}>
                        Tóm tắt
                    </h2>
                    <p style={{ fontSize: "11px", lineHeight: 1.625, color: "#374151", margin: 0 }}>{personalInfo.summary}</p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#047857", borderBottom: "1px solid #a7f3d0", paddingBottom: "4px", marginBottom: "12px" }}>
                        Kinh nghiệm làm việc
                    </h2>
                    {experience.slice(0, 4).map((exp) => (
                        <div key={exp.id} style={{ marginBottom: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong style={{ fontWeight: "bold", color: "#1f2937" }}>
                                    {exp.position} | {exp.company}
                                </strong>
                                <span style={{ fontSize: "10px", color: "#6b7280" }}>
                                    {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
                                </span>
                            </div>
                            {exp.description && (
                                <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>{exp.description}</p>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#047857", borderBottom: "1px solid #a7f3d0", paddingBottom: "4px", marginBottom: "12px" }}>
                        Học vấn
                    </h2>
                    {education.slice(0, 3).map((edu) => (
                        <div key={edu.id} style={{ marginBottom: "8px" }}>
                            <strong style={{ fontWeight: "bold", color: "#1f2937" }}>{edu.school}</strong>
                            <span style={{ color: "#4b5563" }}> | {edu.degree}, {edu.field}</span>
                            <span style={{ fontSize: "10px", color: "#6b7280" }}>
                                {" "}({edu.startDate} - {edu.current ? "Hiện tại" : edu.endDate})
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section>
                    <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", color: "#047857", borderBottom: "1px solid #a7f3d0", paddingBottom: "4px", marginBottom: "8px" }}>
                        Kỹ năng
                    </h2>
                    <p style={{ fontSize: "10px", color: "#374151", margin: 0 }}>
                        {skills.map((s) => s.name).join(" • ")}
                    </p>
                </section>
            )}
        </div>
    );
}

// ============================================
// CREATIVE TEMPLATE
// ============================================
function CreativeTemplate({ data }: { data: CVData }) {
    const { personalInfo, experience, education, skills } = data;

    return (
        <div
            style={{
                width: "595px",
                minHeight: "842px",
                fontSize: "11px",
                backgroundColor: "#faf5ff",
                fontFamily: "Poppins, sans-serif"
            }}
        >
            {/* Header with gradient */}
            <div style={{ backgroundColor: "#9333ea", padding: "24px", color: "#ffffff" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                    {personalInfo.fullName || "Họ và tên"}
                </h1>
                <p style={{ marginTop: "4px", color: "#f3e8ff", margin: "4px 0 0" }}>{personalInfo.title || "Chức danh"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "10px", color: "#f3e8ff", marginTop: "12px" }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.address && <span>{personalInfo.address}</span>}
                    {personalInfo.linkedin && <span>LN: {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                    {personalInfo.github && <span>GH: {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                    {personalInfo.website && <span>WB: {personalInfo.website.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                </div>
            </div>

            <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
                {/* Left column */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {skills.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#9333ea", marginBottom: "12px" }}>
                                ✨ Kỹ năng
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {skills.slice(0, 8).map((skill) => (
                                    <div
                                        key={skill.id}
                                        style={{ borderRadius: "9999px", backgroundColor: "#f3e8ff", padding: "4px 12px", textAlign: "center", fontSize: "10px", color: "#7e22ce" }}
                                    >
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {education.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#9333ea", marginBottom: "12px" }}>
                                🎓 Học vấn
                            </h3>
                            {education.slice(0, 2).map((edu) => (
                                <div key={edu.id} style={{ marginBottom: "12px" }}>
                                    <p style={{ fontWeight: "bold", color: "#1f2937", margin: 0 }}>{edu.school}</p>
                                    <p style={{ fontSize: "10px", color: "#6b7280", margin: 0 }}>{edu.degree}</p>
                                    <p style={{ fontSize: "9px", color: "#9ca3af", margin: 0 }}>
                                        {edu.startDate} - {edu.current ? "Hiện tại" : edu.endDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div style={{ flex: 2 }}>
                    {personalInfo.summary && (
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#9333ea", marginBottom: "8px" }}>
                                👋 Về tôi
                            </h3>
                            <p style={{ fontSize: "11px", lineHeight: 1.625, color: "#4b5563", margin: 0 }}>
                                {personalInfo.summary}
                            </p>
                        </div>
                    )}

                    {experience.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#9333ea", marginBottom: "12px" }}>
                                💼 Kinh nghiệm
                            </h3>
                            {experience.slice(0, 4).map((exp) => (
                                <div
                                    key={exp.id}
                                    style={{ borderLeft: "4px solid #c084fc", backgroundColor: "#ffffff", padding: "12px", marginBottom: "16px", borderRadius: "8px" }}
                                >
                                    <p style={{ fontWeight: "bold", color: "#1f2937", margin: 0 }}>{exp.position}</p>
                                    <p style={{ color: "#9333ea", margin: 0 }}>{exp.company}</p>
                                    <p style={{ fontSize: "9px", color: "#9ca3af", margin: 0 }}>
                                        {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
                                    </p>
                                    {exp.description && (
                                        <p style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0" }}>
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
