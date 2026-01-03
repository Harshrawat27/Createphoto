import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full bg-background min-h-screen">
        <header className="flex justify-end items-center p-4 border-b border-border gap-4 bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="text-sm text-muted-foreground hidden sm:block">
                Credits: <span className="font-bold text-foreground">150</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50" />
            <ThemeToggle />
        </header>
        {children}
      </main>
    </div>
  );
}
