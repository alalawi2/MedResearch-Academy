import Layout from "@/components/Layout";
import { Award, Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WallOfImpact() {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="/images/hero-medical-research.png" className="w-full h-full object-cover" alt="Background" />
          </div>
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-8">
              <Award className="mr-2 h-4 w-4" />
              Wall of Impact
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
              Stories That Change Lives
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Behind every breakthrough is a researcher who dared to ask "Why?" and "What if?"
            </p>
          </div>
        </section>

        {/* Featured Story Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  
                  {/* Image Side */}
                  <div className="relative h-full min-h-[400px] lg:min-h-full">
                    <img 
                      src="/images/dr_fatma_real.jpeg"
                      alt="Dr. Fatma Al Shamsi" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/50" />
                    <div className="absolute bottom-6 left-6 right-6 text-white lg:hidden">
                      <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-3">
                        Resident Success Story
                      </div>
                      <h2 className="font-serif font-bold text-3xl">Dr. Fatma Al Shamsi</h2>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                    <div className="hidden lg:block">
                      <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4">
                        Resident Success Story
                      </div>
                      <h2 className="font-serif font-bold text-4xl text-primary">Dr. Fatma Al Shamsi</h2>
                      <p className="text-muted-foreground mt-2 font-medium">Internal Medicine Resident</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Spark
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          It started with a simple debate among residents: <em>Should we use feeding tubes for patients with advanced dementia?</em> While international guidelines said "no," local practice was hesitant. Dr. Fatma didn't just argue the point—she decided to prove it.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Journey
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Facing skepticism and a lack of regional data, she launched a study to evaluate outcomes right here in our population. Her research wasn't just academic; it was a quest for the most compassionate care for our elderly.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Impact
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Her findings were clear: feeding tubes offered no meaningful benefit, confirming that international guidelines hold true in Oman. This work won <strong>1st Place at the Royal Hospital Research Day</strong> and took her to the global stage at <strong>ACP 2025 in New Orleans</strong>.
                        </p>
                        <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border/50 italic text-muted-foreground relative">
                          <Quote className="absolute top-4 left-4 h-6 w-6 text-accent/20" />
                          <p className="pl-8">
                            "Today, her findings are driving a hospital-wide quality improvement initiative, ensuring that our care for the elderly is not just evidence-based, but deeply humane."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src="/images/dr_fatma_qr.png" 
                          alt="Scan to view original post" 
                          className="w-20 h-20 rounded-xl border border-border shadow-sm"
                        />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-semibold text-foreground">Read the full story</p>
                          <p>Scan to view on Instagram</p>
                        </div>
                      </div>
                      
                      <a href="https://www.instagram.com/p/DCWuAxMooNI/?igsh=anBxMjRiNGJ6Z3lu" target="_blank" rel="noopener noreferrer">
                        <Button className="w-full sm:w-auto gap-2">
                          View Original Post <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-muted/30">
          <div className="container text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold mb-4">Do you have a story to tell?</h3>
            <p className="text-muted-foreground mb-8">
              Your research journey could inspire the next generation of medical professionals. Share your achievements with the MedResearch Academy community.
            </p>
            <a href="mailto:dr.abdullahalalawi@gmail.com">
              <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary hover:bg-primary/5">
                Submit Your Story
              </Button>
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
