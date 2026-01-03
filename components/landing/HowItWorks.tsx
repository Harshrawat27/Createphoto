import { Upload, Cpu, Download } from "lucide-react";

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "Upload Photos",
    description: "Upload 10-20 varied selfies or portraits. Good lighting and different angles help the AI learn best."
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "Train Model",
    description: "Our powerful GPU cluster processes your images to create a dedicated LoRA model of your likeness in ~20 minutes."
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "Generate & Download",
    description: "Use text prompts to generate photos of yourself in any scenario. Download high-res images instantly."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to your digital twin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center text-primary mb-6 relative z-10 shadow-xl">
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm border-2 border-background">
                    {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground max-w-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
