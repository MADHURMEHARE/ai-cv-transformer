'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
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
        return <FileText className="w-8 h-8 text-red-500" />
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />
      case 'xlsx':
      case 'xls':
        return <FileText className="w-8 h-8 text-green-500" />
      default:
        return <FileText className="w-8 h-8 text-gray-500" />
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
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
          isDragReject ? 'border-red-400 bg-red-50' : ''
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        {isDragActive ? (
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <p className="text-lg font-medium text-blue-600">Drop your CV here</p>
            <p className="text-sm text-blue-500">Release to upload</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop your CV here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              {acceptedTypes.map(type => (
                <span key={type} className="px-2 py-1 bg-gray-100 rounded">
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-4 h-4"></div>
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">Uploaded</span>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="spinner w-5 h-5"></div>
            <div>
              <p className="font-medium text-blue-800">Processing your CV...</p>
              <p className="text-sm text-blue-600">
                This may take a few minutes. Please wait.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: PDF, DOCX, XLSX, XLS</p>
        <p>• Maximum file size: 10MB</p>
        <p>• Your CV will be processed using AI to extract and format content</p>
        <p>• Processing typically takes 1-3 minutes</p>
      </div>
    </div>
  )
}