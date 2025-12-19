import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Award, GraduationCap, Briefcase } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-muted/30 py-16 md:py-24 border-b border-border/40">
        <div className="container max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">About Dr. Abdullah</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Senior Consultant, Educator, and Researcher committed to excellence in Internal Medicine.
          </p>
        </div>
      </section>

      {/* Main Content */}
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
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">Muscat, Oman</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-1">Affiliation</p>
                  <p className="text-sm text-muted-foreground">Sultan Qaboos University Hospital</p>
                </div>
                <div className="pt-6">
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" /> Download CV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Biography Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-foreground font-serif">Biography</h2>
              <p>
                Dr. Abdullah M. Al Alawi is a distinguished Senior Consultant in General Medicine at Sultan Qaboos University Hospital in Oman. With a career spanning over 15 years, he has established himself as a leader in both clinical practice and medical education.
              </p>
              <p>
                He currently serves as the Program Director of the Internal Medicine Residency Program, where he oversees the training and development of future physicians. His leadership in this role is driven by a passion for academic excellence and a commitment to raising the standards of healthcare delivery in the region.
              </p>
              <p>
                Dr. Al Alawi's clinical expertise covers a broad spectrum of internal medicine, with specific interests in the management of complex diseases, metabolic disorders, and acute care medicine. His approach integrates evidence-based medicine with a patient-centered philosophy.
              </p>
            </div>

            {/* Timeline / Credentials */}
            <div className="space-y-8">
              <h2 className="text-2xl font-serif font-bold text-foreground border-b border-border pb-4">
                Credentials & Experience
              </h2>

              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Senior Consultant, General Medicine</h3>
                    <p className="text-primary font-medium">Sultan Qaboos University Hospital</p>
                    <p className="text-sm text-muted-foreground mt-1">Current Position</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Program Director</h3>
                    <p className="text-primary font-medium">Internal Medicine Residency Program</p>
                    <p className="text-sm text-muted-foreground mt-1">Oman Medical Specialty Board (OMSB)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Fellowships & Memberships</h3>
                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                      <li>Fellow of the Royal Australasian College of Physicians (FRACP)</li>
                      <li>Fellow of the American College of Physicians (FACP)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
