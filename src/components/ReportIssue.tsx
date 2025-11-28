import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { DEFAULT_FORM_CONFIG } from '../utils/mockData';
import { Campus, Building, Room, FormConfig } from '../types';
import { ValidationAlert } from './ValidationAlert';
import { ConfirmDialog } from './ConfirmDialog';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ReportIssueProps {
  onSuccess: () => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({ onSuccess }) => {
  const { createTicket } = useTickets();
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  
  const [formData, setFormData] = useState({
    campus: '',
    building: '',
    room: '',
    unitId: '',
    issueType: '',
    issueSubtype: '',
    issueDescription: '',
    otherIssueSubtype: '',
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableUnitIds, setAvailableUnitIds] = useState<string[]>([]);
  const [availableSubtypes, setAvailableSubtypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    const unsubscribe = loadFormConfig();
    
    // Cleanup listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadFormConfig = () => {
    try {
      setIsLoadingConfig(true);
      
      // Set up real-time listener for Firestore formConfig
      const configRef = doc(db, 'formConfig', 'mainConfig');
      
      const unsubscribe = onSnapshot(
        configRef,
        (configSnap) => {
          if (configSnap.exists()) {
            const config = configSnap.data() as FormConfig;
            console.log('Form config updated from Firestore:', config);
            setFormConfig(config);
            // Update localStorage as fallback
            localStorage.setItem('formConfig', JSON.stringify(config));
          } else {
            console.log('No formConfig document found, using localStorage or default');
            // Load from localStorage if Firestore doesn't have it
            const stored = localStorage.getItem('formConfig');
            if (stored) {
              const config = JSON.parse(stored);
              setFormConfig(config);
            } else {
              setFormConfig(DEFAULT_FORM_CONFIG);
            }
          }
          setIsLoadingConfig(false);
        },
        (error) => {
          console.error('Error setting up real-time listener for form config:', error);
          setIsLoadingConfig(false);
          
          // Fallback to localStorage
          const stored = localStorage.getItem('formConfig');
          if (stored) {
            const config = JSON.parse(stored);
            setFormConfig(config);
          } else {
            setFormConfig(DEFAULT_FORM_CONFIG);
          }
        }
      );

      // Return cleanup function to unsubscribe when component unmounts
      return unsubscribe;
    } catch (error) {
      console.error('Error loading form config:', error);
      setIsLoadingConfig(false);
      // Fallback to localStorage
      const stored = localStorage.getItem('formConfig');
      if (stored) {
        const config = JSON.parse(stored);
        setFormConfig(config);
      } else {
        setFormConfig(DEFAULT_FORM_CONFIG);
      }
    }
  };

  useEffect(() => {
    if (formData.campus) {
      const campus = formConfig.campuses.find(c => c.name === formData.campus);
      setAvailableBuildings(campus?.buildings || []);
      setFormData(prev => ({ ...prev, building: '', room: '', unitId: '' }));
    }
  }, [formData.campus, formConfig]);

  useEffect(() => {
    if (formData.building) {
      const building = availableBuildings.find(b => b.name === formData.building);
      setAvailableRooms(building?.rooms || []);
      setFormData(prev => ({ ...prev, room: '', unitId: '' }));
    }
  }, [formData.building, availableBuildings]);

  useEffect(() => {
    if (formData.room) {
      const room = availableRooms.find(r => r.name === formData.room);
      setAvailableUnitIds(room?.unitIds || []);
      setFormData(prev => ({ ...prev, unitId: '' }));
    }
  }, [formData.room, availableRooms]);

  useEffect(() => {
    if (formData.issueType) {
      const issueType = formConfig.issueTypes.find(t => t.name === formData.issueType);
      setAvailableSubtypes(issueType?.subtypes || []);
      setFormData(prev => ({ ...prev, issueSubtype: '', otherIssueSubtype: '' }));
    }
  }, [formData.issueType, formConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.campus || !formData.building || !formData.room || !formData.unitId || 
        !formData.issueType || !formData.issueSubtype || !formData.issueDescription) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.issueSubtype === 'Others' && !formData.otherIssueSubtype) {
      setError('Please specify the issue subtype');
      return;
    }

    const issueSubtype = formData.issueSubtype === 'Others' ? formData.otherIssueSubtype : formData.issueSubtype;

    createTicket({
      campus: formData.campus,
      building: formData.building,
      room: formData.room,
      unitId: formData.unitId,
      issueType: formData.issueType,
      issueSubtype,
      issueDescription: formData.issueDescription,
      images,
    });

    setSuccess(true);
    setFormData({
      campus: '',
      building: '',
      room: '',
      unitId: '',
      issueType: '',
      issueSubtype: '',
      issueDescription: '',
      otherIssueSubtype: '',
    });
    setImages([]);

    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-gray-800 dark:text-white mb-6">Report an Issue</h2>

        {isLoadingConfig ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600 dark:text-gray-400">Loading form configuration...</div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Campus *</label>
              <select
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Campus</option>
                {formConfig.campuses.map(campus => (
                  <option key={campus.name} value={campus.name}>{campus.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Building *</label>
              <select
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                required
                disabled={!formData.campus}
              >
                <option value="">Select Building</option>
                {availableBuildings.map(building => (
                  <option key={building.name} value={building.name}>{building.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Room *</label>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                required
                disabled={!formData.building}
              >
                <option value="">Select Room</option>
                {availableRooms.map(room => (
                  <option key={room.name} value={room.name}>{room.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Unit ID *</label>
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                required
                disabled={!formData.room}
              >
                <option value="">Select Unit ID</option>
                {availableUnitIds.map(unitId => (
                  <option key={unitId} value={unitId}>{unitId}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Issue Type *</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Issue Type</option>
                {formConfig.issueTypes.map(type => (
                  <option key={type.name} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Issue Subtype *</label>
              <select
                name="issueSubtype"
                value={formData.issueSubtype}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                required
                disabled={!formData.issueType}
              >
                <option value="">Select Issue Subtype</option>
                {availableSubtypes.map(subtype => (
                  <option key={subtype} value={subtype}>{subtype}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.issueSubtype === 'Others' && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Please Specify *</label>
              <input
                type="text"
                name="otherIssueSubtype"
                value={formData.otherIssueSubtype}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Please specify the issue"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Issue Description *</label>
            <textarea
              name="issueDescription"
              value={formData.issueDescription}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Upload Images</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 dark:text-gray-400">Click to upload images</p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
              Issue reported successfully! Redirecting to dashboard...
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  campus: '',
                  building: '',
                  room: '',
                  unitId: '',
                  issueType: '',
                  issueSubtype: '',
                  issueDescription: '',
                  otherIssueSubtype: '',
                });
                setImages([]);
              }}
              className="px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
        )}
      </div>

      {/* Validation Alert */}
      {validationError && (
        <ValidationAlert
          message={validationError}
          onClose={() => setValidationError('')}
        />
      )}

      {/* Submit Confirmation Dialog */}
      {confirmSubmit && (
        <ConfirmDialog
          title="Submit Issue Report"
          message="Are you sure you want to submit this issue report? Please make sure all information is correct."
          confirmText="Submit"
          onConfirm={confirmSubmitTicket}
          onCancel={() => setConfirmSubmit(false)}
          type="info"
        />
      )}
    </div>
  );
};
