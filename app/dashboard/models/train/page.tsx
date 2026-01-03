"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Info, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrainModelPage() {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("man");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/models" className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
            <h1 className="text-2xl font-heading font-bold">Train New Model</h1>
            <p className="text-muted-foreground">Create a custom AI model of a person.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1: Model Details */}
        <div className="space-y-4 p-6 border border-border rounded-xl bg-card">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                Model Details
            </h2>
            
            <div className="grid gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Model Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g., My Professional Headshots" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Type</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['man', 'woman', 'person'].map((type) => (
                            <div 
                                key={type}
                                onClick={() => setModelType(type)}
                                className={cn(
                                    "cursor-pointer border rounded-lg p-4 text-center capitalize transition-all hover:bg-secondary/50",
                                    modelType === type ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-border"
                                )}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Step 2: Upload Photos */}
        <div className="space-y-4 p-6 border border-border rounded-xl bg-card">
            <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                    Upload Photos (10-20)
                </h2>
                <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">
                    {uploadedFiles.length} / 20 selected
                </span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-600 dark:text-blue-400">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>
                    For best results, upload close-ups, half-body, and full-body shots with different lighting, backgrounds, and angles. No sunglasses or hats.
                </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <label className="aspect-square border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-medium">Add Photos</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>

                {uploadedFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-secondary">
                        <img src={URL.createObjectURL(file)} alt="Upload preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => removeFile(i)}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between p-6 border border-primary/20 bg-primary/5 rounded-xl">
            <div>
                <p className="font-bold">Cost: 100 Credits</p>
                <p className="text-sm text-muted-foreground">You have 150 credits remaining</p>
            </div>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium shadow-lg shadow-primary/20 button-highlighted-shadow flex items-center gap-2">
                <Check className="w-5 h-5" />
                Start Training
            </button>
        </div>
      </div>
    </div>
  );
}
