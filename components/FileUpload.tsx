'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle, Cloud, Sparkles } from 'lucide-react'
import { FileUploadProps } from '@/types/cv'

export default function FileUpload({ onFileUpload, isProcessing, acceptedTypes }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((error: any) => error.code === 'file-too-large')) {
        setUploadError('File is too large. Maximum size is 10MB.')
      } else if (rejection.errors.some((error: any) => error.code === 'file-invalid-type')) {
        setUploadError('Invalid file type. Please upload PDF, DOCX, or Excel files.')
      } else {
        setUploadError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedFile(file)
      
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 10MB.')
        setUploadedFile(null)
        return
      }

      // Validate file type
      const fileExtension = file.name.toLowerCase().split('.').pop()
      const validExtensions = acceptedTypes.map(type => type.replace('.', ''))
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        setUploadError('Invalid file type. Please upload PDF, DOCX, or Excel files.')
        setUploadedFile(null)
        return
      }

      // Auto-upload the file
      onFileUpload(file)
    }
  }, [onFileUpload, acceptedTypes])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadError(null)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-10 h-10 text-red-500" />
      case 'docx':
        return <FileText className="w-10 h-10 text-blue-500" />
      case 'xlsx':
      case 'xls':
        return <FileText className="w-10 h-10 text-green-500" />
      default:
        return <FileText className="w-10 h-10 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative group transition-all duration-300 ${
          isDragActive ? 'scale-105' : 'hover:scale-102'
        }`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
          }
          ${isDragReject ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative p-12 text-center">
            {isDragActive ? (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Cloud className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-700">Drop your CV here</h3>
                <p className="text-blue-600 text-lg">Release to upload and transform</p>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Processing Ready
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-12 h-12 text-blue-500 group-hover:text-purple-600 transition-colors duration-300" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Drag & drop your CV here
                  </h3>
                  <p className="text-gray-600 text-lg">
                    or click to browse files
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {acceptedTypes.map(type => (
                    <span key={type} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium text-sm shadow-md">
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Maximum file size: <span className="font-semibold">10MB</span></p>
                  <p>AI-powered transformation with EHS standards</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Upload Error</h4>
            <p className="text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                {getFileIcon(uploadedFile.name)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{uploadedFile.name}</h4>
                <p className="text-gray-600">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            
            {isProcessing ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="text-right">
                  <p className="font-medium text-emerald-800">Processing...</p>
                  <p className="text-sm text-emerald-600">AI transformation in progress</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Uploaded</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 text-lg mb-1">Processing your CV...</h4>
              <p className="text-blue-700">
                Our AI is analyzing and transforming your document into a professional format
              </p>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
          How it works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
            <p>Upload your CV in PDF, DOCX, or Excel format</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
            <p>AI analyzes and extracts content intelligently</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
            <p>Apply EHS professional formatting standards</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
            <p>Download your polished, professional CV</p>
          </div>
        </div>
      </div>
    </div>
  )
}