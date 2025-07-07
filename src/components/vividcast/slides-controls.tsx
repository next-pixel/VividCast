import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


export function SlidesControls() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Slides</Label>
         <Input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
        <p className="text-xs text-muted-foreground text-center">Upload a PDF to use as slides in your video.</p>
      </div>
      
      {uploadedFile && (
        <div className="space-y-2">
            <Label>Current Slides</Label>
            <div className="flex items-center justify-between p-2 border rounded-lg">
                <div className='flex items-center gap-2'>
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ (uploadedFile.size / (1024*1024)).toFixed(2) } MB</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadedFile(null)}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
