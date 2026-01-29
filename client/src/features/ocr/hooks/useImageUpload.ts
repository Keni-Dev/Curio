/**
 * useImageUpload Hook
 *
 * Handles image file selection and upload to Supabase storage.
 * For MVP: We'll process images directly without uploading to save time.
 */

import { useState, useCallback, useRef } from 'react';
import type { UploadState } from '../types';

interface UseImageUploadOptions {
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number;
  /** Accepted file types */
  acceptedTypes?: string[];
}

interface UseImageUploadReturn {
  /** Reference to attach to the file input element */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Current upload state */
  state: UploadState;
  /** Trigger the file picker dialog */
  openFilePicker: () => void;
  /** Handle file selection from input */
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  /** Convert a data URL to base64 (strips the prefix) */
  dataUrlToBase64: (dataUrl: string) => string;
  /** Reset the upload state */
  reset: () => void;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  } = options;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  /** Open the file picker dialog */
  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /** Convert file to data URL */
  const fileToDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  /** Convert a data URL to base64 (strips the prefix) */
  const dataUrlToBase64 = useCallback((dataUrl: string): string => {
    const base64Index = dataUrl.indexOf('base64,');
    if (base64Index === -1) {
      return dataUrl;
    }
    return dataUrl.slice(base64Index + 7);
  }, []);

  /** Handle file selection */
  const handleFileSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<string | null> => {
    const file = event.target.files?.[0];
    if (!file) {
      return null;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setState(prev => ({
        ...prev,
        error: `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`,
      }));
      return null;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      setState(prev => ({
        ...prev,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      }));
      return null;
    }

    setState({ isUploading: true, progress: 0, error: null });

    try {
      // Simulate progress for better UX
      setState(prev => ({ ...prev, progress: 30 }));
      
      // Convert to data URL
      const dataUrl = await fileToDataUrl(file);
      
      setState(prev => ({ ...prev, progress: 100, isUploading: false }));
      
      // Reset the input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      return dataUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
      return null;
    }
  }, [acceptedTypes, maxFileSize, fileToDataUrl]);

  /** Reset the upload state */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return {
    inputRef,
    state,
    openFilePicker,
    handleFileSelect,
    dataUrlToBase64,
    reset,
  };
}

export type { UseImageUploadReturn };
