
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
          
          {/* Medical Research Assistant Section */}
          <div className="rounded-xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <div className="p-8 md:p-12 text-white">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  🔬 Medical Research Assistant
                </h2>
                <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive research tools designed for early-career medical researchers. 
                  Plan, design, and write research proposals with AI-powered assistance.
                </p>
              </div>

              {/* 8 Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { icon: '📊', title: 'Sample Size Calculator', desc: '8 statistical tests with beginner-friendly wizard' },
                  { icon: '🧪', title: 'Study Type Wizard', desc: 'Interactive decision tree for study design' },
                  { icon: '📝', title: 'AI Proposal Writer', desc: 'IMRAD templates with PDF/Word export' },
                  { icon: '💬', title: 'Research Chatbot', desc: 'LLM-powered Q&A for research guidance' },
                  { icon: '🔍', title: 'Statistical Test Selector', desc: 'Interactive flowchart to choose tests' },
                  { icon: '📚', title: 'Literature Search', desc: 'PubMed integration for research papers' },
                  { icon: '💰', title: 'Budget Calculator', desc: 'Research budget planning with charts' },
                  { icon: '📅', title: 'Timeline Planner', desc: 'Gantt chart for project milestones' }
                ].map((tool, idx) => (
                  <div 
                    key={idx}
                    className="bg-white/15 backdrop-blur-sm p-5 rounded-lg border border-white/20 hover:-translate-y-1 transition-transform duration-200"
                  >
                    <div className="text-3xl mb-2">{tool.icon}</div>
                    <h4 className="text-base font-semibold mb-2">{tool.title}</h4>
                    <p className="text-sm opacity-90 leading-snug">{tool.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <a 
                  href="https://3000-iudb0l3cxip5864amsdp9-0037ee3b.sg1.manus.computer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-[#667eea] px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Launch Research Assistant →
                </a>
                <p className="mt-4 text-sm opacity-85">
                  Free trial period • No credit card required
                </p>
              </div>
            </div>
          </div>
          
          {/* Example Publications Section */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-accent rounded-full"></div>
                <h2 className="text-2xl font-serif font-bold">Example Publications</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadPublications} 
                disabled={loading}
                className="text-muted-foreground hover:text-primary"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <p className="text-muted-foreground">
              Explore recent work by our founder and team to understand the quality and scope of research we support.
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Fetching latest research...</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
                <p>{error}</p>
                <Button variant="link" onClick={loadPublications} className="text-destructive underline mt-2">Try Again</Button>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No recent publications found via API.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="group bg-card border border-border/50 rounded-lg p-5 hover:bg-muted/20 transition-colors">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{article.journal}</span>
                        <span>•</span>
                        <span>{new Date(article.pubDate).getFullYear()}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold font-serif leading-tight group-hover:text-primary transition-colors">
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                          {article.title}
                          <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                        </a>
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.authors.join(", ")}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sharePublication("whatsapp", article)}>
                            Share on WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sharePublication("linkedin", article)}>
                            Share on LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sharePublication("twitter", article)}>
                            Share on X
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
               <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Dr. Al Alawi's Publications</Button>
               </a>
               <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al-Rawahi+M&sort=date" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Dr. Al Rawahi's Publications</Button>
               </a>
               <a href="https://www.linkedin.com/in/mohamed-al-rawahi-40b76130/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Dr. Al Rawahi's LinkedIn</Button>
               </a>
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
