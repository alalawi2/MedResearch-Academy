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

      {/* Success Stories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Award className="mr-2 h-4 w-4" />
              Wall of Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
              Real Stories, Real Impact
            </h2>
            <p className="text-muted-foreground text-lg">
              See how our community members are transforming healthcare through research and innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story 1: Dr. Fatma Al Shamsi */}
            <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/dr_fatma_real.jpeg"
                  alt="Dr. Fatma Al Shamsi" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded mb-2">
                    Resident Success
                  </div>
                  <h3 className="font-serif font-bold text-xl">Dr. Fatma Al Shamsi</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-lg text-primary line-clamp-2">
                  Transforming Clinical Practice: The Power of Local Evidence
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-4">
                  Dr. Fatma turned a residency debate into a groundbreaking study on feeding tube use in advanced dementia. Her findings confirmed international guidelines were applicable in Oman, winning 1st Place at the Royal Hospital Research Day and influencing hospital-wide protocols.
                </p>
                <div className="pt-2 flex items-center text-sm font-medium text-primary">
                  <Award className="h-4 w-4 mr-2 text-accent" />
                  ACP 2025 Presenter
                </div>
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Scan to view original post</span>
                  <img 
                    src="/images/dr_fatma_qr.png" 
                    alt="Scan for Original Post" 
                    className="w-16 h-16 rounded-lg border border-border"
                  />
                </div>
              </div>
            </div>

            {/* Story 2: Student Success */}
            <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/student_success_placeholder.png" 
                  alt="Student Research Success" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-block px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded mb-2">
                    Student Achievement
                  </div>
                  <h3 className="font-serif font-bold text-xl">Ali Al Balushi</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-lg text-primary line-clamp-2">
                  From Classroom to International Conference
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-4">
                  Starting with zero research experience, Ali joined our mentorship program to investigate prevalence of genetic markers in local populations. His dedication led to a poster presentation at an international genetics conference in Dubai.
                </p>
                <div className="pt-2 flex items-center text-sm font-medium text-primary">
                  <Award className="h-4 w-4 mr-2 text-blue-500" />
                  Best Student Poster Award
                </div>
              </div>
            </div>

{/* Story 3: Patient Impact */}
            <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="/images/omani_patient_dementia_v2.png" 
                  alt="Patient Impact Story" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-bold rounded mb-2">
                    Community Impact
                  </div>
                  <h3 className="font-serif font-bold text-xl">Patient-Centered Care</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-lg text-primary line-clamp-2">
                  Research That Touches Lives
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-4">
                  "It's not just about data; it's about dignity." Our research on feeding tube outcomes has directly improved the quality of life for elderly dementia patients, ensuring care decisions are compassionate, evidence-based, and culturally respectful.
                </p>
                <div className="pt-2 flex items-center text-sm font-medium text-primary">
                  <Award className="h-4 w-4 mr-2 text-green-600" />
                  Improved Patient Outcomes
                </div>
              </div>
            </div>
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
