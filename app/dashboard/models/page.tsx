import { Plus } from "lucide-react";
import Link from "next/link";
import { Model, ModelCard } from "@/components/dashboard/models/ModelCard";

// Mock Data
const models: Model[] = [
  {
    id: "m1",
    name: "My Professional Self",
    type: "Man",
    status: "Ready",
    thumbnailUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80",
    createdAt: "2 days ago"
  },
  {
    id: "m2",
    name: "Cyberpunk Avatar",
    type: "Style",
    status: "Training",
    thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop&q=80",
    createdAt: "Just now",
    progress: 45
  },
  {
    id: "m3",
    name: "Instagram Influencer V2",
    type: "Woman",
    status: "Ready",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
    createdAt: "1 week ago"
  },
  {
    id: "m4",
    name: "Failed Test Run",
    type: "Person",
    status: "Failed",
    thumbnailUrl: "https://images.unsplash.com/photo-1590086782957-93c06ef51608?w=400&h=400&fit=crop&q=80",
    createdAt: "1 month ago"
  }
];

export default function ModelsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Models</h1>
          <p className="text-muted-foreground">Manage your fine-tuned AI models.</p>
        </div>
        
        <Link href="/dashboard/models/train">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20 button-highlighted-shadow hover:translate-y-[-1px]">
                <Plus className="w-5 h-5" />
                Train New Model
            </button>
        </Link>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
            <ModelCard key={model.id} model={model} />
        ))}
        
        {/* Placeholder 'Add New' Card */}
        <Link href="/dashboard/models/train" className="group flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl aspect-[3/4] hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors mb-4">
                <Plus className="w-8 h-8" />
            </div>
            <p className="font-bold text-lg">Train New Model</p>
            <p className="text-sm text-muted-foreground">Create a new digital persona</p>
        </Link>
      </div>
    </div>
  );
}
