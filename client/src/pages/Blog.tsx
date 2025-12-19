import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Share2, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Blog() {
  const posts = [
    {
      title: "Awarded Best Poster at 6th QIIM Conference",
      excerpt: "Honored to receive the Best Poster Award at the 6th Qatar International Internal Medicine Conference in Doha for our research on hospital outcomes.",
      date: "October 2024",
      category: "Awards",
      image: "/images/blog-placeholder.png"
    },
    {
      title: "National Research Award Winner 2023 & 2024",
      excerpt: "Proud to be recognized with the National Research Award for two consecutive years, highlighting our team's commitment to advancing medical research in Oman.",
      date: "December 2024",
      category: "Achievements",
      image: "/images/blog-placeholder.png"
    },
    {
      title: "New Publication: Magnesium and Human Health",
      excerpt: "Our latest comprehensive review on Magnesium and Human Health has been published, exploring perspectives and future research directions.",
      date: "August 2024",
      category: "Research",
      image: "/images/blog-placeholder.png"
    }
  ];

  return (
    <Layout>
      <section className="bg-muted/30 py-16 md:py-24 border-b border-border/40">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Insights & Updates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sharing perspectives on medical research, clinical practice, and healthcare education.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={index} className="overflow-hidden border-border/50 hover:shadow-lg transition-all group cursor-pointer">
                <div className="aspect-video overflow-hidden bg-muted relative">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Dr. Abdullah
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <span className="text-sm font-medium text-accent group-hover:underline">Read More &rarr;</span>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share on Twitter</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                            }}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share on LinkedIn</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
