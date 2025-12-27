import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearChatHistory,
  createChatSession,
  getAllChatSessions,
  getChatHistory,
  sendChatMessage,
} from "@/services/chatApi";
import type { ChatMessageDto, ChatSessionDto } from "@/types/chat.d.ts";
import { Bot, Loader2, MessageSquare, Send, Trash2, Settings, History, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function UserChatPage() {
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions khi component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages khi session thay đổi
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Auto scroll to bottom chỉ khi user đang ở gần bottom hoặc có message mới
  useEffect(() => {
    // Chỉ scroll nếu user đang ở gần bottom (trong vòng 100px từ bottom)
    if (scrollRef.current) {
      const div = scrollRef.current;
      const isNearBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 100;
      
      // Chỉ scroll nếu đang ở gần bottom hoặc đây là message đầu tiên
      if (isNearBottom || messages.length <= 2) {
        setTimeout(() => {
          div.scrollTo({
            top: div.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [messages]);

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

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div className="flex h-[calc(100dvh-64px)] w-full gap-4 overflow-hidden bg-gray-50/30">
      {/* Sidebar - Danh sách sessions */}
      <Card className="hidden md:flex w-80 flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 shadow-none rounded-none md:rounded-l-xl">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-bold text-gray-800">Lịch sử</CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-gray-500"
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleCreateSession}
                disabled={isCreatingSession}
                className="h-8 bg-orange-600 text-white hover:bg-orange-700 px-3 text-xs font-medium"
              >
                {isCreatingSession ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Chat mới
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col p-0 overflow-hidden">
          {/* Settings Menu */}
          {showSettings && (
            <div className="shrink-0 border-b bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Quản lý lịch sử</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAllSessions}
                  disabled={sessions.length === 0}
                  className="w-full text-xs"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Xóa tất cả lịch sử ({sessions.length})
                </Button>
                <p className="text-xs text-gray-500">
                  Tổng số cuộc trò chuyện: {sessions.length}
                </p>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bot className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>Chưa có cuộc trò chuyện nào</p>
                <p className="text-sm">Tạo cuộc trò chuyện mới để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    onClick={() => setCurrentSessionId(session.sessionId)}
                    className={`group cursor-pointer border-l-4 px-3 py-3 transition-all ${
                      currentSessionId === session.sessionId
                        ? "border-orange-500 bg-orange-50"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-semibold ${currentSessionId === session.sessionId ? "text-orange-900" : "text-gray-900"}`}>
                          {session.firstMessage || "Cuộc trò chuyện mới"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500 font-normal">
                          {session.lastMessage || "Chưa có tin nhắn"}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-gray-400">
                          <span>{session.messageCount} tin nhắn</span>
                          <span>•</span>
                          <span>{formatDate(session.lastMessageTime)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                        className="ml-2 rounded p-1 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100"
                        title="Xóa cuộc trò chuyện này"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-sm border-0 bg-white/50">
        <CardHeader className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 border border-orange-100">
              <img src="/web-logo.png" alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">TalentBridge AI</CardTitle>
              <p className="text-xs font-medium text-gray-500">Trợ lý ảo hỗ trợ tìm việc & tuyển dụng</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col p-0 bg-white">
          {!currentSessionId ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="text-gray-500">Chọn một cuộc trò chuyện hoặc tạo mới</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
                >
                  <div className="flex min-h-full flex-col">
                    {isLoading && messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Bot className="mb-4 h-16 w-16 text-gray-300" />
                        <p className="text-gray-500">Bắt đầu cuộc trò chuyện với AI</p>
                      </div>
                    ) : (
                      <div className="mx-auto w-full max-w-3xl space-y-6">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === "USER" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className={`flex max-w-[85%] flex-col ${message.role === "USER" ? "items-end ml-auto" : "items-start"}`}>
                              <div
                                className={`rounded-2xl px-5 py-3 shadow-sm ${
                                  message.role === "USER"
                                    ? "bg-gray-100 text-gray-900 rounded-br-sm"
                                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                              </div>
                              <span
                                className="mt-1 px-1 text-[11px] font-medium text-gray-400"
                              >
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {isLoading && messages.length > 0 && (
                          <div className="flex justify-start">
                            <div className="rounded-lg bg-gray-100 px-4 py-2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-none border-t border-gray-200 bg-white p-4 pb-6">
                <form onSubmit={handleSendMessage} className="mx-auto flex max-w-3xl gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={isLoading}
                    className="flex-1 rounded-full border-gray-300 bg-gray-50 px-4 py-5 text-sm shadow-sm focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  <Button type="submit" disabled={isLoading || !inputMessage.trim()} className="h-12 w-12 rounded-full bg-orange-600 hover:bg-orange-700 shadow-sm">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
