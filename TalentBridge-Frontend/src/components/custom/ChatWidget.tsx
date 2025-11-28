import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  clearChatHistory,
  createChatSession,
  getAllChatSessions,
  getChatHistory,
  sendChatMessage,
} from "@/services/chatApi";
import type { ChatMessageDto, ChatSessionDto } from "@/types/chat.d.ts";
import { Bot, Loader2, MessageSquare, Send, X, Minimize2, Maximize2, Trash2, Settings, History } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/features/hooks";

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
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Thêm message của user vào UI ngay lập tức
    const userMsg: ChatMessageDto = {
      id: Date.now(),
      role: "USER",
      content: userMessage,
      createdAt: new Date().toISOString(),
      createdBy: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setIsLoading(true);
      const response = await sendChatMessage({
        question: userMessage,
        sessionId: currentSessionId,
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
      // Xóa message user nếu lỗi
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
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
      setShowSettings(false);
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
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
          className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isMinimized ? "h-16" : "h-[600px]"
            } w-[400px]`}
        >
          <Card className="flex h-full flex-col overflow-hidden border-0 shadow-2xl rounded-3xl">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 shadow-lg rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white tracking-tight">Chat AI</CardTitle>
                  <p className="text-xs text-blue-100 font-medium">Trợ lý thông minh</p>
                </div>
              </div>
              <div className="flex gap-1">
                {!isMinimized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 transition-colors rounded-lg"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Cài đặt"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-red-500/30 transition-colors rounded-lg"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setShowSettings(false);
                  }}
                  title="Đóng"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
                {/* Settings Menu */}
                {showSettings && (
                  <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 shadow-sm rounded-t-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                          <History className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Quản lý lịch sử</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(false)}
                        className="h-6 w-6 p-0 hover:bg-gray-200 rounded-lg"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAllSessions}
                        disabled={sessions.length === 0}
                        className="w-full text-xs font-medium shadow-sm hover:shadow-md transition-all rounded-xl"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Xóa tất cả lịch sử ({sessions.length})
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        Tổng số cuộc trò chuyện: <span className="font-semibold text-gray-700">{sessions.length}</span>
                      </p>
                    </div>
                  </div>
                )}

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
                    {!currentSessionId ? (
                      <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                          <Bot className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-800 mb-2">
                          Chào mừng bạn!
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Chọn cuộc trò chuyện hoặc tạo mới
                        </p>
                      </div>
                    ) : isLoading && messages.length === 0 ? (
                      <div className="flex min-h-full items-center justify-center p-8">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <p className="text-sm text-gray-600 font-medium">Đang tải...</p>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex min-h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                          <Bot className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-800 mb-2">Sẵn sàng trò chuyện!</p>
                        <p className="text-sm text-gray-600 font-medium">Hãy đặt câu hỏi đầu tiên</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pb-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.role === "USER" ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${message.role === "USER"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-gray-50 text-gray-800 border border-gray-200"
                                }`}
                            >
                              <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px] font-normal">{message.content}</p>
                              <p
                                className={`mt-2 text-xs font-medium ${message.role === "USER" ? "text-white/80" : "text-gray-500"
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

                {/* Input Area - Fixed at bottom */}
                {currentSessionId && (
                  <div className="shrink-0 border-t border-gray-200 bg-white p-3 shadow-lg">
                    <form onSubmit={handleSendMessage}>
                      <div className="flex gap-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Nhập câu hỏi..."
                          disabled={isLoading}
                          className="flex-1 rounded-full border-gray-300 bg-gray-50 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isLoading || !inputMessage.trim()}
                          className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

