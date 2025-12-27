import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/types/apiResponse.d.ts";
import type {
  ChatRequest,
  ChatMessageDto,
  ChatSessionDto,
  ChatSessionInfo,
} from "@/types/chat.d.ts";

/**
 * Gửi tin nhắn tới AI (hỗ trợ file attachments)
 * Yêu cầu quyền: POST /api/chat-message
 * Lưu ý: Backend trả về String trực tiếp (không bọc trong ApiResponse)
 */
export const sendChatMessage = (data: ChatRequest & { files?: File[] }) => {
  const formData = new FormData();
  formData.append("question", data.question);
  formData.append("sessionId", data.sessionId);

  // Add files if present
  if (data.files && data.files.length > 0) {
    data.files.forEach(file => {
      formData.append("files", file);
    });
  }

  return axiosClient.post<string>("/chat-message", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Lấy lịch sử chat theo sessionId
 * Yêu cầu quyền: GET /api/chat-history
 */
export const getChatHistory = (sessionId: string) => {
  return axiosClient.get<ApiResponse<ChatMessageDto[]>>(
    `/chat-history/${sessionId}`,
  );
};

/**
 * Xóa lịch sử chat theo sessionId
 * Yêu cầu quyền: DELETE /api/chat-history
 */
export const clearChatHistory = (sessionId: string) => {
  return axiosClient.delete<ApiResponse<void>>(
    `/chat-history/${sessionId}`,
  );
};

/**
 * Tạo session chat mới
 * Yêu cầu quyền: POST /api/chat-message
 * Trả về sessionId để sử dụng khi gửi tin nhắn
 */
export const createChatSession = () => {
  return axiosClient.post<ApiResponse<{ sessionId: string; message: string }>>(
    "/chat-sessions",
  );
};

/**
 * Lấy tất cả chat sessions của user với thông tin chi tiết
 * Yêu cầu quyền: GET /api/chat-sessions
 * Trả về danh sách sessions với message đầu, message cuối, số lượng tin nhắn và thời gian
 */
export const getAllChatSessions = () => {
  return axiosClient.get<ApiResponse<ChatSessionDto[]>>("/chat-sessions");
};

/**
 * Lấy thông tin cơ bản của session chat
 * Yêu cầu quyền: GET /api/chat-session
 */
export const getChatSessionInfo = (sessionId: string) => {
  return axiosClient.get<ApiResponse<ChatSessionInfo>>(
    `/chat-session/${sessionId}/info`,
  );
};

