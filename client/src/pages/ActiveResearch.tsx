import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Users, Calendar, FileText } from 'lucide-react';

const ActiveResearch = () => {
  const activeProjects = [
    {
      id: 1,
      title: "Perspectives on Parenthood During Residency Training in Oman: Barriers, Support, and Career Implications",
      status: "Recruiting Now",
      image: "/images/omani_doctor_family.png",
      investigators: [
        "Dr. Abdullah Mohammed Khamis Al Alawi (PI)",
        "Dr. Fatma Abdullah Issa Al Mahruqi (Co-investigator)"
      ],
      summary: "This qualitative study explores the experiences of parenthood during residency training in Oman. We aim to understand the cultural and institutional barriers residents face regarding maternity/paternity leave and postpartum support. Your insights will help shape better policies to support resident parents across Oman.",
      targetAudience: [
        "Residency Program Directors",
        "Female Residents (who became pregnant during training)",
        "Male Residents (who became fathers during training)"
      ],
      contactEmail: "r2261@resident.omsb.org",
      registrationLink: "https://docs.google.com/forms/d/e/1FAIpQLSfJ8_example_link/viewform" // Placeholder link
    }
  ];

  return (
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
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto bg-muted">
                    <img 
                      src={project.image} 
                      alt="Omani doctor with family" 
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm font-medium animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">
                        {project.title}
                      </h2>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Users className="w-5 h-5 mt-1 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">Principal Investigators:</p>
                            <ul className="text-sm list-disc list-inside">
                              {project.investigators.map((name, idx) => (
                                <li key={idx}>{name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 text-muted-foreground">
                          <FileText className="w-5 h-5 mt-1 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">About the Study:</p>
                            <p className="text-sm leading-relaxed">{project.summary}</p>
                          </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                          <p className="font-semibold text-primary mb-2 text-sm uppercase tracking-wide">Who Can Participate?</p>
                          <ul className="space-y-1">
                            {project.targetAudience.map((audience, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                {audience}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-border/50">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20"
                        onClick={() => window.open(project.registrationLink, '_blank')}
                      >
                        Register Now <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto gap-2"
                        onClick={() => window.location.href = `mailto:${project.contactEmail}`}
                      >
                        <Mail className="w-4 h-4" /> Contact for Inquiry
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveResearch;
