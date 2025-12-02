"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MessageSquare, Send, User, Bot, MessageSquareText, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext"; // Import useAuth
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  contact_name: string;
  contact_number: string;
  last_activity: string;
  status: "En cours" | "Clôturé" | "Non-répondu";
  unread_messages: number;
  instance_id: string; // Added instance_id
  user_id: string; // Added user_id
}

interface Message {
  id: string;
  conversation_id: string;
  sender: "client" | "ai";
  text: string;
  timestamp: string;
  evolution_message_id: string;
}

export default function ChatHistoryPage() {
  const { userId, loading: authLoading } = useAuth(); // Use AuthContext
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last_activity");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [manualNote, setManualNote] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  const router = useRouter();

  const fetchConversations = useCallback(async () => {
    if (authLoading || !userId) {
      setLoadingConversations(true);
      return;
    }

    setLoadingConversations(true);
    try {
      const response = await fetch(`/api/chat-history/conversations`); // userId is now handled by API route
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erreur lors du chargement des conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, [userId, authLoading]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat-history/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat-history/conversations/${conversationId}/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update the local state to reflect 0 unread messages
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unread_messages: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      toast.error("Erreur lors de la mise à jour du statut de lecture.");
    }
  }, []);

  useEffect(() => {
    if (!authLoading && userId) {
      fetchConversations();
    }
  }, [fetchConversations, authLoading, userId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      if (selectedConversation.unread_messages > 0) {
        markConversationAsRead(selectedConversation.id);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages, markConversationAsRead]);

  const filteredAndSortedConversations = conversations
    .filter((conv) => {
      const matchesSearch = conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conv.contact_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || conv.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by last_activity (most recent first)
      if (sortBy === "last_activity") {
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      }
      // Add other sorting logic if needed
      return 0;
    });

  const handleAddNote = async () => {
    if (manualNote.trim() && selectedConversation) {
      setSendingNote(true);
      try {
        // In a real app, you'd send this note to your backend to be stored
        // For now, we'll simulate it and add it as a local message from 'ai'
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const newNoteMessage: Message = {
          id: `note-${Date.now()}`,
          conversation_id: selectedConversation.id,
          sender: "ai", // Assuming manual notes are from the AI/agent
          text: `[Note Manuelle]: ${manualNote}`,
          timestamp: new Date().toISOString(),
          evolution_message_id: `manual-note-${Date.now()}`
        };
        setMessages(prev => [...prev, newNoteMessage]);
        toast.success(`Note ajoutée à la conversation avec ${selectedConversation.contact_name}`);
        setManualNote("");
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error("Erreur lors de l'ajout de la note.");
      } finally {
        setSendingNote(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement de l'utilisateur...</p>
      </div>
    );
  }

  if (!userId) {
    router.push('/login'); // Redirect to login if not authenticated
    return null;
  }

  return (
    <div className="p-8 h-full">
      <h1 className="text-3xl font-bold mb-6">Historique des Chats 💬</h1>
      <p className="mb-6 text-muted-foreground">
        Journal détaillé de toutes les conversations de votre bot.
      </p>

      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[700px] rounded-lg border"
      >
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="flex h-full flex-col">
            <CardHeader className="border-b p-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" /> Vos Contacts Récents
              </CardTitle>
            </CardHeader>
            <div className="p-4 space-y-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un contact..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Clôturé">Clôturé</SelectItem>
                    <SelectItem value="Non-répondu">Non-répondu</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_activity">Dernière activité</SelectItem>
                    {/* Add more sort options if needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <CardContent className="p-0">
                {loadingConversations ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Chargement des conversations...</p>
                  </div>
                ) : filteredAndSortedConversations.length > 0 ? (
                  filteredAndSortedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div>
                        <p className="font-medium">{conv.contact_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conv.last_activity).toLocaleString("fr-FR", {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            conv.status === "En cours"
                              ? "bg-synapse-primary hover:bg-synapse-primary/90 text-white"
                              : conv.status === "Clôturé"
                              ? "bg-gray-500 hover:bg-gray-500/90 text-white"
                              : "bg-orange-500 hover:bg-orange-500/90 text-white"
                          }
                        >
                          {conv.status}
                        </Badge>
                        {conv.unread_messages > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-500/90 text-white">
                            {conv.unread_messages}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-muted-foreground">Aucune conversation trouvée.</p>
                )}
              </CardContent>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <div className="flex h-full flex-col">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg">
                {selectedConversation ? `Conversation avec ${selectedConversation.contact_name}` : "Sélectionnez une conversation"}
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {selectedConversation ? (
                loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Chargement des messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "client" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[70%] p-3 rounded-lg ${
                            message.sender === "client"
                              ? "bg-muted text-foreground"
                              : "bg-synapse-primary text-white"
                          }`}
                        >
                          {message.sender === "client" && <User className="h-5 w-5 flex-shrink-0" />}
                          <div>
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.sender === "client" ? "text-muted-foreground" : "text-white/80"}`}>
                              {new Date(message.timestamp).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {message.sender === "ai" && <Bot className="h-5 w-5 flex-shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Aucun message dans cette conversation.</p>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <MessageSquareText className="mr-2 h-5 w-5" />
                  <span>Sélectionnez une conversation pour voir l'historique.</span>
                </div>
              )}
            </ScrollArea>
            {selectedConversation && (
              <div className="border-t p-4 flex flex-col gap-2">
                <Textarea
                  placeholder="Ajouter une note manuelle..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={handleAddNote} disabled={!manualNote.trim() || sendingNote}>
                  {sendingNote ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout de la note...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Ajouter Note
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}