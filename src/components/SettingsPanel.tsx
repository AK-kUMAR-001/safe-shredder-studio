import { useState } from 'react';
import { Settings, X, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const [sensitiveKeywords, setSensitiveKeywords] = useState([
    'password', 'bank', 'aadhar', 'ssn', 'credit', 'passport', 
    'social', 'confidential', 'secret', 'private'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [advancedSettings, setAdvancedSettings] = useState({
    enableAutoScan: true,
    showDetailedLogs: false,
    confirmBeforeWipe: true,
    enableQuarantineMode: false
  });

  const addKeyword = () => {
    if (newKeyword.trim() && !sensitiveKeywords.includes(newKeyword.toLowerCase().trim())) {
      setSensitiveKeywords([...sensitiveKeywords, newKeyword.toLowerCase().trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSensitiveKeywords(sensitiveKeywords.filter(k => k !== keyword));
  };

  const resetToDefaults = () => {
    setSensitiveKeywords([
      'password', 'bank', 'aadhar', 'ssn', 'credit', 'passport', 
      'social', 'confidential', 'secret', 'private'
    ]);
    setAdvancedSettings({
      enableAutoScan: true,
      showDetailedLogs: false,
      confirmBeforeWipe: true,
      enableQuarantineMode: false
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Security Settings
          </SheetTitle>
          <SheetDescription>
            Configure sensitive keyword detection and wipe behavior
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Sensitive Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sensitive Keywords
              </CardTitle>
              <CardDescription>
                Files containing these keywords in their names will be flagged as high-risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {sensitiveKeywords.map((keyword, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {sensitiveKeywords.length} keywords configured
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Options</CardTitle>
              <CardDescription>
                Configure advanced scanning and wipe behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-scan">Auto-scan on selection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically scan files when they are selected
                  </p>
                </div>
                <Switch
                  id="auto-scan"
                  checked={advancedSettings.enableAutoScan}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, enableAutoScan: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="detailed-logs">Detailed operation logs</Label>
                  <p className="text-sm text-muted-foreground">
                    Show detailed logs during wipe operations
                  </p>
                </div>
                <Switch
                  id="detailed-logs"
                  checked={advancedSettings.showDetailedLogs}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, showDetailedLogs: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="confirm-wipe">Confirm before wipe</Label>
                  <p className="text-sm text-muted-foreground">
                    Require explicit confirmation before starting wipe
                  </p>
                </div>
                <Switch
                  id="confirm-wipe"
                  checked={advancedSettings.confirmBeforeWipe}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, confirmBeforeWipe: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quarantine-mode">Quarantine mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Move files to quarantine instead of immediate deletion
                  </p>
                </div>
                <Switch
                  id="quarantine-mode"
                  checked={advancedSettings.enableQuarantineMode}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, enableQuarantineMode: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning mb-1">Security Notice</p>
                  <p className="text-muted-foreground">
                    This application requires elevated permissions to access and delete files. 
                    Never run this tool on untrusted files or in unsecured environments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={resetToDefaults} className="flex-1">
              Reset Defaults
            </Button>
            <Button onClick={onClose} className="flex-1">
              Apply Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};