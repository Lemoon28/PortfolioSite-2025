import {
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Media,
  type InsertMedia,
  type ContactSubmission,
  type InsertContact,
} from "@shared/schema";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProjects(status?: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Media operations
  getMedia(): Promise<Media[]>;
  getMediaById(id: number): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<void>;
  
  // Contact operations
  getContacts(): Promise<ContactSubmission[]>;
  createContact(contact: InsertContact): Promise<ContactSubmission>;
  updateContactStatus(id: number, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<number, Project> = new Map();
  private media: Map<number, Media> = new Map();
  private contacts: Map<number, ContactSubmission> = new Map();
  private nextProjectId = 1;
  private nextMediaId = 1;
  private nextContactId = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required");
    }
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Project operations
  async getProjects(status?: string): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    const filtered = status ? allProjects.filter(p => p.status === status) : allProjects;
    return filtered.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(p => p.slug === slug);
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.nextProjectId++;
    const project: Project = {
      id,
      title: projectData.title,
      slug: projectData.slug,
      description: projectData.description,
      content: projectData.content,
      featuredImage: projectData.featuredImage || null,
      category: projectData.category,
      tags: projectData.tags || null,
      status: projectData.status || "draft",
      authorId: projectData.authorId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updated: Project = {
      ...existing,
      ...projectData,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  // Media operations
  async getMedia(): Promise<Media[]> {
    const allMedia = Array.from(this.media.values());
    return allMedia.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const id = this.nextMediaId++;
    const media: Media = {
      id,
      filename: mediaData.filename,
      originalName: mediaData.originalName,
      mimeType: mediaData.mimeType,
      size: mediaData.size,
      url: mediaData.url,
      altText: mediaData.altText || null,
      uploadedBy: mediaData.uploadedBy || null,
      createdAt: new Date(),
    };
    this.media.set(id, media);
    return media;
  }

  async deleteMedia(id: number): Promise<void> {
    this.media.delete(id);
  }

  // Contact operations
  async getContacts(): Promise<ContactSubmission[]> {
    const allContacts = Array.from(this.contacts.values());
    return allContacts.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createContact(contactData: InsertContact): Promise<ContactSubmission> {
    const id = this.nextContactId++;
    const contact: ContactSubmission = {
      id,
      ...contactData,
      status: "new",
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContactStatus(id: number, status: string): Promise<void> {
    const existing = this.contacts.get(id);
    if (existing) {
      this.contacts.set(id, { ...existing, status });
    }
  }
}

export const storage = new MemStorage();
