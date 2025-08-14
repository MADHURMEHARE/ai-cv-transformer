'use client'

import { useState, useEffect } from 'react'
import { CV, CVTransformedData } from '@/types/cv'
import FileUpload from '@/components/FileUpload'
import CVPreview from '@/components/CVPreview'
import CVEditor from '@/components/CVEditor'
import { Upload, FileText, Download, Edit3, Eye, Trash2, CheckCircle, AlertCircle, Clock, Sparkles, Zap, Star, Users, Award, ArrowRight, FileDown } from 'lucide-react'

export default function Home() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchCVs()
  }, [])

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/cv')
      if (response.ok) {
        const data = await response.json()
        setCvs(data)
      }
    } catch (error) {
      console.error('Failed to fetch CVs:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('cv', file)

    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newCV = await response.json()
        setCvs(prev => [newCV, ...prev])
        setSelectedCV(newCV)
        console.log('CV uploaded successfully:', newCV)
      } else {
        const error = await response.json()
        console.error('Upload failed:', error)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCVUpdate = async (updatedData: CVTransformedData) => {
    if (!selectedCV) return

    try {
      const response = await fetch(`/api/cv/${selectedCV._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transformedData: updatedData }),
      })

      if (response.ok) {
        const updatedCV = await response.json()
        setCvs(prev => prev.map(cv => cv._id === updatedCV._id ? updatedCV : cv))
        setSelectedCV(updatedCV)
        console.log('CV updated successfully')
      }
    } catch (error) {
      console.error('Failed to update CV:', error)
    }
  }

  const handleCVDelete = async (cvId: string) => {
    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCvs(prev => prev.filter(cv => cv._id !== cvId))
        if (selectedCV?._id === cvId) {
          setSelectedCV(null)
        }
        console.log('CV deleted successfully')
      }
    } catch (error) {
      console.error('Failed to delete CV:', error)
    }
  }

  const downloadEHSFormattedCV = async (cv: CV) => {
    if (!cv.transformedData) {
      console.error('No transformed data available')
      return
    }

    try {
      const response = await fetch('/api/cv/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvId: cv._id,
          format: 'pdf',
          ehsStandards: true
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${cv.transformedData.header.name || 'CV'} (EHS Formatted).pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Upload className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed'
      case 'processing':
        return 'status-processing'
      case 'error':
        return 'status-error'
      default:
        return 'status-uploaded'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">AI CV Transformer</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform raw, unstructured CVs into polished, professional documents using advanced AI technology. 
            Follows EHS formatting standards with Palatino Linotype font and professional layout.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-blue-100">
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              <span>AI-Powered Processing</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span>EHS Standards</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>Professional Format</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              <span>Executive Quality</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & CV List */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload Card */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-blue-500 to-purple-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Upload className="w-6 h-6 mr-3" /> Upload CV
                </h2>
              </div>
              <div className="card-content">
                <FileUpload 
                  onFileUpload={handleFileUpload} 
                  isProcessing={isProcessing} 
                  acceptedTypes={['.pdf', '.docx', '.xlsx', '.xls']} 
                />
              </div>
            </div>

            {/* CV List Card */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-emerald-500 to-teal-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-3" /> Your CVs
                </h2>
              </div>
              <div className="card-content">
                {cvs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No CVs uploaded yet</p>
                    <p className="text-sm">Upload your first CV to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cvs.map((cv) => (
                      <div
                        key={cv._id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedCV?._id === cv._id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCV(cv)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {cv.originalName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(cv.status)}
                            <span className={`status-badge ${getStatusColor(cv.status)}`}>
                              {cv.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{new Date(cv.uploadedAt).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCV(cv)
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View CV"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {cv.status === 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadEHSFormattedCV(cv)
                                }}
                                className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                                title="Download EHS Formatted CV"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCVDelete(cv._id)
                              }}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Delete CV"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - CV Preview & Editor */}
          <div className="lg:col-span-2">
            {selectedCV ? (
              <div className="space-y-6">
                {/* CV Header Card */}
                <div className="card">
                  <div className="card-header bg-gradient-to-r from-gray-600 to-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="w-6 h-6 mr-3" />
                        {selectedCV.originalName}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className={`status-badge ${getStatusColor(selectedCV.status)}`}>
                          {getStatusIcon(selectedCV.status)}
                          <span className="ml-2">{selectedCV.status}</span>
                        </span>
                        {selectedCV.status === 'completed' && (
                          <button
                            onClick={() => downloadEHSFormattedCV(selectedCV)}
                            className="btn-success px-4 py-2 text-sm flex items-center"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Download EHS CV
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <span className="ml-2 text-gray-800">
                          {new Date(selectedCV.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedCV.processedAt && (
                        <div>
                          <span className="font-medium text-gray-600">Processed:</span>
                          <span className="ml-2 text-gray-800">
                            {new Date(selectedCV.processedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedCV.processingDuration && (
                        <div>
                          <span className="font-medium text-gray-600">Processing Time:</span>
                          <span className="ml-2 text-gray-800">
                            {Math.round(selectedCV.processingDuration / 1000)}s
                          </span>
                        </div>
                      )}
                      {selectedCV.aiProcessingDetails && (
                        <div>
                          <span className="font-medium text-gray-600">AI Model:</span>
                          <span className="ml-2 text-gray-800">
                            {selectedCV.aiProcessingDetails.modelUsed}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CV Content */}
                {selectedCV.status === 'completed' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Preview Card */}
                    <div className="card">
                      <div className="card-header bg-gradient-to-r from-blue-500 to-indigo-600">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <Eye className="w-5 h-5 mr-2" /> EHS Formatted Preview
                        </h3>
                      </div>
                      <div className="card-content">
                        <CVPreview cv={selectedCV} />
                      </div>
                    </div>

                    {/* Editor Card */}
                    <div className="card">
                      <div className="card-header bg-gradient-to-r from-emerald-500 to-teal-600">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <Edit3 className="w-5 h-5 mr-2" /> Edit CV Content
                        </h3>
                      </div>
                      <div className="card-content">
                        <CVEditor cv={selectedCV} onUpdate={handleCVUpdate} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-content">
                      {selectedCV.status === 'processing' && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Your CV...</h3>
                          <p className="text-gray-600 mb-4">Our AI is analyzing and transforming your document</p>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                        </div>
                      )}

                      {selectedCV.status === 'error' && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Failed</h3>
                          <p className="text-gray-600 mb-4">There was an error processing your CV</p>
                          {selectedCV.errors && selectedCV.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                              <p className="font-medium text-red-800 mb-2">Error Details:</p>
                              <ul className="text-sm text-red-700 space-y-1">
                                {selectedCV.errors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => window.location.reload()}
                            className="btn-primary mt-4"
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {selectedCV.status === 'uploaded' && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-8 h-8 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">CV Uploaded Successfully</h3>
                          <p className="text-gray-600">Your CV is queued for AI processing</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div className="card-content text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No CV Selected</h3>
                  <p className="text-gray-600 mb-6">Select a CV from the list to view and edit</p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    <span>Upload a CV to get started</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}