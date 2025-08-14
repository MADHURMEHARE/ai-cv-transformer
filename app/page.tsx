'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Download, Edit3, Eye, Trash2, CheckCircle, AlertCircle, Clock, Sparkles, Zap, Star, Users, Award, ArrowRight } from 'lucide-react'
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
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-12 lg:py-16">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="p-3 bg-white/20 rounded-full mr-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                  AI CV Transformer
                </h1>
              </div>
              <p className="text-xl text-blue-100 max-w-2xl">
                Transform raw CVs into polished, professional documents using cutting-edge AI technology
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                <div className="flex items-center text-blue-100">
                  <Zap className="w-5 h-5 mr-2" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <Star className="w-5 h-5 mr-2" />
                  <span>Professional</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <Users className="w-5 h-5 mr-2" />
                  <span>EHS Standards</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-200 mb-2">Session ID</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <span className="text-white font-mono text-sm">{sessionId.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & CV List */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Upload className="w-6 h-6 mr-3" />
                  Upload CV
                </h2>
              </div>
              <div className="p-6">
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                  acceptedTypes={['.pdf', '.docx', '.xlsx', '.xls']}
                />
              </div>
            </div>

            {/* CV List Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-3" />
                  Your CVs
                </h2>
              </div>
              <div className="p-6">
                {cvs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No CVs Yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first CV to get started</p>
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Now
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cvs.map((cv) => (
                      <div
                        key={cv._id}
                        className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedCV?._id === cv._id
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                        onClick={() => handleCVSelect(cv)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {cv.originalFileName}
                            </p>
                            <div className="flex items-center mt-2">
                              {getStatusIcon(cv.status)}
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(cv.status)}`}>
                                {cv.status}
                              </span>
                            </div>
                            {cv.transformedData?.header?.name && (
                              <p className="text-sm text-gray-600 mt-1">
                                {cv.transformedData.header.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {cv.status === 'completed' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleExport(cv._id, 'pdf')
                                  }}
                                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                                  title="Export PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedCV(cv)
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        {selectedCV.transformedData?.header?.name || selectedCV.originalFileName}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedCV(null)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </button>
                        {selectedCV.status === 'completed' && (
                          <button
                            onClick={() => handleExport(selectedCV._id, 'pdf')}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 mb-1">Status</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(selectedCV.status)}`}>
                          {selectedCV.status}
                        </span>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 mb-1">File Type</div>
                        <span className="font-medium text-gray-800">{selectedCV.originalFileType.toUpperCase()}</span>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 mb-1">Uploaded</div>
                        <span className="font-medium text-gray-800">
                          {new Date(selectedCV.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedCV.processedAt && (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-gray-500 mb-1">Processed</div>
                          <span className="font-medium text-gray-800">
                            {new Date(selectedCV.processedAt).toLocaleDateString()}
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
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <Eye className="w-5 h-5 mr-2" />
                          Preview
                        </h3>
                      </div>
                      <div className="p-6">
                        <CVPreview cv={selectedCV} />
                      </div>
                    </div>
                    
                    {/* Editor Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <Edit3 className="w-5 h-5 mr-2" />
                          Edit
                        </h3>
                      </div>
                      <div className="p-6">
                        <CVEditor 
                          cv={selectedCV}
                          onUpdate={handleCVUpdate}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="text-center py-16">
                      {selectedCV.status === 'processing' ? (
                        <>
                          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">Processing CV...</h3>
                          <p className="text-gray-600 text-lg">Our AI is transforming your CV into a professional format</p>
                          <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium">
                            <Clock className="w-5 h-5 mr-2" />
                            Please wait...
                          </div>
                        </>
                      ) : selectedCV.status === 'error' ? (
                        <>
                          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-red-800 mb-3">Processing Failed</h3>
                          <p className="text-red-600 text-lg mb-6">There was an error processing your CV</p>
                          <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200">
                            Try Again
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-12 h-12 text-blue-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-blue-800 mb-3">Upload Complete</h3>
                          <p className="text-blue-600 text-lg">Your CV is queued for AI processing</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No CV Selected</h3>
                  <p className="text-gray-600 text-lg mb-6">Select a CV from the list to view and edit it</p>
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Choose a CV
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}