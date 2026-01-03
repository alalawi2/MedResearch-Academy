import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Video, PlayCircle, CheckCircle2, Microscope, Handshake, Users, Lightbulb, Brain, Activity, GraduationCap, FileText, Calendar, Clock, ExternalLink, Share2, Bell, User, Download, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SessionCountdown from "@/components/SessionCountdown";
import AddToCalendar from "@/components/AddToCalendar";
import ReminderDialog from "@/components/ReminderDialog";
import { trpc } from "@/lib/trpc";

export default function Programs() {
  const { data: upcomingSessions = [] } = trpc.sessions.getUpcoming.useQuery();
  const { data: pastSessions = [] } = trpc.sessions.getPast.useQuery();

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

  const nextSession = upcomingSessions[0];

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
          "Introduction to Biostatistics",
          "Hypothesis Testing and P-values"
        ]
      },
      {
        phase: "Phase 3: Data Analysis (Weeks 11-14)",
        modules: [
          "Descriptive Statistics and Data Visualization",
          "Introduction to SPSS/R for Medical Research",
          "Common Statistical Tests (t-test, chi-square, ANOVA)",
          "Regression Analysis Basics",
        ]
      },
      {
        phase: "Phase 4: Publication & Advanced Topics (Weeks 15-16)",
        modules: [
          "How to Write a Research Manuscript",
          "Choosing the Right Journal and Submission Process",
          "Responding to Peer Review",
          "Grant Writing Essentials"
        ]
      }
    ]
  };

  const mentorshipProgram = {
    title: "One-on-One Mentorship",
    description: "Get personalized guidance from experienced researchers. Tailored support for your specific research projects and career goals.",
    icon: <Handshake className="h-8 w-8 text-accent" />,
    duration: "Flexible",
    level: "All Levels",
    benefits: [
      "Personalized research guidance",
      "Project-specific support",
      "Career development advice",
      "Manuscript review and feedback"
    ]
  };

  const collaborativeResearch = {
    title: "Collaborative Research Projects",
    description: "Join ongoing research initiatives or propose your own. Work alongside experienced researchers on impactful studies.",
    icon: <Users className="h-8 w-8 text-accent" />,
    duration: "Project-based",
    level: "Intermediate+",
    opportunities: [
      "Multi-center clinical studies",
      "Systematic reviews and meta-analyses",
      "Quality improvement projects",
      "Medical education research"
    ]
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="container">
          <div className="max-w-3xl">
            <Badge className="mb-4">Training Programs</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Build Your Research Skills
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From foundational concepts to publication-ready manuscripts, our programs equip you with the knowledge and confidence to conduct meaningful medical research.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/contact?subject=Virtual Research Series Inquiry">
                <Button size="lg">
                  Join Open Session
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Program
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => shareProgram("whatsapp")}>
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareProgram("linkedin")}>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareProgram("twitter")}>
                    Share on X (Twitter)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Next Session Countdown */}
      {nextSession && (
        <section className="py-12 bg-muted/30">
          <div className="container">
            <SessionCountdown
              sessionDate={nextSession.sessionDate!}
              title={nextSession.title}
            />
            
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {nextSession.zoomLink && (
                <Button asChild size="lg">
                  <a href={nextSession.zoomLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Zoom Meeting
                  </a>
                </Button>
              )}
              
              <AddToCalendar
                title={nextSession.title}
                description={nextSession.description || undefined}
                location={nextSession.zoomLink || "Online"}
                startDate={nextSession.sessionDate!}
                duration={90}
              />
            </div>
          </div>
        </section>
      )}

      {/* Virtual Research Series */}
      <section className="py-20">
        <div className="container">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {virtualSeries.icon}
                  <div>
                    <CardTitle className="text-3xl mb-2">{virtualSeries.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{virtualSeries.duration}</Badge>
                      <Badge variant="secondary">{virtualSeries.level}</Badge>
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        No Registration Required
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <p className="text-lg text-muted-foreground mb-8">{virtualSeries.description}</p>
              
              {/* Curriculum */}
              <div className="space-y-6 mb-8">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  Curriculum Overview
                </h3>
                
                <div className="grid gap-6">
                  {virtualSeries.curriculum.map((phase, idx) => (
                    <Card key={idx} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="text-xl">{phase.phase}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {phase.modules.map((module, moduleIdx) => (
                            <li key={moduleIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{module}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                    <Calendar className="h-6 w-6 text-primary" />
                    Upcoming Sessions
                  </h3>
                  
                  <div className="grid gap-6">
                    {upcomingSessions.map((session: any) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow border-2 border-primary/20">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Flyer Image for Beyond PubMed, Speaker Photo for others */}
                            <div className="flex-shrink-0">
                              {session.title.includes("Beyond PubMed") ? (
                                <div className="w-full md:w-80 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                                  <img 
                                    src="/images/beyond-pubmed-flyer.png" 
                                    alt="Beyond PubMed Session Flyer" 
                                    className="w-full h-auto object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20 shadow-md">
                                  <img 
                                    src="/images/dr-rawahi.jpg" 
                                    alt="Dr. Mohamed Al Rawahi" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Session Details */}
                            <div className="flex-1">
                              <h4 className="text-xl font-bold mb-2 text-primary">{session.title}</h4>
                              
                              {/* Speaker Info */}
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <User className="h-4 w-4 text-accent" />
                                <div>
                                  <span className="font-semibold">Dr. Mohamed Al Rawahi</span>
                                  <span className="text-muted-foreground"> • MD, MSc, FRCPC, ABIM</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">Senior Consultant in Cardiac Electrophysiology</p>
                              
                              <p className="text-muted-foreground mb-4 mt-3">{session.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {new Date(session.sessionDate).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {new Date(session.sessionDate).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                
                                {/* Reminder Button */}
                                <ReminderDialog 
                                  lectureId={session.id}
                                  sessionTitle={session.title}
                                />
                                
                                {/* Flyer Download Button - Only for Beyond PubMed session */}
                                {session.title.includes("Beyond PubMed") && (
                                  <a 
                                    href="/images/beyond-pubmed-flyer.png" 
                                    download="Beyond-PubMed-Flyer.png"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download Flyer
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            {session.videoUrl && (
                              <div className="flex items-center">
                                <Button variant="outline" size="lg" asChild>
                                  <Link href={`/lectures/${session.id}`}>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    View Lecture
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions Archive */}
              {pastSessions.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    Past Sessions (Recordings Available)
                  </h3>
                  
                  <div className="grid gap-3">
                    {pastSessions.slice(0, 5).map((session: any) => (
                      <Card key={session.id} className="opacity-75 hover:opacity-100 transition-opacity">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(session.sessionDate).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            
                            {session.videoUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/lectures/${session.id}`}>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Watch
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {pastSessions.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild>
                        <Link href="/lectures">
                          View All Recordings ({pastSessions.length})
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-muted/30 flex-wrap gap-4">
              <Button asChild>
                <Link href="/contact?subject=Virtual Research Series Inquiry">
                  Join Open Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/lectures">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  View All Lectures
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Other Programs */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Additional Opportunities</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mentorship */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  {mentorshipProgram.icon}
                  <div>
                    <CardTitle className="text-2xl">{mentorshipProgram.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{mentorshipProgram.duration}</Badge>
                      <Badge variant="secondary">{mentorshipProgram.level}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{mentorshipProgram.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {mentorshipProgram.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact?subject=Mentorship Inquiry">
                    Become a Mentor
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Collaborative Research */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  {collaborativeResearch.icon}
                  <div>
                    <CardTitle className="text-2xl">{collaborativeResearch.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{collaborativeResearch.duration}</Badge>
                      <Badge variant="secondary">{collaborativeResearch.level}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{collaborativeResearch.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {collaborativeResearch.opportunities.map((opportunity, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact?subject=Research Collaboration">
                    Propose Collaboration
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
