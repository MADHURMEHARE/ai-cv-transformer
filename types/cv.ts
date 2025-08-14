export interface CV {
  _id: string;
  originalName: string;
  originalFileType: string;
  filePath: string;
  extractedText?: string;
  transformedData?: CVTransformedData;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  aiProcessingDetails?: AIProcessingDetails;
  uploadedAt: string;
  processedAt?: string;
  processingDuration?: number;
  errors?: string[];
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
  errors?: string[];
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
  onUpdate: (updatedData: CVTransformedData) => void;
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