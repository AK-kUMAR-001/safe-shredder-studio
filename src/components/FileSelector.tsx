import { useRef } from 'react';
import { Upload, Folder, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SelectedFile {
  name: string;
  size: number;
  path: string;
  type: 'file' | 'folder';
  riskLevel: 'low' | 'medium' | 'high';
}

interface FileSelectorProps {
  onFileSelection: (files: FileList | null) => void;
  selectedFiles: SelectedFile[];
}

export const FileSelector = ({ onFileSelection, selectedFiles }: FileSelectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleFileClick}
          className="h-24 flex-col gap-2 security-shadow hover:shadow-elevated transition-all"
        >
          <File className="w-8 h-8 text-primary" />
          <div className="text-center">
            <div className="font-medium">Browse Files</div>
            <div className="text-sm text-muted-foreground">Select individual files</div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleFolderClick}
          className="h-24 flex-col gap-2 security-shadow hover:shadow-elevated transition-all"
        >
          <Folder className="w-8 h-8 text-primary" />
          <div className="text-center">
            <div className="font-medium">Browse Folders</div>
            <div className="text-sm text-muted-foreground">Select entire directories</div>
          </div>
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onFileSelection(e.target.files)}
        accept="*/*"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "" } as any)}
        className="hidden"
        onChange={(e) => onFileSelection(e.target.files)}
      />

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
              <Badge variant="outline">
                {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {file.type === 'folder' ? 
                      <Folder className="w-4 h-4 text-primary flex-shrink-0" /> : 
                      <File className="w-4 h-4 text-primary flex-shrink-0" />
                    }
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getRiskColor(file.riskLevel)}`}>
                      {file.riskLevel} risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Limitations Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Upload className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Demo Mode:</strong> This is a frontend prototype. In a real implementation, 
              this would integrate with Electron for true file system access and secure deletion capabilities.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};