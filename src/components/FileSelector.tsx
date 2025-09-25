import { useRef } from 'react';
import { Upload, Folder, File, HardDrive, FolderOpen, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  isUploading?: boolean;
}

export const FileSelector = ({ onFileSelection, selectedFiles, isUploading = false }: FileSelectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const driveInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleDriveClick = () => {
    driveInputRef.current?.click();
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
    <div className="space-y-6">
      {/* Selection Type Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Choose Data Source Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              Select the type of data you want to analyze and securely wipe. Each option provides different levels of access and scanning capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleFileClick}
          disabled={isUploading}
          className="h-32 flex-col gap-3 security-shadow hover:shadow-elevated transition-all border-2 hover:border-primary/40"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-security flex items-center justify-center">
            <File className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-semibold">Individual Files</div>
            <div className="text-sm text-muted-foreground mt-1">
              Select specific files for targeted analysis
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleFolderClick}
          disabled={isUploading}
          className="h-32 flex-col gap-3 security-shadow hover:shadow-elevated transition-all border-2 hover:border-primary/40"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-security flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-semibold">Folders & Directories</div>
            <div className="text-sm text-muted-foreground mt-1">
              Scan entire folder structures recursively
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleDriveClick}
          disabled={isUploading}
          className="h-32 flex-col gap-3 security-shadow hover:shadow-elevated transition-all border-2 hover:border-warning/40"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-danger flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-semibold">Drive Access</div>
            <div className="text-sm text-muted-foreground mt-1">
              Deep scan entire drives or partitions
            </div>
            <Badge variant="outline" className="mt-1 text-xs border-warning text-warning">
              Advanced
            </Badge>
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
      <input
        ref={driveInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "" } as any)}
        className="hidden"
        onChange={(e) => onFileSelection(e.target.files)}
      />

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <Card className="security-shadow border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Analysis Queue
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-primary text-primary">
                  {selectedFiles.length} items
                </Badge>
                <Badge variant="outline" className="border-success text-success">
                  {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* File Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{selectedFiles.filter(f => f.type === 'file').length}</div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{selectedFiles.filter(f => f.type === 'folder').length}</div>
                <div className="text-xs text-muted-foreground">Folders</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {selectedFiles.filter(f => f.riskLevel === 'high' || f.riskLevel === 'medium').length}
                </div>
                <div className="text-xs text-muted-foreground">At Risk</div>
              </div>
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

      {/* Processing Capabilities Notice */}
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-security flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-primary">Enterprise-Grade Security Processing</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                • <strong>Advanced Pattern Recognition:</strong> AI-powered scanning for sensitive data patterns<br/>
                • <strong>DoD-Standard Wiping:</strong> Multi-pass overwrite following military specifications<br/>
                • <strong>Real-time Processing:</strong> Files uploaded to secure cloud infrastructure<br/>
                • <strong>Compliance Ready:</strong> GDPR, HIPAA, and SOX compliant data destruction
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};