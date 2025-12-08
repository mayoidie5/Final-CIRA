import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FormConfig } from '../types';
import { DEFAULT_FORM_CONFIG } from '../utils/defaultFormConfig';

const FORM_CONFIG_DOC = 'default';

/**
 * Get form configuration from Firestore
 * Falls back to localStorage if Firestore fails
 */
export const getFormConfig = async (fallbackConfig?: FormConfig): Promise<FormConfig> => {
  const config = fallbackConfig || DEFAULT_FORM_CONFIG;
  try {
    console.log('📋 Fetching form configuration from Firestore...');
    
    const docRef = doc(db, 'formConfigs', FORM_CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('✅ Form configuration loaded from Firestore');
      return docSnap.data() as FormConfig;
    } else {
      console.log('ℹ️ Form configuration not found in Firestore, creating default...');
      // Create default config if it doesn't exist
      await setFormConfig(config);
      return config;
    }
  } catch (error) {
    console.error('❌ Error fetching form config from Firestore:', error);
    
    // Fallback to localStorage
    const stored = localStorage.getItem('formConfig');
    if (stored) {
      console.log('ℹ️ Using form configuration from localStorage');
      return JSON.parse(stored);
    }
    
    console.log('ℹ️ Using fallback form configuration');
    return config;
  }
};

/**
 * Save form configuration to Firestore
 */
export const setFormConfig = async (config: FormConfig): Promise<void> => {
  try {
    console.log('💾 Saving form configuration to Firestore...');
    
    const docRef = doc(db, 'formConfigs', FORM_CONFIG_DOC);
    await setDoc(docRef, config);
    
    // Also save to localStorage for offline access
    localStorage.setItem('formConfig', JSON.stringify(config));
    
    console.log('✅ Form configuration saved');
  } catch (error) {
    console.error('❌ Error saving form config:', error);
    throw error;
  }
};

/**
 * Update a specific field in form configuration
 */
export const updateFormConfigField = async (
  field: keyof FormConfig,
  value: any
): Promise<void> => {
  try {
    console.log(`💾 Updating form configuration field: ${field}`);
    
    const docRef = doc(db, 'formConfigs', FORM_CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentConfig = docSnap.data() as FormConfig;
      const updatedConfig = { ...currentConfig, [field]: value };
      await setFormConfig(updatedConfig);
    }
  } catch (error) {
    console.error(`❌ Error updating form config field ${field}:`, error);
    throw error;
  }
};

/**
 * Get all form configuration documents
 */
export const getAllFormConfigs = async (): Promise<FormConfig[]> => {
  try {
    console.log('📋 Fetching all form configurations...');
    
    const querySnapshot = await getDocs(collection(db, 'formConfigs'));
    const configs = querySnapshot.docs.map(doc => doc.data() as FormConfig);
    
    console.log(`✅ Loaded ${configs.length} form configurations`);
    return configs;
  } catch (error) {
    console.error('❌ Error fetching form configs:', error);
    return [];
  }
};
