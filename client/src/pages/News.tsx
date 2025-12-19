import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function News() {
  const newsItems = [
    {
      id: 1,
      title: "Annual Forum for Medical Specialties Highlights Career and Research Pathways",
      date: "February 2025",
      summary: "The Oman Medical Specialty Board (OMSB) organized the Annual Forum for Career Guidance and Scientific Research 2025/2026 at the Oman Convention and Exhibition Centre. The event showcased research achievements and honored winners of scientific research and poster competitions.",
      image: "/images/news-omsb-forum.jpg", // Placeholder, we might need to find a generic image or use a color block
      link: "https://www.omandaily.om/عمان-اليوم/na/الملتقى-السنوي-للاختصاصات-الطبية-يستعرض-المسارات-المهنية-والبحثية"
    }
  ];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Latest News</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Updates on our activities, achievements, and contributions to the medical research community.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Card key={item.id} className="flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-muted w-full relative overflow-hidden rounded-t-xl">
                   {/* Using a generic medical/conference placeholder since we can't scrape the exact image easily without more tools */}
                   <div className="absolute inset-0 bg-accent/10 flex items-center justify-center text-accent">
                      <Calendar className="h-12 w-12 opacity-20" />
                   </div>
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {item.date}
                  </div>
                  <CardTitle className="font-serif text-xl leading-tight">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.summary}
                  </p>
                </CardContent>
                <CardFooter>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      Read More <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
