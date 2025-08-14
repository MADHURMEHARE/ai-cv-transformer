'use client'

import { CVPreviewProps } from '@/types/cv'
import { Mail, Phone, MapPin, Globe, Calendar, Heart, Award, GraduationCap, Briefcase, Star } from 'lucide-react'

export default function CVPreview({ cv }: CVPreviewProps) {
  const { transformedData } = cv

  if (!transformedData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No CV data available for preview</p>
      </div>
    )
  }

  return (
    <div className="cv-preview bg-white p-8 rounded-xl border border-gray-200 max-h-[600px] overflow-y-auto">
      {/* Header Section */}
      <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
        <h1 className="text-4xl font-bold text-blue-700 mb-3" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
          {transformedData.header.name || 'Professional Name'}
        </h1>
        <h2 className="text-2xl text-gray-700 mb-4 font-semibold" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
          {transformedData.header.jobTitle || 'Professional Title'}
        </h2>
        
        {/* Professional Photo Placeholder */}
        {transformedData.header.photoUrl && (
          <div className="w-24 h-32 mx-auto mb-4 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs text-center">Photo<br/>4.7cm</span>
          </div>
        )}
        
        {/* Contact Information */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          {transformedData.personalDetails.contactInfo.email && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-500" />
              {transformedData.personalDetails.contactInfo.email}
            </div>
          )}
          {transformedData.personalDetails.contactInfo.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-blue-500" />
              {transformedData.personalDetails.contactInfo.phone}
            </div>
          )}
          {transformedData.personalDetails.contactInfo.address && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              {transformedData.personalDetails.contactInfo.address}
            </div>
          )}
        </div>
      </div>

      {/* Personal Details Section */}
      {(transformedData.personalDetails.nationality || 
        transformedData.personalDetails.languages.length > 0 || 
        transformedData.personalDetails.dateOfBirth || 
        transformedData.personalDetails.maritalStatus) && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <Award className="w-5 h-5 mr-2 text-blue-500" />
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {transformedData.personalDetails.nationality && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Nationality:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.nationality}
                </span>
              </div>
            )}
            {transformedData.personalDetails.languages.length > 0 && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Languages:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.languages.join(', ')}
                </span>
              </div>
            )}
            {transformedData.personalDetails.dateOfBirth && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Date of Birth:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.dateOfBirth}
                </span>
              </div>
            )}
            {transformedData.personalDetails.maritalStatus && (
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">Marital Status:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.maritalStatus}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Profile Section */}
      {transformedData.profile && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <Star className="w-5 h-5 mr-2 text-blue-500" />
            Professional Profile
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            {transformedData.profile}
          </p>
        </div>
      )}

      {/* Professional Experience Section */}
      {transformedData.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
            Professional Experience
          </h3>
          <div className="space-y-6">
            {transformedData.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-300 pl-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
                    {exp.position}
                  </h4>
                  <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                    {exp.duration}
                  </span>
                </div>
                <p className="font-semibold text-blue-600 mb-3 text-lg" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
                  {exp.company}
                </p>
                {exp.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {exp.responsibilities.map((resp, respIndex) => (
                      <li key={respIndex} className="text-base leading-relaxed" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
                        {resp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {transformedData.education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
            Education
          </h3>
          <div className="space-y-4">
            {transformedData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
                    {edu.degree} in {edu.field}
                  </h4>
                  <p className="text-gray-600 text-base" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
                    {edu.institution}
                  </p>
                </div>
                <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                  {edu.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Skills Section */}
      {transformedData.keySkills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <Star className="w-5 h-5 mr-2 text-blue-500" />
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-3">
            {transformedData.keySkills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professional Interests Section */}
      {transformedData.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b border-gray-200 pb-2" style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}>
            <Heart className="w-5 h-5 mr-2 text-blue-500" />
            Professional Interests
          </h3>
          <div className="flex flex-wrap gap-3">
            {transformedData.interests.map((interest, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200"
                style={{ fontFamily: 'Palatino Linotype, Palatino, serif' }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* EHS Formatting Notice */}
      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p className="font-medium mb-2">✓ EHS Formatting Standards Applied</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Palatino Linotype Font
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Professional Layout
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              EHS Standards
            </span>
          </div>
        </div>
      </div>

      {/* AI Processing Info */}
      {cv.aiProcessingDetails && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Processed with {cv.aiProcessingDetails.modelUsed} AI</p>
          <p>Confidence: {Math.round(cv.aiProcessingDetails.confidence * 100)}%</p>
          <p>Processing time: {cv.aiProcessingDetails.processingTime}ms</p>
        </div>
      )}
    </div>
  )
}