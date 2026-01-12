import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, RefreshCw, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { fetchLatestPublications, type PubMedArticle } from "@/lib/pubmed";

export default function Resources() {
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestPublications(5); // Reduced count for resources page
      setArticles(data);
    } catch (err) {
      setError("Failed to load latest publications from PubMed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sharePublication = (platform: string, article: PubMedArticle) => {
    const text = encodeURIComponent(`${article.title} - MedResearch Academy`);
    const url = encodeURIComponent(article.link);
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&via=Medresearch_om&hashtags=MedResearchOman,MedicalResearch,Publication`;
        break;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <Layout>
      <section className="bg-background py-16 md:py-24 border-b border-border/40">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Resources</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore our latest research and publications.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl space-y-16">
          
          {/* Featured Pre-Operative Guide */}
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative">
              <img 
                src="/images/preop-guide-banner.png" 
                alt="Pre-Operative Patient Preparation Guide"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent"></div>
            </div>
            
            <div className="relative p-8 md:p-10 -mt-16">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Featured Clinical Resource
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
                Comprehensive Pre-Operative Patient Preparation Guide
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                Access the most recent and comprehensive evidence-based resource designed to guide medical professionals through optimal patient preparation for surgical procedures. This interactive tool provides step-by-step protocols, safety checklists, and best practices to ensure patient readiness and minimize perioperative risks.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://perio-guide-mencvhpz.manus.space/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="lg" className="gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Access Interactive Guide
                  </Button>
                </a>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const text = encodeURIComponent('Comprehensive Pre-Operative Patient Preparation Guide - MedResearch Academy');
                    const url = encodeURIComponent('https://perio-guide-mencvhpz.manus.space/');
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'width=600,height=400');
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share Guide
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-foreground mb-1">Evidence-Based</div>
                    <div className="text-muted-foreground">Latest clinical guidelines and research</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Interactive Checklists</div>
                    <div className="text-muted-foreground">Step-by-step preparation protocols</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Risk Mitigation</div>
                    <div className="text-muted-foreground">Minimize perioperative complications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MedResearch Clinical Calculator */}
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-teal-500/5 via-background to-blue-500/5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative">
              <img 
                src="/images/clinical-calculator-banner.png" 
                alt="MedResearch Clinical Calculator Hub"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent"></div>
            </div>
            
            <div className="relative p-8 md:p-10 -mt-16">
              <div className="inline-block px-4 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-sm font-medium mb-4">
                Clinical Decision Support Tool
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
                MedResearch Clinical Calculator Hub
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                Your comprehensive hub for hundreds of evidence-based medical calculators. From qSOFA sepsis scoring and vital signs assessment to specialized clinical risk stratification tools. Designed for bedside use to support rapid, accurate clinical decision-making across all medical specialties. Access the calculator you need, when you need it.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://qsofacalc-acewiica.manus.space" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <ExternalLink className="h-5 w-5" />
                    Launch Calculator
                  </Button>
                </a>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const text = encodeURIComponent('MedResearch Clinical Calculator Hub - Hundreds of Medical Calculators - MedResearch Academy');
                    const url = encodeURIComponent('https://qsofacalc-acewiica.manus.space');
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'width=600,height=400');
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share Calculator
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-foreground mb-1">Hundreds of Calculators</div>
                    <div className="text-muted-foreground">Comprehensive medical calculation suite</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">All Specialties</div>
                    <div className="text-muted-foreground">Cardiology, nephrology, emergency medicine & more</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Evidence-Based</div>
                    <div className="text-muted-foreground">Validated clinical scoring systems</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bayan Adaptive Learning Platform - Coming Soon */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/10 shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <div className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold shadow-md">
                Coming Soon
              </div>
            </div>
            
            <div className="p-8 md:p-10 text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/bayan_logo_final_v2.png" 
                  alt="Bayan Logo"
                  className="h-32 w-32 md:h-40 md:w-40 object-contain"
                />
              </div>
              
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                AI-Powered Exam Preparation
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
                Bayan: AI-Powered Adaptive Learning Platform
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                Master medical exams with personalized question banks that adapt to your knowledge gaps. Smart algorithms identify weak areas and create custom practice sessions for optimal exam preparation.
              </p>
              
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="font-semibold text-foreground mb-1">Adaptive Learning</div>
                    <div className="text-muted-foreground">AI identifies your weak areas automatically</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Personalized Practice</div>
                    <div className="text-muted-foreground">Custom question sets tailored to you</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">Exam-Ready</div>
                    <div className="text-muted-foreground">OMSB, Arab Board, and licensing exams</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-muted-foreground italic">
                  Stay tuned for the launch of Bayan. Follow us on social media for updates!
                </p>
              </div>
            </div>
          </div>


        </div>
      </section>
    </Layout>
  );
}
