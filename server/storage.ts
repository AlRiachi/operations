import { 
  users, User, InsertUser, 
  events, Event, InsertEvent,
  defects, Defect, InsertDefect,
  signals, Signal, InsertSignal,
  notifications, Notification, InsertNotification
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { hashPassword } from "./auth";

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getAllEvents(): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  getEventsByStatus(status: string): Promise<Event[]>;
  
  // Defect operations
  createDefect(defect: InsertDefect): Promise<Defect>;
  getDefect(id: number): Promise<Defect | undefined>;
  updateDefect(id: number, defect: Partial<InsertDefect>): Promise<Defect | undefined>;
  deleteDefect(id: number): Promise<boolean>;
  getAllDefects(): Promise<Defect[]>;
  getDefectsByUser(userId: number): Promise<Defect[]>;
  getDefectsBySeverity(severity: string): Promise<Defect[]>;
  
  // Signal operations
  createSignal(signal: InsertSignal): Promise<Signal>;
  getSignal(id: number): Promise<Signal | undefined>;
  updateSignal(id: number, signal: Partial<InsertSignal>): Promise<Signal | undefined>;
  getAllSignals(): Promise<Signal[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private defects: Map<number, Defect>;
  private signals: Map<number, Signal>;
  private notifications: Map<number, Notification>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private defectIdCounter: number;
  private signalIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.defects = new Map();
    this.signals = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.defectIdCounter = 1;
    this.signalIdCounter = 1;
    this.notificationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize demo users with hardcoded hashed passwords
    // These passwords are pre-hashed versions of "admin123" and "operator123"
    this.initializeDemoUsers();
  }
  
  // Initialize demo users with pre-hashed passwords
  private initializeDemoUsers() {
    // Admin user with pre-hashed password for "admin123"
    const adminId = this.userIdCounter++;
    const adminUser: User = { 
      id: adminId,
      username: "admin",
      password: "c67fd35b5759b0a835fe4a0d40b7940cfabda9d3fcdc227365b3f5700ce5bdb4b1c500154aef9fe3fc1864d7cbf5fc2454d31c251bc16d7b81ee707e0211e75c.9d39402e87525f37f35c665f376ae410",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(adminId, adminUser);
    
    // Operator user with pre-hashed password for "operator123"
    const operatorId = this.userIdCounter++;
    const operatorUser: User = { 
      id: operatorId,
      username: "operator",
      password: "ef9fb603e15bed335d0630ce896d9bc7dbe3eecf5f93c384e5a41303cef5c6eac80f8349a80fc1c9726a505e65ab53760d6c137f75bba1e5eee0bb38e946e2b7.22b39bc16c0b03a8e9e845bf9d25f84d",
      firstName: "John",
      lastName: "Doe",
      role: "operator",
      createdAt: new Date()
    };
    this.users.set(operatorId, operatorUser);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Ensure role is defined, default to 'operator' if not provided
    const role = insertUser.role || 'operator';
    
    const user: User = { 
      ...insertUser, 
      role,
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    
    // Set default values for required fields if not provided
    const status = insertEvent.status || "new";
    
    const event: Event = {
      ...insertEvent,
      status,
      id,
      createdAt: now,
      updatedAt: now,
      photoUrl: insertEvent.photoUrl || null
    };
    
    this.events.set(id, event);
    return event;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    
    if (!event) {
      return undefined;
    }
    
    const updatedEvent: Event = {
      ...event,
      ...eventUpdate,
      updatedAt: new Date()
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.createdById === userId || event.assignedToId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getEventsByStatus(status: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Defect methods
  async createDefect(insertDefect: InsertDefect): Promise<Defect> {
    const id = this.defectIdCounter++;
    const now = new Date();
    
    const defect: Defect = {
      ...insertDefect,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.defects.set(id, defect);
    return defect;
  }
  
  async getDefect(id: number): Promise<Defect | undefined> {
    return this.defects.get(id);
  }
  
  async updateDefect(id: number, defectUpdate: Partial<InsertDefect>): Promise<Defect | undefined> {
    const defect = this.defects.get(id);
    
    if (!defect) {
      return undefined;
    }
    
    const updatedDefect: Defect = {
      ...defect,
      ...defectUpdate,
      updatedAt: new Date()
    };
    
    this.defects.set(id, updatedDefect);
    return updatedDefect;
  }
  
  async deleteDefect(id: number): Promise<boolean> {
    return this.defects.delete(id);
  }
  
  async getAllDefects(): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getDefectsByUser(userId: number): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .filter(defect => defect.createdById === userId || defect.assignedToId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getDefectsBySeverity(severity: string): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .filter(defect => defect.severity === severity)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Signal methods
  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const id = this.signalIdCounter++;
    const now = new Date();
    
    const signal: Signal = {
      ...insertSignal,
      id,
      createdAt: now
    };
    
    this.signals.set(id, signal);
    return signal;
  }
  
  async getSignal(id: number): Promise<Signal | undefined> {
    return this.signals.get(id);
  }
  
  async updateSignal(id: number, signalUpdate: Partial<InsertSignal>): Promise<Signal | undefined> {
    const signal = this.signals.get(id);
    
    if (!signal) {
      return undefined;
    }
    
    const updatedSignal: Signal = {
      ...signal,
      ...signalUpdate
    };
    
    this.signals.set(id, updatedSignal);
    return updatedSignal;
  }
  
  async getAllSignals(): Promise<Signal[]> {
    return Array.from(this.signals.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: now
    };
    
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    
    if (!notification) {
      return false;
    }
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = await this.getNotificationsByUser(userId);
    
    for (const notification of userNotifications) {
      notification.isRead = true;
      this.notifications.set(notification.id, notification);
    }
    
    return true;
  }
}

export const storage = new MemStorage();
