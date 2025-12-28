import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowRight, ExternalLink, Search, Loader2, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6); // Initial number of items to show
  const ITEMS_PER_PAGE = 3; // Number of items to add when clicking "Load More"

  const newsItems = [
    {
      id: 14,
      title: "Dr. Omar Al Taie Wins First Place for Best Scientific Research",
      date: "December 2025",
      summary: "Dr. Omar Al Taie, a resident in the Internal Medicine Program, was awarded First Place for the best scientific research at the 7th Annual Research Forum of the National Heart Center. His winning study was titled: \"Ten-Year Trends in Cardiac Mortality and Sudden Death in Oman (2014–2023).\"",
      image: "/images/dr_omar_award.webp",
      link: "https://x.com/OMSB_OM/status/2005151473563557933"
    },
    {
      id: 13,
      title: "Dr. Marwa Al Sharji Presents at International Conference",
      date: "December 2025",
      summary: "Dr. Marwa Al Sharji, a resident in the Internal Medicine Program, presented a scientific poster at the Emirates International Gastroenterology and Hepatology Conference. Her research evaluated the effectiveness of platelet-related indices in predicting esophageal varices and liver fibrosis complications in cirrhotic patients.",
      image: "/images/dr_marwa_poster.webp",
      link: "https://x.com/OMSB_OM/status/2005154326424228031"
    },
    {
      id: 12,
      title: "Launch of Medad: Revolutionizing Clinical Documentation with AI",
      date: "December 2025",
      summary: "We are proud to announce the launch of Medad, an AI-powered ambient clinical documentation system designed specifically for Omani healthcare. This innovative solution automates medical transcription in Arabic and English, restoring the doctor-patient connection.",
      image: "/images/medad_hero.webp",
      link: "https://www.medad.om/"
    },
    {
      id: 1,
      title: "Annual Forum for Medical Specialties Highlights Career and Research Pathways",
      date: "February 2025",
      summary: "The Oman Medical Specialty Board (OMSB) organized the Annual Forum for Career Guidance and Scientific Research 2025/2026 at the Oman Convention and Exhibition Centre. The event showcased research achievements and honored winners of scientific research and poster competitions.",
      image: "/images/news-omsb.jpg",
      link: "https://www.omandaily.om/عمان-اليوم/na/الملتقى-السنوي-للاختصاصات-الطبية-يستعرض-المسارات-المهنية-والبحثية"
    },
    {
      id: 4,
      title: "UMC Congratulates Dr. Aisha Al Huraizi and Team on National Research Award",
      date: "December 2024",
      summary: "The University Medical City (UMC) congratulated Dr. Aisha Al Huraizi and her research team, led by Dr. Abdullah Al Alawi and Dr. Khalfan Al Zaidi, for winning the National Research Award in the Young Researchers category at the Annual Forum for Researchers.",
      image: "/images/news-umc-award.jpg",
      link: "https://x.com/UMC_OMAN/status/1866122329937350820"
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
      id: 5,
      title: "Internal Medicine Program Organizes 'Scientific Research Day'",
      date: "October 2025",
      summary: "The Internal Medicine Program at OMSB organized a 'Scientific Research Day' bringing together residents and faculty members to present and discuss their scientific research, fostering a collaborative environment for academic growth.",
      image: "/images/news-omsb-internal-med-oct.jpg",
      link: "https://x.com/OMSB_OM/status/1981972765268967804"
    },
    {
      id: 3,
      title: "Winners of the 'Forsatak' Program Announced",
      date: "October 2025",
      summary: "The Innovation & Technology Transfer Center at Sultan Qaboos University congratulated the winners of the 'Forsatak' program. This achievement highlights the continued excellence and success of participants in fostering innovation and entrepreneurship within the university community.",
      image: "/images/news-squ.jpg",
      link: "https://x.com/ITTC_SQU/status/1983150366012387536"
    },
    {
      id: 7,
      title: "Internal Medicine Program Research Day Presentations",
      date: "October 2024",
      summary: "Another successful 'Scientific Research Day' was held by the Internal Medicine Program, where residents and faculty gathered to showcase their latest research findings and discuss advancements in the field.",
      image: "/images/news-omsb-research-day-oct5.jpg",
      link: "https://x.com/OMSB_OM/status/1842467280526962892"
    },
    {
      id: 6,
      title: "Internal Medicine Program Annual Gathering",
      date: "May 2025",
      summary: "The Internal Medicine Program held its annual gathering with residents, trainers, and faculty to discuss training challenges and exchange ideas on leveraging diverse skills to overcome them.",
      image: "/images/news-omsb-internal-med-may.jpg",
      link: "https://x.com/OMSB_OM/status/1924140013576433825"
    },
    {
      id: 8,
      title: "Dr. Raja Al Farsi Wins National Research Award",
      date: "December 2023",
      summary: "The University Medical City (UMC) congratulated Dr. Raja Al Farsi from OMSB for winning the National Research Award (Health and Community Service Sector) for her scientific paper on 'Delirium in Patients Admitted to the Internal Medicine Department: Prevalence, Recognition, and Risk Factors'.",
      image: "/images/news-umc-raja-award.jpg",
      link: "https://x.com/UMC_OMAN/status/1731914315454717976"
    },
    {
      id: 9,
      title: "Dr. Mohamed Al Rawahi Mentors Medical Students in Research",
      date: "December 2025",
      summary: "Dr. Mohamed Al Rawahi highlights the impact of student-led research on hypertrophic cardiomyopathy in Oman. This achievement reflects the true role of education: sharing knowledge, building research skills, and inspiring the next generation to aim higher.",
      image: "/images/news/linkedin_post_1.webp",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7405297235590213632/"
    },
    {
      id: 10,
      title: "Graduation from EHRA Level 3 Leadership Program",
      date: "September 2025",
      summary: "Dr. Mohamed Al Rawahi graduated from the EHRA Level 3 – Leadership and Innovation in Cardiac Arrhythmia Management (DAS-CAM) program at Maastricht University. This prestigious program strengthens leadership skills and broadens perspectives on innovation in electrophysiology.",
      image: "/images/news/linkedin_post_2.webp",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7403831930363961344/"
    },
    {
      id: 11,
      title: "Participation in Gulf Arrhythmia Forum",
      date: "September 2023",
      summary: "Dr. Mohamed Al Rawahi participated in the Gulf Arrhythmia Forum held in Salalah. The event brought together outstanding individuals in the field of electrophysiology to discuss ventricular arrhythmias and other cardiac conditions.",
      image: "/images/news/linkedin_post_3.webp",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7104288117586558976/"
    }
  ];

  // Helper function to parse date strings like "February 2025" into Date objects
  const parseDate = (dateString: string) => {
    const parts = dateString.split(' ');
    if (parts.length !== 2) return new Date(); // Fallback
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    return new Date(year, monthIndex);
  };

  // Sort news items by date (newest first)
  const sortedNewsItems = [...newsItems].sort((a, b) => {
    return parseDate(b.date).getTime() - parseDate(a.date).getTime();
  });

  // Filter items based on search query
  const filteredNews = useMemo(() => {
    return sortedNewsItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedNewsItems]);

  // Get the items to display based on visible count
  const displayedNews = filteredNews.slice(0, visibleCount);
  
  // Check if there are more items to load
  const hasMore = visibleCount < filteredNews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Reset visible count when search query changes
  useMemo(() => {
    setVisibleCount(6);
  }, [searchQuery]);

  const shareNews = (platform: string, item: typeof newsItems[0]) => {
    const text = encodeURIComponent(`${item.title} - MedResearch Academy`);
    const url = encodeURIComponent(item.link);
    
    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

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

      <section className="py-12 bg-muted/30">
        <div className="container max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              type="text" 
              placeholder="Search news..." 
              className="pl-10 bg-background border-primary/20 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="container">
          {displayedNews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedNews.map((item) => (
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
                    <CardFooter className="flex gap-2">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-grow">
                        <Button variant="outline" className="w-full gap-2">
                          Read More <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => shareNews("whatsapp", item)}>
                            Share on WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareNews("linkedin", item)}>
                            Share on LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareNews("twitter", item)}>
                            Share on X (Twitter)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleLoadMore} 
                    size="lg" 
                    variant="secondary"
                    className="min-w-[200px]"
                  >
                    Load More News
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No news items found matching your search.</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                Clear search
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
