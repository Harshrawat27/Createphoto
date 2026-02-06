import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  Easing,
  Audio,
  Sequence,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { loadFont } from '@remotion/google-fonts/Inter';
import { loadFont as loadSerif } from '@remotion/google-fonts/Playfair';

// Load fonts
const { fontFamily: interFont } = loadFont('normal', {
  weights: ['400', '600', '700', '900'],
  subsets: ['latin'],
});

const { fontFamily: serifFont } = loadSerif('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

// Colors
const COLORS = {
  primary: '#ee575a',
  primaryGlow: '#ee575a80',
  background: '#020617',
  backgroundLight: '#0f172a',
  foreground: '#f8fafc',
  muted: '#94a3b8',
  card: '#0f172a',
  accent: '#8b5cf6',
  cyan: '#06b6d4',
  green: '#10b981',
};

// Utility: Noise pattern for texture
const NoiseOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

// Utility: Animated grid background
const AnimatedGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = (frame * 0.5) % 60;
  return (
    <div
      style={{
        position: 'absolute',
        inset: -100,
        backgroundImage: `
          linear-gradient(${COLORS.primary}08 1px, transparent 1px),
          linear-gradient(90deg, ${COLORS.primary}08 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        transform: `perspective(500px) rotateX(60deg) translateY(${offset}px)`,
        transformOrigin: 'center top',
      }}
    />
  );
};

// Scene 1: Epic Logo Intro
const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0, 1]);
  const logoRotateZ = interpolate(logoProgress, [0, 1], [720, 0]);
  const logoRotateY = interpolate(frame, [0, 30], [90, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  // Text animations
  const textProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12 },
  });

  const letterSpacing = interpolate(frame, [15, 45], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  // Glow pulse
  const glowScale = interpolate(frame % 60, [0, 30, 60], [1, 1.3, 1]);

  const glowOpacity = interpolate(frame % 60, [0, 30, 60], [0.3, 0.6, 0.3]);

  // Particles explosion
  const particles = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const speed = 8 + (i % 5) * 3;
    const delay = (i % 8) * 2;
    const startFrame = 5 + delay;
    const particleFrame = Math.max(0, frame - startFrame);
    const distance = particleFrame * speed;
    const opacity = interpolate(particleFrame, [0, 30], [1, 0], {
      extrapolateRight: 'clamp',
    });
    const size = 3 + (i % 4) * 2;

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity,
      size,
      color:
        i % 3 === 0
          ? COLORS.primary
          : i % 3 === 1
          ? COLORS.accent
          : COLORS.cyan,
    };
  });

  // Light rays
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rayOpacity = interpolate(frame, [10, 40, 70], [0, 0.3, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const rayLength = interpolate(frame, [10, 50], [0, 800], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return { angle, opacity: rayOpacity, length: rayLength };
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineY = interpolate(frame, [55, 75], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <NoiseOverlay />

      {/* Light rays */}
      {rays.map((ray, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: ray.length,
            background: `linear-gradient(to bottom, ${COLORS.primary}, transparent)`,
            transform: `rotate(${ray.angle}deg)`,
            transformOrigin: 'center top',
            opacity: ray.opacity,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            transform: `translate(${p.x}px, ${p.y}px)`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}

      {/* Main glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}40 0%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
        }}
      />

      {/* Logo and text container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          perspective: 1000,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale}) rotateZ(${logoRotateZ}deg) rotateY(${logoRotateY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <Img
            src={staticFile('logo.png')}
            style={{
              width: 160,
              height: 160,
              borderRadius: 32,
              boxShadow: `0 0 60px ${COLORS.primary}60`,
            }}
          />
        </div>

        {/* Brand text */}
        <div
          style={{
            transform: `scale(${Math.max(0, textProgress)})`,
            opacity: textProgress,
          }}
        >
          <h1
            style={{
              fontFamily: serifFont,
              fontSize: 140,
              fontWeight: 700,
              color: COLORS.foreground,
              margin: 0,
              letterSpacing: letterSpacing,
              textShadow: `0 0 40px ${COLORS.primary}40`,
            }}
          >
            PicLore
            <span
              style={{
                color: COLORS.primary,
                textShadow: `0 0 60px ${COLORS.primary}`,
              }}
            >
              AI
            </span>
          </h1>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <p
          style={{
            fontFamily: interFont,
            fontSize: 48,
            color: COLORS.muted,
            margin: 0,
            letterSpacing: 2,
          }}
        >
          Your Personal AI Photographer
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          width: interpolate(frame, [70, 100], [0, 400], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 2: Train Your Model
const TrainModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleY = interpolate(frame, [0, 25], [-80, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Image animation
  const imageScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  const imageRotate = interpolate(frame, [20, 60], [-8, 2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scanning effect
  const scanY = interpolate(frame % 80, [0, 80], [0, 100], {});
  const scanOpacity = interpolate(frame, [25, 40, 120, 135], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Data points animation
  const dataPoints = Array.from({ length: 20 }, (_, i) => {
    const startFrame = 50 + i * 3;
    const progress = Math.max(0, Math.min(1, (frame - startFrame) / 30));
    const startX = 225 + Math.random() * 100 - 50;
    const startY = 275 + Math.random() * 100 - 50;
    const endX = 800 + i * 20;
    const endY = 200 + (i % 4) * 80;

    return {
      x: interpolate(progress, [0, 1], [startX, endX], {
        easing: Easing.inOut(Easing.quad),
      }),
      y: interpolate(progress, [0, 1], [startY, endY], {
        easing: Easing.inOut(Easing.quad),
      }),
      opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.7]),
      size: 6 + (i % 3) * 2,
    };
  });

  // Steps
  const steps = [
    {
      icon: '📸',
      text: 'Upload 3-5 selfies',
      subtext: 'Different angles work best',
    },
    {
      icon: '🧠',
      text: 'AI learns your features',
      subtext: 'Neural network training',
    },
    {
      icon: '⚡',
      text: 'Ready in ~30 seconds',
      subtext: 'GPU-accelerated processing',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        overflow: 'hidden',
      }}
    >
      <AnimatedGrid frame={frame} />
      <NoiseOverlay />

      {/* Content */}
      <div
        style={{
          padding: 80,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 50,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 24px',
              backgroundColor: COLORS.primary + '20',
              borderRadius: 100,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: interFont,
                fontSize: 20,
                color: COLORS.primary,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              Step 1
            </span>
          </div>
          <h2
            style={{
              fontFamily: serifFont,
              fontSize: 90,
              color: COLORS.foreground,
              margin: 0,
            }}
          >
            Train Your <span style={{ color: COLORS.primary }}>Model</span>
          </h2>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, gap: 80 }}>
          {/* Image section */}
          <div
            style={{
              position: 'relative',
              transform: `scale(${Math.max(
                0,
                imageScale
              )}) rotate(${imageRotate}deg)`,
            }}
          >
            {/* Glow behind image */}
            <div
              style={{
                position: 'absolute',
                inset: -40,
                background: `radial-gradient(ellipse, ${COLORS.primary}30 0%, transparent 70%)`,
                borderRadius: 40,
              }}
            />

            {/* Image container */}
            <div
              style={{
                width: 450,
                height: 550,
                borderRadius: 28,
                overflow: 'hidden',
                border: `3px solid ${COLORS.primary}`,
                position: 'relative',
                boxShadow: `
                  0 0 0 1px ${COLORS.primary}40,
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  0 0 100px ${COLORS.primary}20
                `,
              }}
            >
              <Img
                src={staticFile('selfie-image.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Scan line */}
              <div
                style={{
                  position: 'absolute',
                  top: `${scanY}%`,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, ${COLORS.primary}, transparent)`,
                  opacity: scanOpacity,
                  boxShadow: `0 0 30px ${COLORS.cyan}, 0 0 60px ${COLORS.primary}`,
                }}
              />

              {/* Corner brackets */}
              {[
                { top: 16, left: 16, borderWidth: '3px 0 0 3px' },
                { top: 16, right: 16, borderWidth: '3px 3px 0 0' },
                { bottom: 16, left: 16, borderWidth: '0 0 3px 3px' },
                { bottom: 16, right: 16, borderWidth: '0 3px 3px 0' },
              ].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    ...pos,
                    width: 40,
                    height: 40,
                    borderColor: COLORS.cyan,
                    borderStyle: 'solid',
                    borderWidth: pos.borderWidth,
                    opacity: scanOpacity,
                  }}
                />
              ))}
            </div>

            {/* Upload indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: COLORS.backgroundLight,
                border: `2px solid ${COLORS.primary}40`,
                borderRadius: 12,
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: COLORS.green,
                  boxShadow: `0 0 10px ${COLORS.green}`,
                }}
              />
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 16,
                  color: COLORS.foreground,
                  fontWeight: 600,
                }}
              >
                Processing...
              </span>
            </div>
          </div>

          {/* Data points flowing */}
          {dataPoints.map((dp, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: dp.x,
                top: dp.y,
                width: dp.size,
                height: dp.size,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
                opacity: dp.opacity,
                boxShadow: `0 0 ${dp.size}px ${COLORS.primary}`,
              }}
            />
          ))}

          {/* Steps section */}
          <div style={{ flex: 1, paddingTop: 20 }}>
            {steps.map((step, i) => {
              const stepDelay = 40 + i * 25;
              const stepOpacity = interpolate(
                frame,
                [stepDelay, stepDelay + 20],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              );
              const stepX = interpolate(
                frame,
                [stepDelay, stepDelay + 20],
                [80, 0],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.exp),
                }
              );

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 28,
                    marginBottom: 40,
                    opacity: stepOpacity,
                    transform: `translateX(${stepX}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 20,
                      backgroundColor: COLORS.card,
                      border: `2px solid ${COLORS.primary}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 42,
                      boxShadow: `0 0 30px ${COLORS.primary}10`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: interFont,
                        fontSize: 34,
                        fontWeight: 700,
                        color: COLORS.foreground,
                        margin: 0,
                      }}
                    >
                      {step.text}
                    </h3>
                    <p
                      style={{
                        fontFamily: interFont,
                        fontSize: 20,
                        color: COLORS.muted,
                        margin: '6px 0 0 0',
                      }}
                    >
                      {step.subtext}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Progress bar */}
            <div
              style={{
                marginTop: 40,
                opacity: interpolate(frame, [100, 120], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <div
                style={{
                  height: 8,
                  backgroundColor: COLORS.card,
                  borderRadius: 100,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${interpolate(frame, [100, 140], [0, 100], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })}%`,
                    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                    borderRadius: 100,
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: interFont,
                  fontSize: 16,
                  color: COLORS.muted,
                  marginTop: 12,
                }}
              >
                Model training:{' '}
                {Math.round(
                  interpolate(frame, [100, 140], [0, 100], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Generate Unlimited Photos
const GenerateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const imageScale = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 60 },
  });

  // Orbiting elements
  const orbitItems = Array.from({ length: 8 }, (_, i) => {
    const baseAngle = (i / 8) * Math.PI * 2;
    const angle = baseAngle + frame * 0.02;
    const radius = 380;
    const verticalSquash = 0.3;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * verticalSquash,
      scale: interpolate(Math.sin(angle), [-1, 1], [0.6, 1]),
      zIndex: Math.sin(angle) > 0 ? 1 : -1,
      icon: ['🎨', '👔', '🌴', '🏢', '🎭', '📸', '✨', '🌟'][i],
    };
  });

  // Magic sparkles
  const sparkles = Array.from({ length: 25 }, (_, i) => {
    const seed = i * 137.5;
    const startFrame = 30 + (i % 10) * 4;
    const progress = Math.max(0, (frame - startFrame) / 50);
    const angle = seed;
    const distance = progress * 200;

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - progress * 100,
      opacity: interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
      size: 4 + (i % 4) * 2,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <NoiseOverlay />

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}25 0%, ${COLORS.accent}10 40%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          textAlign: 'center',
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '8px 24px',
            backgroundColor: COLORS.accent + '20',
            borderRadius: 100,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: interFont,
              fontSize: 20,
              color: COLORS.accent,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            Step 2
          </span>
        </div>
        <h2
          style={{
            fontFamily: serifFont,
            fontSize: 80,
            color: COLORS.foreground,
            margin: 0,
          }}
        >
          Generate <span style={{ color: COLORS.primary }}>Unlimited</span>{' '}
          Photos
        </h2>
      </div>

      {/* Main image with orbit */}
      <div style={{ position: 'relative', marginTop: 40 }}>
        {/* Sparkles */}
        {sparkles.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? COLORS.primary : COLORS.accent,
              transform: `translate(${s.x}px, ${s.y}px)`,
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 2}px ${
                i % 2 === 0 ? COLORS.primary : COLORS.accent
              }`,
            }}
          />
        ))}

        {/* Orbiting items - behind */}
        {orbitItems
          .filter((item) => item.zIndex < 0)
          .map((item, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) scale(${item.scale})`,
                fontSize: 48,
                opacity: 0.5 + item.scale * 0.5,
                zIndex: 0,
              }}
            >
              {item.icon}
            </div>
          ))}

        {/* Center image */}
        <div
          style={{
            transform: `scale(${Math.max(0, imageScale)})`,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 500,
              height: 500,
              borderRadius: 32,
              overflow: 'hidden',
              border: `4px solid ${COLORS.primary}`,
              boxShadow: `
                0 0 0 2px ${COLORS.primary}40,
                0 0 80px ${COLORS.primary}50,
                0 0 120px ${COLORS.accent}30
              `,
            }}
          >
            <Img
              src={staticFile('generated.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* AI Generated badge */}
          <div
            style={{
              position: 'absolute',
              bottom: -25,
              left: '50%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
              padding: '14px 36px',
              borderRadius: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: `0 10px 40px ${COLORS.primary}50`,
            }}
          >
            <span style={{ fontSize: 26 }}>✨</span>
            <span
              style={{
                fontFamily: interFont,
                fontSize: 22,
                fontWeight: 700,
                color: 'white',
              }}
            >
              AI Generated
            </span>
          </div>
        </div>

        {/* Orbiting items - front */}
        {orbitItems
          .filter((item) => item.zIndex > 0)
          .map((item, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) scale(${item.scale})`,
                fontSize: 48,
                opacity: 0.5 + item.scale * 0.5,
                zIndex: 20,
              }}
            >
              {item.icon}
            </div>
          ))}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Features Showcase
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    {
      icon: '📸',
      title: 'AI Headshots',
      desc: 'Professional quality',
      color: COLORS.primary,
    },
    {
      icon: '👔',
      title: 'Virtual Try-On',
      desc: 'See any outfit',
      color: COLORS.accent,
    },
    {
      icon: '🤳',
      title: 'AI Influencer',
      desc: 'Consistent persona',
      color: COLORS.cyan,
    },
    {
      icon: '🎨',
      title: 'Any Style',
      desc: 'Unlimited creativity',
      color: COLORS.green,
    },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
        overflow: 'hidden',
      }}
    >
      <NoiseOverlay />

      {/* Background accents */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '-10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 60%)`,
        }}
      />

      {/* Title */}
      <h2
        style={{
          fontFamily: serifFont,
          fontSize: 80,
          color: COLORS.foreground,
          marginBottom: 80,
          opacity: titleOpacity,
          textAlign: 'center',
        }}
      >
        Everything You <span style={{ color: COLORS.primary }}>Need</span>
      </h2>

      {/* Features grid */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          justifyContent: 'center',
        }}
      >
        {features.map((feature, i) => {
          const delay = 15 + i * 15;
          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, stiffness: 80 },
          });

          const cardRotate = interpolate(frame, [delay, delay + 25], [20, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                width: 320,
                padding: 48,
                backgroundColor: COLORS.card,
                borderRadius: 28,
                border: `2px solid ${feature.color}30`,
                transform: `scale(${Math.max(
                  0,
                  cardScale
                )}) rotate(${cardRotate}deg)`,
                textAlign: 'center',
                boxShadow: `
                  0 20px 40px rgba(0, 0, 0, 0.3),
                  0 0 60px ${feature.color}10
                `,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  backgroundColor: feature.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 52,
                  margin: '0 auto 24px',
                  border: `2px solid ${feature.color}40`,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: interFont,
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.foreground,
                  margin: '0 0 12px 0',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: interFont,
                  fontSize: 20,
                  color: COLORS.muted,
                  margin: 0,
                }}
              >
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Final CTA
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 60 },
  });

  const buttonScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 8, stiffness: 100 },
  });

  const glowPulse = interpolate(frame % 50, [0, 25, 50], [0.5, 1, 0.5]);

  const pricingOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => {
    const x = (i * 73) % 100;
    const y = (i * 137) % 100;
    const floatOffset = Math.sin(frame * 0.03 + i) * 20;
    const opacity = 0.3 + Math.sin(frame * 0.05 + i * 2) * 0.2;

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translateY(${floatOffset}px)`,
      opacity,
      size: 3 + (i % 4) * 2,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <NoiseOverlay />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: COLORS.primary,
            transform: p.transform,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}${Math.round(
            glowPulse * 25
          )
            .toString(16)
            .padStart(2, '0')} 0%, transparent 50%)`,
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          zIndex: 10,
          transform: `scale(${titleScale})`,
        }}
      >
        <h2
          style={{
            fontFamily: serifFont,
            fontSize: 110,
            color: COLORS.foreground,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Start Creating
          <br />
          <span
            style={{
              color: COLORS.primary,
              textShadow: `0 0 80px ${COLORS.primary}60`,
            }}
          >
            Today
          </span>
        </h2>
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 60,
          transform: `scale(${Math.max(0, buttonScale)})`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
            padding: '28px 72px',
            borderRadius: 100,
            boxShadow: `
              0 0 ${60 * glowPulse}px ${COLORS.primary}60,
              0 20px 40px rgba(0, 0, 0, 0.3)
            `,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 36 }}>✨</span>
          <span
            style={{
              fontFamily: interFont,
              fontSize: 38,
              fontWeight: 700,
              color: 'white',
            }}
          >
            Try Free - 100 Credits
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div
        style={{
          marginTop: 60,
          display: 'flex',
          gap: 30,
          opacity: pricingOpacity,
          zIndex: 10,
        }}
      >
        {[
          { plan: 'Free', price: '$0', credits: '50 credits' },
          { plan: 'Pro', price: '$10', credits: '300/month', highlight: true },
          { plan: 'Ultra', price: '$24', credits: '1000/month' },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              padding: '24px 40px',
              borderRadius: 20,
              backgroundColor: p.highlight ? COLORS.primary : COLORS.card,
              border: `2px solid ${p.highlight ? COLORS.primary : COLORS.card}`,
              textAlign: 'center',
              transform: p.highlight ? 'scale(1.1)' : 'scale(1)',
              boxShadow: p.highlight ? `0 0 40px ${COLORS.primary}40` : 'none',
            }}
          >
            <span
              style={{
                fontFamily: interFont,
                fontSize: 18,
                color: p.highlight ? 'white' : COLORS.muted,
                display: 'block',
                fontWeight: 600,
              }}
            >
              {p.plan}
            </span>
            <span
              style={{
                fontFamily: interFont,
                fontSize: 36,
                fontWeight: 700,
                color: p.highlight ? 'white' : COLORS.foreground,
                display: 'block',
                margin: '4px 0',
              }}
            >
              {p.price}
            </span>
            <span
              style={{
                fontFamily: interFont,
                fontSize: 14,
                color: p.highlight ? 'rgba(255,255,255,0.8)' : COLORS.muted,
              }}
            >
              {p.credits}
            </span>
          </div>
        ))}
      </div>

      {/* Website URL */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Img
          src={staticFile('logo.png')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
          }}
        />
        <span
          style={{
            fontFamily: interFont,
            fontSize: 32,
            color: COLORS.muted,
            fontWeight: 600,
          }}
        >
          picloreai.com
        </span>
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const PicLorePromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <TransitionSeries>
        {/* Scene 1: Logo Intro (0-4s = 120 frames) */}
        <TransitionSeries.Sequence
          durationInFrames={120}
          style={{ overflow: 'hidden' }}
        >
          <LogoIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2: Train Model (4-9s = 150 frames) */}
        <TransitionSeries.Sequence
          durationInFrames={150}
          style={{ overflow: 'hidden' }}
        >
          <TrainModelScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Generate Photos (9-13s = 120 frames) */}
        <TransitionSeries.Sequence
          durationInFrames={120}
          style={{ overflow: 'hidden' }}
        >
          <GenerateScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 4: Features (13-17s = 120 frames) */}
        <TransitionSeries.Sequence
          durationInFrames={120}
          style={{ overflow: 'hidden' }}
        >
          <FeaturesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-left' })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: CTA (17-20s = 130 frames - extended for final hold) */}
        <TransitionSeries.Sequence
          durationInFrames={130}
          style={{ overflow: 'hidden' }}
        >
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
