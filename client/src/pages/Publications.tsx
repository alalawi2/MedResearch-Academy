import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLatestPublications, type PubMedArticle } from "@/lib/pubmed";
import { Badge } from "@/components/ui/badge";

export default function Publications() {
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Highlighted/Selected publications (Manual curation for key papers)
  const selectedPublications = [
    {
      title: "Magnesium and Human Health: Perspectives and Research Directions",
      journal: "International Journal of Endocrinology",
      year: "2018",
      citations: "663+",
      link: "https://pubmed.ncbi.nlm.nih.gov/29849626/"
    },
    {
      title: "Machine Learning-Powered 28-Day Mortality Prediction Model Following Hospitalization with Acute Decompensation of Liver Cirrhosis",
      journal: "ResearchGate",
      year: "2024",
      citations: "Recent",
      link: "https://www.researchgate.net/publication/379674216_Machine_Learning-Powered_28-Day_Mortality_Prediction_Model_Following_Hospitalization_with_Acute_Decompensation_of_Liver_Cirrhosis"
    }
  ];

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestPublications(10);
      setArticles(data);
    } catch (err) {
      setError("Failed to load latest publications from PubMed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-background py-16 md:py-24 border-b border-border/40">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Publications</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A comprehensive collection of research contributing to internal medicine, metabolic disorders, and healthcare quality.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl space-y-16">
          
          {/* Selected Highlights Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              <h2 className="text-2xl font-serif font-bold">Key Highlights</h2>
            </div>
            
            <div className="grid gap-6">
              {selectedPublications.map((pub, index) => (
                <div key={index} className="group relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-md transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm text-accent font-medium">
                        <FileText className="h-4 w-4" />
                        <span>{pub.journal}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{pub.year}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">Highly Cited</Badge>
                      </div>
                      <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">
                        <a href={pub.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {pub.title}
                        </a>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Citations: <span className="font-medium text-foreground">{pub.citations}</span>
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                        <ExternalLink className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Feed Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-muted-foreground/30 rounded-full"></div>
                <h2 className="text-2xl font-serif font-bold">Latest from PubMed</h2>
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
              <div className="space-y-6">
                {articles.map((article) => (
                  <div key={article.id} className="group bg-card border border-border/50 rounded-lg p-5 hover:bg-muted/20 transition-colors">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{article.journal}</span>
                        <span>•</span>
                        <span>{new Date(article.pubDate).getFullYear()}</span>
                        {article.doi && (
                          <>
                            <span>•</span>
                            <span className="font-mono">DOI: {article.doi}</span>
                          </>
                        )}
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
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Data automatically retrieved from NCBI PubMed API.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* External Profiles */}
          <div className="mt-16 pt-16 border-t border-border/40 text-center space-y-6">
            <h3 className="text-2xl font-serif font-bold">View Complete Profiles</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM&cauthor_id=29849626" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  PubMed Profile <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://www.researchgate.net/profile/Abdullah-Al-Alawi-4" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  ResearchGate <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://orcid.org/0000-0003-2077-7186" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  ORCID <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
