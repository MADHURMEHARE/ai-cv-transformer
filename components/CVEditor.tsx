'use client'

import { useState } from 'react'
import { CVEditorProps, CVTransformedData } from '@/types/cv'
import { Plus, X, Save, Edit3 } from 'lucide-react'

export default function CVEditor({ cv, onUpdate }: CVEditorProps) {
  const [editingData, setEditingData] = useState<CVTransformedData>(cv.transformedData)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')

  const handleFieldEdit = (field: string, value: string) => {
    setEditingField(field)
    setTempValue(value)
  }

  const handleFieldSave = (field: string) => {
    const updatedData = { ...editingData }
    
    // Update the specific field
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'header' || parent === 'personalDetails') {
        if (parent === 'personalDetails' && child === 'contactInfo') {
          // Handle nested contact info
          const [contactField] = field.split('.').slice(2)
          updatedData[parent][child][contactField] = tempValue
        } else {
          updatedData[parent][child] = tempValue
        }
      }
    } else {
      (updatedData as any)[field] = tempValue
    }

    setEditingData(updatedData)
    setEditingField(null)
    setTempValue('')
    
    // Trigger update
    onUpdate(updatedData)
  }

  const handleArrayFieldEdit = (field: string, index: number, subField?: string) => {
    const key = subField ? `${field}.${index}.${subField}` : `${field}.${index}`
    const value = subField 
      ? editingData[field][index][subField]
      : editingData[field][index]
    
    setEditingField(key)
    setTempValue(Array.isArray(value) ? value.join('\n') : value)
  }

  const handleArrayFieldSave = (field: string, index: number, subField?: string) => {
    const updatedData = { ...editingData }
    
    if (subField) {
      updatedData[field][index][subField] = tempValue
    } else {
      updatedData[field][index] = tempValue.split('\n').filter(item => item.trim())
    }

    setEditingData(updatedData)
    setEditingField(null)
    setTempValue('')
    
    onUpdate(updatedData)
  }

  const addArrayItem = (field: string, template: any) => {
    const updatedData = { ...editingData }
    updatedData[field].push(template)
    setEditingData(updatedData)
    onUpdate(updatedData)
  }

  const removeArrayItem = (field: string, index: number) => {
    const updatedData = { ...editingData }
    updatedData[field].splice(index, 1)
    setEditingData(updatedData)
    onUpdate(updatedData)
  }

  const renderEditableField = (label: string, field: string, value: string, multiline = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label}
      </label>
      {editingField === field ? (
        <div className="flex space-x-2">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="input-field flex-1"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="input-field flex-1"
            />
          )}
          <button
            onClick={() => handleFieldSave(field)}
            className="btn-primary px-3 py-2"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingField(null)}
            className="btn-outline px-3 py-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200">
          <span className="text-secondary-700 flex-1">
            {value || <span className="text-secondary-400 italic">Not specified</span>}
          </span>
          <button
            onClick={() => handleFieldEdit(field, value)}
            className="ml-2 p-1 text-secondary-500 hover:text-primary-600 transition-colors"
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
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
        <button
          onClick={() => addArrayItem(field, template)}
          className="btn-outline px-3 py-2 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </button>
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary-600">
                Item {index + 1}
              </span>
              <button
                onClick={() => removeArrayItem(field, index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {Object.keys(item).map((key) => (
              <div key={key} className="mb-2">
                <label className="block text-xs font-medium text-secondary-600 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {Array.isArray(item[key]) ? (
                  <div>
                    {editingField === `${field}.${index}.${key}` ? (
                      <div className="flex space-x-2">
                        <textarea
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="input-field flex-1 text-sm"
                          rows={2}
                        />
                        <button
                          onClick={() => handleArrayFieldSave(field, index, key)}
                          className="btn-primary px-2 py-1 text-sm"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="btn-outline px-2 py-1 text-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-secondary-200">
                        <span className="text-sm text-secondary-700">
                          {item[key].join(', ') || <span className="text-secondary-400 italic">None</span>}
                        </span>
                        <button
                          onClick={() => handleArrayFieldEdit(field, index, key)}
                          className="ml-2 p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {editingField === `${field}.${index}.${key}` ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="input-field flex-1 text-sm"
                        />
                        <button
                          onClick={() => handleArrayFieldSave(field, index, key)}
                          className="btn-primary px-2 py-1 text-sm"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="btn-outline px-2 py-1 text-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-secondary-200">
                        <span className="text-sm text-secondary-700">
                          {item[key] || <span className="text-secondary-400 italic">Not specified</span>}
                        </span>
                        <button
                          onClick={() => handleArrayFieldEdit(field, index, key)}
                          className="ml-2 p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-secondary-500 text-sm">
            No {label.toLowerCase()} added yet
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      {/* Header Section */}
      <div>
        <h4 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
          Header Information
        </h4>
        {renderEditableField('Full Name', 'header.name', editingData.header.name)}
        {renderEditableField('Job Title', 'header.jobTitle', editingData.header.jobTitle)}
        {renderEditableField('Photo URL', 'header.photoUrl', editingData.header.photoUrl)}
      </div>

      {/* Personal Details Section */}
      <div>
        <h4 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
          Personal Details
        </h4>
        {renderEditableField('Nationality', 'personalDetails.nationality', editingData.personalDetails.nationality)}
        {renderEditableField('Date of Birth', 'personalDetails.dateOfBirth', editingData.personalDetails.dateOfBirth)}
        {renderEditableField('Marital Status', 'personalDetails.maritalStatus', editingData.personalDetails.maritalStatus)}
        
        {/* Languages */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Languages
          </label>
          {editingField === 'personalDetails.languages' ? (
            <div className="flex space-x-2">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="input-field flex-1"
                rows={2}
                placeholder="Enter languages separated by commas"
              />
              <button
                onClick={() => handleFieldSave('personalDetails.languages')}
                className="btn-primary px-3 py-2"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="btn-outline px-3 py-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-200">
              <span className="text-secondary-700 flex-1">
                {editingData.personalDetails.languages.join(', ') || <span className="text-secondary-400 italic">No languages specified</span>}
              </span>
              <button
                onClick={() => handleFieldEdit('personalDetails.languages', editingData.personalDetails.languages.join(', '))}
                className="ml-2 p-1 text-secondary-500 hover:text-primary-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div>
          <h5 className="text-sm font-medium text-secondary-700 mb-3">Contact Information</h5>
          {renderEditableField('Email', 'personalDetails.contactInfo.email', editingData.personalDetails.contactInfo.email)}
          {renderEditableField('Phone', 'personalDetails.contactInfo.phone', editingData.personalDetails.contactInfo.phone)}
          {renderEditableField('Address', 'personalDetails.contactInfo.address', editingData.personalDetails.contactInfo.address, true)}
        </div>
      </div>

      {/* Profile Section */}
      <div>
        <h4 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
          Professional Profile
        </h4>
        {renderEditableField('Profile Summary', 'profile', editingData.profile, true)}
      </div>

      {/* Experience Section */}
      {renderArrayField('Professional Experience', 'experience', editingData.experience, {
        company: '',
        position: '',
        duration: '',
        responsibilities: []
      })}

      {/* Education Section */}
      {renderArrayField('Education', 'education', editingData.education, {
        institution: '',
        degree: '',
        field: '',
        year: ''
      })}

      {/* Skills Section */}
      <div>
        <h4 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
          Key Skills
        </h4>
        {renderEditableField('Skills (one per line)', 'keySkills', editingData.keySkills.join('\n'), true)}
      </div>

      {/* Interests Section */}
      <div>
        <h4 className="text-lg font-semibold text-secondary-800 mb-4 border-b border-secondary-200 pb-2">
          Interests
        </h4>
        {renderEditableField('Interests (one per line)', 'interests', editingData.interests.join('\n'), true)}
      </div>
    </div>
  )
}