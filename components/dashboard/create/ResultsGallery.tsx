"use client";

import { Download, Share2, Maximize2, MoreHorizontal } from "lucide-react";

// Mock data for initial view
const generatedImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60", prompt: "Professional headshot in studio lighting" },
  { id: 2, url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60", prompt: "Cyberpunk style portrait, neon lights" },
  { id: 3, url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60", prompt: "Casual candid photo at a cafe" },
  { id: 4, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60", prompt: "Business executive speaking at conference" },
];

export function ResultsGallery() {
  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Recent Generations</h2>
        <div className="flex gap-2">
            <button className="text-sm text-muted-foreground hover:text-foreground">Clear All</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder for loading state */}
        {/* <div className="aspect-[2/3] rounded-xl bg-secondary animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div> */}

        {generatedImages.map((img) => (
          <div key={img.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary/20 border border-border">
            <img 
                src={img.url} 
                alt={img.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs line-clamp-2 mb-3 opacity-90">{img.prompt}</p>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors" title="Expand">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors ml-auto" title="More">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
