import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-24 md:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="/images/hero-medical-research.png" 
            alt="Medical Research Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 mix-blend-multiply" />
        </div>
        
        <div className="container relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent border border-accent/20">
              Senior Consultant & Medical Researcher
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Advancing Medicine Through <span className="text-accent">Research</span> & Clinical Excellence
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
              Dr. Abdullah M. Al Alawi is dedicated to improving patient outcomes through rigorous research in general medicine, metabolic disorders, and hospital care quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/research">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Explore Research
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="relative hidden md:block animate-in slide-in-from-right duration-700 delay-200">
            <div className="relative w-80 h-80 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border-2 border-primary-foreground/20 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shadow-2xl border-4 border-background">
                 <img 
                   src="/images/dr-alawi.jpg" 
                   alt="Dr. Abdullah M. Al Alawi" 
                   className="w-full h-full object-cover"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats / Highlights */}
      <section className="py-12 bg-muted/30 border-b border-border/40">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary font-serif">15+</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Years Experience</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary font-serif">600+</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Citations</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary font-serif">20+</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Publications</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary font-serif">MD, MSc</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Qualifications</p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-background">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video md:aspect-square">
            <img 
              src="/images/about-medical-office.png" 
              alt="Medical Office" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Bridging Clinical Practice and Academic Inquiry
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              As a Senior Consultant in General Medicine at Sultan Qaboos University Hospital, I combine hands-on patient care with in-depth research. My work focuses on understanding complex disease mechanisms, particularly in metabolic disorders and liver cirrhosis, to develop better treatment protocols.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I also serve as the Program Director of the Internal Medicine Residency Program, mentoring the next generation of medical professionals in Oman.
            </p>
            <Link href="/about">
              <Button variant="link" className="p-0 h-auto text-primary font-semibold hover:text-accent mt-2">
                Read Full Biography <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Research Areas Preview */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Research Focus</h2>
            <p className="text-muted-foreground">
              Exploring critical areas in internal medicine to improve diagnostic accuracy and patient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Metabolic Disorders",
                desc: "Investigating dysmagnesemia, ketoacidosis, and electrolyte imbalances in hospitalized patients."
              },
              {
                icon: Users,
                title: "Hospital Outcomes",
                desc: "Analyzing mortality prediction models and length of stay to optimize healthcare delivery."
              },
              {
                icon: BookOpen,
                title: "Medical Education",
                desc: "Evaluating and improving residency programs to enhance medical training standards."
              }
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-serif">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/research">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Research Areas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
