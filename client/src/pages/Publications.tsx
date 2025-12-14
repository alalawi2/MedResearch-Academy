import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";

export default function Publications() {
  const publications = [
    {
      title: "Magnesium and Human Health: Perspectives and Research Directions",
      journal: "International Journal of Endocrinology",
      year: "2018",
      citations: "663+",
      link: "https://pubmed.ncbi.nlm.nih.gov/29849626/"
    },
    {
      title: "Lactation Ketoacidosis: A Systematic Review of Case Reports",
      journal: "Journal of Clinical Medicine",
      year: "2020",
      citations: "16+",
      link: "https://pubmed.ncbi.nlm.nih.gov/32560535/"
    },
    {
      title: "Machine Learning-Powered 28-Day Mortality Prediction Model Following Hospitalization with Acute Decompensation of Liver Cirrhosis",
      journal: "ResearchGate",
      year: "2024",
      citations: "Recent",
      link: "https://www.researchgate.net/publication/379674216_Machine_Learning-Powered_28-Day_Mortality_Prediction_Model_Following_Hospitalization_with_Acute_Decompensation_of_Liver_Cirrhosis"
    },
    {
      title: "Incidence of Dysmagnesemia among Medically Hospitalized Patients",
      journal: "Journal of Primary Care & Community Health",
      year: "2023",
      citations: "12+",
      link: "https://pubmed.ncbi.nlm.nih.gov/37829115/"
    },
    {
      title: "Clinical characteristics and health outcomes in patients with alcohol withdrawal syndrome: an observational study from Oman",
      journal: "BMC Psychiatry",
      year: "2022",
      citations: "11+",
      link: "https://pubmed.ncbi.nlm.nih.gov/35112593/"
    },
    {
      title: "Inappropriate Hospital Stay of Patients Admitted Under Care of General Medicine Units",
      journal: "Sultan Qaboos University Medical Journal",
      year: "2022",
      citations: "Recent",
      link: "https://www.researchgate.net/publication/361465751_Inappropriate_Hospital_Stay_of_Patients_Admitted_Under_Care_of_General_Medicine_Units"
    }
  ];

  return (
    <Layout>
      <section className="bg-background py-16 md:py-24 border-b border-border/40">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Selected Publications</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A collection of peer-reviewed articles and studies contributing to the field of internal medicine.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-8">
            {publications.map((pub, index) => (
              <div key={index} className="group relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-accent font-medium">
                      <FileText className="h-4 w-4" />
                      <span>{pub.journal}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{pub.year}</span>
                    </div>
                    <h3 className="text-xl font-bold font-serif group-hover:text-primary transition-colors">
                      <a href={pub.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {pub.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Citations: <span className="font-medium text-foreground">{pub.citations}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center space-y-6">
            <h3 className="text-2xl font-serif font-bold">View Complete Profiles</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM&cauthor_id=29849626" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  PubMed Profile <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://www.researchgate.net/profile/Abdullah-Al-Alawi-4" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  ResearchGate <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://orcid.org/0000-0003-2077-7186" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  ORCID <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
