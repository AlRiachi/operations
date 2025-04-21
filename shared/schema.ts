import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: ["operator", "admin"] }).default("operator").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  category: text("category", { 
    enum: ["operations", "maintenance", "safety", "environmental"] 
  }).notNull(),
  priority: text("priority", { 
    enum: ["low", "medium", "high", "critical"] 
  }).notNull(),
  status: text("status", { 
    enum: ["new", "in_progress", "resolved", "closed"] 
  }).default("new").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  photoUrl: text("photo_url"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Defect schema
export const defects = pgTable("defects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  category: text("category", { 
    enum: ["mechanical", "electrical", "structural", "control", "other"] 
  }).notNull(),
  severity: text("severity", { 
    enum: ["low", "medium", "high", "critical"] 
  }).notNull(),
  status: text("status", { 
    enum: ["new", "assigned", "in_progress", "resolved", "closed"] 
  }).default("new").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  photoUrl: text("photo_url"),
});

export const insertDefectSchema = createInsertSchema(defects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Signal schema
export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  status: text("status", { 
    enum: ["normal", "warning", "critical", "active", "inactive"] 
  }).default("normal").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Note: These fields exist in our schema but not in the actual database
  // We're commenting them out rather than removing entirely for reference
  // category: text("category", {
  //   enum: ["normal", "forced"]
  // }).default("normal").notNull(),
  // severity: text("severity", {
  //   enum: ["low", "medium", "high", "critical"]
  // }).default("low").notNull(),
  // description: text("description"),
  // createdById: integer("created_by_id").references(() => users.id),
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { 
    enum: ["info", "success", "warning", "error"] 
  }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedId: integer("related_id"),
  relatedType: text("related_type", { 
    enum: ["event", "defect", "signal"] 
  }),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  eventsCreated: many(events, { relationName: "userEventsCreated" }),
  eventsAssigned: many(events, { relationName: "userEventsAssigned" }),
  defectsCreated: many(defects, { relationName: "userDefectsCreated" }),
  defectsAssigned: many(defects, { relationName: "userDefectsAssigned" }),
  // Removing relation since createdById doesn't exist in signals table
  // signalsCreated: many(signals, { relationName: "userSignalsCreated" }),
  notifications: many(notifications),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
    relationName: "userEventsCreated"
  }),
  assignedTo: one(users, {
    fields: [events.assignedToId],
    references: [users.id],
    relationName: "userEventsAssigned"
  }),
}));

export const defectsRelations = relations(defects, ({ one }) => ({
  createdBy: one(users, {
    fields: [defects.createdById],
    references: [users.id],
    relationName: "userDefectsCreated"
  }),
  assignedTo: one(users, {
    fields: [defects.assignedToId],
    references: [users.id],
    relationName: "userDefectsAssigned"
  }),
}));

// Since createdById doesn't exist in the database, we need to update the relations
export const signalsRelations = relations(signals, ({ }) => ({
  // Commenting out this relation since createdById doesn't exist in the database
  // createdBy: one(users, {
  //   fields: [signals.createdById],
  //   references: [users.id],
  //   relationName: "userSignalsCreated"
  // }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Defect = typeof defects.$inferSelect;
export type InsertDefect = z.infer<typeof insertDefectSchema>;

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
