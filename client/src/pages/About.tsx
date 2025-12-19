import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Briefcase, Award, Building2, BookOpen, PenTool } from "lucide-react";

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
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Quick Info */}
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="aspect-square rounded-lg bg-muted mb-6 overflow-hidden relative">
                 <img 
                   src="/images/dr-alawi.jpg" 
                   alt="Dr. Abdullah M. Al Alawi" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">Dr. Abdullah M. Al Alawi</h3>
                  <p className="text-sm text-muted-foreground">Founder & Lead Mentor</p>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span>Sultan Qaboos University Hospital, Oman</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span>Senior Consultant & Program Director (OMSB)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <PenTool className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span>Associate Editor, SQUMJ</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <PenTool className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span>Associate Editor, World Advances in Renal Medicine</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">Research Methodology</Badge>
                  <Badge variant="secondary">Biostatistics</Badge>
                  <Badge variant="secondary">Scientific Writing</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12 order-1 lg:order-2">
            
            {/* Vision */}
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-primary">Our Vision</h2>
              <div className="prose prose-lg text-muted-foreground">
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

            {/* Founder Bio */}
            <div className="space-y-6 pt-8 border-t border-border">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold">Meet the Founder</h2>
              </div>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  Dr. Abdullah M. Al Alawi is a distinguished Senior Consultant in General Medicine at Sultan Qaboos University Hospital (SQUH) and the Program Director of the Internal Medicine Residency Program at the Oman Medical Specialty Board (OMSB). With a career spanning over 15 years, he has established himself as a leader in both clinical practice and medical education.
                </p>
                <p>
                  He completed his medical degree (MD) with distinction at Sultan Qaboos University before pursuing advanced training in Australia. He is a Fellow of the Royal Australasian College of Physicians (FRACP) and the American College of Physicians (FACP). His academic journey includes a Master of Clinical Epidemiology with distinction from the University of Newcastle, Australia.
                </p>
                <p>
                  Dr. Al Alawi is a prolific researcher with over <strong>80+ peer-reviewed publications</strong> in high-impact journals. He serves as an <strong>Associate Editor for the Sultan Qaboos University Medical Journal (SQUMJ)</strong> and <strong>World Advances in Renal Medicine</strong>. His research focuses on magnesium homeostasis, liver cirrhosis mortality prediction, and hospital quality improvement.
                </p>
                <p>
                  As a dedicated educator, he has led numerous workshops covering <strong>Research Methodology, Biostatistics, Grant Writing, and Critical Appraisal</strong>, empowering hundreds of trainees to navigate the complex world of medical research.
                </p>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold">Founder's Qualifications</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card p-5 rounded-lg border border-border/50">
                  <h3 className="font-bold">Master of Health Research (M.Sc.)</h3>
                  <p className="text-sm text-muted-foreground">Charles Darwin University, Australia (Current)</p>
                </div>
                <div className="bg-card p-5 rounded-lg border border-border/50">
                  <h3 className="font-bold">Master of Clinical Epidemiology</h3>
                  <p className="text-sm text-muted-foreground">University of Newcastle, Australia (2018)</p>
                  <Badge variant="outline" className="mt-2">With Distinction</Badge>
                </div>
                <div className="bg-card p-5 rounded-lg border border-border/50">
                  <h3 className="font-bold">Fellowship (FRACP)</h3>
                  <p className="text-sm text-muted-foreground">Royal Australasian College of Physicians (2017)</p>
                </div>
                <div className="bg-card p-5 rounded-lg border border-border/50">
                  <h3 className="font-bold">Doctor of Medicine (MD)</h3>
                  <p className="text-sm text-muted-foreground">Sultan Qaboos University, Oman (2008)</p>
                  <Badge variant="outline" className="mt-2">With Distinction</Badge>
                </div>
              </div>
            </div>

            {/* Awards */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold">Recognition</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-bold">Best Poster Presentation</p>
                    <p className="text-sm text-muted-foreground">6th QIIM Conference, Doha, Qatar (2025)</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-bold">National Research Award</p>
                    <p className="text-sm text-muted-foreground">Best Published Research - Health & Community Service (2023 & 2024)</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-bold">Best Trainer Award</p>
                    <p className="text-sm text-muted-foreground">Internal Medicine Residency Program, OMSB (2022)</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
