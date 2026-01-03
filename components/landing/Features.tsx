import { Wand2, Shirt, TrendingUp, Camera, Palette, Lock } from "lucide-react";

const features = [
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: "Personalized AI Model",
    description: "Train a custom AI model on your face. It learns your features perfectly to generate hyper-realistic photos in any setting."
  },
  {
    icon: <Shirt className="w-6 h-6" />,
    title: "Virtual Try-On",
    description: "Upload any clothing item or choose from our catalog. See how it looks on you instantly without leaving your home."
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "AI Influencer Creation",
    description: "Create a consistent digital persona. Generate daily content for Instagram, TikTok, and LinkedIn to grow your audience."
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Professional Headshots",
    description: "Need a LinkedIn update? Generate studio-quality professional headshots in suits, casual wear, or artistic styles."
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: "Creative Styles",
    description: "Transform yourself into a fantasy character, a cyberpunk hero, or a vintage movie star with just one click."
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Private & Secure",
    description: "Your photos are yours. We use advanced encryption and your model is private to you unless you choose to share it."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Everything you need to create yourself</h2>
          <p className="text-muted-foreground text-lg">
            From professional needs to creative fun, our AI engine handles it all with stunning photorealism.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
