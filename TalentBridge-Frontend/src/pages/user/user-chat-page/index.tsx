import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  clearChatHistory,
  createChatSession,
  getAllChatSessions,
  getChatHistory,
  sendChatMessage,
  sendChatMessageStream,
} from "@/services/chatApi";
import type { ChatMessageDto, ChatSessionDto } from "@/types/chat.d.ts";
import { Bot, Loader2, MessageSquare, Send, Trash2, Settings, History, X, Paperclip, FileText, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

export default function UserChatPage() {
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (scrollRef.current) {
      const div = scrollRef.current;
      const isNearBottom = div.scrollHeight - div.scrollTop - div.clientHeight < 150;

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
    if (!inputMessage.trim() || !currentSessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    const filesToSend = [...selectedFiles];
    setInputMessage("");
    setSelectedFiles([]);

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

    try {
      setIsLoading(true);

      if (filesToSend.length > 0) {
        const response = await sendChatMessage({
          question: userMessage,
          sessionId: currentSessionId,
          files: filesToSend,
        });

        const aiMsg: ChatMessageDto = {
          id: Date.now() + 1,
          role: "ASSISTANT",
          content: response.data as string,
          createdAt: new Date().toISOString(),
          createdBy: "assistant",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
        await loadSessions();
        return;
      }

      const aiMsgId = Date.now() + 1;
      const aiMsg: ChatMessageDto = {
        id: aiMsgId,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
        createdBy: "assistant",
      };
      setMessages((prev) => [...prev, aiMsg]);

      let fullContent = "";
      sendChatMessageStream(
        { sessionId: currentSessionId, question: userMessage },
        (chunk) => {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: fullContent } : m
            )
          );
        },
        async () => {
          setIsLoading(false);
          await loadSessions();
        },
        async (error) => {
          console.error("Streaming error, falling back:", error);
          setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));

          try {
            const response = await sendChatMessage({
              question: userMessage,
              sessionId: currentSessionId!,
            });
            const fallbackMsg: ChatMessageDto = {
              id: Date.now() + 2,
              role: "ASSISTANT",
              content: response.data as string,
              createdAt: new Date().toISOString(),
              createdBy: "assistant",
            };
            setMessages((prev) => [...prev, fallbackMsg]);
          } catch (fallbackError) {
            toast.error("Không thể gửi tin nhắn. Vui lòng thử lại");
          }
          setIsLoading(false);
          await loadSessions();
        }
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể gửi tin nhắn. Vui lòng thử lại",
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== userMsg.id));
      setInputMessage(userMessage);
      setSelectedFiles(filesToSend);
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
      <Card className="hidden md:flex w-80 flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 shadow-none rounded-none md:rounded-l-xl bg-white">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-bold text-gray-800">Lịch sử</CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 text-gray-500 rounded-lg hover:bg-gray-100"
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleCreateSession}
                disabled={isCreatingSession}
                className="h-8 bg-orange-600 text-white hover:bg-orange-700 px-3 text-xs font-semibold rounded-lg shadow-sm"
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
          {/* Settings Menu - Restored Inline UX */}
          {showSettings && (
            <div className="shrink-0 border-b bg-gray-50 p-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-bold text-gray-700">Quản lý lịch sử</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
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
                  className="w-full text-xs font-bold rounded-lg shadow-sm"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Xóa tất cả ({sessions.length})
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bot className="mx-auto mb-2 h-12 w-12 text-gray-200" />
                <p className="font-bold text-sm">Chưa có hội thoại</p>
                <p className="text-[11px]">Bắt đầu chat ngay!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    onClick={() => setCurrentSessionId(session.sessionId)}
                    className={`group relative cursor-pointer rounded-xl px-4 py-3.5 transition-all border ${currentSessionId === session.sessionId
                        ? "border-orange-100 bg-orange-50 shadow-sm"
                        : "border-transparent hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-bold ${currentSessionId === session.sessionId ? "text-orange-900" : "text-gray-800"}`}>
                          {session.firstMessage || "Cuộc trò chuyện mới"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500 font-medium">
                          {session.lastMessage || "Chưa có tin nhắn"}
                        </p>
                        <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {session.messageCount}
                          </span>
                          <span>•</span>
                          <span>{formatDate(session.lastMessageTime)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area - Restored Native Scroller */}
      <Card className="flex-1 flex flex-col shadow-sm border-0 bg-white overflow-hidden md:rounded-r-xl">
        <CardHeader className="border-b bg-white px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
              <Bot className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">TalentBridge AI</CardTitle>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-0.5">
                <p className="text-xs font-medium text-gray-500">Trợ lý ảo hỗ trợ tìm việc & tuyển dụng</p>
                <div className="flex items-center gap-1.5 md:border-l md:pl-3 border-gray-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Trực tuyến</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600 rounded-xl">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0 bg-white relative">
          {!currentSessionId ? (
            <div className="flex flex-1 items-center justify-center bg-gray-50/30">
              <div className="text-center max-w-sm px-6">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 shadow-inner">
                  <Bot className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng trợ giúp bạn!</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Chọn một cuộc trò chuyện từ lịch sử hoặc bắt đầu một cuộc trò chuyện mới để hỏi về công việc, CV hoặc tuyển dụng.</p>
                <Button
                  onClick={handleCreateSession}
                  className="mt-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 shadow-md transition-all hover:scale-105"
                >
                  Bắt đầu ngay
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area - Native Scroller with Smart Logic */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-white scroll-smooth scrollbar-thin scrollbar-thumb-gray-100"
              >
                <div className="flex flex-col min-h-full px-4 md:px-8 py-8">
                  <div className="mx-auto w-full max-w-4xl space-y-8">
                    {isLoading && messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
                        <p className="text-sm text-gray-400 font-medium">Đang tải tin nhắn...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50">
                          <Bot className="h-10 w-10 text-orange-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Cửa sổ chat trống</h4>
                        <p className="text-sm text-gray-500">Hãy đặt câu hỏi đầu tiên của bạn cho TalentBridge AI!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.role === "USER" ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div className={`flex max-w-[85%] flex-col ${message.role === "USER" ? "items-end ml-auto" : "items-start"}`}>
                              <div
                                className={`rounded-2xl px-5 py-3.5 shadow-sm border ${message.role === "USER"
                                    ? "bg-orange-600 text-white border-orange-500 rounded-br-none"
                                    : "bg-gray-50 border-gray-100 text-gray-800 rounded-bl-none"
                                  }`}
                              >
                                <div className="text-[15px] font-medium leading-relaxed">
                                  {renderMessageContent(message.content)}
                                </div>

                                {/* File Attachments */}
                                {message.attachmentUrls && message.attachmentUrls.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {message.attachmentUrls.map((url, idx) => {
                                      const type = (message.attachmentTypes?.[idx] || "").trim().toLowerCase();
                                      const isImage = type.startsWith("image/") ||
                                        url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ||
                                        url.startsWith("blob:");

                                      return isImage ? (
                                        <div key={idx} className="relative mt-1 group shrink-0">
                                          <img
                                            src={url}
                                            alt={`attachment-${idx}`}
                                            className="max-w-[240px] rounded-xl border-2 border-white/50 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                                            style={{ maxHeight: "180px", objectFit: "cover" }}
                                            onClick={() => window.open(url, "_blank")}
                                          />
                                        </div>
                                      ) : (
                                        <a
                                          key={idx}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${message.role === "USER"
                                            ? "bg-orange-700/50 hover:bg-orange-800/50 text-white"
                                            : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                                            }`}
                                        >
                                          <FileText className="h-4 w-4" />
                                          <span className="truncate max-w-[150px]">
                                            {type.includes("pdf") ? "Tài liệu PDF" : "Tài liệu"} {idx + 1}
                                          </span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <span className="mt-1.5 px-1 text-[10px] font-bold text-gray-400 uppercase">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {isLoading && messages.length > 0 && (
                          <div className="flex justify-start animate-in fade-in zoom-in-95 duration-200">
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 shadow-sm">
                              <div className="flex gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce"></span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex-none border-t border-gray-200 bg-white p-4 md:p-6 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                <div className="mx-auto max-w-4xl">
                  {/* File Preview Area */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4 flex gap-3 overflow-x-auto pb-4 px-2">
                      {selectedFiles.map((file, idx) => {
                        const isImage = file.type.startsWith("image/");
                        const fileUrl = URL.createObjectURL(file);

                        return (
                          <div key={idx} className="relative group shrink-0">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={file.name}
                                className="h-20 w-20 rounded-xl object-cover shadow-md border-2 border-white"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-xl bg-orange-50 border-2 border-white shadow-md flex flex-col items-center justify-center p-2">
                                <FileText className="h-8 w-8 text-orange-500 mb-1" />
                                <span className="text-[10px] font-bold text-orange-900 truncate w-full text-center">{file.name}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm transition-all hover:scale-110 z-10"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
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
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || selectedFiles.length >= 5}
                      className="h-12 w-12 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-all shadow-inner border border-transparent hover:border-orange-100 flex-shrink-0"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    <div className="relative flex-1 group">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Đặt câu hỏi về sự nghiệp, CV hoặc tuyển dụng..."
                        disabled={isLoading}
                        className="w-full rounded-2xl border-gray-200 bg-gray-50 px-5 py-6 text-sm shadow-inner focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          type="submit"
                          disabled={isLoading || !inputMessage.trim()}
                          className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md disabled:bg-gray-200 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Gửi</span>
                              <Send className="h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                  <p className="mt-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    TalentBridge AI có thể mắc lỗi. Vui lòng kiểm tra các thông tin quan trọng.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
