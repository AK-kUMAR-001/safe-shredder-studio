import { AlertTriangle, Shield, FileX, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SelectedFile {
  name: string;
  size: number;
  path: string;
  type: 'file' | 'folder';
  riskLevel: 'low' | 'medium' | 'high';
}

interface ScanResultsProps {
  files: SelectedFile[];
  recommendedWipeType: 'standard' | 'advanced';
  onProceed: () => void;
  onBack: () => void;
}

export const ScanResults = ({ files, recommendedWipeType, onProceed, onBack }: ScanResultsProps) => {
  const highRiskFiles = files.filter(f => f.riskLevel === 'high');
  const mediumRiskFiles = files.filter(f => f.riskLevel === 'medium');
  const lowRiskFiles = files.filter(f => f.riskLevel === 'low');

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scan Summary */}
      <Card className="security-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Scan Complete
          </CardTitle>
          <CardDescription>
            Analysis complete for {files.length} files. Review the results below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border bg-success/5">
              <div className="text-2xl font-bold text-success">{lowRiskFiles.length}</div>
              <div className="text-sm text-success/80">Low Risk Files</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-warning/5">
              <div className="text-2xl font-bold text-warning">{mediumRiskFiles.length}</div>
              <div className="text-sm text-warning/80">Medium Risk Files</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-destructive/5">
              <div className="text-2xl font-bold text-destructive">{highRiskFiles.length}</div>
              <div className="text-sm text-destructive/80">High Risk Files</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wipe Recommendation */}
      <Card className={`security-shadow ${recommendedWipeType === 'advanced' ? 'border-warning/40' : 'border-success/40'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {recommendedWipeType === 'advanced' ? 
              <AlertTriangle className="w-6 h-6 text-warning" /> :
              <Shield className="w-6 h-6 text-success" />
            }
            Recommended: {recommendedWipeType === 'advanced' ? 'Advanced' : 'Standard'} Wipe
          </CardTitle>
          <CardDescription>
            {recommendedWipeType === 'advanced' 
              ? 'High-risk sensitive content detected. Advanced multi-pass wipe recommended.'
              : 'Standard secure deletion is sufficient for the detected content.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              recommendedWipeType === 'standard' ? 'bg-success/10 border-success/20' : 'bg-muted/30'
            }`}>
              <div className="font-medium text-success">Standard Wipe</div>
              <div className="text-sm text-muted-foreground mt-1">
                Single-pass overwrite with random data. Suitable for most files.
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${
              recommendedWipeType === 'advanced' ? 'bg-warning/10 border-warning/20' : 'bg-muted/30'
            }`}>
              <div className="font-medium text-warning">Advanced Wipe</div>
              <div className="text-sm text-muted-foreground mt-1">
                Multi-pass overwrite following DoD standards. For sensitive data.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Details */}
      <Card className="security-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="w-5 h-5" />
            Files to be Wiped
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {/* High Risk Files */}
            {highRiskFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  High Risk Files ({highRiskFiles.length})
                </h4>
                <div className="space-y-1 ml-6">
                  {highRiskFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border bg-destructive/5">
                      <div className="font-mono text-sm">{file.name}</div>
                      <Badge className={getRiskColor(file.riskLevel)}>
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Risk Files */}
            {mediumRiskFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-warning mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Medium Risk Files ({mediumRiskFiles.length})
                </h4>
                <div className="space-y-1 ml-6">
                  {mediumRiskFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border bg-warning/5">
                      <div className="font-mono text-sm">{file.name}</div>
                      <Badge className={getRiskColor(file.riskLevel)}>
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Risk Files */}
            {lowRiskFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Low Risk Files ({lowRiskFiles.length})
                </h4>
                <div className="space-y-1 ml-6">
                  {lowRiskFiles.slice(0, 5).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border bg-success/5">
                      <div className="font-mono text-sm">{file.name}</div>
                      <Badge className={getRiskColor(file.riskLevel)}>
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                  ))}
                  {lowRiskFiles.length > 5 && (
                    <div className="text-sm text-muted-foreground ml-2">
                      ... and {lowRiskFiles.length - 5} more files
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warning and Actions */}
      <Alert className="border-destructive/20 bg-destructive/5">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Warning:</strong> This operation will permanently delete all selected files. 
          This action cannot be undone. Ensure you have backups of any important data.
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
        <Button 
          onClick={onProceed}
          className={`flex-1 ${
            recommendedWipeType === 'advanced' 
              ? 'bg-gradient-danger danger-shadow' 
              : 'bg-gradient-security security-shadow'
          }`}
          size="lg"
        >
          Proceed with {recommendedWipeType === 'advanced' ? 'Advanced' : 'Standard'} Wipe
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};