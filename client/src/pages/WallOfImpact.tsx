import Layout from "@/components/Layout";
import { Award } from "lucide-react";

export default function WallOfImpact() {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="/images/hero-medical-research.png" className="w-full h-full object-cover" alt="Background" />
          </div>
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-6">
              <Award className="mr-2 h-4 w-4" />
              Wall of Impact
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Real Stories, Real Impact
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              See how our community members are transforming healthcare through research and innovation. From resident success stories to direct patient impact.
            </p>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Story 1: Dr. Fatma Al Shamsi */}
              <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src="/images/dr_fatma_real.jpeg"
                    alt="Dr. Fatma Al Shamsi" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded mb-2">
                      Resident Success
                    </div>
                    <h3 className="font-serif font-bold text-xl">Dr. Fatma Al Shamsi</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="font-bold text-lg text-primary line-clamp-2">
                    Transforming Clinical Practice: The Power of Local Evidence
                  </h4>
                  <p className="text-muted-foreground text-sm line-clamp-4">
                    Dr. Fatma turned a residency debate into a groundbreaking study on feeding tube use in advanced dementia. Her findings confirmed international guidelines were applicable in Oman, winning 1st Place at the Royal Hospital Research Day and influencing hospital-wide protocols.
                  </p>
                  <div className="pt-2 flex items-center text-sm font-medium text-primary">
                    <Award className="h-4 w-4 mr-2 text-accent" />
                    ACP 2025 Presenter
                  </div>
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Scan to view original post</span>
                    <img 
                      src="/images/dr_fatma_qr.png" 
                      alt="Scan for Original Post" 
                      className="w-16 h-16 rounded-lg border border-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
