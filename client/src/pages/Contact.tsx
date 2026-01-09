import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Twitter, Linkedin, BookOpen, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Contact() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    // Parse query parameters manually since wouter doesn't provide a hook for it
    const searchParams = new URLSearchParams(window.location.search);
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setValue("subject", subjectParam);
    }
  }, [location, setValue]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Add Formspree specific fields
      const formData = {
        ...data,
        _replyto: data.email, // Ensure reply-to is set to the sender's email
        _subject: data.subject || "New Inquiry from MedResearch Academy Website", // Set email subject
      };

      const response = await fetch("https://formspree.io/f/mojavboe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully! I will get back to you soon.");
        reset();
      } else {
        toast.error("Failed to send message. Please try again later.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            For research collaborations, speaking engagements, or clinical inquiries.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Feel free to reach out using the form or through the contact details below. I aim to respond to all professional inquiries within 48 hours.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Email</h3>
                      <p className="text-muted-foreground text-sm">info@research-academy.om</p>
                    </div>
                  </CardContent>
                </Card>



                <div className="pt-4">
                  <h3 className="font-bold mb-4">Social Profiles</h3>
                  <div className="flex gap-4">
                    <a href="https://x.com/Medresearch_om" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">X (Twitter)</span>
                      </Button>
                    </a>
                    <a href="https://www.linkedin.com/in/abdullah-al-alawi-4" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    </a>
                    <a href="https://www.researchgate.net/profile/Abdullah-Al-Alawi-4" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full hover:text-primary hover:border-primary transition-colors">
                        <BookOpen className="h-5 w-5" />
                        <span className="sr-only">ResearchGate</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-bold mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your Name" {...register("name", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="your@email.com" {...register("email", { required: true })} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="Inquiry regarding..." {...register("subject", { required: true })} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea id="message" placeholder="How can I help you?" className="min-h-[150px]" {...register("message", { required: true })} />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
