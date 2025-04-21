import { 
  users, User, InsertUser, 
  events, Event, InsertEvent,
  defects, Defect, InsertDefect,
  signals, Signal, InsertSignal,
  notifications, Notification, InsertNotification
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { hashPassword } from "./auth";
import { db, pool } from "./db";
import { eq, desc, and, or, not } from "drizzle-orm";

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
  softDeleteEvent(id: number): Promise<boolean>; // Changed to soft delete
  getAllEvents(): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  getEventsByStatus(status: string): Promise<Event[]>;
  
  // Defect operations
  createDefect(defect: InsertDefect): Promise<Defect>;
  getDefect(id: number): Promise<Defect | undefined>;
  updateDefect(id: number, defect: Partial<InsertDefect>): Promise<Defect | undefined>;
  softDeleteDefect(id: number): Promise<boolean>; // Changed to soft delete
  getAllDefects(): Promise<Defect[]>;
  getDefectsByUser(userId: number): Promise<Defect[]>;
  getDefectsBySeverity(severity: string): Promise<Defect[]>;
  
  // Signal operations
  createSignal(signal: { name: string; value: string; unit: string; status: string; source: string }): Promise<Signal>;
  getSignal(id: number): Promise<Signal | undefined>;
  updateSignal(id: number, signal: Partial<{ name: string; value: string; unit: string; status: string; source: string }>): Promise<Signal | undefined>;
  softDeleteSignal(id: number): Promise<boolean>; // Changed to soft delete
  getAllSignals(): Promise<Signal[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any for session store due to type issue
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private defects: Map<number, Defect>;
  private signals: Map<number, Signal>;
  private notifications: Map<number, Notification>;
  sessionStore: any; // Using any for session store due to type issue
  
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
    const assignedToId = insertEvent.assignedToId !== undefined ? insertEvent.assignedToId : null;
    
    const event: Event = {
      ...insertEvent,
      status,
      assignedToId,
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
  
  async softDeleteEvent(id: number): Promise<boolean> {
    const event = this.events.get(id);
    if (!event) {
      return false;
    }
    
    // Mark as deleted but keep in storage
    const updatedEvent: Event = {
      ...event,
      status: "closed", // Use "closed" instead of "deleted" to match the enum
      updatedAt: new Date()
    };
    
    this.events.set(id, updatedEvent);
    return true;
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.status !== "closed") // Filter out soft-deleted events
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => 
        (event.createdById === userId || event.assignedToId === userId) &&
        event.status !== "closed" // Filter out soft-deleted events
      )
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
    
    // Set default values for required fields if not provided
    const status = insertDefect.status || "new";
    const severity = insertDefect.severity || "medium";
    const assignedToId = insertDefect.assignedToId !== undefined ? insertDefect.assignedToId : null;
    
    const defect: Defect = {
      ...insertDefect,
      status,
      severity,
      assignedToId,
      id,
      createdAt: now,
      updatedAt: now,
      photoUrl: insertDefect.photoUrl || null
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
  
  async softDeleteDefect(id: number): Promise<boolean> {
    const defect = this.defects.get(id);
    if (!defect) {
      return false;
    }
    
    // Mark as deleted but keep in storage
    const updatedDefect: Defect = {
      ...defect,
      status: "closed", // Use "closed" instead of "deleted" to match the enum
      updatedAt: new Date()
    };
    
    this.defects.set(id, updatedDefect);
    return true;
  }
  
  async getAllDefects(): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .filter(defect => defect.status !== "closed") // Filter out soft-deleted defects
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getDefectsByUser(userId: number): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .filter(defect => 
        (defect.createdById === userId || defect.assignedToId === userId) &&
        defect.status !== "closed" // Filter out soft-deleted defects
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getDefectsBySeverity(severity: string): Promise<Defect[]> {
    return Array.from(this.defects.values())
      .filter(defect => 
        defect.severity === severity &&
        defect.status !== "closed" // Filter out soft-deleted defects
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Signal methods
  async createSignal(insertSignal: { name: string; value: string; unit: string; status: string; source: string }): Promise<Signal> {
    const id = this.signalIdCounter++;
    const now = new Date();
    
    // Set default values for required fields if not provided
    const status = insertSignal.status || "normal";
    
    // Create a signal object with only the fields that exist in the database schema
    const signal: Signal = {
      id,
      name: insertSignal.name,
      value: insertSignal.value,
      unit: insertSignal.unit,
      source: insertSignal.source,
      status: status as "normal" | "warning" | "critical" | "active" | "inactive",
      createdAt: now
    };
    
    this.signals.set(id, signal);
    return signal;
  }
  
  async getSignal(id: number): Promise<Signal | undefined> {
    return this.signals.get(id);
  }
  
  async updateSignal(id: number, signalUpdate: Partial<{ name: string; value: string; unit: string; status: string; source: string }>): Promise<Signal | undefined> {
    const signal = this.signals.get(id);
    
    if (!signal) {
      return undefined;
    }
    
    // Apply updates while maintaining proper types
    const updatedSignal: Signal = {
      ...signal,
      name: signalUpdate.name !== undefined ? signalUpdate.name : signal.name,
      value: signalUpdate.value !== undefined ? signalUpdate.value : signal.value,
      unit: signalUpdate.unit !== undefined ? signalUpdate.unit : signal.unit,
      source: signalUpdate.source !== undefined ? signalUpdate.source : signal.source,
      status: signalUpdate.status !== undefined ? signalUpdate.status as "normal" | "warning" | "critical" | "active" | "inactive" : signal.status,
      createdAt: signal.createdAt
    };
    
    this.signals.set(id, updatedSignal);
    return updatedSignal;
  }
  
  async getAllSignals(): Promise<Signal[]> {
    return Array.from(this.signals.values())
      .filter(signal => signal.status !== "inactive") // Filter out soft-deleted signals
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async deleteSignal(id: number): Promise<boolean> {
    if (!this.signals.has(id)) {
      return false;
    }
    
    return this.signals.delete(id);
  }
  
  async softDeleteSignal(id: number): Promise<boolean> {
    const signal = this.signals.get(id);
    if (!signal) {
      return false;
    }
    
    // Mark as deleted by changing status but keep in storage
    const updatedSignal: Signal = {
      ...signal,
      status: "inactive" // Use inactive as deleted status for signals
    };
    
    this.signals.set(id, updatedSignal);
    return true;
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    
    // Set default values for required fields if not provided
    const isRead = insertNotification.isRead !== undefined ? insertNotification.isRead : false;
    const relatedId = insertNotification.relatedId !== undefined ? insertNotification.relatedId : null;
    const relatedType = insertNotification.relatedType !== undefined ? insertNotification.relatedType : null;
    
    const notification: Notification = {
      ...insertNotification,
      isRead,
      relatedId,
      relatedType,
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

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store due to type issue

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Initialize demo users with freshly hashed passwords
  async initializeDemoUsers() {
    // Check if admin user exists
    const adminUser = await this.getUserByUsername("admin");
    if (!adminUser) {
      await this.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      });
    }

    // Check if operator user exists
    const operatorUser = await this.getUserByUsername("operator");
    if (!operatorUser) {
      await this.createUser({
        username: "operator",
        password: await hashPassword("operator123"),
        firstName: "John",
        lastName: "Doe",
        role: "operator"
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Make username case-insensitive
    const lowercaseUsername = username.toLowerCase();
    const allUsers = await db.select().from(users);
    
    // Find the user with case-insensitive matching
    const user = allUsers.find(
      (u) => u.username.toLowerCase() === lowercaseUsername
    );
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Event methods
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const now = new Date();
    
    // Set default values for required fields if not provided
    const status = insertEvent.status || "new";
    const assignedToId = insertEvent.assignedToId !== undefined ? insertEvent.assignedToId : null;
    const photoUrl = insertEvent.photoUrl || null;
    
    const [event] = await db
      .insert(events)
      .values({
        ...insertEvent,
        status,
        assignedToId,
        photoUrl,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const now = new Date();
    
    const [event] = await db
      .update(events)
      .set({
        ...eventUpdate,
        updatedAt: now
      })
      .where(eq(events.id, id))
      .returning();
    
    return event;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async softDeleteEvent(id: number): Promise<boolean> {
    const now = new Date();
    
    const [event] = await db
      .update(events)
      .set({
        status: "closed", // Use "closed" instead of "deleted" to match enum
        updatedAt: now
      })
      .where(eq(events.id, id))
      .returning();
    
    return !!event;
  }

  async getAllEvents(): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        // Filter out deleted events (status != "closed")
        not(eq(events.status, "closed"))
      )
      .orderBy(desc(events.createdAt));
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          or(
            eq(events.createdById, userId),
            eq(events.assignedToId, userId)
          ),
          // Filter out deleted events
          not(eq(events.status, "closed"))
        )
      )
      .orderBy(desc(events.createdAt));
  }

  async getEventsByStatus(status: string): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.status, status as any))
      .orderBy(desc(events.createdAt));
  }

  // Defect methods
  async createDefect(insertDefect: InsertDefect): Promise<Defect> {
    const now = new Date();
    
    // Set default values for required fields if not provided
    const status = insertDefect.status || "new";
    const severity = insertDefect.severity || "medium";
    const assignedToId = insertDefect.assignedToId !== undefined ? insertDefect.assignedToId : null;
    const photoUrl = insertDefect.photoUrl || null;
    
    const [defect] = await db
      .insert(defects)
      .values({
        ...insertDefect,
        status,
        severity,
        assignedToId,
        photoUrl,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    return defect;
  }

  async getDefect(id: number): Promise<Defect | undefined> {
    const [defect] = await db
      .select()
      .from(defects)
      .where(eq(defects.id, id));
    return defect;
  }

  async updateDefect(id: number, defectUpdate: Partial<InsertDefect>): Promise<Defect | undefined> {
    const now = new Date();
    
    const [defect] = await db
      .update(defects)
      .set({
        ...defectUpdate,
        updatedAt: now
      })
      .where(eq(defects.id, id))
      .returning();
    
    return defect;
  }

  async deleteDefect(id: number): Promise<boolean> {
    const result = await db
      .delete(defects)
      .where(eq(defects.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async softDeleteDefect(id: number): Promise<boolean> {
    const now = new Date();
    
    const [defect] = await db
      .update(defects)
      .set({
        status: "closed", // Use "closed" instead of "deleted" to match enum
        updatedAt: now
      })
      .where(eq(defects.id, id))
      .returning();
    
    return !!defect;
  }

  async getAllDefects(): Promise<Defect[]> {
    return db
      .select()
      .from(defects)
      .where(
        // Filter out deleted defects (status != "closed")
        not(eq(defects.status, "closed"))
      )
      .orderBy(desc(defects.createdAt));
  }

  async getDefectsByUser(userId: number): Promise<Defect[]> {
    return db
      .select()
      .from(defects)
      .where(
        and(
          or(
            eq(defects.createdById, userId),
            eq(defects.assignedToId, userId)
          ),
          // Filter out deleted defects
          not(eq(defects.status, "closed"))
        )
      )
      .orderBy(desc(defects.createdAt));
  }

  async getDefectsBySeverity(severity: string): Promise<Defect[]> {
    return db
      .select()
      .from(defects)
      .where(
        and(
          eq(defects.severity, severity as any),
          // Filter out deleted defects
          not(eq(defects.status, "closed"))
        )
      )
      .orderBy(desc(defects.createdAt));
  }

  // Signal methods
  async createSignal(insertSignal: { name: string; value: string; unit: string; status: string; source: string }): Promise<Signal> {
    const now = new Date();
    
    // Set default values for required fields if not provided
    const status = insertSignal.status || "normal";
    
    // Log the exact SQL query being generated for debugging purposes
    console.log("Signal insert details:", {
      name: insertSignal.name,
      value: insertSignal.value,
      unit: insertSignal.unit,
      status,
      source: insertSignal.source,
      created_at: now
    });
    
    // Explicitly map to database column names
    // The column name is 'created_at', not 'createdAt'
    try {
      // Using the proper column names as defined in the schema
      const [signal] = await db
        .insert(signals)
        .values({
          name: insertSignal.name,
          value: insertSignal.value,
          unit: insertSignal.unit,
          status,
          source: insertSignal.source,
          createdAt: now
        })
        .returning();
      
      return signal;
    } catch (error) {
      console.error("Error inserting signal:", error);
      throw error;
    }
  }

  async getSignal(id: number): Promise<Signal | undefined> {
    const [signal] = await db
      .select()
      .from(signals)
      .where(eq(signals.id, id));
    return signal;
  }

  async updateSignal(id: number, signalUpdate: Partial<{ name: string; value: string; unit: string; status: string; source: string }>): Promise<Signal | undefined> {
    // Ensure status is one of the allowed enum values if it's provided
    const update: any = { ...signalUpdate };
    if (update.status && !["normal", "warning", "critical", "active", "inactive"].includes(update.status)) {
      update.status = "normal"; // Default to normal if invalid status
    }
    
    const [signal] = await db
      .update(signals)
      .set(update)
      .where(eq(signals.id, id))
      .returning();
    
    return signal;
  }

  async getAllSignals(): Promise<Signal[]> {
    // Explicitly select only the existing columns to avoid schema issues
    return db
      .select({
        id: signals.id,
        name: signals.name,
        value: signals.value,
        unit: signals.unit,
        status: signals.status,
        source: signals.source,
        createdAt: signals.createdAt
      })
      .from(signals)
      .where(
        // Filter out inactive signals
        not(eq(signals.status, "inactive"))
      )
      .orderBy(desc(signals.createdAt));
  }
  
  async deleteSignal(id: number): Promise<boolean> {
    const result = await db
      .delete(signals)
      .where(eq(signals.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async softDeleteSignal(id: number): Promise<boolean> {
    // Set status to "inactive" instead of deleting
    const [signal] = await db
      .update(signals)
      .set({
        status: "inactive" // Use inactive instead of deleted for signals
      })
      .where(eq(signals.id, id))
      .returning();
    
    return !!signal;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const now = new Date();
    
    // Set default values for required fields if not provided
    const isRead = insertNotification.isRead !== undefined ? insertNotification.isRead : false;
    const relatedId = insertNotification.relatedId !== undefined ? insertNotification.relatedId : null;
    const relatedType = insertNotification.relatedType !== undefined ? insertNotification.relatedType : null;
    
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        isRead,
        relatedId,
        relatedType,
        createdAt: now
      })
      .returning();
    
    return notification;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
    
    return result.length > 0;
  }
}

// Use database storage by default
export const storage = new DatabaseStorage();
