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
      image: "/images/news-omsb.jpg",
      link: "https://www.omandaily.om/عمان-اليوم/na/الملتقى-السنوي-للاختصاصات-الطبية-يستعرض-المسارات-المهنية-والبحثية"
    },
    {
      id: 2,
      title: "First Annual Scientific Research Day at Khoula Hospital",
      date: "November 2025",
      summary: "Khoula Hospital hosted its First Annual Scientific Research Day, emphasizing the importance of research in advancing healthcare services. The event featured presentations on various medical studies and highlighted the hospital's commitment to fostering a culture of scientific inquiry.",
      image: "/images/news-khoula.jpg",
      link: "https://x.com/omantvnews/status/1988914446681465147"
    },
    {
      id: 3,
      title: "Winners of the 'Forsatak' Program Announced",
      date: "October 2025",
      summary: "The Innovation & Technology Transfer Center at Sultan Qaboos University congratulated the winners of the 'Forsatak' program. This achievement highlights the continued excellence and success of participants in fostering innovation and entrepreneurship within the university community.",
      image: "/images/news-squ.jpg",
      link: "https://x.com/ITTC_SQU/status/1983150366012387536"
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
              <Card key={item.id} className="flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-48 w-full relative overflow-hidden bg-muted">
                   <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg class="h-12 w-12 opacity-20" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>';
                      e.currentTarget.parentElement?.appendChild(icon);
                    }}
                   />
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
