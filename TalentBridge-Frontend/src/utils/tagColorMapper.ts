// ====================
// METHOD COLOR MAPPER
// ====================
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-500",
  POST: "bg-blue-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
};

export const getMethodColor = (method: string): string => {
  const color = METHOD_COLORS[method.toUpperCase()];

  return `${color ? color : "bg-gray-500"} w-[80px]`;
};

// ====================
// LEVEL COLOR MAPPER
// ====================
export const levelLabels = {
  INTERN: "Intern",
  FRESHER: "Fresher",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEADER: "Leader",
};

export const levelColors = {
  INTERN: "bg-blue-100 text-blue-700",
  FRESHER: "bg-green-100 text-green-700",
  MIDDLE: "bg-yellow-100 text-yellow-700",
  SENIOR: "bg-purple-100 text-purple-700",
  LEADER: "bg-red-100 text-red-700",
};

// ====================
// RESUME STATUS COLOR MAPPER
// ====================
export const statusOptions = [
  {
    value: "PENDING",
    label: "Chờ duyệt",
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: "◐"
  },
  {
    value: "REVIEWING",
    label: "Đang xét duyệt",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "◑"
  },
  {
    value: "APPROVED",
    label: "Đã duyệt",
    color: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: "●"
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    color: "bg-red-50 text-red-700 border border-red-200",
    icon: "✕"
  },
];

export const getResumeStatusColor = (status: string) => {
  const statusItem = statusOptions.find((opt) => opt.value === status);
  return statusItem ? statusItem.color : "bg-gray-100 text-gray-600 border border-gray-200";
};

export const getResumeStatusLabel = (status: string) => {
  const statusItem = statusOptions.find((opt) => opt.value === status);
  return statusItem ? statusItem.label : status;
};

export const getResumeStatusIcon = (status: string) => {
  const statusItem = statusOptions.find((opt) => opt.value === status);
  return statusItem ? statusItem.icon : "○";
};
