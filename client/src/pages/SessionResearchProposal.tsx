import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Download, Share2, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function SessionResearchProposal() {
  const sessionDate = new Date("2026-02-11T20:00:00+04:00");
  const registrationLink = "https://us02web.zoom.us/meeting/register/JF4MkhQCSgCAHDmzSA0gTg";
  const flyerPath = "/images/research-proposal-flyer.png";

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Calendar className="mr-2 h-4 w-4" />
              February 11, 2026 • 8:00 PM Muscat Time
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              How to Write a Research Proposal
            </h1>
            <p className="text-xl text-primary-foreground/90">
              From Idea to Approval
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a href={registrationLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Register Now
                </Button>
              </a>
              <a href={flyerPath} download>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Download className="mr-2 h-4 w-4" />
                  Download Flyer
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Session Details */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Duration</h3>
              <p className="text-muted-foreground">60 Minutes</p>
            </Card>
            <Card className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Platform</h3>
              <p className="text-muted-foreground">Zoom</p>
            </Card>
            <Card className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Audience</h3>
              <p className="text-muted-foreground">All Healthcare Professionals</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Session Overview</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Learn the essential skills to craft a compelling research proposal that gets approved. This comprehensive session will guide you through every step of the proposal writing process, from conceptualizing your research idea to presenting it effectively to funding bodies and ethics committees.
              </p>
            </div>

            {/* Learning Objectives */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                <Target className="h-7 w-7" />
                Learning Objectives
              </h2>
              <div className="grid gap-4">
                {[
                  "Understand the key components of a successful research proposal",
                  "Develop a clear and focused research question using FINER criteria",
                  "Write compelling background and rationale sections",
                  "Design appropriate methodology and study protocols",
                  "Create realistic budgets and timelines",
                  "Address ethical considerations effectively",
                  "Navigate the approval process with confidence"
                ].map((objective, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{objective}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Agenda */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                <BookOpen className="h-7 w-7" />
                Session Agenda
              </h2>
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm">
                      0-10 min
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Introduction & Overview</h3>
                      <p className="text-muted-foreground">
                        Welcome, session objectives, and overview of the proposal writing journey
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm">
                      10-25 min
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Developing Your Research Question</h3>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>FINER criteria for research questions</li>
                        <li>Common pitfalls and how to avoid them</li>
                        <li>Practical examples from successful proposals</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm">
                      25-40 min
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Core Components of the Proposal</h3>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Background and significance</li>
                        <li>Literature review strategies</li>
                        <li>Methodology and study design</li>
                        <li>Budget and timeline planning</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm">
                      40-50 min
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Ethics & Approval Process</h3>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Ethical considerations in research</li>
                        <li>Navigating ethics committee requirements</li>
                        <li>Common reasons for rejection and how to address them</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm">
                      50-60 min
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Q&A and Practical Tips</h3>
                      <p className="text-muted-foreground">
                        Open discussion, participant questions, and actionable advice for your proposals
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Speaker Bio */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">About the Speaker</h2>
              <Card className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img 
                    src="/images/dr-alawi.jpg" 
                    alt="Dr. Abdullah M. Al Alawi" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-serif font-bold mb-1">Dr. Abdullah M. Al Alawi</h3>
                      <p className="text-muted-foreground font-medium">BSc, MD, MSc, FRACP, FACP</p>
                      <p className="text-primary font-semibold">Founder, MedResearch Academy</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Dr. Abdullah Al Alawi is a distinguished physician-researcher and the founder of MedResearch Academy. With extensive experience in clinical research and medical education, he has mentored over 50 students and healthcare professionals in research methodology and proposal writing. His expertise spans internal medicine, research design, and biostatistics, making him uniquely qualified to guide aspiring researchers through the proposal development process.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Dr. Al Alawi has successfully secured numerous research grants and has published extensively in peer-reviewed journals. His practical, hands-on approach to teaching research skills has helped countless healthcare professionals transform their research ideas into funded projects.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Target Audience */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Who Should Attend</h2>
              <Card className="p-6">
                <ul className="grid md:grid-cols-2 gap-3">
                  {[
                    "Medical students planning research projects",
                    "Residents and fellows seeking research opportunities",
                    "Early-career researchers",
                    "Healthcare professionals interested in clinical research",
                    "Nurses and allied health professionals",
                    "Anyone preparing to submit a research proposal"
                  ].map((audience, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{audience}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center space-y-4">
              <h3 className="text-2xl font-serif font-bold text-primary">Ready to Get Started?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join us on February 11th and take the first step toward getting your research proposal approved. This session is free and open to all healthcare professionals.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                <a href={registrationLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Register for Free
                  </Button>
                </a>
                <Link href="/programs">
                  <Button size="lg" variant="outline">
                    View All Programs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
