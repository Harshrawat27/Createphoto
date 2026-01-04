import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$19",
    description: "Perfect for individuals wanting to try AI photography.",
    features: [
      "1 Custom AI Model",
      "50 AI Photos / month",
      "Standard Resolution (2K)",
      "Basic Styles Pack",
      "Commercial Usage License"
    ],
    cta: "Start Creating",
    icon: Sparkles,
    highlighted: false,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    name: "Professional",
    price: "$49",
    description: "For influencers and creators needing consistent content.",
    features: [
      "3 Custom AI Models",
      "500 AI Photos / month",
      "High Resolution (4K)",
      "Priority Processing",
      "Virtual Try-On Access",
      "Advanced Style Controls"
    ],
    cta: "Go Professional",
    icon: Zap,
    highlighted: true,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary"
  },
  {
    name: "Agency",
    price: "$199",
    description: "Power your agency with unlimited creative possibilities.",
    features: [
      "10 Custom AI Models",
      "Unlimited AI Photos",
      "Ultra High Res (8K)",
      "Instant Processing Queue",
      "API Access",
      "Dedicated Support",
      "White-label Options"
    ],
    cta: "Contact Sales",
    icon: Crown,
    highlighted: false,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg">
            Choose the perfect plan for your creative journey. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`
                relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${tier.highlighted 
                  ? "bg-card shadow-lg ring-2 ring-primary border-primary z-10 scale-105 md:scale-110" 
                  : "bg-card/50 backdrop-blur border-border hover:border-primary/50"
                }
              `}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-lg ${tier.bgColor} ${tier.color} flex items-center justify-center mb-6`}>
                <tier.icon className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                {tier.description}
              </p>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={`w-5 h-5 flex-shrink-0 ${tier.color}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" className="block">
                <button className={`
                  w-full py-3 rounded-xl font-bold transition-all
                  ${tier.highlighted 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 button-highlighted-shadow" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }
                `}>
                  {tier.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
