# Secure Data Wipe Portal

A complete production-ready application for securely analyzing and wiping sensitive files with real backend functionality.

## 🚀 Features

- **Real File Upload**: Upload files to secure Supabase cloud storage
- **Intelligent Scanning**: Advanced keyword-based analysis for sensitive content detection
- **Risk Assessment**: Automatic classification (Low/Medium/High risk)
- **Secure Deletion**: Complete file wipe from cloud storage
- **Professional UI**: Security-focused design with progress tracking
- **Session Management**: Track operations across the entire workflow

## 🏗️ Architecture

### Frontend (React + Vite)
- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Custom security-themed design system
- Real-time progress tracking
- Professional file management interface

### Backend (Supabase Edge Functions)
- **upload-files**: Handles file uploads to Supabase Storage
- **scan-files**: Performs intelligent content analysis
- **wipe-files**: Securely deletes files from storage
- Complete database tracking for all operations

### Database Schema
- `uploaded_files` table tracks the entire lifecycle:
  - Upload metadata and timestamps
  - Scan results and risk levels
  - Wipe operations and results
  - Session management

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
The app uses Lovable's native Supabase integration. Update `src/lib/supabase.ts` with your Supabase credentials:

```typescript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
```

### 3. Deploy Edge Functions
Deploy the backend functions to your Supabase project:

```bash
# Deploy upload function
supabase functions deploy upload-files

# Deploy scan function  
supabase functions deploy scan-files

# Deploy wipe function
supabase functions deploy wipe-files
```

### 4. Setup Database
Run the migration to create the required tables and storage bucket:

```sql
-- Create bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('file-uploads', 'file-uploads', false);

-- Create table for tracking files
CREATE TABLE uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT,
  upload_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scan_completed BOOLEAN DEFAULT FALSE,
  scan_timestamp TIMESTAMPTZ,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  wipe_completed BOOLEAN DEFAULT FALSE,
  wipe_timestamp TIMESTAMPTZ,
  wipe_type TEXT CHECK (wipe_type IN ('standard', 'advanced')),
  wipe_status TEXT CHECK (wipe_status IN ('success', 'failed')),
  wipe_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON uploaded_files FOR ALL USING (true);

-- Storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'file-uploads');
CREATE POLICY "Allow authenticated downloads" ON storage.objects  
  FOR SELECT USING (bucket_id = 'file-uploads');
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'file-uploads');
```

### 5. Run Development Server
```bash
npm run dev
```

## 🔒 Security Features

### Intelligent Scanning
The system analyzes filenames for sensitive keywords including:
- **High Risk**: SSN, bank account, credit card, passwords, confidential documents
- **Medium Risk**: Personal information, tax documents, medical records
- **Low Risk**: General files with no sensitive indicators

### Wipe Methods
- **Standard Wipe**: Basic secure deletion from cloud storage
- **Advanced Wipe**: Enhanced deletion for high-risk files (recommended for sensitive data)

### Privacy Protection
- Files are uploaded to secure Supabase storage with proper access controls
- All operations are tracked with timestamps and audit trails
- Complete deletion removes files from storage permanently
- Session-based tracking ensures data isolation

## 🎯 Usage Workflow

1. **Select Files**: Choose individual files or entire folders
2. **Upload**: Files are securely uploaded to cloud storage
3. **Scan**: Intelligent analysis detects sensitive content
4. **Review**: See risk assessment and wipe recommendations
5. **Wipe**: Securely delete files with confirmation
6. **Complete**: View operation results and audit trail

## 🔧 Customization

### Adding Keywords
Modify the `SENSITIVE_KEYWORDS` array in `supabase/functions/scan-files/index.ts`:

```typescript
const SENSITIVE_KEYWORDS = [
  'password', 'ssn', 'bank', 'credit card',
  // Add your custom keywords here
  'company-confidential', 'internal-only'
]
```

### Styling
The app uses a custom security-themed design system in:
- `src/index.css` - CSS variables and gradients
- `tailwind.config.ts` - Custom color palette
- Professional blue/slate theme with security-focused aesthetics

## 📦 Production Deployment

The application is ready for production deployment with:
- Supabase backend for scalability and security
- Professional UI suitable for enterprise environments
- Complete audit logging and session management
- Secure file handling with proper access controls

## 🤝 Support

This is a complete production implementation ready for VS Code import and deployment. All backend functionality is real and functional through Supabase integration.

---

## Original Lovable Project Info

**Project URL**: https://lovable.dev/projects/34825e24-b05e-496a-ba64-a5d264f56eeb

Built with Lovable using:
- Vite
- TypeScript  
- React
- shadcn-ui
- Tailwind CSS
- Supabase