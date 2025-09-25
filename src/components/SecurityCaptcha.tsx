import { useState, useEffect } from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityCaptchaProps {
  onVerified: () => void;
  className?: string;
}

export const SecurityCaptcha = ({ onVerified, className = '' }: SecurityCaptchaProps) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    if (userInput.toUpperCase() === captchaText) {
      setIsVerified(true);
      setError('');
      setTimeout(() => {
        onVerified();
      }, 1000);
    } else {
      setAttempts(prev => prev + 1);
      setError('Incorrect captcha. Please try again.');
      generateCaptcha();
      
      if (attempts >= 2) {
        setError('Multiple failed attempts. Please wait a moment before trying again.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 3000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.length === 6) {
      handleVerify();
    }
  };

  if (isVerified) {
    return (
      <Card className={`security-shadow border-success/40 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-success mb-2">
            <Shield className="w-6 h-6" />
            <span className="font-semibold">Security Verification Complete</span>
          </div>
          <p className="text-sm text-muted-foreground">Access granted. Redirecting...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`security-shadow ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Security Verification
        </CardTitle>
        <CardDescription>
          Please complete the security check to access the file wipe portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Captcha Display */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div 
              className="bg-gradient-security text-white p-4 rounded-lg font-mono text-2xl tracking-widest select-none"
              style={{ 
                background: 'linear-gradient(45deg, hsl(218 54% 20%), hsl(217 91% 60%))',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                transform: 'skew(-2deg)',
                letterSpacing: '0.3em'
              }}
            >
              {captchaText}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateCaptcha}
            disabled={attempts >= 3}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Code
          </Button>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter the code above"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="text-center text-lg tracking-widest font-mono"
            disabled={attempts >= 3}
          />
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-character code shown above
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertDescription className="text-destructive text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={userInput.length !== 6 || attempts >= 3}
          className="w-full bg-gradient-security security-shadow"
          size="lg"
        >
          <Shield className="w-4 h-4 mr-2" />
          Verify & Continue
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
          <Shield className="w-3 h-3 inline mr-1" />
          This verification ensures secure access to sensitive file operations
        </div>
      </CardContent>
    </Card>
  );
};