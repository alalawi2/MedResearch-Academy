import React from 'react';
import Layout from "@/components/Layout";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Users, Calendar, FileText, ShieldCheck, Target, BookOpen, Lightbulb } from 'lucide-react';

const ActiveResearch = () => {
  const activeProjects = [
    {
      id: 1,
      title: "Perspectives on Parenthood During Residency Training in Oman: Barriers, Support, and Career Implications",
      status: "Recruiting Now",
      image: "/images/omani_doctor_family.png",
      investigators: [
        "Dr. Abdullah Mohammed Khamis Al Alawi (PI)",
        "Dr. Fatma Abdullah Issa Al Mahruqi (Co-PI)"
      ],
      summary: "This qualitative study explores the experiences of parenthood during residency training in Oman. We aim to understand the cultural and institutional barriers residents face regarding maternity/paternity leave and postpartum support. Your insights will help to create a better understanding of the challenges faced by resident parents across Oman.",
      description: {
        aims: [
          "To explore program directors' perspectives on cultural and fiscal barriers to maternity leave and postpartum support.",
          "To assess the experiences of female residents regarding pregnancy, maternity leave, and career satisfaction.",
          "To evaluate male residents' experiences of parenthood, paternity leave, and work-life balance.",
          "To identify gaps in current institutional policies and support systems."
        ],
        methodology: "This is a qualitative study utilizing in-depth, semi-structured interviews. We will conduct interviews with three key groups: residency program directors, female residents who became pregnant during training, and male residents who became fathers during training. The study will be conducted across multiple accredited residency programs.",
        significance: "Parenthood during residency presents significant challenges, including difficulties balancing work and family life, financial concerns, and pressure to delay childbearing. By identifying these barriers, this study seeks to provide insights that can inform policy enhancements and foster a more supportive training environment for resident parents in Oman."
      },
      targetAudience: [
        "Residency Program Directors",
        "Female Residents (who became pregnant during training)",
        "Male Residents (who became fathers during training)"
      ],
      contactEmail: "r2261@resident.omsb.org",
      ethicalApproval: {
        refNo: "SQU-EC/228/2025",
        mrecNo: "MREC #3679",
        date: "September 4, 2025",
        committee: "Medical Research Ethics Committee (MREC), College of Medicine and Health Sciences, Sultan Qaboos University"
      },
      googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdgdjPhGLefsHkKl4S4C-pOrWOBw9ZZPLRvKlksZuC5ZuV-SQ/viewform"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-display">
            Active Research <span className="text-primary">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our ongoing studies and contribute to the advancement of medical research in Oman. 
            Your participation shapes the future of healthcare.
          </p>
        </motion.div>

        <div className="grid gap-8 max-w-5xl mx-auto">
          {activeProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
                {/* Image Section - Now at the top */}
                <div className="relative h-96 w-full bg-muted">
                  <img 
                    src={project.image} 
                    alt="Omani doctor with family" 
                    className="w-full h-full object-contain object-center bg-muted"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm font-medium animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 md:p-10">
                  <h2 className="text-3xl font-bold text-foreground mb-6 leading-tight text-center">
                    {project.title}
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-8">
                      {/* About the Study - Expanded */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <h3 className="text-xl font-semibold text-foreground">About the Study</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {project.summary}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {project.description.significance}
                        </p>
                        
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/50 mt-4">
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> Study Aims
                          </h4>
                          <ul className="space-y-2">
                            {project.description.aims.map((aim, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                                {aim}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" /> Methodology
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.description.methodology}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Sidebar Info */}
                      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <Users className="w-5 h-5 mt-1 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground mb-1">Principal Investigators</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {project.investigators.map((name, idx) => (
                                <li key={idx}>{name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                          <ShieldCheck className="w-5 h-5 mt-1 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground mb-1">Ethical Approval</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Approved by {project.ethicalApproval.committee}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-[10px] font-normal">
                                Ref: {project.ethicalApproval.refNo}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {project.ethicalApproval.mrecNo}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 mt-1 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground mb-1">Who Can Participate?</p>
                            <ul className="space-y-1">
                              {project.targetAudience.map((audience, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0"></span>
                                  {audience}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full gap-2"
                        size="lg"
                        onClick={() => window.location.href = `mailto:${project.contactEmail}`}
                      >
                        <Mail className="w-4 h-4" /> Contact for Inquiry
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Embedded Google Form Section */}
                <div className="border-t border-border/50 bg-muted/30 p-6 md:p-10">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-foreground mb-2">Register to Participate</h3>
                      <p className="text-muted-foreground">
                        Please fill out the form below to express your interest. Your information will be kept confidential.
                      </p>
                    </div>
                    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm" style={{ height: '1200px' }}>
                      <iframe 
                        src={`${project.googleFormUrl}?embedded=true`}
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        marginHeight={0} 
                        marginWidth={0}
                        title="Research Registration Form"
                        className="absolute inset-0 w-full h-full"
                      >
                        Loading…
                      </iframe>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActiveResearch;
