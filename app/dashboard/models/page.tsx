"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Model, ModelCard } from "@/components/dashboard/models/ModelCard";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchModels, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models");
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setLoading(false);
    }
  };
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
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
