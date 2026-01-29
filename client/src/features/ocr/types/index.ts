/**
 * OCR Scanner Types
 *
 * Type definitions for the prescription OCR scanner feature.
 */

/** Steps in the scanner state machine */
export type ScannerStep = 'capture' | 'preview' | 'processing' | 'results' | 'error';

/** Confidence level for extracted medicines */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** A medicine extracted from the prescription via OCR */
export interface ExtractedMedicine {
  /** Unique identifier for this extraction */
  id: string;
  /** Raw text extracted from the prescription */
  rawText: string;
  /** Normalized medicine name (after fuzzy matching) */
  normalizedName: string | null;
  /** Confidence score from OCR (0-1) */
  confidence: number;
  /** Human-readable confidence level */
  confidenceLevel: ConfidenceLevel;
  /** Dosage if detected (e.g., "500mg") */
  dosage: string | null;
  /** Whether the user has selected this item for search */
  isSelected: boolean;
  /** Whether the user has manually edited this item */
  isEdited: boolean;
}

/** Response from the ML service OCR endpoint */
export interface OCRServiceResponse {
  /** Raw extracted text from the image */
  extractedText: string;
  /** Classification label ("medical prescription" or "not medical prescription") */
  predictedLabel: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/** Processed OCR result for the frontend */
export interface OCRResult {
  /** Raw text extracted from the prescription */
  rawText: string;
  /** Whether the image was classified as a medical prescription */
  isMedicalPrescription: boolean;
  /** List of extracted medicines */
  medicines: ExtractedMedicine[];
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Timestamp of extraction */
  extractedAt: Date;
}

/** Request payload for OCR extraction */
export interface OCRExtractRequest {
  /** Base64-encoded image data (without the data URL prefix) */
  imageBase64: string;
}

/** Camera facing mode for mobile devices */
export type CameraFacingMode = 'user' | 'environment';

/** Camera stream state */
export interface CameraState {
  /** Whether the camera is currently active */
  isActive: boolean;
  /** Whether the camera is loading/initializing */
  isLoading: boolean;
  /** Current facing mode */
  facingMode: CameraFacingMode;
  /** Whether flash is enabled (if supported) */
  flashEnabled: boolean;
  /** Error message if camera access failed */
  error: string | null;
}

/** Image upload state */
export interface UploadState {
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload progress (0-100) */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
}

/**
 * Determines confidence level from a numeric score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.9) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

/**
 * Generates a unique ID for extracted medicines
 */
export function generateExtractedMedicineId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
