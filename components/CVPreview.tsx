'use client'

import { CVPreviewProps } from '@/types/cv'
import { Mail, Phone, MapPin, Globe, Calendar, Heart } from 'lucide-react'

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
    <div className="cv-preview bg-white p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          {transformedData.header.name || 'Professional Name'}
        </h1>
        <h2 className="text-xl text-gray-700 mb-4">
          {transformedData.header.jobTitle || 'Professional Title'}
        </h2>
        
        {/* Contact Information */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {transformedData.personalDetails.contactInfo.email && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {transformedData.personalDetails.contactInfo.email}
            </div>
          )}
          {transformedData.personalDetails.contactInfo.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {transformedData.personalDetails.contactInfo.phone}
            </div>
          )}
          {transformedData.personalDetails.contactInfo.address && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {transformedData.personalDetails.contactInfo.address}
            </div>
          )}
        </div>
      </div>

      {/* Personal Details */}
      {(transformedData.personalDetails.nationality || 
        transformedData.personalDetails.languages.length > 0 || 
        transformedData.personalDetails.dateOfBirth || 
        transformedData.personalDetails.maritalStatus) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {transformedData.personalDetails.nationality && (
              <div>
                <span className="font-medium text-gray-700">Nationality:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.nationality}
                </span>
              </div>
            )}
            {transformedData.personalDetails.languages.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Languages:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.languages.join(', ')}
                </span>
              </div>
            )}
            {transformedData.personalDetails.dateOfBirth && (
              <div>
                <span className="font-medium text-gray-700">Date of Birth:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.dateOfBirth}
                </span>
              </div>
            )}
            {transformedData.personalDetails.maritalStatus && (
              <div>
                <span className="font-medium text-gray-700">Marital Status:</span>
                <span className="ml-2 text-gray-600">
                  {transformedData.personalDetails.maritalStatus}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile */}
      {transformedData.profile && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Professional Profile
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {transformedData.profile}
          </p>
        </div>
      )}

      {/* Experience */}
      {transformedData.experience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Professional Experience
          </h3>
          <div className="space-y-4">
            {transformedData.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">
                    {exp.position}
                  </h4>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {exp.duration}
                  </span>
                </div>
                <p className="font-medium text-blue-600 mb-2">
                  {exp.company}
                </p>
                {exp.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {exp.responsibilities.map((resp, respIndex) => (
                      <li key={respIndex}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {transformedData.education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Education
          </h3>
          <div className="space-y-3">
            {transformedData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {edu.degree} in {edu.field}
                  </h4>
                  <p className="text-gray-600">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {edu.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Skills */}
      {transformedData.keySkills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {transformedData.keySkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {transformedData.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {transformedData.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

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