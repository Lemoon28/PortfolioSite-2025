import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Eye } from "lucide-react";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const projectFormSchema = insertProjectSchema.extend({
  tags: z.string().optional(),
});

type ProjectForm = z.infer<typeof projectFormSchema>;

interface ProjectEditorProps {
  project?: any;
  onClose: () => void;
}

export default function ProjectEditor({ project, onClose }: ProjectEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [content, setContent] = useState(project?.content || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      content: project?.content || "",
      featuredImage: project?.featuredImage || "",
      status: project?.status || "draft",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const projectData = {
        ...data,
        content,
        tags,
      };

      if (project) {
        return await apiRequest("PUT", `/api/admin/projects/${project.id}`, projectData);
      } else {
        return await apiRequest("POST", "/api/admin/projects", projectData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: project ? "Project updated" : "Project created",
        description: `The project has been successfully ${project ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: `Failed to ${project ? "update" : "create"} project. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: ProjectForm) => {
    mutation.mutate(data);
  };

  // Simple content editor toolbar actions
  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto bg-background rounded-xl shadow-2xl"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                {project ? "Edit Project" : "Create New Project"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    {...form.register("title")}
                    placeholder="Enter project title"
                    className="mt-2"
                  />
                  {form.formState.errors.title && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Design">Web Design</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="UI/UX">UI/UX</SelectItem>
                      <SelectItem value="Landing Page">Landing Page</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  {...form.register("description")}
                  rows={3}
                  placeholder="Brief description of the project"
                  className="mt-2"
                />
                {form.formState.errors.description && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  {...form.register("featuredImage")}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="content">Project Content</Label>
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  {/* Simple toolbar */}
                  <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("**", "**")}
                      title="Bold"
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("*", "*")}
                      title="Italic"
                    >
                      <em>I</em>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("## ")}
                      title="Heading"
                    >
                      H2
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("- ")}
                      title="List"
                    >
                      List
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("[", "](url)")}
                      title="Link"
                    >
                      Link
                    </Button>
                  </div>
                  
                  <Textarea
                    id="content-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    placeholder="Write your project content here... You can use markdown formatting."
                    className="border-0 focus-visible:ring-0 resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports basic markdown formatting (**, *, ##, -, [](url))
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value)}
                  >
                    <SelectTrigger className="w-32 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="min-w-[100px]"
                  >
                    {mutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {project ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
