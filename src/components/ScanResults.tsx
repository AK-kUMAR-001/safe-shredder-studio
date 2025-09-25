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
  
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const folders = files.filter(f => f.type === 'folder');
  const actualFiles = files.filter(f => f.type === 'file');

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
          {/* Main Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg border bg-primary/5">
              <div className="text-2xl font-bold text-primary">{files.length}</div>
              <div className="text-sm text-primary/80">Total Items</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-success/5">
              <div className="text-2xl font-bold text-success">{lowRiskFiles.length}</div>
              <div className="text-sm text-success/80">Low Risk</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-warning/5">
              <div className="text-2xl font-bold text-warning">{mediumRiskFiles.length}</div>
              <div className="text-sm text-warning/80">Medium Risk</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-destructive/5">
              <div className="text-2xl font-bold text-destructive">{highRiskFiles.length}</div>
              <div className="text-sm text-destructive/80">High Risk</div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm font-medium">Content Analysis</div>
              <div className="text-2xl font-bold">{actualFiles.length}</div>
              <div className="text-xs text-muted-foreground">Files</div>
              <div className="text-lg font-semibold">{folders.length}</div>
              <div className="text-xs text-muted-foreground">Folders</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Total Size</div>
              <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
              <div className="text-xs text-muted-foreground">
                Avg: {formatFileSize(Math.round(totalSize / (actualFiles.length || 1)))} per file
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Risk Assessment</div>
              <div className="text-2xl font-bold text-destructive">
                {Math.round(((highRiskFiles.length * 3 + mediumRiskFiles.length * 2 + lowRiskFiles.length) / (files.length * 3)) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Wipe Recommendation */}
      <Card className={`security-shadow border-2 ${
        recommendedWipeType === 'advanced' 
          ? 'border-destructive/40 bg-destructive/5' 
          : 'border-success/40 bg-success/5'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${
            recommendedWipeType === 'advanced' ? 'text-destructive' : 'text-success'
          }`}>
            {recommendedWipeType === 'advanced' ? 
              <AlertTriangle className="w-7 h-7" /> :
              <Shield className="w-7 h-7" />
            }
            🔥 RECOMMENDED: {recommendedWipeType === 'advanced' ? 'ADVANCED SECURE WIPE' : 'STANDARD SECURE WIPE'}
          </CardTitle>
          <CardDescription className="text-base">
            {recommendedWipeType === 'advanced' 
              ? '⚠️ CRITICAL: High-risk sensitive content detected. Advanced DoD 5220.22-M multi-pass wipe is STRONGLY RECOMMENDED for complete data destruction.'
              : '✅ Standard secure deletion is sufficient for the detected content types.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recommendation Reason */}
          <div className={`p-4 rounded-lg border-2 ${
            recommendedWipeType === 'advanced' 
              ? 'bg-destructive/10 border-destructive/30' 
              : 'bg-success/10 border-success/30'
          }`}>
            <div className="font-semibold mb-2">
              {recommendedWipeType === 'advanced' ? '🚨 Why Advanced Wipe?' : '✅ Why Standard Wipe?'}
            </div>
            <div className="text-sm space-y-1">
              {recommendedWipeType === 'advanced' ? (
                <>
                  <div>• {highRiskFiles.length} high-risk files containing sensitive data patterns</div>
                  <div>• Potential financial, medical, or personal identification data detected</div>
                  <div>• Advanced forensic recovery prevention required</div>
                  <div>• Compliance with data protection regulations</div>
                </>
              ) : (
                <>
                  <div>• {highRiskFiles.length} high-risk files detected (minimal)</div>
                  <div>• Majority of files are low to medium risk</div>
                  <div>• Standard overwrite provides adequate security</div>
                  <div>• Faster processing time</div>
                </>
              )}
            </div>
          </div>

          {/* Wipe Options Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 transition-all ${
              recommendedWipeType === 'standard' 
                ? 'bg-success/15 border-success/40 shadow-lg' 
                : 'bg-muted/30 border-muted hover:border-success/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-success" />
                <div className="font-semibold text-success">Standard Wipe</div>
                {recommendedWipeType === 'standard' && <Badge className="bg-success text-white">RECOMMENDED</Badge>}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Single-pass random overwrite</div>
                <div>• ~2-5 minutes processing</div>
                <div>• Prevents casual recovery</div>
                <div>• Suitable for general files</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-2 transition-all ${
              recommendedWipeType === 'advanced' 
                ? 'bg-destructive/15 border-destructive/40 shadow-lg' 
                : 'bg-muted/30 border-muted hover:border-destructive/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="font-semibold text-destructive">Advanced Wipe</div>
                {recommendedWipeType === 'advanced' && <Badge className="bg-destructive text-white">RECOMMENDED</Badge>}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• DoD 5220.22-M standard (3-pass)</div>
                <div>• ~10-30 minutes processing</div>
                <div>• Prevents forensic recovery</div>
                <div>• Military-grade security</div>
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
          className={`flex-1 text-lg py-6 ${
            recommendedWipeType === 'advanced' 
              ? 'bg-gradient-danger danger-shadow hover:shadow-elevated' 
              : 'bg-gradient-security security-shadow hover:shadow-elevated'
          }`}
          size="lg"
        >
          {recommendedWipeType === 'advanced' ? '🔥 START ADVANCED WIPE' : '✅ START STANDARD WIPE'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};