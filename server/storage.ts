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

// Initialize with sample projects
async function initializeSampleData() {
  // Sample Project 1: E-commerce Platform
  await storage.createProject({
    title: "Modern E-commerce Platform",
    slug: "modern-ecommerce-platform",
    description: "A full-stack e-commerce solution built with React, Node.js, and PostgreSQL featuring real-time inventory management, secure payment processing, and an intuitive admin dashboard.",
    content: `# Modern E-commerce Platform

This project represents a comprehensive e-commerce solution designed for modern retail businesses. The platform combines cutting-edge technology with user-centric design to deliver exceptional shopping experiences.

## Key Features

- **Real-time Inventory Management**: Live stock tracking with automated low-stock alerts
- **Secure Payment Processing**: Integration with Stripe for safe and reliable transactions
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Admin Dashboard**: Comprehensive analytics and product management tools
- **Search & Filtering**: Advanced product discovery with multiple filter options
- **User Authentication**: Secure login with social media integration

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Payment**: Stripe API integration
- **Deployment**: Docker containers on AWS ECS

## Results

The platform achieved a 40% increase in conversion rates and 60% reduction in cart abandonment compared to the previous solution. Load times improved by 3x with the new architecture.`,
    featuredImage: "/uploads/ecommerce-preview.svg",
    category: "Full-Stack Development",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe", "E-commerce"],
    status: "published",
    authorId: "mock-user-123"
  });

  // Sample Project 2: Data Analytics Dashboard
  await storage.createProject({
    title: "Real-Time Analytics Dashboard",
    slug: "realtime-analytics-dashboard",
    description: "Interactive data visualization platform for business intelligence, featuring real-time metrics, customizable charts, and automated reporting capabilities.",
    content: `# Real-Time Analytics Dashboard

A powerful business intelligence platform that transforms raw data into actionable insights through interactive visualizations and real-time monitoring.

## Project Overview

Built for a SaaS company to replace their legacy reporting system, this dashboard provides stakeholders with instant access to key performance indicators and business metrics.

## Core Capabilities

- **Real-time Data Processing**: WebSocket connections for live data updates
- **Interactive Visualizations**: Custom charts built with D3.js and React
- **Customizable Dashboards**: Drag-and-drop interface for personalized views
- **Automated Reports**: Scheduled PDF reports via email
- **Data Export**: CSV, Excel, and API endpoints for data access
- **Role-based Access**: Granular permissions for different user types

## Technical Implementation

- **Frontend**: React, TypeScript, D3.js, Material-UI
- **Backend**: Python, FastAPI, Redis for caching
- **Database**: ClickHouse for analytics, PostgreSQL for metadata
- **Infrastructure**: Kubernetes on Google Cloud Platform

## Impact

- Reduced report generation time from hours to seconds
- Increased data accessibility across all departments
- Enabled data-driven decision making with real-time insights
- Saved 20+ hours per week in manual reporting tasks`,
    featuredImage: "/uploads/dashboard-preview.svg",
    category: "Data Visualization",
    tags: ["React", "D3.js", "Python", "Analytics", "Real-time"],
    status: "published",
    authorId: "mock-user-123"
  });

  // Sample Project 3: Mobile Banking App
  await storage.createProject({
    title: "Secure Mobile Banking Application",
    slug: "secure-mobile-banking-app",
    description: "Cross-platform mobile banking app with biometric authentication, real-time transaction monitoring, and advanced security features for seamless financial management.",
    content: `# Secure Mobile Banking Application

A next-generation mobile banking solution that prioritizes security while delivering an intuitive user experience for everyday banking needs.

## Project Background

Developed for a mid-sized credit union to modernize their digital banking offerings and compete with larger financial institutions. The app needed to meet strict regulatory requirements while providing a smooth user experience.

## Security Features

- **Biometric Authentication**: Fingerprint and facial recognition
- **Multi-factor Authentication**: SMS and email verification
- **End-to-end Encryption**: All data encrypted in transit and at rest
- **Fraud Detection**: Real-time transaction monitoring with ML algorithms
- **Session Management**: Automatic logout and suspicious activity alerts

## User Features

- **Account Overview**: Real-time balance and transaction history
- **Money Transfers**: Instant transfers between accounts and external banks
- **Bill Pay**: Automated bill scheduling and payment tracking
- **Mobile Deposits**: Photo check deposits with instant verification
- **ATM Locator**: GPS-based ATM and branch finder
- **Budgeting Tools**: Spending categorization and savings goals

## Technology Stack

- **Mobile**: React Native for cross-platform development
- **Backend**: Node.js, Express, MongoDB
- **Security**: OAuth 2.0, JWT tokens, AES-256 encryption
- **Cloud**: AWS with SOC 2 compliance
- **Testing**: Comprehensive security testing and penetration testing

## Achievements

- 4.8-star rating on both App Store and Google Play
- 95% user adoption rate within 6 months
- Zero security incidents since launch
- 50% reduction in call center inquiries
- Passed all regulatory audits with zero findings`,
    featuredImage: "/uploads/banking-app-preview.svg",
    category: "Mobile Development",
    tags: ["React Native", "Security", "FinTech", "Mobile", "AWS"],
    status: "published",
    authorId: "mock-user-123"
  });
}

// Initialize sample data when the module loads
initializeSampleData().catch(console.error);
