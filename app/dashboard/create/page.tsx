"use client";

import { useState } from "react";
import { CreationControls } from "@/components/dashboard/create/CreationControls";
import { ResultsGallery } from "@/components/dashboard/create/ResultsGallery";

export default function CreatePage() {
  const [newImages, setNewImages] = useState<any[]>([]);

  const handleGenerate = (images: any[]) => {
    setNewImages(images);
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden">
      {/* Left Panel: Controls */}
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-border bg-card h-full flex-shrink-0">
        <CreationControls onGenerate={handleGenerate} />
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 bg-secondary/10 h-full">
        <ResultsGallery newImages={newImages} />
      </div>
    </div>
  );
}
