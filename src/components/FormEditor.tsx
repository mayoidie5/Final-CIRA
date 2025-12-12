import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { FormConfig } from '../types';
import { getFormConfig, setFormConfig as saveFormConfig } from '../services/formConfigService';
import { DEFAULT_FORM_CONFIG } from '../utils/defaultFormConfig';
import { FormDialog } from './FormDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { SuccessToast } from './SuccessToast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export const FormEditor: React.FC = () => {
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDialog, setShowDialog] = useState<{ type: string; data?: any } | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: string; index: number; parentIndices?: number[] } | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCampuses, setExpandedCampuses] = useState<Set<number>>(new Set());
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [expandedIssueTypes, setExpandedIssueTypes] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  
  // Preview form state
  const [previewCampus, setPreviewCampus] = useState<string>('');
  const [previewBuilding, setPreviewBuilding] = useState<string>('');
  const [previewRoom, setPreviewRoom] = useState<string>('');
  const [previewUnitId, setPreviewUnitId] = useState<string>('');
  const [previewIssueType, setPreviewIssueType] = useState<string>('');
  const [previewIssueSubtype, setPreviewIssueSubtype] = useState<string>('');

  useEffect(() => {
    // Load form config from Firestore
    const loadFormConfig = async () => {
      try {
        setIsLoading(true);
        const config = await getFormConfig(DEFAULT_FORM_CONFIG);
        setFormConfig(config);
        setOriginalConfig(config);
      } catch (error) {
        console.error('Error loading form config:', error);
        // Use default config on error
        setFormConfig(DEFAULT_FORM_CONFIG);
        setOriginalConfig(DEFAULT_FORM_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormConfig();
  }, []);

  useEffect(() => {
    // Check if config has changed from original
    setHasChanges(JSON.stringify(formConfig) !== JSON.stringify(originalConfig));
  }, [formConfig, originalConfig]);

  const saveConfig = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    try {
      await saveFormConfig(formConfig);
      setOriginalConfig(formConfig);
      setHasChanges(false);
      setShowSaveConfirm(false);
      setShowSuccessToast(true);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const cancelEdit = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setFormConfig(originalConfig);
        setEditMode(false);
        setHasChanges(false);
      }
    } else {
      setEditMode(false);
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

  // Toggle campus expansion
  const toggleCampusExpanded = (campusIndex: number) => {
    const newExpanded = new Set(expandedCampuses);
    if (newExpanded.has(campusIndex)) {
      newExpanded.delete(campusIndex);
    } else {
      newExpanded.add(campusIndex);
    }
    setExpandedCampuses(newExpanded);
  };

  const isCampusExpanded = (campusIndex: number) => {
    return expandedCampuses.has(campusIndex);
  };

  // Toggle building expansion
  const toggleBuildingExpanded = (campusIndex: number, buildingIndex: number) => {
    const key = `${campusIndex}-${buildingIndex}`;
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedBuildings(newExpanded);
  };

  const isBuildingExpanded = (campusIndex: number, buildingIndex: number) => {
    return expandedBuildings.has(`${campusIndex}-${buildingIndex}`);
  };

  // Toggle issue type expansion
  const toggleIssueTypeExpanded = (issueTypeIndex: number) => {
    const newExpanded = new Set(expandedIssueTypes);
    if (newExpanded.has(issueTypeIndex)) {
      newExpanded.delete(issueTypeIndex);
    } else {
      newExpanded.add(issueTypeIndex);
    }
    setExpandedIssueTypes(newExpanded);
  };

  const isIssueTypeExpanded = (issueTypeIndex: number) => {
    return expandedIssueTypes.has(issueTypeIndex);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-gray-800 dark:text-white mb-2">Form Editor</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Configure form options for issue reporting</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
          >
            {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
            <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            <span className="sm:hidden">{showPreview ? 'Hide' : 'Show'}</span>
          </button>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Edit2 size={20} />
              Edit Form
            </button>
          ) : (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
              {hasChanges && (
                <button
                  onClick={saveConfig}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  Save Configuration
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabbed Configuration Interface */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 ${!editMode ? 'opacity-60 pointer-events-none' : ''}`}>
        <Tabs defaultValue="campus" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="campus"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              Campus & Location
            </TabsTrigger>
            <TabsTrigger 
              value="issues"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
            >
              Issue Types
            </TabsTrigger>
          </TabsList>

          {/* Campus and Location Configuration Tab */}
          <TabsContent value="campus" className="space-y-0">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-gray-800 dark:text-white">Campus & Location Configuration</h3>
              <button
                onClick={() => setShowDialog({ type: 'campus' })}
                disabled={!editMode}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus size={18} />
                Add Campus
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {formConfig.campuses.map((campus, campusIndex) => (
            <div 
              key={campusIndex} 
              draggable
              onDragStart={() => handleDragStart('campus', campusIndex)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('campus', campusIndex)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 cursor-move hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1 hover:opacity-70 transition-opacity"
                  onClick={() => toggleCampusExpanded(campusIndex)}
                >
                  <GripVertical className="text-gray-400" size={20} />
                  {isCampusExpanded(campusIndex) ? (
                    <ChevronDown className="text-gray-600 dark:text-gray-400" size={20} />
                  ) : (
                    <ChevronUp className="text-gray-600 dark:text-gray-400" size={20} />
                  )}
                  <h4 className="text-gray-800 dark:text-white font-semibold">{campus.name}</h4>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors flex-1 sm:flex-none justify-center"
                  >
                    <Plus size={16} />
                    <span className="sm:inline">Add Building</span>
                  </button>
                </div>
              </div>

              {isCampusExpanded(campusIndex) && (
                <div className="space-y-4 ml-0 sm:ml-6">
                  {campus.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div 
                        className="flex items-center gap-2 cursor-pointer flex-1 hover:opacity-70 transition-opacity"
                        onClick={() => toggleBuildingExpanded(campusIndex, buildingIndex)}
                      >
                        {isBuildingExpanded(campusIndex, buildingIndex) ? (
                          <ChevronDown className="text-gray-600 dark:text-gray-400" size={18} />
                        ) : (
                          <ChevronUp className="text-gray-600 dark:text-gray-400" size={18} />
                        )}
                        <h5 className="text-gray-800 dark:text-white font-semibold">{building.name}</h5>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors flex-1 sm:flex-none justify-center"
                        >
                          <Plus size={16} />
                          <span className="sm:inline">Add Room</span>
                        </button>
                      </div>
                    </div>

                    {isBuildingExpanded(campusIndex, buildingIndex) && (
                      <div className="space-y-3 ml-0 sm:ml-6">
                      {building.rooms.map((room, roomIndex) => (
                        <div key={roomIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                            <h6 className="text-gray-800 dark:text-white">{room.name}</h6>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm rounded transition-colors flex-1 sm:flex-none justify-center"
                              >
                                <Plus size={14} />
                                <span>Add Unit ID</span>
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
                    )}
                  </div>
                ))}
                </div>
              )}
            </div>
          ))}
            </div>
          </TabsContent>

          {/* Issue Types Configuration Tab */}
          <TabsContent value="issues" className="space-y-0">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-gray-800 dark:text-white">Issue Types Configuration</h3>
              <button
                onClick={() => setShowDialog({ type: 'issueType' })}
                disabled={!editMode}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus size={18} />
                Add Issue Type
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {formConfig.issueTypes.map((issueType, issueTypeIndex) => (
                <div 
                  key={issueTypeIndex} 
                  draggable
                  onDragStart={() => handleDragStart('issueType', issueTypeIndex)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop('issueType', issueTypeIndex)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 cursor-move hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div 
                      className="flex items-center gap-2 cursor-pointer flex-1 hover:opacity-70 transition-opacity"
                      onClick={() => toggleIssueTypeExpanded(issueTypeIndex)}
                    >
                      <GripVertical className="text-gray-400" size={20} />
                      {isIssueTypeExpanded(issueTypeIndex) ? (
                        <ChevronDown className="text-gray-600 dark:text-gray-400" size={20} />
                      ) : (
                        <ChevronUp className="text-gray-600 dark:text-gray-400" size={20} />
                      )}
                      <h4 className="text-gray-800 dark:text-white font-semibold">{issueType.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors flex-1 sm:flex-none justify-center"
                      >
                        <Plus size={16} />
                        <span className="sm:inline">Add Subtype</span>
                      </button>
                    </div>
                  </div>

                  {isIssueTypeExpanded(issueTypeIndex) && (
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
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Preview */}
      {showPreview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-gray-800 dark:text-white font-semibold">Form Preview</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Interactive preview - select options to see dependent fields update</p>
            </div>
            <button
              onClick={() => {
                setPreviewCampus('');
                setPreviewBuilding('');
                setPreviewRoom('');
                setPreviewUnitId('');
                setPreviewIssueType('');
                setPreviewIssueSubtype('');
              }}
              className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Campus Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campus *
              </label>
              <select 
                value={previewCampus} 
                onChange={(e) => {
                  setPreviewCampus(e.target.value);
                  setPreviewBuilding('');
                  setPreviewRoom('');
                  setPreviewUnitId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a campus</option>
                {formConfig.campuses.map((campus, idx) => (
                  <option key={idx} value={campus.name}>{campus.name}</option>
                ))}
              </select>
            </div>

            {/* Building Selection */}
            {previewCampus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Building *
                </label>
                <select 
                  value={previewBuilding} 
                  onChange={(e) => {
                    setPreviewBuilding(e.target.value);
                    setPreviewRoom('');
                    setPreviewUnitId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a building</option>
                  {formConfig.campuses.find(c => c.name === previewCampus)?.buildings.map((building, idx) => (
                    <option key={idx} value={building.name}>{building.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Room Selection */}
            {previewBuilding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room *
                </label>
                <select 
                  value={previewRoom} 
                  onChange={(e) => {
                    setPreviewRoom(e.target.value);
                    setPreviewUnitId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room</option>
                  {formConfig.campuses.find(c => c.name === previewCampus)?.buildings.find(b => b.name === previewBuilding)?.rooms.map((room, idx) => (
                    <option key={idx} value={room.name}>{room.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Unit ID Selection */}
            {previewRoom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit ID *
                </label>
                <select 
                  value={previewUnitId} 
                  onChange={(e) => setPreviewUnitId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a unit ID</option>
                  {formConfig.campuses.find(c => c.name === previewCampus)?.buildings.find(b => b.name === previewBuilding)?.rooms.find(r => r.name === previewRoom)?.unitIds.map((unitId, idx) => (
                    <option key={idx} value={unitId}>{unitId}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Issue Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Type *
              </label>
              <select 
                value={previewIssueType} 
                onChange={(e) => {
                  setPreviewIssueType(e.target.value);
                  setPreviewIssueSubtype('');
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an issue type</option>
                {formConfig.issueTypes.map((issueType, idx) => (
                  <option key={idx} value={issueType.name}>{issueType.name}</option>
                ))}
              </select>
            </div>

            {/* Issue Subtype Selection */}
            {previewIssueType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Subtype *
                </label>
                <select 
                  value={previewIssueSubtype} 
                  onChange={(e) => setPreviewIssueSubtype(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a subtype</option>
                  {formConfig.issueTypes.find(it => it.name === previewIssueType)?.subtypes.map((subtype, idx) => (
                    <option key={idx} value={subtype}>{subtype}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Summary */}
            {(previewCampus || previewIssueType) && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Currently Selected</h4>
                <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  {previewCampus && <p><strong>Campus:</strong> {previewCampus}</p>}
                  {previewBuilding && <p><strong>Building:</strong> {previewBuilding}</p>}
                  {previewRoom && <p><strong>Room:</strong> {previewRoom}</p>}
                  {previewUnitId && <p><strong>Unit ID:</strong> {previewUnitId}</p>}
                  {previewIssueType && <p><strong>Issue Type:</strong> {previewIssueType}</p>}
                  {previewIssueSubtype && <p><strong>Issue Subtype:</strong> {previewIssueSubtype}</p>}
                </div>
              </div>
            )}

            {/* Configuration Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Configuration Summary</h4>
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Total Campuses:</strong> {formConfig.campuses.length}</p>
                <p><strong>Total Buildings:</strong> {formConfig.campuses.reduce((sum, c) => sum + c.buildings.length, 0)}</p>
                <p><strong>Total Rooms:</strong> {formConfig.campuses.reduce((sum, c) => sum + c.buildings.reduce((bs, b) => bs + b.rooms.length, 0), 0)}</p>
                <p><strong>Total Issue Types:</strong> {formConfig.issueTypes.length}</p>
                <p><strong>Total Subtypes:</strong> {formConfig.issueTypes.reduce((sum, it) => sum + it.subtypes.length, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          title="Save Configuration"
          message="Are you sure you want to save the form configuration? This will update the form options for all users."
          confirmText="Save"
          onConfirm={confirmSave}
          onCancel={() => setShowSaveConfirm(false)}
          type="info"
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast
          message="Form configuration saved successfully!"
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </div>
  );
};
