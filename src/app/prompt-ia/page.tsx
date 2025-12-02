export default function PromptIaPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Prompt & IA 🧠</h1>
      <p>C'est ici que l'utilisateur configure son IA.</p>
      <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Configuration de l'IA</h2>
        <p className="text-muted-foreground">
          Des options pour personnaliser le comportement de l'IA seront disponibles ici.
        </p>
      </div>
    </div>
  );
}