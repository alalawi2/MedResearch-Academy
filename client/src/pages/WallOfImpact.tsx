import Layout from "@/components/Layout";
import { Award, Quote, ArrowRight, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/Map";

export default function WallOfImpact() {
  const shareStory = (platform: string, name: string) => {
    const url = window.location.href;
    const text = encodeURIComponent(`Read the inspiring story of ${name} on MedResearch Academy's Wall of Impact`);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&via=Medresearch_om&hashtags=MedResearchOman,MedicalResearch,SuccessStory`;
        break;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

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
          <div className="container space-y-20">
            {/* Dr. Salim Al Busaidi Story */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  
                  {/* Image Side */}
                  <div className="relative h-full min-h-[500px] lg:min-h-full bg-white flex flex-col">
                    <div className="flex-1 relative overflow-hidden">
                      <img 
                        src="/images/dr_salim_profile.jpg"
                        alt="Dr. Salim Al Busaidi" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 relative overflow-hidden border-t border-border/20">
                      <img 
                        src="/images/dr_salim_presentation.jpg"
                        alt="Dr. Salim Al Busaidi Presenting" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                    <div className="hidden lg:block">
                      <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4">
                        Alumni Success Story
                      </div>
                      <h2 className="font-serif font-bold text-4xl text-primary">Dr. Salim Al Busaidi</h2>
                      <p className="text-muted-foreground mt-2 font-medium">Specialist Physician, SQUH</p>
                      <p className="text-sm text-muted-foreground/80">Currently: Acute Care & General Medicine Fellow, Australia</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Spark
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          It began during an on-call shift, completing a death notification under pressure with limited information. Faced with assigning a single cause of death based on fragmented data, Dr. Salim questioned: <em>How reliable is our national mortality data?</em> This moment became the catalyst for a systematic evaluation of death certification practices.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Journey
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          He launched a retrospective study at SQUH, identifying substantial discrepancies in cause-of-death documentation. His work was published in the <strong>Journal of Forensic and Legal Medicine (Q1)</strong> and supported by national research funding. But he didn't stop at publication—he translated findings into national capacity-building initiatives.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3 flex items-center">
                          <span className="w-8 h-1 bg-accent mr-3 rounded-full"></span>
                          The Impact
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          His research led to a flagship national workshop with WHO, MOH, and OMSB, aligning Oman's practices with international standards. It also spurred the creation of a national online training platform for physicians.
                        </p>
                        <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border/50 italic text-muted-foreground relative">
                          <Quote className="absolute top-4 left-4 h-6 w-6 text-accent/20" />
                          <p className="pl-8">
                            "These efforts strengthened mortality data quality, supported evidence-informed public health policy, and illustrate how clinician-led research can translate into sustained national health system improvement."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col gap-4">
                      <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Key Publications</h4>
                      <div className="flex flex-col gap-3">
                        <a href="https://mjournal.squ.edu.om/home/vol25/iss1/36/" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full justify-between group">
                            <span className="truncate mr-2">SQUMJ Publication (2025)</span>
                            <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </a>
                        <a href="https://www.sciencedirect.com/science/article/abs/pii/S1752928X23000653?via%3Dihub" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full justify-between group">
                            <span className="truncate mr-2">Journal of Forensic and Legal Medicine</span>
                            <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </a>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2">
                              <Share2 className="h-4 w-4" /> Share Story
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => shareStory("whatsapp", "Dr. Salim Al Busaidi")}>
                              Share on WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareStory("linkedin", "Dr. Salim Al Busaidi")}>
                              Share on LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareStory("twitter", "Dr. Salim Al Busaidi")}>
                              Share on X
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dr. Fatma Al Shamsi Story */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  
                  {/* Image Side */}
                  <div className="relative h-full min-h-[500px] lg:min-h-full bg-white flex items-center justify-center p-4">
                    <img 
                      src="/images/dr_fatma_award_full.jpeg"
                      alt="Dr. Fatma Al Shamsi Award Ceremony" 
                      className="w-full h-auto max-h-full object-contain"
                    />
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
                          Her findings were clear: feeding tubes offered no meaningful benefit, confirming that international guidelines hold true in Oman. On <strong>November 14, 2024</strong>, this work won <strong>1st Place at the Royal Hospital Internal Medicine Research Day</strong>. It also took her to the global stage at <strong>ACP 2025 in New Orleans</strong>.
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
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <a href="https://www.instagram.com/p/DCWuAxMooNI/?igsh=anBxMjRiNGJ6Z3lu" target="_blank" rel="noopener noreferrer" className="flex-grow sm:flex-grow-0">
                          <Button className="w-full gap-2">
                            View Original Post <ArrowRight className="h-4 w-4" />
                          </Button>
                        </a>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                              <Share2 className="h-4 w-4" />
                              <span className="sr-only">Share</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => shareStory("whatsapp", "Dr. Fatma Al Shamsi")}>
                              Share on WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareStory("linkedin", "Dr. Fatma Al Shamsi")}>
                              Share on LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareStory("twitter", "Dr. Fatma Al Shamsi")}>
                              Share on X
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Impact Map */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Global Reach</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From Oman to the world, our alumni and founders are making an impact across continents.
              </p>
            </div>
            
            <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl h-[500px] relative">
              <MapView 
                initialCenter={{ lat: 20.0, lng: 60.0 }} 
                initialZoom={2}
                onMapReady={(map) => {
                  // Locations data
                  const locations = [
                    {
                      position: { lat: 23.5880, lng: 58.3829 }, // Muscat, Oman
                      title: "Muscat, Oman",
                      content: `
                        <div class="p-2 min-w-[200px]">
                          <h3 class="font-bold text-primary mb-1">Muscat, Oman</h3>
                          <p class="text-sm text-muted-foreground">Home of MedResearch Academy</p>
                          <div class="mt-2 text-xs">
                            <span class="block">• Dr. Abdullah Al Alawi</span>
                            <span class="block">• Dr. Mohamed Al Rawahi</span>
                            <span class="block">• Dr. Fatma Al Shamsi</span>
                          </div>
                        </div>
                      `
                    },
                    {
                      position: { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia (approx for Australia)
                      title: "Australia",
                      content: `
                        <div class="p-2 min-w-[200px]">
                          <h3 class="font-bold text-primary mb-1">Australia</h3>
                          <p class="text-sm text-muted-foreground">Acute Care Fellowship</p>
                          <div class="mt-2 text-xs">
                            <span class="block font-semibold">• Dr. Salim Al Busaidi</span>
                          </div>
                        </div>
                      `
                    },
                    {
                      position: { lat: 50.8514, lng: 5.6910 }, // Maastricht, Netherlands
                      title: "Maastricht, Netherlands",
                      content: `
                        <div class="p-2 min-w-[200px]">
                          <h3 class="font-bold text-primary mb-1">Maastricht, Netherlands</h3>
                          <p class="text-sm text-muted-foreground">PhD Research</p>
                          <div class="mt-2 text-xs">
                            <span class="block">• Dr. Mohamed Al Rawahi</span>
                          </div>
                        </div>
                      `
                    },
                    {
                      position: { lat: 29.9511, lng: -90.0715 }, // New Orleans, USA
                      title: "New Orleans, USA",
                      content: `
                        <div class="p-2 min-w-[200px]">
                          <h3 class="font-bold text-primary mb-1">New Orleans, USA</h3>
                          <p class="text-sm text-muted-foreground">ACP 2025 Presentation</p>
                          <div class="mt-2 text-xs">
                            <span class="block">• Dr. Fatma Al Shamsi</span>
                          </div>
                        </div>
                      `
                    }
                  ];

                  // Add markers
                  locations.forEach(loc => {
                    const marker = new google.maps.marker.AdvancedMarkerElement({
                      map,
                      position: loc.position,
                      title: loc.title,
                    });

                    // Add info window on click
                    const infoWindow = new google.maps.InfoWindow({
                      content: loc.content,
                    });

                    marker.addListener("click", () => {
                      infoWindow.open({
                        anchor: marker,
                        map,
                      });
                    });
                  });
                }}
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16">
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
