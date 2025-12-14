import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    toast.success("Message sent successfully! I will get back to you soon.");
    reset();
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
                      <p className="text-muted-foreground text-sm">contact@dralalawi.om</p>
                      <p className="text-muted-foreground text-sm">abdullah.alalawi@squ.edu.om</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Office Location</h3>
                      <p className="text-muted-foreground text-sm">
                        Department of Medicine<br />
                        Sultan Qaboos University Hospital<br />
                        Al Khoudh, Muscat, Oman
                      </p>
                    </div>
                  </CardContent>
                </Card>
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

                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
