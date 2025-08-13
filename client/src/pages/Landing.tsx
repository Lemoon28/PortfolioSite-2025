import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, Phone, MapPin, Github, Linkedin, Dribbble, View } from "lucide-react";

type ContactForm = z.infer<typeof insertContactSchema>;

export default function Landing() {
  const { toast } = useToast();
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const form = useForm<ContactForm>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Creative <span className="text-primary">Digital</span> Experiences
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                I craft user-friendly and visually engaging digital solutions that combine aesthetic excellence with functional design principles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <a href="#projects">View Projects</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <a href="#contact">Get In Touch</a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-card rounded-full shadow-2xl flex items-center justify-center">
                  <div className="text-6xl text-primary">👨‍💻</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore my latest work in web design, mobile apps, and digital experiences
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-xl overflow-hidden shadow-xl">
                <div className="absolute inset-4 bg-card rounded-lg flex items-center justify-center">
                  <div className="text-8xl text-primary">🎨</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">About Me</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                I'm a passionate digital designer with over 5 years of experience creating user-centered solutions. 
                My approach combines strategic thinking with creative execution to deliver designs that not only 
                look beautiful but also solve real problems.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Specializing in web design, mobile applications, and brand identity, I work closely with clients 
                to understand their vision and transform it into compelling digital experiences.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Skills</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>UI/UX Design</li>
                    <li>Web Development</li>
                    <li>Brand Identity</li>
                    <li>Prototyping</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Tools</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>Figma, Adobe XD</li>
                    <li>React, Next.js</li>
                    <li>Tailwind CSS</li>
                    <li>Framer Motion</li>
                  </ul>
                </div>
              </div>
              
              <Button asChild size="lg">
                <a href="#contact">Let's Work Together</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h2>
            <p className="text-xl text-muted-foreground">Ready to start your next project? Let's discuss how I can help.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-foreground mb-6">Let's Connect</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="text-primary w-6 h-6 mr-4" />
                  <span className="text-muted-foreground">hello@portfolio.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="text-primary w-6 h-6 mr-4" />
                  <span className="text-muted-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-primary w-6 h-6 mr-4" />
                  <span className="text-muted-foreground">San Francisco, CA</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-semibold text-foreground mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <Dribbble className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <View className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    <Github className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                <Input
                  {...form.register("name")}
                  placeholder="Your Name"
                  className="w-full"
                />
                {form.formState.errors.name && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full"
                />
                {form.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <Input
                  {...form.register("subject")}
                  placeholder="Project Inquiry"
                  className="w-full"
                />
                {form.formState.errors.subject && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.subject.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                <Textarea
                  {...form.register("message")}
                  rows={4}
                  placeholder="Tell me about your project..."
                  className="w-full"
                />
                {form.formState.errors.message && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.message.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
