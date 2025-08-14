import type { Express, RequestHandler } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertContactSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

// Development middleware to bypass auth issues
const developmentAuthBypass: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Check if user has explicitly logged out
    const session = (req as any).session;
    console.log('Development bypass - session:', session ? { loggedOut: session.loggedOut, id: session.id } : 'no session');
    
    const isLoggedOut = session && session.loggedOut === true;
    
    if (!isLoggedOut) {
      // Mock user for development only if not logged out
      (req as any).user = {
        claims: {
          sub: 'mock-user-123',
          email: 'dev@example.com',
          first_name: 'Developer',
          last_name: 'User'
        }
      };
      // Mock isAuthenticated function
      (req as any).isAuthenticated = () => true;
      console.log('Development bypass - user mocked');
    } else {
      console.log('Development bypass - user logged out, not mocking user');
    }
    return next();
  }
  return next();
};

// Helper function for admin route authentication
const adminAuth: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Check if user has logged out in development
    const session = (req as any).session;
    const isLoggedOut = !session || session.loggedOut === true;
    
    if (isLoggedOut || !(req as any).user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return next(); // Skip authentication check if user exists and not logged out
  }
  return isAuthenticated(req, res, next);
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and documents are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', developmentAuthBypass, async (req: any, res) => {
    // Check authentication in all environments
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Create user if it doesn't exist (for development)
      if (!user && process.env.NODE_ENV === 'development') {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name || 'Developer',
          lastName: req.user.claims.last_name || 'User',
          profileImageUrl: null,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects('published');
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const project = await storage.getProjectBySlug(slug);
      
      if (!project || project.status !== 'published') {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Admin project routes
  app.get('/api/admin/projects', developmentAuthBypass, async (req, res) => {
    // Skip isAuthenticated middleware in development for testing
    if (process.env.NODE_ENV !== 'development') {
      return isAuthenticated(req, res, () => {});
    }
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/admin/projects/:id', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/admin/projects', developmentAuthBypass, adminAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        authorId: userId,
        slug: req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      });
      
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/admin/projects/:id', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      
      if (validatedData.title) {
        validatedData.slug = validatedData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/admin/projects/:id', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Media routes
  app.get('/api/admin/media', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const mediaFiles = await storage.getMedia();
      res.json(mediaFiles);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post('/api/admin/media', developmentAuthBypass, adminAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const mediaData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size.toString(),
        url: `/uploads/${req.file.filename}`,
        altText: req.body.altText || '',
        uploadedBy: userId,
      };

      const media = await storage.createMedia(mediaData);
      res.status(201).json(media);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  app.delete('/api/admin/media/:id', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedia(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(400).json({ message: "Failed to submit contact form" });
    }
  });

  app.get('/api/admin/contacts', developmentAuthBypass, adminAuth, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
