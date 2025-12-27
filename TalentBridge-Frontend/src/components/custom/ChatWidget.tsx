import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  clearChatHistory,
  createChatSession,
  getAllChatSessions,
  getChatHistory,
  sendChatMessage,
} from "@/services/chatApi";
import type { ChatMessageDto, ChatSessionDto } from "@/types/chat.d.ts";
import { Bot, Loader2, MessageSquare, Send, X, Minimize2, Maximize2, Trash2, Settings, MoreVertical, ChevronUp, Paperclip, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "@/features/hooks";

// Helper: Parse bold text (**text**)
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Helper: Render message content with basic Markdown support
const renderMessageContent = (content: string) => {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <div key={index} className="flex items-start gap-2 ml-1 mb-1">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
          <span className="flex-1">{parseBold(trimmed.substring(2))}</span>
        </div>
      );
    }
    if (!trimmed) return <div key={index} className="h-2" />;
    return <p key={index} className="mb-1 last:mb-0 leading-relaxed">{parseBold(line)}</p>;
  });
};

export default function ChatWidget() {
  const { user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Load sessions khi widget mở
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  // Load messages khi session thay đổi
  useEffect(() => {
    if (currentSessionId && isOpen) {
      loadMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, isOpen]);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await getAllChatSessions();
      const data = response.data.data;
      setSessions(data);
      // Nếu chưa có session nào được chọn và có sessions, chọn session đầu tiên
      if (!currentSessionId && data.length > 0) {
        setCurrentSessionId(data[0].sessionId);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách cuộc trò chuyện",
      );
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await getChatHistory(sessionId);
      const data = response.data.data;
      setMessages(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử chat",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      const response = await createChatSession();
      const sessionId = response.data.data.sessionId;
      await loadSessions();
      setCurrentSessionId(sessionId);
      toast.success("Đã tạo cuộc trò chuyện mới");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tạo cuộc trò chuyện mới",
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + newFiles.length;

      if (totalFiles > 5) {
        toast.error("Chỉ có thể tải lên tối đa 5 files");
        return;
      }

      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const filesToSend = [...selectedFiles];
    setInputMessage("");
    setSelectedFiles([]);

    try {
      setIsLoading(true);

      // Nếu chưa có session, tự động tạo mới
      let sessionId = currentSessionId;
      if (!sessionId) {
        const response = await createChatSession();
        sessionId = response.data.data.sessionId;
        setCurrentSessionId(sessionId);
        await loadSessions();
      }

      // Thêm message của user vào UI ngay lập tức với file previews
      const tempAttachmentUrls = filesToSend.length > 0
        ? filesToSend.map(file => URL.createObjectURL(file))
        : undefined;

      const tempAttachmentTypes = filesToSend.length > 0
        ? filesToSend.map(file => file.type)
        : undefined;

      const userMsg: ChatMessageDto = {
        id: Date.now(),
        role: "USER",
        content: userMessage,
        createdAt: new Date().toISOString(),
        createdBy: "user",
        attachmentUrls: tempAttachmentUrls,
        attachmentTypes: tempAttachmentTypes,
      };
      setMessages((prev) => [...prev, userMsg]);

      const response = await sendChatMessage({
        question: userMessage,
        sessionId: sessionId,
        files: filesToSend.length > 0 ? filesToSend : undefined,
      });

      // Thêm response từ AI
      const aiMsg: ChatMessageDto = {
        id: Date.now() + 1,
        role: "ASSISTANT",
        content: response.data as string,
        createdAt: new Date().toISOString(),
        createdBy: "assistant",
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Reload sessions để cập nhật lastMessage
      await loadSessions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể gửi tin nhắn. Vui lòng thử lại",
      );
      setInputMessage(userMessage);
      setSelectedFiles(filesToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) return;

    try {
      await clearChatHistory(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      await loadSessions();
      toast.success("Đã xóa cuộc trò chuyện");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể xóa cuộc trò chuyện",
      );
    }
  };

  const handleDeleteAllSessions = async () => {
    if (!confirm("Bạn có chắc muốn xóa TẤT CẢ lịch sử trò chuyện? Hành động này không thể hoàn tác!")) return;

    try {
      const deletePromises = sessions.map((session) => clearChatHistory(session.sessionId));
      await Promise.all(deletePromises);
      setCurrentSessionId(null);
      setMessages([]);
      await loadSessions();
      toast.success("Đã xóa tất cả lịch sử trò chuyện");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể xóa lịch sử",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const hasPermission = user?.permissions?.includes("POST /chat-message");

  const handleOpenChat = () => {
    if (!user || !hasPermission) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng Chat AI");
      return;
    }
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Ẩn widget nếu đang ở trang chat full-screen
  if (location.pathname.includes("/user/chat")) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-20 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Mở Chat AI"
        >
          <Bot className="h-6 w-6 text-white" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && hasPermission && (
        <div
          className={`fixed bottom-20 left-6 z-50 transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"
            } w-[400px]`}
        >
          <Card
            className={`flex h-full flex-col overflow-hidden border-0 shadow-2xl transition-all duration-300 ${isMinimized ? "rounded-[24px] cursor-pointer hover:scale-[1.02]" : "rounded-3xl"}`}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            {/* Header */}
            <CardHeader className={`flex flex-row items-center justify-between border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 shadow-lg transition-all ${isMinimized ? "h-full" : "rounded-t-3xl"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all ${isMinimized ? "h-8 w-8" : "h-10 w-10"}`}>
                  <Bot className={`${isMinimized ? "h-5 w-5" : "h-6 w-6"} text-white`} />
                </div>
                <div>
                  <CardTitle className={`font-bold text-white tracking-tight ${isMinimized ? "text-base" : "text-lg"}`}>Chat AI</CardTitle>
                  {!isMinimized && (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                      </span>
                      <p className="text-xs text-blue-100 font-medium">Trực tuyến</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {isMinimized ? (
                  <ChevronUp className="h-6 w-6 text-white/80 animate-pulse" />
                ) : (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/20 transition-colors rounded-lg"
                          title="Cài đặt"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleDeleteAllSessions} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Xóa tất cả lịch sử</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(true);
                      }}
                      title="Thu nhỏ"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-red-500/30 transition-colors rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        setIsMinimized(false);
                      }}
                      title="Đóng"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
                {/* Sessions List (Compact) */}
                <div className="shrink-0 border-b border-gray-200 bg-gray-50/50 p-2 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <ScrollArea className="h-12 max-w-[calc(100%-100px)]">
                      <div className="flex gap-2">
                        {isLoadingSessions ? (
                          <div className="flex items-center justify-center px-2">
                            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                          </div>
                        ) : sessions.length === 0 ? (
                          <span className="px-2 text-xs text-gray-500">Chưa có cuộc trò chuyện</span>
                        ) : (
                          sessions.map((session) => (
                            <div
                              key={session.sessionId}
                              className="group relative"
                            >
                              <button
                                onClick={() => setCurrentSessionId(session.sessionId)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${currentSessionId === session.sessionId
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                  : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                                  }`}
                                title={session.firstMessage || "Cuộc trò chuyện mới"}
                              >
                                {session.firstMessage && session.firstMessage.length > 18
                                  ? `${session.firstMessage.substring(0, 18)}...`
                                  : session.firstMessage || "Mới"}
                              </button>
                              <button
                                onClick={(e) => handleDeleteSession(session.sessionId, e)}
                                className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:bg-red-600 hover:scale-110 group-hover:flex"
                                title="Xóa cuộc trò chuyện này"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCreateSession}
                        disabled={isCreatingSession}
                        className="h-8 w-8 rounded-xl border-blue-300 bg-white p-0 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                        title="Tạo cuộc trò chuyện mới"
                      >
                        {isCreatingSession ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area - Fixed height with scroll */}
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-white to-gray-50/30">
                  <ScrollArea className="h-full px-4 py-4">
                    {!currentSessionId && (
                      <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                          <Bot className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-800 mb-2">
                          Chào mừng bạn!
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Hãy nhập câu hỏi bên dưới để bắt đầu
                        </p>
                      </div>
                    )}

                    {currentSessionId && isLoading && messages.length === 0 && (
                      <div className="flex min-h-full items-center justify-center p-8">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <p className="text-sm text-gray-600 font-medium">Đang tải...</p>
                        </div>
                      </div>
                    )}

                    {currentSessionId && !isLoading && messages.length === 0 && (
                      <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                          <Bot className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-800 mb-2">Sẵn sàng trò chuyện!</p>
                        <p className="text-sm text-gray-600 font-medium">Hãy đặt câu hỏi đầu tiên</p>
                      </div>
                    )}

                    {currentSessionId && messages.length > 0 && (
                      <div className="space-y-4 pb-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex animate-in fade-in-from-bottom-2 duration-300 ${message.role.toUpperCase() === "USER" ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.role.toUpperCase() === "USER"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                }`}
                            >
                              <div className="text-[15px] font-normal break-words">
                                {renderMessageContent(message.content)}
                              </div>

                              {/* File Attachments */}
                              {message.attachmentUrls && message.attachmentUrls.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {message.attachmentUrls.map((url, idx) => {
                                    const type = message.attachmentTypes?.[idx] || "";
                                    const isImage = type.startsWith("image/");

                                    return isImage ? (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt={`attachment-${idx}`}
                                        className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(url, "_blank")}
                                      />
                                    ) : (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${message.role.toUpperCase() === "USER"
                                          ? "bg-blue-700 hover:bg-blue-800"
                                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                          }`}
                                      >
                                        <FileText className="h-3 w-3" />
                                        {type.includes("pdf") ? "PDF" : "Document"} {idx + 1}
                                      </a>
                                    );
                                  })}
                                </div>
                              )}

                              <p
                                className={`mt-1 text-[10px] font-medium text-right ${message.role.toUpperCase() === "USER" ? "text-blue-100" : "text-gray-400"
                                  }`}
                              >
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isLoading && messages.length > 0 && (
                          <div className="flex justify-start animate-in fade-in">
                            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Input Area - Always visible */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-3 shadow-lg">
                  {/* File Preview Area */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
                      {selectedFiles.map((file, idx) => {
                        const isImage = file.type.startsWith("image/");
                        const fileUrl = URL.createObjectURL(file);

                        return (
                          <div key={idx} className="relative group shrink-0">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={file.name}
                                className="h-16 w-16 rounded object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <p className="mt-1 text-[10px] text-gray-600 text-center truncate w-16">
                              {file.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage}>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.md"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || selectedFiles.length >= 5}
                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all disabled:opacity-50"
                        title="Đính kèm file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>

                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn..."
                        disabled={isLoading}
                        className="flex-1 rounded-full border-gray-300 bg-white px-4 py-5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        autoFocus
                      />

                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !inputMessage.trim()}
                        className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Send className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
