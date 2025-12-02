export default function ChatHistoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Historique des Chats 💬</h1>
      <p>Journal des conversations avec le bot.</p>
      <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Historique des Conversations</h2>
        <p className="text-muted-foreground">
          Les conversations passées avec le bot seront affichées ici.
        </p>
      </div>
    </div>
  );
}