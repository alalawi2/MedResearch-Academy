import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, BookOpen, Users, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="/images/hero-medical-research.png" className="w-full h-full object-cover" alt="Medical Research Background" />
        </div>
        
        <div className="container relative z-10 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
              Research Training & Education
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Empowering the Next Generation of <span className="text-accent">Medical Researchers</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
              MedResearch Academy is a premier platform dedicated to spreading research knowledge, fostering innovation, and building research capacity in Oman and beyond. Led by Dr. Abdullah M. Al Alawi and Dr. Mohamed Al Rawahi.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/programs">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg h-12 px-8">
                  Explore Programs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8">
                  Our Mission
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Profile Images */}
          <div className="relative hidden lg:block animate-in slide-in-from-right duration-700 delay-200">
            <div className="relative w-[500px] h-[400px] mx-auto flex items-center justify-center">
              
              {/* Decorative Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-[spin_10s_linear_infinite] opacity-50 scale-110" />
              <div className="absolute inset-4 rounded-full border-2 border-primary-foreground/20 animate-[spin_15s_linear_infinite_reverse] opacity-50 scale-110" />

              {/* Dr. Al Alawi */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 transform hover:scale-105 transition-transform duration-300">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-background shadow-2xl">
                  <img 
                    src="/images/dr-alawi.jpg" 
                    alt="Dr. Abdullah M. Al Alawi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur text-foreground px-4 py-1 rounded-full shadow-lg border border-border text-sm font-semibold whitespace-nowrap">
                  Dr. Abdullah Al Alawi
                </div>
              </div>

              {/* Dr. Al Rawahi */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transform translate-x-4 hover:scale-105 transition-transform duration-300">
                <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-background shadow-xl grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src="/images/dr-rawahi.jpg" 
                    alt="Dr. Mohamed Al Rawahi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full shadow-lg border border-border text-xs font-medium whitespace-nowrap">
                  Dr. Mohamed Al Rawahi
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Key Stats / Highlights */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-serif">50+</h3>
              <p className="text-muted-foreground">Students Mentored</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-serif">200+</h3>
              <p className="text-muted-foreground">Workshops</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-serif">20+</h3>
              <p className="text-muted-foreground">Research Projects</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-serif">20+</h3>
              <p className="text-muted-foreground">Research Grants</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a href="/contact" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5">
                <BookOpen className="h-4 w-4" />
                Join Our Community
              </Button>
            </a>
          </div>
        </div>
      </section>



      {/* Brief Bio / Mission */}
      <section className="py-20 md:py-32">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full -z-10"></div>
            <img 
              src="/images/about-medical-office.png" 
              alt="Dr. Al Alawi in Office" 
              className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-lg border border-border max-w-xs hidden md:block">
              <p className="font-serif italic text-lg text-primary">
                "Research is the engine of medical progress. We are here to help you start your engine."
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Why Choose MedResearch Academy?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We provide comprehensive training in research methodology, biostatistics, and scientific writing. Our programs are designed for medical students, residents, and healthcare professionals who want to excel in academic medicine.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Under the guidance of Dr. Abdullah Al Alawi, Dr. Mohamed Al Rawahi, and a team of experienced researchers, you will gain practical skills to conduct high-quality research and publish in reputable journals.
            </p>
            <div className="pt-4">
              <Link href="/about">
                <Button variant="outline" className="gap-2">
                  Meet the Founders <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
