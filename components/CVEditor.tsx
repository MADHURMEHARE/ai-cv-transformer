'use client'

import { useState } from 'react'
import { CVEditorProps, CVTransformedData, ContactInfo } from '@/types/cv'
import { Edit3, Save, X, Plus, Trash2, CheckCircle } from 'lucide-react'

export default function CVEditor({ cv, onUpdate }: CVEditorProps) {
  // Provide default data structure if transformedData is undefined
  const defaultData: CVTransformedData = {
    header: {
      name: '',
      jobTitle: '',
      photoUrl: ''
    },
    personalDetails: {
      nationality: '',
      languages: ['English'],
      dateOfBirth: '',
      maritalStatus: '',
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      }
    },
    profile: '',
    experience: [],
    education: [],
    keySkills: [],
    interests: []
  }

  const [editingData, setEditingData] = useState<CVTransformedData>(cv.transformedData || defaultData)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')
  const [editingArrayField, setEditingArrayField] = useState<string | null>(null)
  const [editingArrayIndex, setEditingArrayIndex] = useState<number | null>(null)

  // If no transformed data, show message
  if (!cv.transformedData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Edit3 className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">CV Not Processed Yet</h3>
        <p className="text-gray-600 mb-4">This CV needs to be processed by AI before editing</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
          <p className="font-medium text-amber-800 mb-2">Current Status:</p>
          <p className="text-amber-700 text-sm">{cv.status}</p>
        </div>
      </div>
    )
  }

  const handleFieldEdit = (field: string, value: string) => {
    setEditingField(field)
    setTempValue(value)
  }

  const handleFieldSave = () => {
    if (!editingField) return
    
    const updatedData = { ...editingData }
    if (editingField.includes('.')) {
      const [parent, child, ...rest] = editingField.split('.')
      if (parent && child && (updatedData as any)[parent] && (updatedData as any)[parent][child]) {
        if (parent === 'personalDetails' && child === 'contactInfo') {
          const [contactField] = editingField.split('.').slice(2)
          if (contactField && contactField in updatedData.personalDetails.contactInfo) {
            (updatedData.personalDetails.contactInfo as any)[contactField] = tempValue
          }
        } else {
          (updatedData as any)[parent][child] = tempValue
        }
      }
    } else {
      (updatedData as any)[editingField] = tempValue
    }
    
    setEditingData(updatedData)
    onUpdate(updatedData)
    setEditingField(null)
    setTempValue('')
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleArrayFieldEdit = (field: string, index: number, subField?: string) => {
    const key = subField ? `${field}.${index}.${subField}` : `${field}.${index}`
    const value = subField
      ? (editingData as any)[field][index][subField]
      : (editingData as any)[field][index]
    
    setEditingArrayField(key)
    setEditingArrayIndex(index)
    setTempValue(typeof value === 'string' ? value : value.join('\n'))
  }

  const handleArrayFieldSave = (field: string, index: number, subField?: string) => {
    const updatedData = { ...editingData }
    if (subField) {
      (updatedData as any)[field][index][subField] = tempValue
    } else {
      (updatedData as any)[field][index] = tempValue.split('\n').filter(item => item.trim())
    }
    
    setEditingData(updatedData)
    onUpdate(updatedData)
    setEditingArrayField(null)
    setEditingArrayIndex(null)
    setTempValue('')
  }

  const handleArrayFieldCancel = () => {
    setEditingArrayField(null)
    setEditingArrayIndex(null)
    setTempValue('')
  }

  const addArrayItem = (field: string, template: any) => {
    const updatedData = { ...editingData }
    ;(updatedData as any)[field].push(template)
    setEditingData(updatedData)
    onUpdate(updatedData)
  }

  const removeArrayItem = (field: string, index: number) => {
    const updatedData = { ...editingData }
    ;(updatedData as any)[field].splice(index, 1)
    setEditingData(updatedData)
    onUpdate(updatedData)
  }

  const renderEditableField = (label: string, field: string, value: string, placeholder?: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {editingField === field ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="input-field flex-1"
            placeholder={placeholder}
          />
          <button
            onClick={handleFieldSave}
            className="btn-success px-3 py-2"
            title="Save"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleFieldCancel}
            className="btn-danger px-3 py-2"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-gray-700">{value || placeholder || 'Not specified'}</span>
          <button
            onClick={() => handleFieldEdit(field, value)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )

  const renderArrayField = (label: string, field: string, items: any[], template: any) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-lg font-semibold text-gray-800">{label}</label>
        <button
          onClick={() => addArrayItem(field, template)}
          className="btn-primary px-3 py-2 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add {label.slice(0, -1)}
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No {label.toLowerCase()} added yet</p>
          <p className="text-sm">Click "Add {label.slice(0, -1)}" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{label.slice(0, -1)} #{index + 1}</h4>
                <button
                  onClick={() => removeArrayItem(field, index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  
                  {Array.isArray(value) ? (
                    <div>
                      {editingArrayField === `${field}.${index}` ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="input-field"
                            rows={4}
                            placeholder="Enter items, one per line"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleArrayFieldSave(field, index)}
                              className="btn-success px-3 py-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={handleArrayFieldCancel}
                              className="btn-danger px-3 py-2 text-sm"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {value.map((v, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {v}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => handleArrayFieldEdit(field, index)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {editingArrayField === `${field}.${index}.${key}` ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="input-field flex-1"
                            placeholder={`Enter ${key}`}
                          />
                          <button
                            onClick={() => handleArrayFieldSave(field, index, key)}
                            className="btn-success px-3 py-2"
                            title="Save"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleArrayFieldCancel}
                            className="btn-danger px-3 py-2"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <span className="text-gray-700">{String(value || 'Not specified')}</span>
                          <button
                            onClick={() => handleArrayFieldEdit(field, index, key)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">EHS Formatting Standards Applied</h3>
        <p className="text-blue-700 text-sm">
          Your CV has been automatically formatted according to EHS standards including Palatino Linotype font, 
          professional layout, and proper content organization.
        </p>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Header Information</h3>
        {renderEditableField('Full Name', 'header.name', editingData.header.name, 'Enter your full name')}
        {renderEditableField('Job Title', 'header.jobTitle', editingData.header.jobTitle, 'Enter your professional title')}
        {renderEditableField('Photo URL', 'header.photoUrl', editingData.header.photoUrl, 'Enter photo URL (optional)')}
      </div>

      {/* Personal Details Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Personal Details</h3>
        {renderEditableField('Nationality', 'personalDetails.nationality', editingData.personalDetails.nationality, 'Enter your nationality')}
        {renderEditableField('Date of Birth', 'personalDetails.dateOfBirth', editingData.personalDetails.dateOfBirth, 'DD/MM/YYYY')}
        {renderEditableField('Marital Status', 'personalDetails.maritalStatus', editingData.personalDetails.maritalStatus, 'Enter marital status')}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
          {editingArrayField === 'personalDetails.languages' ? (
            <div className="space-y-2">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Enter languages, one per line"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleArrayFieldSave('personalDetails', 0, 'languages')}
                  className="btn-success px-3 py-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Save Languages
                </button>
                <button
                  onClick={handleArrayFieldCancel}
                  className="btn-danger px-3 py-2 text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {editingData.personalDetails.languages.map((lang, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleArrayFieldEdit('personalDetails', 0, 'languages')}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                title="Edit Languages"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-6">Contact Information</h4>
        {renderEditableField('Email', 'personalDetails.contactInfo.email', editingData.personalDetails.contactInfo.email, 'Enter your email address')}
        {renderEditableField('Phone', 'personalDetails.contactInfo.phone', editingData.personalDetails.contactInfo.phone, 'Enter your phone number')}
        {renderEditableField('Address', 'personalDetails.contactInfo.address', editingData.personalDetails.contactInfo.address, 'Enter your full address')}
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Professional Profile</h3>
        {renderEditableField('Professional Summary', 'profile', editingData.profile, 'Enter your professional summary (2-3 sentences)')}
      </div>

      {/* Experience Section */}
      {renderArrayField('Experience', 'experience', editingData.experience, {
        company: 'Company Name',
        position: 'Job Title',
        duration: 'Jan 2020 - Dec 2023',
        responsibilities: ['Responsibility 1', 'Responsibility 2', 'Responsibility 3']
      })}

      {/* Education Section */}
      {renderArrayField('Education', 'education', editingData.education, {
        institution: 'Institution Name',
        degree: 'Degree Type',
        field: 'Field of Study',
        year: 'Jan 2020'
      })}

      {/* Skills Section */}
      {renderArrayField('Key Skills', 'keySkills', editingData.keySkills, ['Skill 1', 'Skill 2', 'Skill 3'])}

      {/* Interests Section */}
      {renderArrayField('Professional Interests', 'interests', editingData.interests, ['Interest 1', 'Interest 2', 'Interest 3'])}

      {/* Save Notice */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
        <div className="flex items-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
          <div>
            <h4 className="font-semibold text-emerald-800">Changes Auto-Saved</h4>
            <p className="text-emerald-700 text-sm">All your edits are automatically saved and applied to your CV</p>
          </div>
        </div>
      </div>
    </div>
  )
}