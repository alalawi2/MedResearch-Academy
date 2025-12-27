import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Briefcase, Award, Building2, BookOpen, PenTool, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <Layout>
      <section className="bg-muted/30 py-16 md:py-24 border-b border-border/40">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About MedResearch Academy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Our mission is to serve the community by building a robust research ecosystem in Oman. As a non-profit initiative, we are dedicated to equipping healthcare professionals with the skills, mentorship, and open-access resources needed to conduct world-class research for the public good.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container space-y-20">
          
          {/* Vision Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-12 space-y-6">
              <h2 className="text-3xl font-serif font-bold text-primary">Our Vision</h2>
              <div className="prose prose-lg text-muted-foreground max-w-none">
                <p>
                  At MedResearch Academy, we believe that research is not just an academic exercise but a vital tool for improving patient care and health outcomes. We envision a future where every healthcare professional in Oman is empowered to contribute to the global body of medical knowledge.
                </p>
                <p>
                  Our academy provides a structured pathway for research development, offering comprehensive training programs in research methodology, biostatistics, scientific writing, and critical appraisal. We bridge the gap between theoretical knowledge and practical application.
                </p>
                <p>
                  Through mentorship and collaboration, we aim to foster a culture of inquiry and innovation. Whether you are a medical student taking your first steps in research or a seasoned clinician looking to refine your skills, MedResearch Academy is your partner in academic excellence.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Leadership Team Section */}
          <div className="space-y-12">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              <h2 className="text-3xl font-serif font-bold">Leadership Team</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Founder Profile */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
                  <div className="aspect-[3/4] rounded-lg bg-secondary/30 border border-border/50 mb-6 overflow-hidden relative">
                     <img 
                       src="/images/dr-alawi.jpg" 
                       alt="Dr. Abdullah M. Al Alawi" 
                       className="w-full h-full object-cover object-center"
                     />
                  </div>
                  <div className="space-y-6 flex-grow">
                    <div>
                      <h3 className="font-bold text-2xl font-serif">Dr. Abdullah M. Al Alawi <span className="text-lg font-normal text-muted-foreground ml-2">BSc, MD, MSc, FRACP, FACP</span></h3>
                      <p className="text-primary font-medium">Founder & Lead Mentor</p>
                    </div>
                    
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>Senior Consultant, General Medicine (SQUH)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>Program Director, Internal Medicine Residency (OMSB)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <PenTool className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>Associate Editor, SQUMJ</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      Dr. Abdullah Al Alawi is a Senior Consultant Physician at Sultan Qaboos University Hospital (SQUH) and a transformative leader in medical education. As the <strong>Program Director of the Internal Medicine Residency Program</strong> at the Oman Medical Specialty Board (OMSB), he plays a pivotal role in shaping the next generation of physicians in Oman.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      With a fellowship from the <strong>Royal Australasian College of Physicians (FRACP)</strong>, Dr. Al Alawi brings a global perspective to clinical practice and research. He holds a Master of Clinical Epidemiology with Distinction from the University of Newcastle, Australia, underpinning his expertise in research methodology and evidence-based medicine.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      A prolific researcher, Dr. Al Alawi has been honored with the <strong>National Research Award</strong> for two consecutive years (2023 & 2024) and the Best Researcher Award from SQUH. Through <strong>MedResearch Academy</strong>, he is dedicated to empowering healthcare professionals with the skills to conduct high-impact research that addresses local health challenges and advances global medical knowledge.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Research Methodology</Badge>
                      <Badge variant="secondary">Biostatistics</Badge>
                      <Badge variant="secondary">Scientific Writing</Badge>
                      <Badge variant="secondary">Clinical Epidemiology</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-6 mt-auto">
                    <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        View Publications <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Co-Founder Profile */}
              <div className="space-y-8">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
                  <div className="aspect-[3/4] rounded-lg bg-secondary/30 border border-border/50 mb-6 overflow-hidden relative">
                     <img 
                       src="/images/dr-rawahi.jpg" 
                       alt="Dr. Mohamed Al Rawahi" 
                       className="w-full h-full object-cover object-center"
                     />
                  </div>
                  <div className="space-y-6 flex-grow">
                    <div>
                      <h3 className="font-bold text-2xl font-serif">Dr. Mohamed Al Rawahi</h3>
                      <p className="text-primary font-medium">Co-Founder & Senior Mentor</p>
                    </div>
                    
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>Senior Consultant, Cardiac Electrophysiologist (SQUH & Royal Hospital)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>Associate Program Director, Internal Medicine Residency (OMSB)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Award className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span>First American Board Certified Cardiac Electrophysiologist in Oman</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      A pioneer in cardiac electrophysiology in Oman, Dr. Al Rawahi holds a Master of Experimental Medicine from McGill University, Canada. He is currently pursuing a PhD in Cardiac Electrophysiology at Maastricht University. He leads groundbreaking research in arrhythmia management and AI applications in cardiology.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Cardiac Electrophysiology</Badge>
                      <Badge variant="secondary">AI in Medicine</Badge>
                      <Badge variant="secondary">Clinical Trials</Badge>
                    </div>
                  </div>

                  <div className="pt-6 mt-auto flex flex-col gap-2">
                    <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al-Rawahi+M&sort=date" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        View Publications <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="https://www.linkedin.com/in/mohamed-al-rawahi-40b76130/" target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-primary">
                        LinkedIn Profile <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Shared Qualifications Section */}
          <div className="space-y-8 pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-serif font-bold">Our Combined Expertise</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-card p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <h3 className="font-bold text-lg mb-2">Advanced Degrees</h3>
                <p className="text-sm text-muted-foreground">
                  Masters in Clinical Epidemiology (Australia) and Experimental Medicine (Canada), combining rigorous statistical training with translational research skills.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <h3 className="font-bold text-lg mb-2">Global Certification</h3>
                <p className="text-sm text-muted-foreground">
                  Fellowships from Royal Australasian College of Physicians (FRACP), Royal College of Physicians of Canada (FRCPC), and American Boards (ABIM).
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <h3 className="font-bold text-lg mb-2">Research Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Over 100+ combined peer-reviewed publications, national research awards, and leadership in major clinical trials and registries in Oman.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
