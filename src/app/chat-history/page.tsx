"use client";

import React, { useState } from "react";
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
import { Search, MessageSquare, Send, User, Bot, MessageSquareText } from "lucide-react"; // Added MessageSquareText
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Added toast import

interface Conversation {
  id: string;
  contactName: string;
  lastActivity: string;
  status: "En cours" | "Clôturé" | "Non-répondu";
  unreadMessages: number;
}

interface Message {
  id: string;
  sender: "client" | "ai";
  text: string;
  timestamp: string;
}

// NOTE: These mock conversations and messages are currently simulated.
// To make them "real", you would need to implement a backend API endpoint
// (e.g., /api/user/conversations and /api/user/conversations/{id}/messages)
// that queries your Supabase `public.chat_messages` table and potentially
// other tables (like `public.users` for contact names) to provide this data.
const mockConversations: Conversation[] = [
  { id: "conv-001", contactName: "Alice Dupont", lastActivity: "Il y a 5 min", status: "En cours", unreadMessages: 2 },
  { id: "conv-002", contactName: "Bob Martin", lastActivity: "Il y a 1h", status: "Clôturé", unreadMessages: 0 },
  { id: "conv-003", contactName: "Charlie Leblanc", lastActivity: "Hier", status: "Non-répondu", unreadMessages: 1 },
  { id: "conv-004", contactName: "Diana Rousseau", lastActivity: "2 jours", status: "En cours", unreadMessages: 0 },
  { id: "conv-005", contactName: "Eve Dubois", lastActivity: "3 jours", status: "Clôturé", unreadMessages: 0 },
  { id: "conv-006", contactName: "Frank Thomas", lastActivity: "4 jours", status: "En cours", unreadMessages: 0 },
  { id: "conv-007", contactName: "Grace Petit", lastActivity: "5 jours", status: "Non-répondu", unreadMessages: 0 },
  { id: "conv-008", contactName: "Heidi Leroy", lastActivity: "6 jours", status: "En cours", unreadMessages: 0 },
  { id: "conv-009", contactName: "Ivan Moreau", lastActivity: "1 semaine", status: "Clôturé", unreadMessages: 0 },
  { id: "conv-010", contactName: "Julia Simon", lastActivity: "1 semaine", status: "En cours", unreadMessages: 0 },
];

const mockMessages: Record<string, Message[]> = {
  "conv-001": [
    { id: "msg1", sender: "client", text: "Bonjour, j'ai une question sur mon abonnement.", timestamp: "14:25" },
    { id: "msg2", sender: "ai", text: "Bonjour Alice ! Je suis l'assistant IA de Synapse. Comment puis-je vous aider concernant votre abonnement ?", timestamp: "14:26" },
    { id: "msg3", sender: "client", text: "Je voudrais savoir comment modifier mon plan.", timestamp: "14:28" },
    { id: "msg4", sender: "ai", text: "Pour modifier votre plan, vous pouvez vous rendre dans la section 'Facturation' de votre tableau de bord. Vous y trouverez les options de mise à niveau ou de rétrogradation.", timestamp: "14:29" },
    { id: "msg5", sender: "client", text: "Merci ! Et si j'ai besoin d'aide supplémentaire ?", timestamp: "14:30" },
  ],
  "conv-003": [
    { id: "msg6", sender: "client", text: "Salut, mon bot ne répond plus.", timestamp: "Hier 10:00" },
  ],
  // Add more mock messages for other conversations as needed
};

export default function ChatHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastActivity");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [manualNote, setManualNote] = useState("");

  const filteredAndSortedConversations = mockConversations
    .filter((conv) => {
      const matchesSearch = conv.contactName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || conv.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Simple sorting for mock data, can be expanded for real dates
      if (sortBy === "lastActivity") {
        return a.lastActivity.localeCompare(b.lastActivity);
      }
      // Add other sorting logic if needed
      return 0;
    });

  const handleAddNote = () => {
    if (manualNote.trim() && selectedConversation) {
      toast.success(`Note ajoutée à la conversation avec ${selectedConversation.contactName}`);
      setManualNote("");
      // In a real app, you'd send this note to your backend
    }
  };

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
                    <SelectItem value="lastActivity">Dernière activité</SelectItem>
                    {/* Add more sort options if needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <CardContent className="p-0">
                {filteredAndSortedConversations.length > 0 ? (
                  filteredAndSortedConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div>
                        <p className="font-medium">{conv.contactName}</p>
                        <p className="text-sm text-muted-foreground">{conv.lastActivity}</p>
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
                        {conv.unreadMessages > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-500/90 text-white">
                            {conv.unreadMessages}
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
                {selectedConversation ? `Conversation avec ${selectedConversation.contactName}` : "Sélectionnez une conversation"}
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {selectedConversation ? (
                <div className="space-y-4">
                  {mockMessages[selectedConversation.id]?.length > 0 ? (
                    mockMessages[selectedConversation.id].map((message) => (
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
                              {message.timestamp}
                            </p>
                          </div>
                          {message.sender === "ai" && <Bot className="h-5 w-5 flex-shrink-0" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">Aucun message dans cette conversation.</p>
                  )}
                </div>
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
                <Button onClick={handleAddNote} disabled={!manualNote.trim()}>
                  <Send className="mr-2 h-4 w-4" /> Ajouter Note
                </Button>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}