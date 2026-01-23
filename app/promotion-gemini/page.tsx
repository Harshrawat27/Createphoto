"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Camera, Zap, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PromotionPage() {
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [beat, setBeat] = useState(0);
  const [muted, setMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // BPM-based timing: 128 BPM = ~468ms per beat
  const BEAT_MS = 468;

  const playSynth = useCallback((freq: number, type: "sine" | "square" | "sawtooth", duration: number, vol: number = 0.1) => {
    if (muted || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [muted]);

  const playKick = useCallback(() => {
    if (muted || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [muted]);

  const playHiHat = useCallback(() => {
     // Simple noise burst usually, but high freq square for now
    playSynth(8000, "square", 0.05, 0.05);
  }, [playSynth]);

  useEffect(() => {
    if (!started) return;

    // Initialize Audio
    if (!audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) {
        audioContextRef.current = new AudioContextConstructor();
      }
    }

    const startTime = Date.now();
    let beatCount = 0;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentBeat = Math.floor(elapsed / BEAT_MS);
      
      if (currentBeat > beatCount) {
        beatCount = currentBeat;
        setBeat(beatCount % 4); // 0, 1, 2, 3
        
        // Music Logic
        if (beatCount % 4 === 0) playKick();
        if (beatCount % 2 === 0) playHiHat();
        if (beatCount % 8 === 0) playSynth(440, "sawtooth", 0.2, 0.1); // Bass note
      }

      // Scene Logic (Fast paced!)
      // 0-4 beats: Intro (~2s)
      // 4-12 beats: Tunnel/Images (~4s)
      // 12-20 beats: Features (~4s)
      // 20-28 beats: 3D Showcase (~4s)
      // 28+ beats: CTA
      
      if (beatCount < 4) setScene(0);
      else if (beatCount < 12) setScene(1);
      else if (beatCount < 20) setScene(2);
      else if (beatCount < 28) setScene(3);
      else setScene(4);

      if (beatCount > 40) { // Loop or end
         // clearInterval(interval); 
      }
      
    }, 20);

    return () => clearInterval(interval);
  }, [started, muted, playKick, playHiHat, playSynth]);


  if (!started) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors" onClick={() => setStarted(true)}>
        <Sparkles className="w-16 h-16 text-primary animate-pulse mb-6" />
        <h1 className="text-4xl font-bold mb-4">Ready for the Experience?</h1>
        <p className="text-muted-foreground mb-8">Turn up your volume. Click anywhere to start.</p>
        <button className="px-8 py-3 bg-primary rounded-full font-bold text-lg animate-bounce">
          LAUNCH
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans relative perspective-1000">
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        
        @keyframes tunnel {
            0% { transform: translateZ(-2000px) rotate(0deg); }
            100% { transform: translateZ(500px) rotate(45deg); }
        }
        @keyframes tunnel-move {
            0% { transform: translateZ(-1000px) rotateZ(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateZ(1000px) rotateZ(45deg); opacity: 0; }
        }
        @keyframes float-3d {
            0% { transform: translateZ(0) translateY(0) rotateX(0); }
            50% { transform: translateZ(100px) translateY(-20px) rotateX(5deg); }
            100% { transform: translateZ(0) translateY(0) rotateX(0); }
        }
        @keyframes spin-3d {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
        }
        @keyframes glitch {
           0% { clip-path: inset(0 0 0 0); transform: translate(0); }
           20% { clip-path: inset(20% 0 0 0); transform: translate(-2px); }
           40% { clip-path: inset(40% 0 20% 0); transform: translate(2px); }
           60% { clip-path: inset(0 20% 0 20%); transform: translate(-2px); }
           100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }
        
        .beat-pulse { transform: scale(1.05); transition: transform 0.05s; }
        .beat-pulse-off { transform: scale(1); transition: transform 0.2s; }
      `}</style>

      {/* Audio Controls */}
      <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} className="absolute top-4 right-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20">
        {muted ? <VolumeX /> : <Volume2 className={beat % 2 === 0 ? "text-primary" : "text-white"} />}
      </button>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 z-0">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_translateZ(-200px)] animate-[tunnel_20s_linear_infinite]" />
      </div>

      {/* SCENE 0: INTRO (High Energy) */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 transform-style-3d", scene === 0 ? "opacity-100 scale-100" : "opacity-0 scale-[5] pointer-events-none")}>
        <div className={cn("relative mb-8", beat % 2 === 0 ? "scale-125" : "scale-100", "transition-transform duration-75")}>
             <div className="absolute inset-0 bg-primary blur-[60px] opacity-50" />
             <Image src="/logo.png" alt="Logo" width={150} height={150} className="relative z-10 invert brightness-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        </div>
        <h1 className="text-8xl font-black tracking-tighter uppercase italic transform -skew-x-12">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-[gradient_2s_linear_infinite]">PicLore</span>
          <span className="block text-white text-4xl tracking-[1rem] mt-2">AI ENGINE</span>
        </h1>
      </div>

      {/* SCENE 1: TUNNEL / VELOCITY */}
      <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300 perspective-1000", scene === 1 ? "opacity-100" : "opacity-0 pointer-events-none")}>
         <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-[60vw] h-[40vh] border-2 border-primary/30 rounded-xl overflow-hidden bg-black/50 backdrop-blur-sm"
                     style={{ 
                         animation: `tunnel-move 4s linear infinite`,
                         animationDelay: `${i * 0.8}s`
                     }}>
                    <Image src={i % 2 === 0 ? "/generated.jpg" : "/selfie-image.png"} alt="Asset" fill className="object-cover opacity-60 mix-blend-screen" />
                </div>
            ))}
            <h2 className={cn("text-6xl font-bold z-50 mix-blend-difference", beat % 4 === 0 ? "animate-[glitch_0.2s_infinite]" : "")}>
                HYPER<br/>REALISTIC
            </h2>
         </div>
      </div>

      {/* SCENE 2: FEATURES (Rapid Fire) */}
      <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-300", scene === 2 ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
            <div className={cn("bg-zinc-900/80 p-8 rounded-3xl border border-primary/20 transform transition-all duration-300", beat % 2 === 0 ? "translate-x-4 border-primary" : "-translate-x-4")}>
                <Camera className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-3xl font-bold">Studio Shoots</h3>
            </div>
             <div className={cn("bg-zinc-900/80 p-8 rounded-3xl border border-primary/20 transform transition-all duration-300", beat % 2 !== 0 ? "-translate-x-4 border-white" : "translate-x-4")}>
                <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-3xl font-bold">Instantly</h3>
            </div>
             <div className="col-span-2 text-center mt-8">
                 <div className="text-[10rem] font-black leading-none opacity-20 animate-pulse">4K</div>
                 <div className="text-4xl font-bold text-primary -mt-20 relative z-10">ULTRA DEFINITION</div>
             </div>
        </div>
      </div>

      {/* SCENE 3: 3D CAROUSEL */}
      <div className={cn("absolute inset-0 flex items-center justify-center transition-all duration-500 perspective-1000", scene === 3 ? "opacity-100" : "opacity-0 pointer-events-none")}>
         <div className="relative w-[300px] h-[400px] transform-style-3d animate-[spin-3d_8s_linear_infinite]">
            {[0, 90, 180, 270].map((deg, i) => (
                <div key={i} className="absolute inset-0 bg-gray-900 border border-white/20 rounded-xl overflow-hidden backface-visible"
                     style={{ transform: `rotateY(${deg}deg) translateZ(300px)` }}>
                    <Image src={i % 2 === 0 ? "/generated.jpg" : "/selfie-image.png"} alt="3D" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                </div>
            ))}
         </div>
         <div className="absolute bottom-20 text-center">
             <h2 className="text-5xl font-bold bg-black/50 px-6 py-2">ANY STYLE</h2>
         </div>
      </div>

      {/* SCENE 4: CTA (Explosive) */}
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 bg-primary text-black", scene === 4 ? "opacity-100" : "opacity-0 pointer-events-none")}>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" /> {/* Noise texture if available, or just generic noise */}
          
          <h1 className="text-[12vw] font-black leading-none tracking-tighter hover:scale-105 transition-transform duration-300">
              CREATE
          </h1>
          <h1 className="text-[12vw] font-black leading-none tracking-tighter text-white hover:scale-105 transition-transform duration-300">
              NOW
          </h1>
          
          <div className="mt-12 flex gap-4 z-10">
              <button onClick={() => window.location.reload()} className="px-8 py-4 bg-black text-white rounded-full font-bold text-xl hover:bg-zinc-800 transition-colors">
                  REPLAY
              </button>
              <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-xl hover:bg-zinc-200 transition-colors shadow-2xl">
                  GET STARTED
              </button>
          </div>
      </div>

      {/* Beat Indicator / Vignette Flash */}
      <div className={cn("absolute inset-0 pointer-events-none border-[20px] transition-colors duration-75", beat % 4 === 0 ? "border-primary/50" : "border-transparent")} />
    </div>
  );
}