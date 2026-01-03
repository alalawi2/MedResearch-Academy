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
            
            <div className="relative p-8 md:p-10 -mt-32">
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
          
          {/* Example Publications Section */}
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
