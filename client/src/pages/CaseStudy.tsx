import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { formatDistance } from "date-fns";
import type { Project } from "@shared/schema";

export default function CaseStudy() {
  const { slug } = useParams();
  
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/projects", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Project Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Button variant="ghost" asChild className="mb-6">
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </a>
            </Button>
            
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">
                {project.category}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {project.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Updated {formatDistance(new Date(project.updatedAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span>Tags:</span>
                    <div className="flex space-x-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Featured Image */}
          {project.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden shadow-lg">
                <img
                  src={project.featuredImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose prose-lg max-w-none"
          >
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <a href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Projects
                </a>
              </Button>
              
              <Button asChild>
                <a href="/#contact">Get In Touch</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
