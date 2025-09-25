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
import { SecurityCaptcha } from '@/components/SecurityCaptcha';
import { fileAPI, type ScanResult, type WipeResult } from '@/lib/supabase';

const Index = () => {
  const [step, setStep] = useState<'captcha' | 'select' | 'scan' | 'review' | 'wipe' | 'complete'>('captcha');
  const [selectedFiles, setSelectedFiles] = useState<ScanResult[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recommendedWipeType, setRecommendedWipeType] = useState<'standard' | 'advanced'>('standard');
  const [wipeResults, setWipeResults] = useState<WipeResult[]>([]);

  const handleFileSelection = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setRawFiles(Array.from(files));
    
    try {
      // Upload files to Supabase
      const uploadResult = await fileAPI.uploadFiles(Array.from(files));
      setSessionId(uploadResult.sessionId);
      
      // Convert to display format
      const displayFiles = uploadResult.files.map(file => ({
        ...file,
        riskLevel: 'low' as const // Will be determined during scan
      }));
      
      setSelectedFiles(displayFiles);
      
      toast({
        title: "Files Uploaded",
        description: `${files.length} file(s) uploaded and ready for analysis`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleScan = async () => {
    if (!sessionId || selectedFiles.length === 0) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setStep('scan');
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Perform actual scan
      const scanResult = await fileAPI.scanFiles(sessionId);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      // Update files with scan results
      setSelectedFiles(scanResult.files);
      setRecommendedWipeType(scanResult.recommendedWipeType);
      
      setTimeout(() => {
        setIsScanning(false);
        setStep('review');
        
        toast({
          title: "Scan Complete",
          description: `Found ${scanResult.summary.high} high-risk files, ${scanResult.summary.medium} medium-risk files`,
        });
      }, 500);
      
    } catch (error) {
      setIsScanning(false);
      setScanProgress(0);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan files",
        variant: "destructive"
      });
      setStep('select');
    }
  };

  const handleWipe = async () => {
    if (!sessionId) return;
    
    setIsWiping(true);
    setWipeProgress(0);
    setStep('wipe');
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setWipeProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      // Perform actual wipe
      const wipeResult = await fileAPI.wipeFiles(sessionId, recommendedWipeType);
      
      clearInterval(progressInterval);
      setWipeProgress(100);
      setWipeResults(wipeResult.results);
      
      setTimeout(() => {
        setIsWiping(false);
        setStep('complete');
        
        toast({
          title: "Wipe Complete",
          description: `Successfully wiped ${wipeResult.summary.successful}/${wipeResult.summary.total} file(s)`,
          variant: wipeResult.summary.failed > 0 ? "destructive" : "default",
        });
      }, 500);
      
    } catch (error) {
      setIsWiping(false);
      setWipeProgress(0);
      toast({
        title: "Wipe Failed", 
        description: error instanceof Error ? error.message : "Failed to wipe files",
        variant: "destructive"
      });
      setStep('review');
    }
  };

  const resetApp = () => {
    setStep('captcha');
    setSelectedFiles([]);
    setRawFiles([]);
    setSessionId('');
    setScanProgress(0);
    setWipeProgress(0);
    setIsScanning(false);
    setIsWiping(false);
    setIsUploading(false);
    setWipeResults([]);
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
        {step !== 'captcha' && (
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
        )}

        {/* Step Content */}
        {step === 'captcha' && (
          <div className="max-w-md mx-auto">
            <SecurityCaptcha onVerified={() => setStep('select')} />
          </div>
        )}

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
                  isUploading={isUploading}
                />
                
                {selectedFiles.length > 0 && !isUploading && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>{selectedFiles.length} files uploaded.</strong> 
                        These files will be permanently deleted after the wipe operation.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleScan}
                      className="w-full bg-gradient-security security-shadow"
                      size="lg"
                      disabled={isScanning}
                    >
                      <FileSearch className="w-5 h-5 mr-2" />
                      {isScanning ? 'Scanning...' : 'Start Security Scan'}
                    </Button>
                  </div>
                )}

                {isUploading && (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground">Uploading files...</div>
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
                  Files have been securely wiped from cloud storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-success/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success mb-2">
                    {wipeResults.filter(r => r.status === 'success').length}/{wipeResults.length} Files Wiped
                  </div>
                  <div className="text-sm text-success/80">
                    Using {recommendedWipeType === 'advanced' ? 'Advanced' : 'Standard'} Wipe Method
                  </div>
                </div>
                
                {wipeResults.some(r => r.status === 'failed') && (
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <div className="font-medium text-destructive mb-2">Failed Operations:</div>
                    {wipeResults.filter(r => r.status === 'failed').map((result, index) => (
                      <div key={index} className="text-sm text-destructive/80">
                        {result.name}: {result.message}
                      </div>
                    ))}
                  </div>
                )}
                
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