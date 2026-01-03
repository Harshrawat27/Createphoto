import Link from "next/link";
import { Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-20 text-center overflow-hidden shadow-2xl">
          {/* Decorative patterns */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
              Ready to create your digital twin?
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
              Join thousands of creators, professionals, and influencers who are saving time and money with AI photography.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Free
              </Link>
            </div>
            <p className="text-white/60 text-sm">
              No credit card required for initial preview.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
