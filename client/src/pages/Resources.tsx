import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
