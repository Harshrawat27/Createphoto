"use client";

import { MoreHorizontal, Trash2, Edit2, Play, Sparkles, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Model {
  id: string;
  name: string;
  type: "Man" | "Woman" | "Person" | "Style";
  status: "Ready" | "Training" | "Failed";
  thumbnailUrl: string;
  createdAt: string;
  progress?: number; // 0-100 for training
}

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Thumbnail / Status Overlay */}
      <div className="aspect-square relative bg-secondary/30">
        <img
            src={model.thumbnailUrl}
            alt={model.name}
            className={cn(
                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                model.status !== "Ready" && "opacity-50 blur-sm"
            )}
        />
        
        {/* Status Indicators */}
        <div className="absolute inset-0 flex items-center justify-center">
            {model.status === "Training" && (
                <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-primary" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * (model.progress || 0)) / 100} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                            {model.progress}%
                        </div>
                    </div>
                    <span className="text-xs font-bold bg-background/80 px-2 py-1 rounded-full backdrop-blur">Training...</span>
                </div>
            )}
            
            {model.status === "Failed" && (
                <div className="flex flex-col items-center gap-2 text-red-500">
                    <AlertCircle className="w-8 h-8" />
                    <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full backdrop-blur">Training Failed</span>
                </div>
            )}
        </div>

        {/* Top Right Menu */}
        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-foreground truncate">{model.name}</h3>
                <p className="text-xs text-muted-foreground">{model.type} • {model.createdAt}</p>
            </div>
            {model.status === "Ready" && (
                <div className="bg-green-500/10 text-green-500 p-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
            {model.status === "Ready" ? (
                <Link href={`/dashboard/create?model=${model.id}`} className="flex-1">
                    <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                        <Play className="w-3 h-3" /> Use Model
                    </button>
                </Link>
            ) : (
                <button disabled className="w-full py-2 bg-secondary text-muted-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                    <Clock className="w-3 h-3" /> Processing
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
