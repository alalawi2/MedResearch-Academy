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

          {/* Bayan Adaptive Learning Platform - Now Live */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-[#0a1628] via-[#0d2040] to-[#0a1628] shadow-xl">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </div>

            {/* Live badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Now Live
              </div>
            </div>

            <div className="relative z-10 p-8 md:p-12">
              {/* Logo + Title row */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                <img
                  src="/images/bayan_logo_final_v2.png"
                  alt="Bayan Logo"
                  className="h-24 w-24 object-contain shrink-0"
                />
                <div>
                  <div className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium mb-3">
                    AI-Powered Board Exam Preparation — Free for All Residents
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                    Bayan: Master Internal Medicine.
                    <span className="text-accent"> Pass Your Board Exam.</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Left: Description + CTA */}
                <div className="space-y-6">
                  <p className="text-white/70 leading-relaxed">
                    Bayan is a free AI-powered medical board exam preparation platform built by MedResearch Academy for residents and medical professionals in Oman and the region. Thousands of physician-reviewed clinical vignettes — all based on the latest AHA, ESC, KDIGO, IDSA, and ADA guidelines — mapped to your target exam.
                  </p>

                  {/* Supported exams */}
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Supported Board Exams</p>
                    <div className="flex flex-wrap gap-2">
                      {['🇴🇲 OMSB Part I & II', '🏥 Arab Board IM', '🇬🇧 MRCP(UK)', '🇺🇸 ABIM', '🇺🇸 USMLE Step 2 CK', '🇦🇪 DHA / HAAD / MOH', '🇶🇦 QCHP', '🇸🇦 SMLE', '🇦🇺 RACP', '🇵🇰 FCPS Part 1', '+ more'].map(exam => (
                        <span key={exam} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full border border-white/10">{exam}</span>
                      ))}
                    </div>
                  </div>

                  {/* Feedback note */}
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-xl">💬</span>
                    <div>
                      <p className="text-sm font-semibold text-white/80">Shape the Platform with Your Feedback</p>
                      <p className="text-xs text-white/50 mt-1">Rate questions and submit feedback directly inside Bayan after each question. Your input drives continuous improvement of the question bank.</p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-3">
                    <a href="https://bayan-med.vercel.app" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2">
                        <ExternalLink className="h-5 w-5" />
                        Launch Bayan Free
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const text = encodeURIComponent('Bayan — Free Medical Board Exam Prep by MedResearch Academy');
                        const url = encodeURIComponent('https://bayan-med.vercel.app');
                        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'width=600,height=400');
                      }}
                      className="border-white/20 text-white hover:bg-white/10 gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share with Colleagues
                    </Button>
                  </div>
                </div>

                {/* Right: Feature grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🧠', title: 'Adaptive Learning', desc: 'AI adjusts difficulty to your level in real time' },
                    { icon: '📚', title: 'Knowledge Library', desc: 'Clinical articles with highlighted key terms' },
                    { icon: '🃏', title: 'Flashcards', desc: 'Spaced repetition for long-term retention' },
                    { icon: '📈', title: 'Analytics', desc: 'Detailed performance tracking & insights' },
                    { icon: '📅', title: 'Study Planner', desc: 'Weekly schedule & personalized goals' },
                    { icon: '🏆', title: 'Leaderboard', desc: 'Compete with fellow residents' },
                  ].map(f => (
                    <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <p className="text-sm font-semibold text-white/90">{f.title}</p>
                      <p className="text-xs text-white/50 mt-1">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer stats */}
              <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div><p className="text-2xl font-bold text-accent">10+</p><p className="text-xs text-white/50">Board Exams Covered</p></div>
                <div><p className="text-2xl font-bold text-accent">3-Tier</p><p className="text-xs text-white/50">Editorial Review</p></div>
                <div><p className="text-2xl font-bold text-accent">14</p><p className="text-xs text-white/50">Specialties</p></div>
                <div><p className="text-2xl font-bold text-accent">Free</p><p className="text-xs text-white/50">No subscription needed</p></div>
              </div>
            </div>
          </div>


        </div>
      </section>
    </Layout>
  );
}
