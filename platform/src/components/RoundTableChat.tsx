import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Bot, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  table_id: string;
  user_id: string;
  message: string;
  message_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const SYSTEM_TYPES = ["system", "bounty_update", "status_change"];

export function RoundTableChat({ tableId }: { tableId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["round-table-messages", tableId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("round_table_messages" as never)
        .select("*")
        .eq("table_id", tableId)
        .order("created_at", { ascending: true })
        .limit(200) as { data: ChatMessage[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!tableId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`rtm-${tableId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "round_table_messages",
          filter: `table_id=eq.${tableId}`,
        } as never,
        (payload: { new: ChatMessage }) => {
          queryClient.setQueryData(
            ["round-table-messages", tableId],
            (old: ChatMessage[] | undefined) => [...(old || []), payload.new]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (msg: string) => {
      const { error } = await supabase
        .from("round_table_messages" as never)
        .insert({
          table_id: tableId,
          user_id: user!.id,
          message: msg,
          message_type: "text",
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      setInput("");
      inputRef.current?.focus();
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="flex items-center gap-2 p-3 border-b">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Table Chat</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {messages.length} msg{messages.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = SYSTEM_TYPES.includes(msg.message_type);
            const isOwn = msg.user_id === user?.id;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex items-center justify-center gap-2 py-1">
                  <Bot className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground italic">{msg.message}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[85%]", isOwn ? "ml-auto items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={!user}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending || !user}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
