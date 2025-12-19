import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, BarChart, PenTool, Stethoscope, Clock, Calendar, Video, PlayCircle, CheckCircle2 } from "lucide-react";

export default function Programs() {
  const programs = [
    {
      title: "Virtual Research Series",
      description: "A comprehensive 16-week virtual training program covering the entire research lifecycle. Designed for flexibility, this series brings expert mentorship directly to your screen.",
      icon: <Video className="h-8 w-8 text-accent" />,
      duration: "16 Weeks",
      level: "All Levels",
      topics: ["Research Foundations", "Research Methods", "Data Analysis", "Publication & Advanced Topics"],
      featured: true,
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
    },
    {
      title: "Research Methodology Workshop",
      description: "A comprehensive introduction to the fundamentals of medical research. Learn how to formulate research questions, design studies, and navigate the ethical approval process.",
      icon: <BookOpen className="h-8 w-8 text-accent" />,
      duration: "2 Days",
      level: "Beginner",
      topics: ["Study Design", "Protocol Development", "Ethics", "Literature Review"]
    },
    {
      title: "Biostatistics for Clinicians",
      description: "Demystifying statistics for healthcare professionals. Gain practical skills in data analysis, interpretation of results, and using statistical software (SPSS/R).",
      icon: <BarChart className="h-8 w-8 text-accent" />,
      duration: "3 Days",
      level: "Intermediate",
      topics: ["Data Analysis", "Hypothesis Testing", "Regression Models", "Sample Size Calculation"]
    },
    {
      title: "Scientific Writing & Publishing",
      description: "Master the art of writing high-impact research papers. This course covers manuscript structure, journal selection, and responding to peer review.",
      icon: <PenTool className="h-8 w-8 text-accent" />,
      duration: "1 Day",
      level: "All Levels",
      topics: ["Manuscript Preparation", "Journal Selection", "Peer Review Process", "Publication Ethics"]
    },
    {
      title: "Clinical Research Fellowship",
      description: "An intensive mentorship program for residents and junior doctors. Participants will lead a research project from conception to publication under expert guidance.",
      icon: <Stethoscope className="h-8 w-8 text-accent" />,
      duration: "6 Months",
      level: "Advanced",
      topics: ["Mentorship", "Project Management", "Grant Writing", "Publication"]
    }
  ];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="/images/research-lab-abstract.png" className="w-full h-full object-cover" alt="Research Background" />
        </div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Our Programs</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl">
            World-class training designed to equip you with the skills needed to excel in medical research.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className={`border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col ${program.featured ? 'border-accent/50 bg-accent/5 md:col-span-2' : ''}`}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="p-3 bg-primary/5 rounded-lg shrink-0">
                    {program.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="font-serif text-2xl text-primary">{program.title}</CardTitle>
                      {program.featured && <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Featured Program</Badge>}
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {program.duration}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {program.level}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-grow">
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                  
                  {/* Video Preview Section for Featured Program */}
                  {program.hasVideo && (
                    <div className="my-6 relative aspect-video bg-black/5 rounded-xl overflow-hidden border border-border/50 group cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="h-16 w-16 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-8 w-8 ml-1" />
                        </div>
                      </div>
                      <img 
                        src="/images/research-lab-abstract.png" 
                        alt="Virtual Series Preview" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                      />
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge variant="secondary" className="bg-black/50 text-white border-none backdrop-blur-sm">
                          Watch Preview
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Curriculum Display for Featured Program */}
                  {program.curriculum && (
                    <div className="space-y-6 mt-6 border-t border-border/50 pt-6">
                      <h3 className="font-serif font-bold text-lg">Program Curriculum</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {program.curriculum.map((phase, i) => (
                          <div key={i} className="space-y-3">
                            <h4 className="font-semibold text-primary text-sm uppercase tracking-wider">{phase.phase}</h4>
                            <ul className="space-y-2">
                              {phase.modules.map((module, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                  <span>{module}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {program.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/contact">
                    <Button className={`w-full ${program.featured ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}>
                      {program.featured ? 'Join Virtual Series' : 'Register Interest'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-bold">Custom Training Solutions</h2>
          <p className="text-muted-foreground">
            We also offer tailored workshops for hospitals, universities, and research groups. Contact us to discuss your specific training needs.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="text-lg px-8 h-12">
              Request a Proposal
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
