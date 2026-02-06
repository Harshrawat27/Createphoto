'use client';

import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  Camera,
  Shirt,
  Users,
  Briefcase,
  Palette,
  Shield,
  Zap,
} from 'lucide-react';

export default function PromotionVideo() {
  const [scene, setScene] = useState(0);
  const [started, setStarted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sound effects using Web Audio API
  const playSound = useCallback(
    (
      type: 'whoosh' | 'impact' | 'rise' | 'bass' | 'glitch' | 'success',
      volume = 0.3
    ) => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const masterGain = gainNodeRef.current!;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);

      const now = ctx.currentTime;

      switch (type) {
        case 'whoosh':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          gain.gain.setValueAtTime(volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'impact':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          // Add noise for punch
          const noise = ctx.createBufferSource();
          const noiseBuffer = ctx.createBuffer(
            1,
            ctx.sampleRate * 0.1,
            ctx.sampleRate
          );
          const noiseData = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
          }
          noise.buffer = noiseBuffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.3, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          noise.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start(now);
          break;

        case 'rise':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'bass':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(60, now);
          gain.gain.setValueAtTime(volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;

        case 'glitch':
          osc.type = 'square';
          for (let i = 0; i < 5; i++) {
            osc.frequency.setValueAtTime(
              Math.random() * 1000 + 200,
              now + i * 0.02
            );
          }
          gain.gain.setValueAtTime(volume * 0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case 'success':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
          gain.gain.setValueAtTime(volume * 0.4, now);
          gain.gain.setValueAtTime(volume * 0.4, now + 0.25);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
      }
    },
    []
  );

  // Background beat
  const playBeat = useCallback(() => {
    if (!audioContextRef.current || !started) return;
    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current!;

    const kick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGain);
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    };

    kick();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const beatInterval = setInterval(playBeat, 500); // 120 BPM
    return () => clearInterval(beatInterval);
  }, [started, playBeat]);

  // Scene timeline
  useEffect(() => {
    if (!started) return;

    const timeline = [
      { time: 0, scene: 1, sound: 'impact' as const },
      { time: 2000, scene: 2, sound: 'whoosh' as const },
      { time: 3500, scene: 3, sound: 'impact' as const },
      { time: 5500, scene: 4, sound: 'whoosh' as const },
      { time: 7000, scene: 5, sound: 'rise' as const },
      { time: 9500, scene: 6, sound: 'impact' as const },
      { time: 11000, scene: 7, sound: 'whoosh' as const },
      { time: 13000, scene: 8, sound: 'whoosh' as const },
      { time: 15000, scene: 9, sound: 'success' as const },
      { time: 17500, scene: 10, sound: 'impact' as const },
    ];

    const timeouts = timeline.map(({ time, scene: s, sound }) =>
      setTimeout(() => {
        setScene(s);
        playSound(sound);
      }, time)
    );

    // Glitch sounds periodically
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) playSound('glitch', 0.15);
    }, 300);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(glitchInterval);
    };
  }, [started, playSound]);

  const handleStart = () => {
    // Initialize audio context on user interaction
    audioContextRef.current = new AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.value = 0.5;
    gainNodeRef.current.connect(audioContextRef.current.destination);
    setStarted(true);
    setScene(1);
    playSound('impact');
  };

  const features = [
    { icon: Camera, label: 'AI Headshots', color: '#ee575a' },
    { icon: Shirt, label: 'Virtual Try-On', color: '#8b5cf6' },
    { icon: Users, label: 'AI Influencer', color: '#06b6d4' },
    { icon: Briefcase, label: 'Pro Photos', color: '#f59e0b' },
    { icon: Palette, label: 'Any Style', color: '#10b981' },
    { icon: Shield, label: '100% Private', color: '#ec4899' },
  ];

  // Particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  if (!started) {
    return (
      <div className='fixed inset-0 bg-[#020617] flex items-center justify-center'>
        <button
          onClick={handleStart}
          className='group relative px-12 py-6 bg-[#ee575a] rounded-2xl text-2xl font-bold text-white overflow-hidden transition-transform hover:scale-105 active:scale-95'
        >
          <span className='relative z-10 flex items-center gap-3'>
            <Zap className='w-8 h-8' />
            Start Video
          </span>
          <div className='absolute inset-0 bg-gradient-to-r from-[#ee575a] via-rose-400 to-[#ee575a] bg-[length:200%_100%] animate-shimmer' />
        </button>
        <p className='absolute bottom-8 text-zinc-600 text-sm'>
          Click to start • Enable sound for best experience
        </p>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-[#020617] text-white overflow-hidden perspective-[1500px]'>
      {/* Animated particles */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {particles.map((p) => (
          <div
            key={p.id}
            className='absolute rounded-full bg-[#ee575a] particle'
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div className='absolute inset-0 grid-bg opacity-20' />

      {/* Scene 1: Logo Slam */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          scene === 1 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='logo-slam flex items-center gap-6'>
          {/* <div className="logo-3d">
            <Image
              src="/logo.png"
              alt="PicLoreAI"
              width={120}
              height={120}
              className="rounded-3xl"
            />
          </div> */}
          <h1 className='text-7xl md:text-9xl font-heading tracking-tight text-reveal'>
            PicLoreAI.
          </h1>
        </div>
      </div>

      {/* Scene 2: Tagline zoom */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 2 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <p className='text-4xl md:text-6xl font-heading text-center zoom-text'>
          Your Personal
          <br />
          <span className='text-[#ee575a] text-6xl md:text-8xl'>
            AI Photographer
          </span>
        </p>
      </div>

      {/* Scene 3: Problem - Strike through */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 3 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='text-center space-y-6 problem-text'>
          <p className='text-4xl md:text-6xl font-heading text-zinc-500 strike-line'>
            Expensive Photoshoots
          </p>
          <p className='text-4xl md:text-6xl font-heading text-zinc-500 strike-line delay-1'>
            Hours of Editing
          </p>
          <p className='text-4xl md:text-6xl font-heading text-zinc-500 strike-line delay-2'>
            Awkward Poses
          </p>
        </div>
      </div>

      {/* Scene 4: "NO MORE" */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 4 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <h2 className='text-8xl md:text-[12rem] font-heading text-[#ee575a] glitch-text no-more-text'>
          NO MORE
        </h2>
      </div>

      {/* Scene 5: The solution - 3 selfies */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 5 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='text-center solution-scene'>
          <h2 className='text-5xl md:text-7xl font-heading mb-8 slide-up'>
            Just <span className='text-[#ee575a]'>3</span> Selfies
          </h2>
          <div className='flex justify-center gap-4 md:gap-8'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='selfie-card w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center'
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <Camera className='w-10 h-10 text-zinc-500' />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 6: Arrow transformation */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 6 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='flex items-center gap-8 transform-scene'>
          <div className='text-2xl md:text-4xl text-zinc-500'>Selfies</div>
          <div className='arrow-container'>
            <div className='arrow-line' />
            <Sparkles className='w-12 h-12 md:w-16 md:h-16 text-[#ee575a] sparkle-spin' />
            <div className='arrow-line' />
          </div>
          <div className='text-2xl md:text-4xl text-[#ee575a] font-bold'>
            UNLIMITED
          </div>
        </div>
      </div>

      {/* Scene 7: Features explosion */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 7 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='features-explosion'>
          {features.map((feature, i) => {
            const angle = (i / features.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={feature.label}
                className='feature-card-3d absolute'
                style={
                  {
                    '--tx': `${x}px`,
                    '--ty': `${y}px`,
                    '--delay': `${i * 0.1}s`,
                    '--color': feature.color,
                  } as React.CSSProperties
                }
              >
                <div
                  className='w-20 h-20 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center gap-2 border-2'
                  style={{
                    background: `${feature.color}20`,
                    borderColor: feature.color,
                  }}
                >
                  <feature.icon
                    className='w-8 h-8 md:w-10 md:h-10'
                    style={{ color: feature.color }}
                  />
                  <span className='text-xs md:text-sm font-medium text-center px-1'>
                    {feature.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene 8: Speed lines + "5 MINUTES" */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 8 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='speed-scene'>
          <div className='speed-lines' />
          <div className='text-center z-10 relative'>
            <p className='text-3xl md:text-5xl text-zinc-400 mb-4'>
              Ready in just
            </p>
            <h2 className='text-7xl md:text-[10rem] font-heading text-[#ee575a] countdown-text'>
              30 Seconds
            </h2>
          </div>
        </div>
      </div>

      {/* Scene 9: Pricing flash */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 9 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='pricing-scene'>
          <h2 className='text-4xl md:text-6xl font-heading mb-12 price-header'>
            Start <span className='text-[#ee575a]'>FREE</span>
          </h2>
          <div className='flex gap-6 md:gap-8 price-cards'>
            <div className='price-card bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 md:p-8'>
              <p className='text-zinc-400 mb-2'>Free</p>
              <p className='text-4xl md:text-5xl font-bold'>$0</p>
              <p className='text-zinc-500 mt-2'>50 credits</p>
            </div>
            <div className='price-card featured bg-gradient-to-br from-[#ee575a]/20 to-rose-900/20 border-2 border-[#ee575a] rounded-2xl p-6 md:p-8 scale-110'>
              <p className='text-[#ee575a] mb-2'>Pro</p>
              <p className='text-4xl md:text-5xl font-bold'>$10</p>
              <p className='text-zinc-400 mt-2'>300/mo</p>
            </div>
            <div className='price-card bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 md:p-8'>
              <p className='text-zinc-400 mb-2'>Ultra</p>
              <p className='text-4xl md:text-5xl font-bold'>$24</p>
              <p className='text-zinc-500 mt-2'>1000/mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 10: Final CTA */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          scene === 10 ? 'scene-active' : 'scene-inactive'
        }`}
      >
        <div className='final-cta text-center'>
          <h2 className='text-5xl md:text-8xl font-heading mb-8 final-title'>
            Create Your
            <br />
            <span className='text-[#ee575a]'>Digital Twin</span>
          </h2>
          <div className='cta-button inline-flex items-center gap-3 bg-[#ee575a] text-white px-12 py-6 rounded-2xl text-2xl md:text-3xl font-bold'>
            <Sparkles className='w-8 h-8' />
            picloreai.com
          </div>
          <div className='mt-8 text-xl text-zinc-500 tagline-final'>
            Your Personal AI Photographer
          </div>
        </div>
      </div>

      {/* Vignette overlay */}
      <div className='absolute inset-0 pointer-events-none vignette' />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        .perspective-\\[1500px\\] {
          perspective: 1500px;
        }

        /* Particles */
        .particle {
          animation: float 3s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }

        /* Grid background */
        .grid-bg {
          background-image: linear-gradient(
              rgba(238, 87, 90, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(238, 87, 90, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% {
            transform: perspective(500px) rotateX(60deg) translateY(0);
          }
          100% {
            transform: perspective(500px) rotateX(60deg) translateY(50px);
          }
        }

        /* Scene transitions */
        .scene-active {
          opacity: 1;
          pointer-events: auto;
        }

        .scene-inactive {
          opacity: 0;
          pointer-events: none;
        }

        /* Scene 1: Logo slam */
        .logo-slam {
          animation: slam 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        @keyframes slam {
          0% {
            transform: translateZ(500px) scale(3);
            opacity: 0;
          }
          100% {
            transform: translateZ(0) scale(1);
            opacity: 1;
          }
        }

        .logo-3d {
          animation: logo-rotate 2s ease-in-out infinite;
        }

        @keyframes logo-rotate {
          0%,
          100% {
            transform: rotateY(-5deg) rotateX(5deg);
          }
          50% {
            transform: rotateY(5deg) rotateX(-5deg);
          }
        }

        .text-reveal {
          animation: text-reveal 0.8s ease-out forwards;
          background: linear-gradient(
            90deg,
            #fff 0%,
            #fff 50%,
            #ee575a 50%,
            #ee575a 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradient-shift 1s ease-out forwards;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0% 0;
          }
        }

        /* Scene 2: Zoom text */
        .zoom-text {
          animation: zoom-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes zoom-in {
          0% {
            transform: scale(0) rotateX(90deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotateX(0deg);
            opacity: 1;
          }
        }

        /* Scene 3: Strike through */
        .strike-line {
          position: relative;
          animation: strike 0.5s ease-out forwards;
        }

        .strike-line::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 0;
          height: 4px;
          background: #ee575a;
          animation: strike-through 0.4s ease-out 0.3s forwards;
        }

        .strike-line.delay-1::after {
          animation-delay: 0.5s;
        }
        .strike-line.delay-2::after {
          animation-delay: 0.7s;
        }

        @keyframes strike-through {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }

        /* Scene 4: NO MORE glitch */
        .no-more-text {
          animation: no-more 0.3s ease-out forwards;
        }

        @keyframes no-more {
          0% {
            transform: scale(5) rotateZ(10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotateZ(-5deg);
          }
          100% {
            transform: scale(1) rotateZ(0deg);
            opacity: 1;
          }
        }

        .glitch-text {
          animation: glitch 0.3s ease-out infinite;
        }

        @keyframes glitch {
          0%,
          100% {
            text-shadow: 2px 0 #00ffff, -2px 0 #ff00ff;
          }
          25% {
            text-shadow: -2px 0 #00ffff, 2px 0 #ff00ff;
          }
          50% {
            text-shadow: 2px 2px #00ffff, -2px -2px #ff00ff;
          }
          75% {
            text-shadow: -2px 2px #00ffff, 2px -2px #ff00ff;
          }
        }

        /* Scene 5: Selfie cards */
        .selfie-card {
          animation: card-flip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: var(--delay, 0s);
          opacity: 0;
        }

        @keyframes card-flip {
          0% {
            transform: rotateY(180deg) translateZ(-200px);
            opacity: 0;
          }
          100% {
            transform: rotateY(0) translateZ(0);
            opacity: 1;
          }
        }

        .slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }

        @keyframes slide-up {
          0% {
            transform: translateY(50px) rotateX(-20deg);
            opacity: 0;
          }
          100% {
            transform: translateY(0) rotateX(0);
            opacity: 1;
          }
        }

        /* Scene 6: Arrow */
        .arrow-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .arrow-line {
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ee575a, transparent);
          animation: arrow-grow 0.5s ease-out forwards;
        }

        @keyframes arrow-grow {
          0% {
            width: 0;
            opacity: 0;
          }
          100% {
            width: 100px;
            opacity: 1;
          }
        }

        .sparkle-spin {
          animation: sparkle-spin 1s ease-in-out infinite;
        }

        @keyframes sparkle-spin {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
        }

        /* Scene 7: Features explosion */
        .features-explosion {
          position: relative;
          width: 400px;
          height: 400px;
        }

        .feature-card-3d {
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: explode 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: var(--delay);
          opacity: 0;
        }

        @keyframes explode {
          0% {
            transform: translate(-50%, -50%) scale(0) rotateZ(180deg);
            opacity: 0;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty)))
              scale(1) rotateZ(0deg);
            opacity: 1;
          }
        }

        /* Scene 8: Speed */
        .speed-scene {
          position: relative;
        }

        .speed-lines {
          position: absolute;
          inset: -100%;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10px,
            rgba(238, 87, 90, 0.1) 10px,
            rgba(238, 87, 90, 0.1) 12px
          );
          animation: speed-move 0.5s linear infinite;
        }

        @keyframes speed-move {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-22px);
          }
        }

        .countdown-text {
          animation: countdown-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        }

        @keyframes countdown-pop {
          0% {
            transform: scale(0) rotateZ(-10deg);
          }
          100% {
            transform: scale(1) rotateZ(0deg);
          }
        }

        /* Scene 9: Pricing */
        .price-header {
          animation: slide-down 0.5s ease-out forwards;
        }

        @keyframes slide-down {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .price-cards {
          display: flex;
          align-items: center;
        }

        .price-card {
          animation: price-flip 0.5s ease-out forwards;
          opacity: 0;
        }

        .price-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .price-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .price-card:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes price-flip {
          0% {
            transform: perspective(500px) rotateY(90deg);
            opacity: 0;
          }
          100% {
            transform: perspective(500px) rotateY(0);
            opacity: 1;
          }
        }

        /* Scene 10: Final CTA */
        .final-title {
          animation: final-reveal 0.8s ease-out forwards;
        }

        @keyframes final-reveal {
          0% {
            transform: translateY(30px) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .cta-button {
          animation: cta-pulse 0.6s ease-out 0.3s forwards,
            pulse-glow 2s ease-in-out 1s infinite;
          opacity: 0;
          transform: scale(0.8);
        }

        @keyframes cta-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(238, 87, 90, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(238, 87, 90, 0.8),
              0 0 60px rgba(238, 87, 90, 0.4);
          }
        }

        .tagline-final {
          animation: fade-in 0.5s ease-out 0.6s forwards;
          opacity: 0;
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Vignette */
        .vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }
      `}</style>
    </div>
  );
}
