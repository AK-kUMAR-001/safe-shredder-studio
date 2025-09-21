import { useState } from 'react';
import { Shield, FileSearch, Trash2, Settings, AlertTriangle, CheckCircle, Upload, Folder, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { FileSelector } from '@/components/FileSelector';
import { ScanResults } from '@/components/ScanResults';
import { WipeProgress } from '@/components/WipeProgress';
import { SettingsPanel } from '@/components/SettingsPanel';

interface SelectedFile {
  name: string;
  size: number;
  path: string;
  type: 'file' | 'folder';
  riskLevel: 'low' | 'medium' | 'high';
}

const Index = () => {
  const [step, setStep] = useState<'select' | 'scan' | 'review' | 'wipe' | 'complete'>('select');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recommendedWipeType, setRecommendedWipeType] = useState<'standard' | 'advanced'>('standard');

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    
    const mockFiles: SelectedFile[] = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      path: file.name,
      type: 'file' as const,
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));
    
    setSelectedFiles(mockFiles);
    toast({
      title: "Files Selected",
      description: `${files.length} file(s) selected for analysis`,
    });
  };

  const handleScan = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setStep('scan');
    
    // Simulate scanning progress
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          setStep('review');
          
          // Determine recommendation based on risk levels
          const hasHighRisk = selectedFiles.some(file => file.riskLevel === 'high');
          setRecommendedWipeType(hasHighRisk ? 'advanced' : 'standard');
          
          toast({
            title: "Scan Complete",
            description: `Found ${selectedFiles.filter(f => f.riskLevel === 'high').length} high-risk files`,
          });
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleWipe = async () => {
    setIsWiping(true);
    setWipeProgress(0);
    setStep('wipe');
    
    // Simulate wiping progress
    const wipeInterval = setInterval(() => {
      setWipeProgress(prev => {
        if (prev >= 100) {
          clearInterval(wipeInterval);
          setIsWiping(false);
          setStep('complete');
          
          toast({
            title: "Wipe Complete",
            description: `Successfully wiped ${selectedFiles.length} file(s)`,
            variant: "default",
          });
          return 100;
        }
        return prev + 1.5;
      });
    }, 80);
  };

  const resetApp = () => {
    setStep('select');
    setSelectedFiles([]);
    setScanProgress(0);
    setWipeProgress(0);
    setIsScanning(false);
    setIsWiping(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card security-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-security flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Secure Data Wipe Portal</h1>
              <p className="text-sm text-muted-foreground">Professional file sanitization tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { id: 'select', icon: Upload, label: 'Select Files' },
              { id: 'scan', icon: Scan, label: 'Scan & Analyze' },
              { id: 'review', icon: FileSearch, label: 'Review Results' },
              { id: 'wipe', icon: Trash2, label: 'Secure Wipe' },
            ].map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === stepItem.id || (step === 'complete' && stepItem.id === 'wipe')
                    ? 'bg-gradient-security text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">{stepItem.label}</span>
                {index < 3 && <div className="w-12 h-0.5 bg-border mx-4 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'select' && (
          <div className="max-w-2xl mx-auto">
            <Card className="security-shadow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-primary" />
                  Select Files or Folders
                </CardTitle>
                <CardDescription>
                  Choose the files and folders you want to securely analyze and wipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileSelector 
                  onFileSelection={handleFileSelection}
                  selectedFiles={selectedFiles}
                />
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>{selectedFiles.length} files selected.</strong> 
                        These files will be permanently deleted after the wipe operation.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleScan}
                      className="w-full bg-gradient-security security-shadow"
                      size="lg"
                    >
                      <FileSearch className="w-5 h-5 mr-2" />
                      Start Security Scan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'scan' && (
          <div className="max-w-2xl mx-auto">
            <Card className="security-shadow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Scan className="w-6 h-6 text-primary animate-spin" />
                  Scanning for Sensitive Content
                </CardTitle>
                <CardDescription>
                  Analyzing {selectedFiles.length} files for potential security risks...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scan Progress</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{selectedFiles.length}</div>
                    <div className="text-sm text-muted-foreground">Files Scanned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">{selectedFiles.filter(f => f.riskLevel === 'medium').length}</div>
                    <div className="text-sm text-muted-foreground">Medium Risk</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{selectedFiles.filter(f => f.riskLevel === 'high').length}</div>
                    <div className="text-sm text-muted-foreground">High Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'review' && (
          <ScanResults 
            files={selectedFiles}
            recommendedWipeType={recommendedWipeType}
            onProceed={handleWipe}
            onBack={() => setStep('select')}
          />
        )}

        {step === 'wipe' && (
          <WipeProgress 
            files={selectedFiles}
            progress={wipeProgress}
            wipeType={recommendedWipeType}
          />
        )}

        {step === 'complete' && (
          <div className="max-w-2xl mx-auto">
            <Card className="security-shadow border-success/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="w-8 h-8" />
                  Wipe Operation Complete
                </CardTitle>
                <CardDescription>
                  All selected files have been securely wiped from your system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-success/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success mb-2">
                    {selectedFiles.length} Files Wiped
                  </div>
                  <div className="text-sm text-success/80">
                    Using {recommendedWipeType === 'advanced' ? 'Advanced' : 'Standard'} Wipe Method
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">High Risk Files:</div>
                    <div className="text-muted-foreground">{selectedFiles.filter(f => f.riskLevel === 'high').length} files</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Size:</div>
                    <div className="text-muted-foreground">{(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                
                <Button 
                  onClick={resetApp}
                  className="w-full"
                  size="lg"
                >
                  Start New Wipe Session
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel 
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Index;