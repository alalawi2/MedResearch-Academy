import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      title: "Understanding Dysmagnesemia in Hospitalized Patients",
      excerpt: "Magnesium disorders are common yet often overlooked in clinical settings. This article explores the incidence and implications of dysmagnesemia...",
      date: "October 15, 2024",
      category: "Clinical Insights",
      image: "/images/blog-placeholder.png"
    },
    {
      title: "The Future of Internal Medicine Residency in Oman",
      excerpt: "As we adapt to new educational models, the residency program at OMSB is evolving to meet international standards while addressing local healthcare needs...",
      date: "September 2, 2024",
      category: "Medical Education",
      image: "/images/blog-placeholder.png"
    },
    {
      title: "AI in Predicting Liver Cirrhosis Outcomes",
      excerpt: "Machine learning offers promising tools for prognostication. Our recent study demonstrates how AI can improve mortality prediction in acute liver decompensation...",
      date: "August 10, 2024",
      category: "Research Update",
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
                <CardFooter className="pt-0">
                  <span className="text-sm font-medium text-accent group-hover:underline">Read More &rarr;</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
