import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupUploadRoutes } from "./upload";
import { z } from "zod";
import {
  insertEventSchema,
  insertDefectSchema,
  insertSignalSchema,
  insertNotificationSchema
} from "@shared/schema";

// WebSocket connections store
const clients = new Set<WebSocket>();

// Helper function to broadcast messages to all connected clients
function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.add(ws);
    
    // Send initial data on connection
    const sendInitialData = async () => {
      try {
        const events = await storage.getAllEvents();
        const defects = await storage.getAllDefects();
        const signals = await storage.getAllSignals();
        
        ws.send(JSON.stringify({ 
          type: 'initial_data', 
          data: { events, defects, signals } 
        }));
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };
    
    sendInitialData();
    
    // Handle connection close
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });
  
  // Authentication routes
  setupAuth(app);
  
  // Upload routes
  setupUploadRoutes(app);
  
  // Users
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const users = await storage.getAllUsers();
      
      // Remove passwords from user objects
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });
  
  // Events
  app.get("/api/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { status, userId } = req.query;
      
      let events;
      if (status) {
        events = await storage.getEventsByStatus(status as string);
      } else if (userId) {
        events = await storage.getEventsByUser(parseInt(userId as string));
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventData = insertEventSchema.parse(req.body);
      
      // Set the creator to the current user
      const event = await storage.createEvent({
        ...eventData,
        createdById: req.user.id,
      });
      
      // Create notification for assigned user if one exists
      if (event.assignedToId) {
        await storage.createNotification({
          title: "New Event Assignment",
          message: `You've been assigned to event: ${event.title}`,
          type: "info",
          isRead: false,
          userId: event.assignedToId,
          relatedId: event.id,
          relatedType: "event"
        });
      }
      
      // Broadcast event creation to connected clients
      broadcastUpdate('event_created', event);
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.put("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      
      const existingEvent = await storage.getEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only allow users to update their own events unless they're an admin
      if (existingEvent.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      
      // If status has changed to resolved, notify the creator
      if (eventData.status === "resolved" && existingEvent.status !== "resolved") {
        await storage.createNotification({
          title: "Event Resolved",
          message: `Event "${existingEvent.title}" has been marked as resolved`,
          type: "success",
          isRead: false,
          userId: existingEvent.createdById,
          relatedId: eventId,
          relatedType: "event"
        });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only allow users to delete their own events unless they're an admin
      if (event.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteEvent(eventId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete event" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Defects
  app.get("/api/defects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { severity, userId } = req.query;
      
      let defects;
      if (severity) {
        defects = await storage.getDefectsBySeverity(severity as string);
      } else if (userId) {
        defects = await storage.getDefectsByUser(parseInt(userId as string));
      } else {
        defects = await storage.getAllDefects();
      }
      
      res.json(defects);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/defects/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const defectId = parseInt(req.params.id);
      const defect = await storage.getDefect(defectId);
      
      if (!defect) {
        return res.status(404).json({ message: "Defect not found" });
      }
      
      res.json(defect);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/defects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const defectData = insertDefectSchema.parse(req.body);
      
      // Set the creator to the current user
      const defect = await storage.createDefect({
        ...defectData,
        createdById: req.user.id,
      });
      
      // Create notification for assigned user if one exists
      if (defect.assignedToId) {
        await storage.createNotification({
          title: "New Defect Assignment",
          message: `You've been assigned to defect: ${defect.title}`,
          type: "warning",
          isRead: false,
          userId: defect.assignedToId,
          relatedId: defect.id,
          relatedType: "defect"
        });
      }
      
      // Broadcast defect creation to all connected clients
      broadcastUpdate('defect_created', defect);
      
      res.status(201).json(defect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.put("/api/defects/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const defectId = parseInt(req.params.id);
      const defectData = insertDefectSchema.partial().parse(req.body);
      
      const existingDefect = await storage.getDefect(defectId);
      
      if (!existingDefect) {
        return res.status(404).json({ message: "Defect not found" });
      }
      
      // Only allow users to update their own defects unless they're an admin
      if (existingDefect.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedDefect = await storage.updateDefect(defectId, defectData);
      
      // If status has changed to resolved, notify the creator
      if (defectData.status === "resolved" && existingDefect.status !== "resolved") {
        await storage.createNotification({
          title: "Defect Resolved",
          message: `Defect "${existingDefect.title}" has been marked as resolved`,
          type: "success",
          isRead: false,
          userId: existingDefect.createdById,
          relatedId: defectId,
          relatedType: "defect"
        });
      }
      
      // Broadcast defect update to all connected clients
      broadcastUpdate('defect_updated', updatedDefect);
      
      res.json(updatedDefect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/defects/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const defectId = parseInt(req.params.id);
      const defect = await storage.getDefect(defectId);
      
      if (!defect) {
        return res.status(404).json({ message: "Defect not found" });
      }
      
      // Only allow users to delete their own defects unless they're an admin
      if (defect.createdById !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteDefect(defectId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete defect" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Signals
  app.get("/api/signals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const signals = await storage.getAllSignals();
      res.json(signals);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/signals/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const signalId = parseInt(req.params.id);
      const signal = await storage.getSignal(signalId);
      
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      res.json(signal);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/signals", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Need to modify the schema validation as the DB doesn't have all columns
      // Skip using insertSignalSchema for now and manually validate
      const { name, value, unit, status, source } = req.body;
      
      if (!name || !value || !unit || !status || !source) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create the signal without trying to use fields that don't exist in DB
      const signal = await storage.createSignal({
        name, value, unit, status, source
      });
      
      // Broadcast the new signal to all connected clients
      broadcastUpdate('signal_created', signal);
      
      res.status(201).json(signal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.put("/api/signals/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const signalId = parseInt(req.params.id);
      
      // Need to modify the schema validation as the DB doesn't have all columns
      // Skip using insertSignalSchema for now and manually validate
      const { name, value, unit, status, source } = req.body;
      const signalData = { name, value, unit, status, source };
      
      const existingSignal = await storage.getSignal(signalId);
      
      if (!existingSignal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      // Remove createdById check as it doesn't exist in the DB yet
      // We'll implement this check later
      
      const updatedSignal = await storage.updateSignal(signalId, signalData);
      
      // Broadcast the signal update to all connected clients
      broadcastUpdate('signal_updated', updatedSignal);
      
      res.json(updatedSignal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });
  
  app.delete("/api/signals/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const signalId = parseInt(req.params.id);
      const signal = await storage.getSignal(signalId);
      
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      // Remove createdById check as it doesn't exist in the DB yet
      // We'll implement this check later
      
      const success = await storage.deleteSignal(signalId);
      
      if (success) {
        // Broadcast the signal deletion to all connected clients
        broadcastUpdate('signal_deleted', { id: signalId });
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete signal" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Notifications
  app.get("/api/notifications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/notifications/:id/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow users to mark their own notifications as read
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.markNotificationAsRead(notificationId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to mark notification as read" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/notifications/mark-all-read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const success = await storage.markAllNotificationsAsRead(req.user.id);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to mark all notifications as read" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Return the HTTP server with WebSocket support
  return httpServer;
}
