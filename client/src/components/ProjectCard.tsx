import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDistance } from "date-fns";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow duration-300">
        <a href={`/case-study/${project.slug}`}>
          <div className="relative aspect-video bg-muted overflow-hidden">
            {project.featuredImage ? (
              <img
                src={project.featuredImage}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                <div className="text-4xl text-primary">🎨</div>
              </div>
            )}
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {project.category}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {project.updatedAt ? formatDistance(new Date(project.updatedAt), new Date(), { addSuffix: true }) : 'Recently'}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {project.description}
              </p>
              
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  );
}
