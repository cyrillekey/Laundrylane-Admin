"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatSessionByIdMessagesOptions,
  postChatSessionMutation,
  getChatSessionsQueryKey,
  getChatSessionByIdMessagesQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  SendIcon,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWebSocket, SocketState } from "@/hooks/use-websocket";
import AuthenticationService from "@/services/tokenService";
import sharedValues from "@/utils/sharedValues";
import { ChatSidebar } from "@/container/support/chat-sidebar";
import { GetChatSessionByIdMessagesResponse } from "@/queries";
import { Input } from "@/components/ui/input";

type ServerChatMessage = GetChatSessionByIdMessagesResponse[0];
interface ChatMessage extends ServerChatMessage {
  temp?: boolean;
}

export default function SupportChat() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("conversations");
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = AuthenticationService.getUser();
  const queryClient = useQueryClient();

  const { mutateAsync: createSession, isPending: creatingSession } =
    useMutation({
      ...postChatSessionMutation(),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: getChatSessionsQueryKey(),
        });
        if (data?.id) {
          setSelectedId(data.id);
          setTab("conversations");
        }
      },
      onError: (error) => {
        toast.error("Error!", {
          description:
            (error as Error)?.message || "Failed to start conversation",
        });
      },
    });

  const { data: initialMessages, isLoading: loadingMessages } = useQuery({
    ...getChatSessionByIdMessagesOptions({
      path: { id: selectedId! },
    }),
    enabled: !!selectedId,
  });

  const token = AuthenticationService.getToken();
  const baseUrl = sharedValues.baseUrl.replace(/^http/, "ws");
  const wsUrl =
    selectedId && token
      ? `${baseUrl}/chat/websocket/${selectedId}?authToken=${token}`
      : null;

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as ChatMessage;
    if (msg && msg.id) {
      queryClient.setQueriesData(
        getChatSessionByIdMessagesOptions({ path: { id: selectedId! } }),
        (prev: ChatMessage[] = []) => [...prev, msg],
      );
      queryClient.invalidateQueries({
        queryKey: getChatSessionsQueryKey(),
      });
      // TODO : fix receiving messages by appending to queryclient data
      // setLiveMessages((prev) => {
      //   if (prev.some((m) => m.id === msg.id)) return prev;
      //   return [...prev, msg];
      // });
    }
  }, []);

  const { send: wsSend, socketState } = useWebSocket({
    url: wsUrl!,
    onMessageReceived: handleWsMessage,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages]);

  const otherMemberName = "Unknown";

  const allMessages = [...(initialMessages ?? [])] as ChatMessage[];

  function handleSend() {
    if (!message.trim()) return;
    wsSend(
      JSON.stringify({
        message: message.trim(),
        senderId: user?.id,
      }),
    );
    setMessage("");
    // TODO: fix sending messages by appending to queryclient data
    queryClient.setQueriesData(
      getChatSessionByIdMessagesOptions({
        path: { id: selectedId! },
      }),
      (prev: ChatMessage[] = []) => [
        ...prev,
        {
          message,
          senderId: user!.id!,
          chatsessionId: selectedId!,
          read: false,
          createdat: new Date().toISOString(),
          id: prev.length + 1,
          temp: true,
        } satisfies ChatMessage,
      ],
    );
    queryClient.invalidateQueries({
      queryKey: getChatSessionByIdMessagesQueryKey({ path: { id: selectedId! } }),
    });
    queryClient.invalidateQueries({
      queryKey: getChatSessionsQueryKey(),
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleStartChat(customerId: number) {
    await createSession({ body: { receiverId: customerId } });
  }

  return (
    <div className="flex h-full overflow-hidden rounded-lg border">
      <ChatSidebar
        tab={tab}
        onTabChange={setTab}
        activeId={selectedId}
        onSelectSession={(id) => setSelectedId(id)}        
        creatingSession={creatingSession}
        onStartChat={handleStartChat}

      />

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* TODO : add header */}
        {selectedId != null ? (
          <>
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {otherMemberName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{otherMemberName}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      socketState === SocketState.OPEN && "bg-green-500",
                      socketState === SocketState.CONNECTING && "bg-amber-500",
                      (socketState === SocketState.CLOSED || socketState === SocketState.CLOSING) && "bg-red-500",
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    {socketState === SocketState.OPEN && "Connected"}
                    {socketState === SocketState.CONNECTING && "Connecting..."}
                    {socketState === SocketState.CLOSED && "Disconnected"}
                    {socketState === SocketState.CLOSING && "Closing..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages && allMessages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : allMessages.length > 0 ? (
                allMessages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  const temp = "temp" in msg && msg.temp;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isMine ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm space-y-1",
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <p>{msg.message}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            isMine ? "justify-end" : "justify-start",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs",
                              isMine
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {msg.createdat
                              ? new Date(msg.createdat).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                          {isMine && (
                            <span className="inline-flex">
                              {temp ? (
                                <Clock className="size-3 animate-pulse" />
                              ) : msg.read ? (
                                <CheckCheck className="size-3.5" />
                              ) : (
                                <Check className="size-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No messages yet
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <SendIcon className="size-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
