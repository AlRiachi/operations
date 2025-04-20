import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Signal, insertSignalSchema } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench } from "lucide-react";

interface SignalFormProps {
  signal?: Signal | null;
  onSuccess?: () => void;
}

// Extend the schema with validation
const formSchema = insertSignalSchema.extend({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  value: z.string().min(1, { message: "Value is required" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  source: z.string().min(3, { message: "Source must be at least 3 characters" }),
});

type SignalFormValues = z.infer<typeof formSchema>;

export function SignalForm({ signal, onSuccess }: SignalFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<SignalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: signal ? {
      name: signal.name,
      value: signal.value,
      unit: signal.unit,
      status: signal.status,
      source: signal.source,
      // We're using these fields with the existing schema
      // In the next database migration, we'll use proper fields
    } : {
      name: "",
      value: "",
      unit: "",
      status: "normal",
      source: "",
    },
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SignalFormValues) => {
      // For forced signals, encode the information in the existing fields
      // using prefixes since the database doesn't have the new columns yet
      const signalData = {
        ...data,
        name: data.name.startsWith("forced_") ? data.name : `forced_${data.name}`,
        source: data.source.includes("forced") ? data.source : `forced_${data.source}`,
        // Don't include fields that don't exist in the database
        // category and severity are encoded in the name
      };
      
      const res = await apiRequest("POST", "/api/signals", signalData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
      toast({
        title: "Forced signal recorded",
        description: "The forced signal has been recorded successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to record forced signal: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SignalFormValues) => {
      if (!signal) return;
      
      // For forced signals, encode the information in the existing fields
      // using prefixes since the database doesn't have the new columns yet
      const signalData = {
        ...data,
        name: data.name.startsWith("forced_") ? data.name : `forced_${data.name}`,
        source: data.source.includes("forced") ? data.source : `forced_${data.source}`,
        // Don't include fields that don't exist in the database
        // category and severity are encoded in the name
      };
      
      const res = await apiRequest("PUT", `/api/signals/${signal.id}`, signalData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
      toast({
        title: "Forced signal updated",
        description: "The forced signal has been updated successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update forced signal: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: SignalFormValues) => {
    if (signal) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signal Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., BFP Pressure Sensor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 120" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., bar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Control System" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center pt-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-sm text-muted-foreground">
            This signal will be marked as a <strong>forced signal</strong> in the system.
          </span>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {signal ? "Update Signal" : "Record Signal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}