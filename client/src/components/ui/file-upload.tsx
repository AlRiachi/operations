import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  existingUrl?: string;
  className?: string;
}

export function FileUpload({ onFileUploaded, existingUrl, className = "" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    // Create local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      
      // Call the callback with the uploaded file URL
      onFileUploaded(data.url);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });
    } catch (err) {
      console.error(err);
      setError('Failed to upload file. Please try again.');
      setPreviewUrl(null);
      
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileUploaded('');
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor="file-upload" className="mb-2 block">Attach Photo</Label>
      
      <Input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!previewUrl ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
              <p className="text-sm font-medium text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              
              {error && (
                <div className="mt-2 flex items-center text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-2 left-2 bg-background bg-opacity-75 px-2 py-1 rounded text-xs flex items-center">
            <FileCheck className="h-3 w-3 mr-1" />
            File uploaded
          </div>
        </div>
      )}
    </div>
  );
}
