import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Research() {
  const researchAreas = [
    {
      title: "Metabolic & Electrolyte Disorders",
      description: "In-depth analysis of magnesium homeostasis (dysmagnesemia) and its impact on human health. Research also covers rare metabolic conditions like lactation ketoacidosis.",
      tags: ["Magnesium", "Ketoacidosis", "Electrolytes", "Metabolism"]
    },
    {
      title: "Liver Disease & Mortality Prediction",
      description: "Development and validation of machine learning models to predict mortality in patients with acute decompensation of liver cirrhosis, aiming to improve prognostic accuracy.",
      tags: ["Liver Cirrhosis", "Machine Learning", "Prognosis", "Hepatology"]
    },
    {
      title: "Hospital Medicine & Quality Improvement",
      description: "Studies focusing on the appropriateness of hospital stays, length of stay analysis, and outcomes for patients admitted under general medicine units.",
      tags: ["Healthcare Quality", "Length of Stay", "Hospital Medicine", "Patient Outcomes"]
    },
    {
      title: "Clinical Toxicology & Addiction Medicine",
      description: "Observational studies on clinical characteristics and health outcomes in patients with alcohol withdrawal syndrome and other toxicological presentations.",
      tags: ["Alcohol Withdrawal", "Toxicology", "Addiction Medicine"]
    }
  ];

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="/images/research-lab-abstract.png" className="w-full h-full object-cover" alt="Research Background" />
        </div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Research & Innovation</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl">
            Driving medical knowledge forward through rigorous investigation into complex clinical challenges.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {researchAreas.map((area, index) => (
              <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-primary">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {area.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {area.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-bold">Collaborate on Research</h2>
          <p className="text-muted-foreground">
            I am always open to collaborative research opportunities with fellow academics, institutions, and medical professionals.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="text-lg px-8 h-12">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
