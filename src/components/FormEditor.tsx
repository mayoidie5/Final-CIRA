import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { FormConfig, Building, Room } from '../types';
import { DEFAULT_FORM_CONFIG } from '../utils/mockData';
import { FormDialog } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { SuccessToast } from './SuccessToast';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export const FormEditor: React.FC = () => {
  const { user } = useAuth();
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDialog, setShowDialog] = useState<{ type: string; data?: any } | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: string; index: number; parentIndices?: number[] } | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewFormData, setPreviewFormData] = useState({
    campus: '',
    building: '',
    room: '',
    unitId: '',
    issueType: '',
    issueSubtype: '',
    description: '',
  });
  const [previewAvailableBuildings, setPreviewAvailableBuildings] = useState<Building[]>([]);
  const [previewAvailableRooms, setPreviewAvailableRooms] = useState<Room[]>([]);
  const [previewAvailableUnitIds, setPreviewAvailableUnitIds] = useState<string[]>([]);
  const [previewAvailableSubtypes, setPreviewAvailableSubtypes] = useState<string[]>([]);

  useEffect(() => {
    loadFormConfig();
    
    // Debug: Check current user's Firestore document
    if (user) {
      const checkUserDoc = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
            console.log('User Firestore doc:', userDoc.data());
            console.log('User role in Firestore:', userDoc.data().role);
          } else {
            console.warn('User Firestore document does not exist:', user.id);
          }
        } catch (err) {
          console.error('Error checking user document:', err);
        }
      };
      checkUserDoc();
    }
  }, [user]);

  const loadFormConfig = async () => {
    try {
      setIsLoading(true);
      console.log('Loading form config from Firestore...');
      
      // Try to load from Firestore
      const configRef = doc(db, 'formConfig', 'mainConfig');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const config = configSnap.data() as FormConfig;
        console.log('Loaded from Firestore:', config);
        setFormConfig(config);
        setOriginalConfig(JSON.parse(JSON.stringify(config)));
        // Update localStorage as fallback
        localStorage.setItem('formConfig', JSON.stringify(config));
      } else {
        console.log('No Firestore document found, initializing with default config...');
        // Initialize Firestore with DEFAULT_FORM_CONFIG if document doesn't exist
        try {
          await setDoc(configRef, {
            campuses: DEFAULT_FORM_CONFIG.campuses,
            issueTypes: DEFAULT_FORM_CONFIG.issueTypes,
            createdAt: new Date().toISOString(),
          });
          console.log('Initialized Firestore with default config');
        } catch (initError) {
          console.warn('Could not initialize Firestore, using localStorage fallback', initError);
        }
        
        setFormConfig(DEFAULT_FORM_CONFIG);
        setOriginalConfig(JSON.parse(JSON.stringify(DEFAULT_FORM_CONFIG)));
        localStorage.setItem('formConfig', JSON.stringify(DEFAULT_FORM_CONFIG));
      }
    } catch (error) {
      console.error('Error loading form config from Firestore:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('formConfig');
      if (stored) {
        const config = JSON.parse(stored);
        console.log('Error loading Firestore, fallback to localStorage:', config);
        setFormConfig(config);
        setOriginalConfig(JSON.parse(JSON.stringify(config)));
      } else {
        console.log('Error loading Firestore, fallback to DEFAULT_FORM_CONFIG');
        setFormConfig(DEFAULT_FORM_CONFIG);
        setOriginalConfig(JSON.parse(JSON.stringify(DEFAULT_FORM_CONFIG)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if config has changed from original
    setHasChanges(JSON.stringify(formConfig) !== JSON.stringify(originalConfig));
  }, [formConfig, originalConfig]);

  useEffect(() => {
    // Update preview available options when formConfig changes
    if (previewFormData.campus) {
      const selectedCampus = formConfig.campuses.find(c => c.name === previewFormData.campus);
      setPreviewAvailableBuildings(selectedCampus?.buildings || []);
      
      // If building is selected, update available rooms
      if (previewFormData.building && selectedCampus) {
        const selectedBuilding = selectedCampus.buildings.find(b => b.name === previewFormData.building);
        setPreviewAvailableRooms(selectedBuilding?.rooms || []);
        
        // If room is selected, update available unit IDs
        if (previewFormData.room && selectedBuilding) {
          const selectedRoom = selectedBuilding.rooms.find(r => r.name === previewFormData.room);
          setPreviewAvailableUnitIds(selectedRoom?.unitIds || []);
        }
      }
    }
    
    // Update available subtypes when formConfig changes
    if (previewFormData.issueType) {
      const selectedType = formConfig.issueTypes.find(t => t.name === previewFormData.issueType);
      setPreviewAvailableSubtypes(selectedType?.subtypes || []);
    }
  }, [formConfig, previewFormData.campus, previewFormData.building, previewFormData.room, previewFormData.issueType]);

  const saveConfig = () => {
    confirmSave();
  };

  const confirmSave = async () => {
    try {
      console.log('Starting save...');
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('Is admin?', user?.role === 'admin');
      console.log('Saving config:', formConfig);
      
      // Check if user is authenticated and is admin
      if (!user) {
        throw new Error('Not authenticated. Please log in first.');
      }
      
      if (user.role !== 'admin') {
        throw new Error(`Permission denied. Only admins can edit form configuration. Your role: ${user.role}`);
      }
      
      // Validate that formConfig has required structure
      if (!formConfig.campuses || !formConfig.issueTypes) {
        throw new Error('Invalid form configuration structure');
      }
      
      // Save to Firestore
      const configRef = doc(db, 'formConfig', 'mainConfig');
      
      console.log('Writing to Firestore at path: formConfig/mainConfig');
      console.log('Auth UID:', auth.currentUser?.uid);
      
      // Use merge: false to replace entire document
      await setDoc(configRef, {
        campuses: formConfig.campuses,
        issueTypes: formConfig.issueTypes,
        updatedAt: new Date().toISOString(),
      });
      
      console.log('Successfully saved to Firestore');
      
      // Update localStorage
      localStorage.setItem('formConfig', JSON.stringify(formConfig));
      setOriginalConfig(JSON.parse(JSON.stringify(formConfig)));
      setHasChanges(false);
      setShowSaveConfirm(false);
      setShowSuccessToast(true);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving form config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.code || 'UNKNOWN';
      console.error('Error code:', errorCode);
      console.log('Current user:', user);
      console.log('Current user role:', user?.role);
      
      if (errorCode === 'permission-denied') {
        alert(`Failed to save: Permission denied (${errorCode}).\n\nChecklist:\n1. Are you logged in as an admin?\n2. Is your user's role set to 'admin' in Firestore?\n3. Have you deployed the Firestore rules?\n\nYour current role: ${user?.role || 'UNKNOWN'}\nYour ID: ${user?.id || 'UNKNOWN'}`);
      } else if (errorMessage.includes('Permission denied') || errorMessage.includes('permission')) {
        alert(`Failed to save: ${errorMessage}\n\nMake sure your user role is set to 'admin' in the Firestore database.`);
      } else {
        alert(`Failed to save configuration: ${errorMessage}`);
      }
    }
  };

  const cancelEdit = () => {
    if (hasChanges) {
      // Show confirmation before saving
      setShowSaveConfirm(true);
    } else {
      setEditMode(false);
    }
  };

  // Helper function to setup admin role for current user
  const setupAdminRole = async () => {
    if (!user) {
      alert('No user logged in');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: 'admin' });
      console.log('Set current user to admin role');
      alert(`Successfully set ${user.email} as admin!\n\nPlease refresh the page.`);
    } catch (error: any) {
      console.error('Error setting admin role:', error);
      alert(`Failed to set admin role: ${error.message}\n\nYou may need admin access or the user document might not exist yet.`);
    }
  };

  // Campus operations
  const addCampus = (data: any) => {
    setFormConfig(prev => ({
      ...prev,
      campuses: [...prev.campuses, { name: data.name, buildings: [] }],
    }));
    setShowDialog(null);
  };

  const editCampus = (index: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[index].name = data.name;
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const deleteCampus = (index: number) => {
    if (confirm('Are you sure you want to delete this campus? All buildings and rooms under it will be deleted.')) {
      const newCampuses = formConfig.campuses.filter((_, i) => i !== index);
      setFormConfig({ ...formConfig, campuses: newCampuses });
    }
  };

  // Building operations
  const addBuilding = (campusIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings.push({ name: data.name, rooms: [] });
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const editBuilding = (campusIndex: number, buildingIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].name = data.name;
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const deleteBuilding = (campusIndex: number, buildingIndex: number) => {
    if (confirm('Are you sure you want to delete this building? All rooms under it will be deleted.')) {
      const newCampuses = [...formConfig.campuses];
      newCampuses[campusIndex].buildings = newCampuses[campusIndex].buildings.filter((_, i) => i !== buildingIndex);
      setFormConfig({ ...formConfig, campuses: newCampuses });
    }
  };

  // Room operations
  const addRoom = (campusIndex: number, buildingIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].rooms.push({ name: data.name, unitIds: [] });
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const editRoom = (campusIndex: number, buildingIndex: number, roomIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].rooms[roomIndex].name = data.name;
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const deleteRoom = (campusIndex: number, buildingIndex: number, roomIndex: number) => {
    if (confirm('Are you sure you want to delete this room?')) {
      const newCampuses = [...formConfig.campuses];
      newCampuses[campusIndex].buildings[buildingIndex].rooms = 
        newCampuses[campusIndex].buildings[buildingIndex].rooms.filter((_, i) => i !== roomIndex);
      setFormConfig({ ...formConfig, campuses: newCampuses });
    }
  };

  // Unit ID operations
  const addUnitId = (campusIndex: number, buildingIndex: number, roomIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].rooms[roomIndex].unitIds.push(data.unitId);
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const editUnitId = (campusIndex: number, buildingIndex: number, roomIndex: number, unitIdIndex: number, data: any) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].rooms[roomIndex].unitIds[unitIdIndex] = data.unitId;
    setFormConfig({ ...formConfig, campuses: newCampuses });
    setShowDialog(null);
  };

  const deleteUnitId = (campusIndex: number, buildingIndex: number, roomIndex: number, unitIdIndex: number) => {
    const newCampuses = [...formConfig.campuses];
    newCampuses[campusIndex].buildings[buildingIndex].rooms[roomIndex].unitIds.splice(unitIdIndex, 1);
    setFormConfig({ ...formConfig, campuses: newCampuses });
  };

  const moveUnitId = (campusIndex: number, buildingIndex: number, roomIndex: number, fromIndex: number, toIndex: number) => {
    const newCampuses = [...formConfig.campuses];
    const unitIds = newCampuses[campusIndex].buildings[buildingIndex].rooms[roomIndex].unitIds;
    const [movedItem] = unitIds.splice(fromIndex, 1);
    unitIds.splice(toIndex, 0, movedItem);
    setFormConfig({ ...formConfig, campuses: newCampuses });
  };

  // Issue Type operations
  const addIssueType = (data: any) => {
    setFormConfig(prev => ({
      ...prev,
      issueTypes: [...prev.issueTypes, { name: data.name, subtypes: [] }],
    }));
    setShowDialog(null);
  };

  const editIssueType = (index: number, data: any) => {
    const newIssueTypes = [...formConfig.issueTypes];
    newIssueTypes[index].name = data.name;
    setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
    setShowDialog(null);
  };

  const deleteIssueType = (index: number) => {
    if (confirm('Are you sure you want to delete this issue type?')) {
      const newIssueTypes = formConfig.issueTypes.filter((_, i) => i !== index);
      setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
    }
  };

  const addSubtype = (issueTypeIndex: number, data: any) => {
    const newIssueTypes = [...formConfig.issueTypes];
    newIssueTypes[issueTypeIndex].subtypes.push(data.subtype);
    setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
    setShowDialog(null);
  };

  const editSubtype = (issueTypeIndex: number, subtypeIndex: number, data: any) => {
    const newIssueTypes = [...formConfig.issueTypes];
    newIssueTypes[issueTypeIndex].subtypes[subtypeIndex] = data.subtype;
    setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
    setShowDialog(null);
  };

  const deleteSubtype = (issueTypeIndex: number, subtypeIndex: number) => {
    const newIssueTypes = [...formConfig.issueTypes];
    newIssueTypes[issueTypeIndex].subtypes.splice(subtypeIndex, 1);
    setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
  };

  const moveSubtype = (issueTypeIndex: number, fromIndex: number, toIndex: number) => {
    const newIssueTypes = [...formConfig.issueTypes];
    const subtypes = newIssueTypes[issueTypeIndex].subtypes;
    const [movedItem] = subtypes.splice(fromIndex, 1);
    subtypes.splice(toIndex, 0, movedItem);
    setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
  };

  // Preview form handlers
  const handlePreviewCampusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campus = e.target.value;
    setPreviewFormData(prev => ({ ...prev, campus, building: '', room: '', unitId: '' }));
    const selectedCampus = formConfig.campuses.find(c => c.name === campus);
    setPreviewAvailableBuildings(selectedCampus?.buildings || []);
    setPreviewAvailableRooms([]);
    setPreviewAvailableUnitIds([]);
    setPreviewAvailableSubtypes([]);
  };

  const handlePreviewBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const building = e.target.value;
    setPreviewFormData(prev => ({ ...prev, building, room: '', unitId: '' }));
    const selectedBuilding = previewAvailableBuildings.find(b => b.name === building);
    setPreviewAvailableRooms(selectedBuilding?.rooms || []);
    setPreviewAvailableUnitIds([]);
  };

  const handlePreviewRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const room = e.target.value;
    setPreviewFormData(prev => ({ ...prev, room, unitId: '' }));
    const selectedRoom = previewAvailableRooms.find(r => r.name === room);
    setPreviewAvailableUnitIds(selectedRoom?.unitIds || []);
  };

  const handlePreviewUnitIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreviewFormData(prev => ({ ...prev, unitId: e.target.value }));
  };

  const handlePreviewIssueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const issueType = e.target.value;
    setPreviewFormData(prev => ({ ...prev, issueType, issueSubtype: '' }));
    const selectedIssueType = formConfig.issueTypes.find(t => t.name === issueType);
    setPreviewAvailableSubtypes(selectedIssueType?.subtypes || []);
  };

  const handlePreviewIssueSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreviewFormData(prev => ({ ...prev, issueSubtype: e.target.value }));
  };

  // Helper function to render form preview
  const renderFormPreview = (config: FormConfig) => {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
        <h4 className="text-gray-800 dark:text-white mb-4 font-semibold">Report an Issue</h4>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Campus *</label>
              <select 
                value={previewFormData.campus}
                onChange={handlePreviewCampusChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Campus</option>
                {config.campuses.map((campus, idx) => (
                  <option key={idx}>{campus.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {config.campuses.length} campus(es) available
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Building *</label>
              <select 
                value={previewFormData.building}
                onChange={handlePreviewBuildingChange}
                disabled={!previewFormData.campus}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Building</option>
                {previewAvailableBuildings.map((building, idx) => (
                  <option key={idx}>{building.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Room *</label>
              <select 
                value={previewFormData.room}
                onChange={handlePreviewRoomChange}
                disabled={!previewFormData.building}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Room</option>
                {previewAvailableRooms.map((room, idx) => (
                  <option key={idx}>{room.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Unit ID *</label>
              <select 
                value={previewFormData.unitId}
                onChange={handlePreviewUnitIdChange}
                disabled={!previewFormData.room}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Unit ID</option>
                {previewAvailableUnitIds.map((unitId, idx) => (
                  <option key={idx}>{unitId}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Issue Type *</label>
              <select 
                value={previewFormData.issueType}
                onChange={handlePreviewIssueTypeChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Issue Type</option>
                {config.issueTypes.map((type, idx) => (
                  <option key={idx}>{type.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {config.issueTypes.length} issue type(s) available
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Issue Subtype *</label>
              <select 
                value={previewFormData.issueSubtype}
                onChange={handlePreviewIssueSubtypeChange}
                disabled={!previewFormData.issueType}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Issue Subtype</option>
                {previewAvailableSubtypes.map((subtype, idx) => (
                  <option key={idx}>{subtype}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Issue Description *</label>
            <textarea
              value={previewFormData.description}
              onChange={(e) => setPreviewFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Upload Images</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center opacity-60">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Click to upload images</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg opacity-60 cursor-not-allowed">
            Submit Report
          </button>
          <button className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg opacity-60 cursor-not-allowed">
            Clear
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{config.campuses.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Campuses</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{config.issueTypes.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Issue Types</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {config.campuses.reduce((total, campus) => 
                total + campus.buildings.reduce((buildingTotal, building) => 
                  buildingTotal + building.rooms.length, 0), 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Rooms</p>
          </div>
        </div>
      </div>
    );
  };

  // Drag and drop handlers
  const handleDragStart = (type: string, index: number, parentIndices?: number[]) => {
    setDraggedItem({ type, index, parentIndices });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (type: string, dropIndex: number, parentIndices?: number[]) => {
    if (!draggedItem || draggedItem.type !== type) return;

    if (type === 'campus') {
      const newCampuses = [...formConfig.campuses];
      const [movedItem] = newCampuses.splice(draggedItem.index, 1);
      newCampuses.splice(dropIndex, 0, movedItem);
      setFormConfig({ ...formConfig, campuses: newCampuses });
    } else if (type === 'issueType') {
      const newIssueTypes = [...formConfig.issueTypes];
      const [movedItem] = newIssueTypes.splice(draggedItem.index, 1);
      newIssueTypes.splice(dropIndex, 0, movedItem);
      setFormConfig({ ...formConfig, issueTypes: newIssueTypes });
    } else if (type === 'subtype' && parentIndices && draggedItem.parentIndices) {
      const [issueTypeIndex] = parentIndices;
      moveSubtype(issueTypeIndex, draggedItem.index, dropIndex);
    } else if (type === 'unitId' && parentIndices && draggedItem.parentIndices) {
      const [campusIndex, buildingIndex, roomIndex] = parentIndices;
      moveUnitId(campusIndex, buildingIndex, roomIndex, draggedItem.index, dropIndex);
    }

    setDraggedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600 dark:text-gray-400">Loading form configuration...</div>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-800 dark:text-white mb-2">Form Editor</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure form options for issue reporting</p>
            </div>
            <div className="flex items-center gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                  Edit Form
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save size={20} />
                    Done
                  </button>
                  <button
                    onClick={() => {
                      setFormConfig(originalConfig);
                      setEditMode(false);
                      setHasChanges(false);
                    }}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                    Discard Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Unsaved Changes Warning */}
          {editMode && JSON.stringify(formConfig) !== JSON.stringify(originalConfig) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                <strong>⚠️ You have unsaved changes!</strong> Click "Done" and then "Save Changes" to save your modifications to the form configuration. If you navigate away without saving, your changes will be lost.
              </p>
            </div>
          )}

          {/* Debug Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Logged in as:</strong> {user?.email} <br />
                  <strong>Role:</strong> {user?.role} <strong>ID:</strong> {user?.id}
                </p>
              </div>
              {user?.role !== 'admin' && (
                <button
                  onClick={setupAdminRole}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Set as Admin
                </button>
              )}
            </div>
          </div>

          {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'editor'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <span className="block px-4 py-3">Form Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <span className="block px-4 py-3">Form Preview</span>
          </button>
        </div>

        {/* Editor Tab Content */}
        {activeTab === 'editor' && (
          <div className="space-y-6 pt-6">
            {/* Campus and Location Configuration */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg border-t border-gray-200 dark:border-gray-700 ${!editMode ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-gray-800 dark:text-white">Campus & Location Configuration</h3>
                <button
                  onClick={() => setShowDialog({ type: 'campus' })}
                  disabled={!editMode}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add Campus
                </button>
              </div>

              <div className="p-6 space-y-6">
          {formConfig.campuses.map((campus, campusIndex) => (
            <div 
              key={campusIndex} 
              draggable
              onDragStart={() => handleDragStart('campus', campusIndex)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('campus', campusIndex)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-move hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="text-gray-400" size={20} />
                  <h4 className="text-gray-800 dark:text-white">{campus.name}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDialog({ type: 'editCampus', data: { campusIndex, name: campus.name } })}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Edit Campus"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteCampus(campusIndex)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Campus"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setShowDialog({ type: 'building', data: { campusIndex } })}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    <Plus size={16} />
                    Add Building
                  </button>
                </div>
              </div>

              <div className="space-y-4 ml-6">
                {campus.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-gray-800 dark:text-white">{building.name}</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDialog({ 
                            type: 'editBuilding', 
                            data: { campusIndex, buildingIndex, name: building.name } 
                          })}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit Building"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteBuilding(campusIndex, buildingIndex)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Building"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setShowDialog({ type: 'room', data: { campusIndex, buildingIndex } })}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          <Plus size={16} />
                          Add Room
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 ml-6">
                      {building.rooms.map((room, roomIndex) => (
                        <div key={roomIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="text-gray-800 dark:text-white">{room.name}</h6>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDialog({ 
                                  type: 'editRoom', 
                                  data: { campusIndex, buildingIndex, roomIndex, name: room.name } 
                                })}
                                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit Room"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteRoom(campusIndex, buildingIndex, roomIndex)}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete Room"
                              >
                                <Trash2 size={14} />
                              </button>
                              <button
                                onClick={() => setShowDialog({ type: 'unitId', data: { campusIndex, buildingIndex, roomIndex } })}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                              >
                                <Plus size={14} />
                                Add Unit ID
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {room.unitIds.map((unitId, unitIdIndex) => (
                              <div
                                key={unitIdIndex}
                                draggable
                                onDragStart={() => handleDragStart('unitId', unitIdIndex, [campusIndex, buildingIndex, roomIndex])}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop('unitId', unitIdIndex, [campusIndex, buildingIndex, roomIndex])}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full cursor-move hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                              >
                                <GripVertical size={12} className="text-blue-600 dark:text-blue-500" />
                                <div className="flex gap-1">
                                  {unitIdIndex > 0 && (
                                    <button
                                      onClick={() => moveUnitId(campusIndex, buildingIndex, roomIndex, unitIdIndex, unitIdIndex - 1)}
                                      className="hover:text-blue-600 dark:hover:text-blue-300"
                                      title="Move Up"
                                    >
                                      <ChevronUp size={12} />
                                    </button>
                                  )}
                                  {unitIdIndex < room.unitIds.length - 1 && (
                                    <button
                                      onClick={() => moveUnitId(campusIndex, buildingIndex, roomIndex, unitIdIndex, unitIdIndex + 1)}
                                      className="hover:text-blue-600 dark:hover:text-blue-300"
                                      title="Move Down"
                                    >
                                      <ChevronDown size={12} />
                                    </button>
                                  )}
                                </div>
                                <span>{unitId}</span>
                                <button
                                  onClick={() => setShowDialog({ 
                                    type: 'editUnitId', 
                                    data: { campusIndex, buildingIndex, roomIndex, unitIdIndex, unitId } 
                                  })}
                                  className="hover:text-blue-600 dark:hover:text-blue-300"
                                  title="Edit"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => deleteUnitId(campusIndex, buildingIndex, roomIndex, unitIdIndex)}
                                  className="hover:text-red-600 dark:hover:text-red-400"
                                  title="Delete"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

            {/* Issue Types Configuration */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg border-t border-gray-200 dark:border-gray-700 ${!editMode ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-gray-800 dark:text-white">Issue Types Configuration</h3>
          <button
            onClick={() => setShowDialog({ type: 'issueType' })}
            disabled={!editMode}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Add Issue Type
          </button>
        </div>

        <div className="p-6 space-y-4">
          {formConfig.issueTypes.map((issueType, issueTypeIndex) => (
            <div 
              key={issueTypeIndex} 
              draggable
              onDragStart={() => handleDragStart('issueType', issueTypeIndex)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('issueType', issueTypeIndex)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-move hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="text-gray-400" size={20} />
                  <h4 className="text-gray-800 dark:text-white">{issueType.name}</h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDialog({ 
                      type: 'editIssueType', 
                      data: { issueTypeIndex, name: issueType.name } 
                    })}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Edit Issue Type"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteIssueType(issueTypeIndex)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Issue Type"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setShowDialog({ type: 'subtype', data: { issueTypeIndex } })}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    <Plus size={16} />
                    Add Subtype
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {issueType.subtypes.map((subtype, subtypeIndex) => (
                  <div
                    key={subtypeIndex}
                    draggable
                    onDragStart={() => handleDragStart('subtype', subtypeIndex, [issueTypeIndex])}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop('subtype', subtypeIndex, [issueTypeIndex])}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full cursor-move hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <GripVertical size={12} className="text-green-600 dark:text-green-500" />
                    <div className="flex gap-1">
                      {subtypeIndex > 0 && (
                        <button
                          onClick={() => moveSubtype(issueTypeIndex, subtypeIndex, subtypeIndex - 1)}
                          className="hover:text-green-600 dark:hover:text-green-300"
                          title="Move Up"
                        >
                          <ChevronUp size={12} />
                        </button>
                      )}
                      {subtypeIndex < issueType.subtypes.length - 1 && (
                        <button
                          onClick={() => moveSubtype(issueTypeIndex, subtypeIndex, subtypeIndex + 1)}
                          className="hover:text-green-600 dark:hover:text-green-300"
                          title="Move Down"
                        >
                          <ChevronDown size={12} />
                        </button>
                      )}
                    </div>
                    <span>{subtype}</span>
                    {subtype !== 'Others' && (
                      <>
                        <button
                          onClick={() => setShowDialog({ 
                            type: 'editSubtype', 
                            data: { issueTypeIndex, subtypeIndex, subtype } 
                          })}
                          className="hover:text-green-600 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteSubtype(issueTypeIndex, subtypeIndex)}
                          className="hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
          </div>
          )}

        {/* Preview Tab Content */}
        {activeTab === 'preview' && (
          <div className="p-6 space-y-6">
            {/* Current Form Preview */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h4 className="text-gray-800 dark:text-white mb-1 font-semibold">Current Form Preview</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">How the Report Issue form appears to users right now</p>
              </div>
              {renderFormPreview(originalConfig)}
            </div>

            {/* Preview After Changes */}
            {editMode && JSON.stringify(formConfig) !== JSON.stringify(originalConfig) && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h4 className="text-gray-800 dark:text-white mb-0 font-semibold">Preview After Changes</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">This is how the form will look after you save your changes</p>
                </div>
                {renderFormPreview(formConfig)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {showDialog && (
        <>
          {showDialog.type === 'campus' && (
            <FormDialog
              title="Add Campus"
              fields={[{ name: 'name', label: 'Campus Name', type: 'text', required: true }]}
              onSubmit={addCampus}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editCampus' && (
            <FormDialog
              title="Edit Campus"
              fields={[{ name: 'name', label: 'Campus Name', type: 'text', required: true }]}
              onSubmit={(data) => editCampus(showDialog.data.campusIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'building' && (
            <FormDialog
              title="Add Building"
              fields={[{ name: 'name', label: 'Building Name', type: 'text', required: true }]}
              onSubmit={(data) => addBuilding(showDialog.data.campusIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editBuilding' && (
            <FormDialog
              title="Edit Building"
              fields={[{ name: 'name', label: 'Building Name', type: 'text', required: true }]}
              onSubmit={(data) => editBuilding(showDialog.data.campusIndex, showDialog.data.buildingIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'room' && (
            <FormDialog
              title="Add Room"
              fields={[{ name: 'name', label: 'Room Name', type: 'text', required: true }]}
              onSubmit={(data) => addRoom(showDialog.data.campusIndex, showDialog.data.buildingIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editRoom' && (
            <FormDialog
              title="Edit Room"
              fields={[{ name: 'name', label: 'Room Name', type: 'text', required: true }]}
              onSubmit={(data) => editRoom(showDialog.data.campusIndex, showDialog.data.buildingIndex, showDialog.data.roomIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'unitId' && (
            <FormDialog
              title="Add Unit ID"
              fields={[{ name: 'unitId', label: 'Unit ID', type: 'text', required: true, placeholder: 'e.g., CL 201-01' }]}
              onSubmit={(data) => addUnitId(showDialog.data.campusIndex, showDialog.data.buildingIndex, showDialog.data.roomIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editUnitId' && (
            <FormDialog
              title="Edit Unit ID"
              fields={[{ name: 'unitId', label: 'Unit ID', type: 'text', required: true }]}
              onSubmit={(data) => editUnitId(showDialog.data.campusIndex, showDialog.data.buildingIndex, showDialog.data.roomIndex, showDialog.data.unitIdIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'issueType' && (
            <FormDialog
              title="Add Issue Type"
              fields={[{ name: 'name', label: 'Issue Type Name', type: 'text', required: true }]}
              onSubmit={addIssueType}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editIssueType' && (
            <FormDialog
              title="Edit Issue Type"
              fields={[{ name: 'name', label: 'Issue Type Name', type: 'text', required: true }]}
              onSubmit={(data) => editIssueType(showDialog.data.issueTypeIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'subtype' && (
            <FormDialog
              title="Add Subtype"
              fields={[{ name: 'subtype', label: 'Subtype', type: 'text', required: true }]}
              onSubmit={(data) => addSubtype(showDialog.data.issueTypeIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
          {showDialog.type === 'editSubtype' && (
            <FormDialog
              title="Edit Subtype"
              fields={[{ name: 'subtype', label: 'Subtype', type: 'text', required: true }]}
              onSubmit={(data) => editSubtype(showDialog.data.issueTypeIndex, showDialog.data.subtypeIndex, data)}
              onCancel={() => setShowDialog(null)}
            />
          )}
        </>
      )}

      {/* Save Confirmation Dialog */}
      {showSaveConfirm && (
        <ConfirmDialog
          title="Save Changes"
          message="Are you sure you want to save these changes to the form configuration? This will update the form options for all users."
          confirmText="Save Changes"
          cancelText="Discard Changes"
          onConfirm={confirmSave}
          onCancel={() => {
            setShowSaveConfirm(false);
            setFormConfig(originalConfig);
            setEditMode(false);
            setHasChanges(false);
          }}
          type="warning"
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast
          message="Form configuration saved successfully!"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
      </>
      )}
    </div>
  );
};
