"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getChatSessionsOptions,
  getChatSessionByIdMessagesOptions,
} from "@/queries/@tanstack/react-query.gen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SendIcon, SearchIcon, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthenticationService from "@/services/tokenService";

export default function SupportChat() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = AuthenticationService.getUser();

  const { data: sessions, isFetching: loadingSessions } = useQuery({
    ...getChatSessionsOptions(),
  });

  const activeId = selectedId ?? sessions?.[0]?.id ?? null;

  const { data: messages, isFetching: loadingMessages } = useQuery({
    ...getChatSessionByIdMessagesOptions({
      path: { id: activeId! },
    }),
    enabled: !!activeId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedSession = sessions?.find((s) => s.id === activeId);
  const otherMemberName =
    selectedSession?.members?.find((m) => m.userId !== user?.id)?.user
      ?.name ?? "Unknown";

  function handleSend() {
    if (!message.trim()) return;
    // Message send will be wired when the API endpoint is available
    setMessage("");
  }

  return (
    <div className="flex h-full overflow-hidden rounded-lg border">
      {/* Conversation list */}
      <div className="flex w-80 shrink-0 flex-col border-r bg-muted/20">
        <div className="border-b p-3">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => {
              const member = session.members?.find(
                (m) => m.userId !== user?.id,
              );
              const name = member?.user?.name ?? "Unknown";
              const lastMsg = session.lastMessage?.message ?? "No messages yet";
              const time = session.lastMessage?.createdat
                ? new Date(session.lastMessage.createdat).toLocaleDateString()
                : "";
              const unread =
                session.lastMessage &&
                !session.lastMessage.read &&
                session.lastMessage.senderId !== user?.id;

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedId(session.id ?? null)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b p-3 text-left text-sm transition-colors hover:bg-accent",
                    activeId === session.id && "bg-accent",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-1 flex-1 text-xs text-muted-foreground">
                      {lastMsg}
                    </span>
                    {unread && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <MessageSquare className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {selectedSession ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {otherMemberName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{otherMemberName}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedSession.members?.length ?? 0} members
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
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
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
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
                        </p>
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

            {/* Message input */}
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
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim()}
                >
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
