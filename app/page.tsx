'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Download, Edit3, Eye, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import CVPreview from '@/components/CVPreview'
import CVEditor from '@/components/CVEditor'
import { CV } from '@/types/cv'

export default function Home() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      const response = await fetch(`/api/cv/session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setCvs(data)
      }
    } catch (error) {
      console.error('Failed to load CVs:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('cv', file)
      formData.append('sessionId', sessionId)

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('File uploaded successfully! Processing started.')
        
        // Poll for status updates
        pollCVStatus(data.cvId)
      } else {
        const error = await response.json()
        console.error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Upload failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const pollCVStatus = async (cvId: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/cv/${cvId}`)
        if (response.ok) {
          const cv = await response.json()
          
          // Update CVs list
          setCvs(prev => prev.map(c => c._id === cvId ? cv : c))
          
          if (cv.status === 'completed') {
            console.log('CV processing completed!')
            return
          } else if (cv.status === 'error') {
            console.error('CV processing failed')
            return
          }
          
          // Continue polling if still processing
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 10000) // Poll every 10 seconds
          } else {
            console.error('Processing timeout. Please check the CV status.')
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 10000)
        }
      }
    }

    poll()
  }

  const handleCVSelect = (cv: CV) => {
    setSelectedCV(cv)
  }

  const handleCVUpdate = async (updatedData: Partial<CV['transformedData']>) => {
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
        setSelectedCV(updatedCV.cv)
        setCvs(prev => prev.map(c => c._id === selectedCV._id ? updatedCV.cv : c))
        console.log('CV updated successfully!')
      } else {
        console.error('Failed to update CV')
      }
    } catch (error) {
      console.error('Update error:', error)
      console.error('Failed to update CV')
    }
  }

  const handleCVDelete = async (cvId: string) => {
    if (!confirm('Are you sure you want to delete this CV?')) return

    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCvs(prev => prev.filter(c => c._id !== cvId))
        if (selectedCV?._id === cvId) {
          setSelectedCV(null)
        }
        console.log('CV deleted successfully!')
      } else {
        console.error('Failed to delete CV')
      }
    } catch (error) {
      console.error('Delete error:', error)
      console.error('Failed to delete CV')
    }
  }

  const handleExport = async (cvId: string, format: string) => {
    try {
      const response = await fetch(`/api/cv/${cvId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      })

      if (response.ok) {
        const data = await response.json()
        // Trigger download
        window.open(data.downloadUrl, '_blank')
        console.log('Export generated successfully!')
      } else {
        console.error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      console.error('Export failed')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusClass = (status: string) => {
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
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-700">AI CV Transformer</h1>
              <p className="text-secondary-600 mt-1">Transform raw CVs into professional documents</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-secondary-500">
                Session: {sessionId.slice(-8)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & CV List */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="card">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Upload CV</h2>
              <FileUpload 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
                acceptedTypes={['.pdf', '.docx', '.xlsx', '.xls']}
              />
            </div>

            {/* CV List */}
            <div className="card">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Your CVs</h2>
              {cvs.length === 0 ? (
                <div className="text-center py-8 text-secondary-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                  <p>No CVs uploaded yet</p>
                  <p className="text-sm">Upload a CV to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div
                      key={cv._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCV?._id === cv._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                      onClick={() => handleCVSelect(cv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-secondary-900 truncate">
                            {cv.originalFileName}
                          </p>
                          <div className="flex items-center mt-1">
                            {getStatusIcon(cv.status)}
                            <span className={`ml-2 status-badge ${getStatusClass(cv.status)}`}>
                              {cv.status}
                            </span>
                          </div>
                          {cv.transformedData?.header?.name && (
                            <p className="text-sm text-secondary-600 mt-1">
                              {cv.transformedData.header.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          {cv.status === 'completed' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleExport(cv._id, 'pdf')
                                }}
                                className="p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                                title="Export PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCV(cv)
                                }}
                                className="p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                                title="Edit CV"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCVDelete(cv._id)
                            }}
                            className="p-1 text-secondary-500 hover:text-red-600 transition-colors"
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

          {/* Right Column - CV Preview & Editor */}
          <div className="lg:col-span-2">
            {selectedCV ? (
              <div className="space-y-6">
                {/* CV Header */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-secondary-800">
                      {selectedCV.transformedData?.header?.name || selectedCV.originalFileName}
                    </h2>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedCV(null)}
                        className="btn-outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                      {selectedCV.status === 'completed' && (
                        <button
                          onClick={() => handleExport(selectedCV._id, 'pdf')}
                          className="btn-primary"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-secondary-700">Status:</span>
                      <span className={`ml-2 status-badge ${getStatusClass(selectedCV.status)}`}>
                        {selectedCV.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-700">File Type:</span>
                      <span className="ml-2 text-secondary-600">{selectedCV.originalFileType.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-700">Uploaded:</span>
                      <span className="ml-2 text-secondary-600">
                        {new Date(selectedCV.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedCV.processedAt && (
                      <div>
                        <span className="font-medium text-secondary-700">Processed:</span>
                        <span className="ml-2 text-secondary-600">
                          {new Date(selectedCV.processedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CV Content */}
                {selectedCV.status === 'completed' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-secondary-800 mb-4">Preview</h3>
                      <CVPreview cv={selectedCV} />
                    </div>
                    
                    {/* Editor */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-secondary-800 mb-4">Edit</h3>
                      <CVEditor 
                        cv={selectedCV}
                        onUpdate={handleCVUpdate}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="text-center py-12">
                      {selectedCV.status === 'processing' ? (
                        <>
                          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                          <h3 className="text-lg font-medium text-secondary-800 mb-2">Processing CV...</h3>
                          <p className="text-secondary-600">This may take a few minutes. Please wait.</p>
                        </>
                      ) : selectedCV.status === 'error' ? (
                        <>
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                          <h3 className="text-lg font-medium text-red-800 mb-2">Processing Failed</h3>
                          <p className="text-red-600">There was an error processing your CV.</p>
                        </>
                      ) : (
                        <>
                          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                          <h3 className="text-lg font-medium text-blue-800 mb-2">Upload Complete</h3>
                          <p className="text-blue-600">Your CV is queued for processing.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
                  <h3 className="text-xl font-medium text-secondary-800 mb-2">No CV Selected</h3>
                  <p className="text-secondary-600">Select a CV from the list to view and edit it.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}