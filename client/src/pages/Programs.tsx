import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, BarChart, PenTool, Stethoscope, Clock, Calendar } from "lucide-react";

export default function Programs() {
  const programs = [
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
              <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="p-3 bg-primary/5 rounded-lg shrink-0">
                    {program.icon}
                  </div>
                  <div>
                    <CardTitle className="font-serif text-2xl text-primary mb-2">{program.title}</CardTitle>
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
                    <Button className="w-full">Register Interest</Button>
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
