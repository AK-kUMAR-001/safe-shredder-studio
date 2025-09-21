import { Trash2, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SelectedFile {
  name: string;
  size: number;
  path: string;
  type: 'file' | 'folder';
  riskLevel: 'low' | 'medium' | 'high';
}

interface WipeProgressProps {
  files: SelectedFile[];
  progress: number;
  wipeType: 'standard' | 'advanced';
}

export const WipeProgress = ({ files, progress, wipeType }: WipeProgressProps) => {
  const currentFileIndex = Math.floor((progress / 100) * files.length);
  const currentFile = files[currentFileIndex] || files[files.length - 1];
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getWipeMethod = () => {
    if (wipeType === 'advanced') {
      return {
        name: 'DoD 5220.22-M (7-pass)',
        description: 'Military-grade secure erasure with 7 overwrite passes',
        icon: <Shield className="w-5 h-5 text-warning" />,
        color: 'warning'
      };
    }
    return {
      name: 'Standard Secure Wipe',
      description: 'Single-pass random data overwrite',
      icon: <Trash2 className="w-5 h-5 text-primary" />,
      color: 'primary'
    };
  };

  const method = getWipeMethod();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={`security-shadow ${wipeType === 'advanced' ? 'border-warning/40' : 'border-primary/40'}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            Secure Wipe in Progress
          </CardTitle>
          <CardDescription>
            Permanently deleting {files.length} files using {method.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress 
              value={progress} 
              className={`h-3 ${wipeType === 'advanced' ? '[&>div]:bg-gradient-danger' : '[&>div]:bg-gradient-security'}`} 
            />
          </div>

          {/* Wipe Method Info */}
          <div className={`p-4 rounded-lg border ${
            wipeType === 'advanced' ? 'bg-warning/10 border-warning/20' : 'bg-primary/10 border-primary/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {method.icon}
              <span className="font-medium">{method.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {method.description}
            </div>
          </div>

          {/* Current File */}
          {progress < 100 && currentFile && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Currently Processing:</div>
              <div className="p-3 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm truncate">{currentFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(currentFile.size)} • File {currentFileIndex + 1} of {files.length}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {currentFile.riskLevel} risk
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg border bg-card/30">
              <div className="text-lg font-bold text-foreground">{files.length}</div>
              <div className="text-xs text-muted-foreground">Total Files</div>
            </div>
            <div className="text-center p-3 rounded-lg border bg-card/30">
              <div className="text-lg font-bold text-foreground">
                {(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} MB
              </div>
              <div className="text-xs text-muted-foreground">Total Size</div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border-dashed border">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <strong>Do not interrupt this process.</strong> Closing the application or powering off 
              your device during the wipe operation may leave recoverable data fragments.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};