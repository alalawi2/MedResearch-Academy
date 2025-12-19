import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Briefcase, Award, Building2 } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <section className="bg-muted/30 py-16 md:py-24 border-b border-border/40">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Dr. Al Alawi</h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            A dedicated Senior Consultant and Medical Researcher with a focus on General Medicine, Metabolic Disorders, and Medical Education.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Quick Info */}
          <div className="lg:col-span-4 space-y-8">
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
                  <p className="text-sm text-muted-foreground">BSc, MD, MSc, FRACP, FACP</p>
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
                </div>
                <div className="pt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">General Medicine</Badge>
                  <Badge variant="secondary">Metabolic Disorders</Badge>
                  <Badge variant="secondary">Medical Education</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Biography */}
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-primary">Biography</h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  Dr. Abdullah M. Al Alawi is a distinguished Senior Consultant in General Medicine at Sultan Qaboos University Hospital (SQUH) and the Program Director of the Internal Medicine Residency Program at the Oman Medical Specialty Board (OMSB). With a career spanning over 15 years, he has established himself as a leader in both clinical practice and medical education.
                </p>
                <p>
                  He completed his medical degree (MD) with distinction at Sultan Qaboos University before pursuing advanced training in Australia. He is a Fellow of the Royal Australasian College of Physicians (FRACP) and the American College of Physicians (FACP). His academic journey includes a Master of Clinical Epidemiology with distinction from the University of Newcastle, Australia, and he is currently pursuing a Master of Health Research at Charles Darwin University.
                </p>
                <p>
                  Dr. Al Alawi is deeply committed to research, with a specific focus on magnesium homeostasis, liver cirrhosis mortality prediction, and hospital quality improvement. He serves on multiple high-level committees, including the Higher Medical Committee at the Ministry of Health and the Research Committee at the College of Medicine and Health Sciences.
                </p>
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold">Professional Experience</h2>
              </div>
              <div className="border-l-2 border-border pl-8 space-y-10 relative">
                <div className="relative">
                  <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-accent"></span>
                  <h3 className="font-bold text-lg">Senior Consultant</h3>
                  <p className="text-primary font-medium">Sultan Qaboos University Hospital, Oman</p>
                  <p className="text-sm text-muted-foreground">2022 - Present</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-muted-foreground"></span>
                  <h3 className="font-bold text-lg">Program Director, Internal Medicine Residency</h3>
                  <p className="text-primary font-medium">Oman Medical Specialty Board (OMSB)</p>
                  <p className="text-sm text-muted-foreground">2022 - Present</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-muted-foreground"></span>
                  <h3 className="font-bold text-lg">General Medicine Consultant</h3>
                  <p className="text-primary font-medium">Various Hospitals, Australia</p>
                  <p className="text-sm text-muted-foreground">2019 - Present</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-background bg-muted-foreground"></span>
                  <h3 className="font-bold text-lg">General Medicine Consultant</h3>
                  <p className="text-primary font-medium">Royal Darwin Hospital, Australia</p>
                  <p className="text-sm text-muted-foreground">2017 - 2018</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold">Education & Qualifications</h2>
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
                <h2 className="text-2xl font-serif font-bold">Honors & Awards</h2>
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
                <li className="flex gap-4 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0"></div>
                  <div>
                    <p className="font-bold">Best Researcher Award</p>
                    <p className="text-sm text-muted-foreground">Sultan Qaboos University Hospital (2022)</p>
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
