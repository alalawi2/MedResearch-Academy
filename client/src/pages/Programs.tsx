import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Video, PlayCircle, CheckCircle2, Microscope, Handshake, Users, Lightbulb, Brain, Activity, GraduationCap, FileText, Calendar, Clock, Download, Bell, Mail, Timer, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Programs() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const shareProgram = (platform: string) => {
    const url = window.location.href;
    const text = encodeURIComponent("Join the Virtual Research Series at MedResearch Academy - A comprehensive 16-week research training program.");
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&via=Medresearch_om&hashtags=MedResearchOman,MedicalResearch,ResearchTraining`;
        break;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  useEffect(() => {
    // Target date: Dec 31, 2025 20:00:00 Muscat Time (GMT+4)
    const targetDate = new Date("2025-12-31T20:00:00+04:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Mock subscription logic
    setIsSubscribed(true);
    toast.success("You've been subscribed to session reminders!");
    setEmail("");
  };

  const virtualSeries = {
    title: "Virtual Research Series",
    description: "A comprehensive 16-week virtual training program covering the entire research lifecycle. Designed for flexibility, this series brings expert mentorship directly to your screen.",
    icon: <Video className="h-8 w-8 text-accent" />,
    duration: "16 Weeks",
    level: "All Levels",
    topics: ["Research Foundations", "Research Methods", "Data Analysis", "Publication & Advanced Topics"],
    hasVideo: true,
    curriculum: [
      {
        phase: "Phase 1: Research Foundations (Weeks 1-5)",
        modules: [
          "Research Question Formulation and PICO Framework",
          "Literature Search and Critical Appraisal",
          "Study Designs: Observational vs Interventional",
          "How to Write a Case Report",
          "Ethical Approval and IRB Process"
        ]
      },
      {
        phase: "Phase 2: Research Methods (Weeks 6-10)",
        modules: [
          "Sampling, Bias, and Confounding",
          "Data Collection Tools and Management (REDCap, surveys)",
          "Qualitative Research for Clinicians",
          "Introduction to Systematic Reviews and Meta-Analysis",
          "Introduction to Clinical Trial Design"
        ]
      },
      {
        phase: "Phase 3: Data Analysis (Weeks 11-13)",
        modules: [
          "Introduction to Biostatistics",
          "Regression Models in Clinical Research",
          "Data Visualization and Presentation"
        ]
      },
      {
        phase: "Phase 4: Publication and Advanced Topics (Weeks 14-16)",
        modules: [
          "How to Write and Structure a Research Manuscript",
          "Choosing the Right Journal & Responding to Reviewers",
          "Research Integrity, AI Tools, and Grant Writing Basics"
        ]
      }
    ]
  };

  const researchFocusAreas = [
    {
      title: "Magnesium & Electrolyte Disorders",
      description: "Investigating the clinical impact of dysmagnesemia (ionized vs. total magnesium) on outcomes in ICU, diabetes, and hospitalized patients.",
      icon: <Activity className="h-6 w-6" />,
      tags: ["Ionized Magnesium", "Diabetes Outcomes", "ICU Prognosis"]
    },
    {
      title: "AI & Machine Learning in Medicine",
      description: "Developing predictive models for hospital readmission, delirium prevention, and mortality risk in liver cirrhosis using advanced machine learning algorithms.",
      icon: <Brain className="h-6 w-6" />,
      tags: ["Readmission Prediction", "Delirium Models", "Liver Cirrhosis"]
    },
    {
      title: "Medical Education & Residency Training",
      description: "Evaluating factors influencing residency program choices, resident burnout, and the impact of programmatic interventions on academic performance.",
      icon: <GraduationCap className="h-6 w-6" />,
      tags: ["Resident Burnout", "Program Choice", "Academic Performance"]
    },
    {
      title: "Clinical Trials & Interventions",
      description: "Leading randomized controlled trials (RCTs) on melatonin for delirium prevention and lung ultrasound-guided diuretic therapy for heart failure.",
      icon: <FileText className="h-6 w-6" />,
      tags: ["Melatonin RCT", "Heart Failure", "Ultrasound Therapy"]
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="/images/research-lab-abstract.png" className="w-full h-full object-cover" alt="Research Background" />
        </div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Programs & Research</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl">
            Bridging the gap between education and active scientific inquiry.
          </p>
        </div>
      </section>

      {/* Virtual Research Series Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-1 bg-accent rounded-full"></div>
            <h2 className="text-3xl font-serif font-bold text-primary">Our Flagship Program</h2>
          </div>

          <Card className="border-accent/50 bg-accent/5 shadow-md overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start gap-6 pb-2">
              <div className="p-4 bg-background rounded-xl shadow-sm shrink-0 border border-border/50">
                {virtualSeries.icon}
              </div>
              <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 w-full justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="font-serif text-3xl text-primary">{virtualSeries.title}</CardTitle>
                    <Badge className="bg-green-600 text-white hover:bg-green-700 text-sm px-3 py-1">No Registration Required</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" /> Share Program
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => shareProgram("whatsapp")}>
                        Share on WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareProgram("linkedin")}>
                        Share on LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareProgram("twitter")}>
                        Share on X
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                  {virtualSeries.description}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-6">
              {/* Schedule & Zoom Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Info Card */}
                <div className="lg:col-span-2 bg-background border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Session Details
                    </h3>
                    <div className="hidden md:flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent-foreground text-sm font-medium">
                      <Timer className="h-4 w-4" />
                      <span>Starts in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
                    </div>
                  </div>
                  
                  {/* Mobile Timer (visible only on small screens) */}
                  <div className="md:hidden mb-6 bg-accent/10 px-4 py-2 rounded-lg text-accent-foreground text-center font-medium">
                    <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Next Session Starts In</p>
                    <p className="text-xl font-mono">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</p>
                  </div>

                  {/* Week 1 Flyer Integration */}
                  <div className="mb-8 rounded-lg overflow-hidden border border-border/50 shadow-sm">
                    <img 
                      src="/images/week1-flyer.png" 
                      alt="Week 1: From Clinical Observation to Research Question - Dr. Abdullah Al Alawi" 
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Topic</p>
                      <p className="font-bold text-lg leading-tight">From Clinical Observation to Research Question</p>
                      <p className="text-sm text-muted-foreground">Week 1 Session</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Speaker</p>
                      <p className="font-bold text-lg">Dr. Abdullah Al Alawi</p>
                      <p className="text-sm text-muted-foreground">Senior Consultant</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-center text-muted-foreground mb-1">
                        Click the link below to join directly
                      </p>
                      <a 
                        href="https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Video className="mr-2 h-4 w-4" />
                          Join Zoom Meeting
                        </Button>
                      </a>
                      <div className="text-xs text-muted-foreground text-center">
                        <span className="font-mono bg-muted px-1 py-0.5 rounded">ID: 864 7984 0360</span>
                        <span className="mx-2">•</span>
                        <span className="font-mono bg-muted px-1 py-0.5 rounded">Pass: 857478</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex justify-center">
                    <a 
                      href="https://us02web.zoom.us/meeting/tZIpcOCgqjspHNRZs5jxGPeRoi0ke9tUY3ew/ics?icsToken=DJnHm43htTyGrgiZvgAALAAAAPh0_NHeVAmTv7jYnKeCJE0iivclYlPmE516nmsAzCZf7YIyWKt9jlQQBef-Mh7febWMUHOdkQ432uf72TAwMDAwMQ&meetingMasterEventId=91mxO4X8SRSwFEzvqa7KtA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-accent hover:underline font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Add Series to Calendar (.ics)
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-background border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Session Details
                    </h3>
                    <div className="hidden md:flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent-foreground text-sm font-medium">
                      <Timer className="h-4 w-4" />
                      <span>Starts in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
                    </div>
                  </div>
                  
                  {/* Mobile Timer (visible only on small screens) */}
                  <div className="md:hidden mb-6 bg-accent/10 px-4 py-2 rounded-lg text-accent-foreground text-center font-medium">
                    <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Next Session Starts In</p>
                    <p className="text-xl font-mono">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Next Meeting</p>
                      <p className="font-bold text-lg">Dec 31, 2025</p>
                      <p className="text-sm text-muted-foreground">Every 14 days</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Time</p>
                      <p className="font-bold text-lg">8:00 PM - 9:00 PM</p>
                      <p className="text-sm text-muted-foreground">Muscat Time</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-center text-muted-foreground mb-1">
                        Click the link below to join directly
                      </p>
                      <a 
                        href="https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Video className="mr-2 h-4 w-4" />
                          Join Zoom Meeting
                        </Button>
                      </a>
                      <div className="text-xs text-muted-foreground text-center">
                        <span className="font-mono bg-muted px-1 py-0.5 rounded">ID: 864 7984 0360</span>
                        <span className="mx-2">•</span>
                        <span className="font-mono bg-muted px-1 py-0.5 rounded">Pass: 857478</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex justify-center">
                    <a 
                      href="https://us02web.zoom.us/meeting/tZIpcOCgqjspHNRZs5jxGPeRoi0ke9tUY3ew/ics?icsToken=DJnHm43htTyGrgiZvgAALAAAAPh0_NHeVAmTv7jYnKeCJE0iivclYlPmE516nmsAzCZf7YIyWKt9jlQQBef-Mh7febWMUHOdkQ432uf72TAwMDAwMQ&meetingMasterEventId=91mxO4X8SRSwFEzvqa7KtA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-accent hover:underline font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Add Series to Calendar (.ics)
                    </a>
                  </div>
                </div>

                {/* Reminder Signup Form */}
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3 text-accent-foreground">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-bold">Get Reminders</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Don't miss a session! We'll email you 1 hour before each meeting starts.
                  </p>
                  
                  {isSubscribed ? (
                    <div className="bg-background/50 rounded-lg p-4 text-center border border-accent/20 animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-bold text-primary">You're Subscribed!</p>
                      <p className="text-xs text-muted-foreground">Check your inbox for confirmation.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          className="pl-9 bg-background"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        Subscribe
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Video Preview */}
              <div className="relative aspect-video md:aspect-[21/9] bg-black rounded-xl overflow-hidden border border-border/50 shadow-lg">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls
                >
                  <source src="/images/program_preview.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                  <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-sm px-3 py-1 text-sm animate-pulse">
                    Watch Program Preview
                  </Badge>
                </div>
              </div>

              {/* Curriculum Grid */}
              <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
                <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Program Curriculum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {virtualSeries.curriculum.map((phase, i) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-semibold text-primary text-sm uppercase tracking-wider border-b border-border/50 pb-2">{phase.phase}</h4>
                      <ul className="space-y-2">
                        {phase.modules.map((module, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0"></span>
                            <span>{module}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-background/50 border-t border-border/50 p-6 md:p-8">
              <Link href="/contact?subject=Virtual Research Series Inquiry">
                <Button size="lg" className="w-full md:w-auto text-lg px-8 bg-accent text-accent-foreground hover:bg-accent/90">
                  Join Open Session
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Current Research Focus Section */}
      <section className="py-20 bg-muted/30 border-y border-border/40">
        <div className="container">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-3xl font-serif font-bold text-primary">Current Research Focus</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchFocusAreas.map((area, index) => (
              <Card key={index} className="border-border/50 hover:shadow-md transition-all flex flex-col">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg text-primary">
                    {area.icon}
                  </div>
                  <CardTitle className="font-serif text-lg leading-tight">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {area.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {area.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] font-normal px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Collaborate With Us</h2>
            <p className="text-xl text-muted-foreground">
              We believe in the power of partnership to advance medical science and education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:border-accent/50 transition-colors">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Join as an Educator</h3>
              <p className="text-muted-foreground mb-6">
                Share your expertise by leading a session in our Virtual Research Series. We welcome mentors in biostatistics, clinical trials, and medical writing.
              </p>
              <Link href="/contact?subject=Mentorship Inquiry">
                <Button variant="outline" className="w-full">Become a Mentor</Button>
              </Link>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-sm hover:border-accent/50 transition-colors">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Handshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Partner in Research</h3>
              <p className="text-muted-foreground mb-6">
                Collaborate on our active projects in metabolic disorders and AI-driven hepatology, or propose a new multi-center study.
              </p>
              <Link href="/contact?subject=Research Collaboration Proposal">
                <Button variant="outline" className="w-full">Propose Collaboration</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
