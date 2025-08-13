export interface CV {
  _id: string;
  originalFileName: string;
  originalFileType: string;
  originalFilePath: string;
  extractedText: string;
  transformedData: CVTransformedData;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  aiProcessingDetails: AIProcessingDetails;
  exportedFiles: ExportedFile[];
  uploadedAt: string;
  processedAt?: string;
  lastModified: string;
  sessionId: string;
  fileSize: number;
  processingDuration?: number;
}

export interface CVTransformedData {
  header: CVHeader;
  personalDetails: PersonalDetails;
  profile: string;
  experience: Experience[];
  education: Education[];
  keySkills: string[];
  interests: string[];
}

export interface CVHeader {
  name: string;
  jobTitle: string;
  photoUrl: string;
}

export interface PersonalDetails {
  nationality: string;
  languages: string[];
  dateOfBirth: string;
  maritalStatus: string;
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  responsibilities: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface AIProcessingDetails {
  modelUsed: string;
  processingTime: number;
  confidence: number;
  errors: string[];
}

export interface ExportedFile {
  format: string;
  filePath: string;
  exportedAt: string;
}

export interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  acceptedTypes: string[];
}

export interface CVPreviewProps {
  cv: CV;
}

export interface CVEditorProps {
  cv: CV;
  onUpdate: (updatedData: Partial<CVTransformedData>) => void;
}

export interface AIStatus {
  openai: {
    available: boolean;
    models: string[];
    capabilities: string[];
  };
  anthropic: {
    available: boolean;
    models: string[];
    capabilities: string[];
  };
  google: {
    available: boolean;
    models: string[];
    capabilities: string[];
  };
  activeModels: string[];
}