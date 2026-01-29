/**
 * OcrScannerPage
 *
 * Main page for the prescription OCR scanner feature.
 * Implements a state machine flow: capture → preview → processing → results
 */

import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '~lib/utils';
import type { ScannerStep, ExtractedMedicine } from '~features/ocr/types';
import {
  useCamera,
  useImageUpload,
  useOCRExtraction,
} from '~features/ocr/hooks';
import {
  CameraCapture,
  ImagePreview,
  ExtractionResults,
} from '~features/ocr/components';
import { useSearchStore } from '~stores/useSearchStore';

const OcrScannerPage: FC = () => {
  const navigate = useNavigate();
  const { setQuery } = useSearchStore();

  // Current step in the scanner flow
  const [step, setStep] = useState<ScannerStep>('capture');
  // Captured/uploaded image data URL
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // Camera hook
  const {
    videoRef,
    state: cameraState,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    toggleFlash,
  } = useCamera();

  // Image upload hook
  const {
    inputRef,
    state: uploadState,
    openFilePicker,
    handleFileSelect,
    reset: resetUpload,
  } = useImageUpload();

  // OCR extraction hook
  const {
    extract,
    data: ocrResult,
    isLoading: isExtracting,
    error: extractionError,
    reset: resetExtraction,
    toggleMedicineSelection,
    updateMedicine,
    addManualMedicine,
    removeMedicine,
  } = useOCRExtraction();

  /** Handle photo capture from camera */
  const handleCapture = useCallback(() => {
    const photo = capturePhoto();
    if (photo) {
      setImageDataUrl(photo);
      stopCamera();
      setStep('preview');
    }
  }, [capturePhoto, stopCamera]);

  /** Handle file upload */
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataUrl = await handleFileSelect(e);
    if (dataUrl) {
      setImageDataUrl(dataUrl);
      stopCamera();
      setStep('preview');
    }
  }, [handleFileSelect, stopCamera]);

  /** Confirm image and start OCR */
  const handleConfirmImage = useCallback(() => {
    if (imageDataUrl) {
      setStep('processing');
      extract(imageDataUrl, {
        onSuccess: () => {
          setStep('results');
        },
        onError: () => {
          setStep('error');
        },
      });
    }
  }, [imageDataUrl, extract]);

  /** Retake photo / go back to capture */
  const handleRetake = useCallback(() => {
    setImageDataUrl(null);
    resetExtraction();
    resetUpload();
    setStep('capture');
  }, [resetExtraction, resetUpload]);

  /** Search for selected medicines */
  const handleSearchMedicines = useCallback((medicines: ExtractedMedicine[]) => {
    // Build search query from medicine names
    const searchTerms = medicines
      .map(m => m.normalizedName ?? m.rawText)
      .filter(Boolean)
      .join(', ');
    
    // Set search query and navigate to home/search
    setQuery(searchTerms);
    navigate('/?search=' + encodeURIComponent(searchTerms));
  }, [setQuery, navigate]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-[#254643] bg-background-dark px-4 md:px-6 py-4 z-20">
        <div className="flex items-center gap-4 text-white">
          <Link
            to="/"
            className="flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-white text-lg md:text-xl font-bold tracking-tight">
              Curio{' '}
              <span className="text-primary font-light text-sm opacity-80">
                | Reseta Reader
              </span>
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col md:flex-row h-full overflow-hidden">
        {/* Camera/Preview Area */}
        <div className="relative flex-1 h-full">
          {step === 'capture' && (
            <CameraCapture
              videoRef={videoRef}
              cameraState={cameraState}
              onStartCamera={startCamera}
              onCapture={handleCapture}
              onToggleFacingMode={toggleFacingMode}
              onToggleFlash={toggleFlash}
              onUploadClick={openFilePicker}
            />
          )}

          {(step === 'preview' || step === 'processing') && imageDataUrl && (
            <ImagePreview
              imageDataUrl={imageDataUrl}
              isProcessing={step === 'processing' || isExtracting}
              onConfirm={handleConfirmImage}
              onRetake={handleRetake}
            />
          )}

          {step === 'results' && !ocrResult && (
            <div className="flex-1 flex items-center justify-center bg-background-dark">
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
                  document_scanner
                </span>
                <p className="text-white/60">Processing complete</p>
              </div>
            </div>
          )}

          {/* Show uploaded/captured image when viewing results */}
          {step === 'results' && ocrResult && imageDataUrl && (
            <div className="flex-1 flex items-center justify-center bg-background-dark p-4 md:p-8">
              <div className="relative w-full max-w-lg">
                <img
                  src={imageDataUrl}
                  alt="Scanned prescription"
                  className="w-full h-auto rounded-xl shadow-2xl border border-white/10 object-contain max-h-[70vh]"
                />
                {/* Image overlay label */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 text-sm font-medium">
                    Scanned Image
                  </span>
                  <button
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Rescan
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="flex-1 flex items-center justify-center bg-background-dark">
              <div className="text-center p-6 max-w-sm">
                <span className="material-symbols-outlined text-5xl text-danger mb-3">
                  error
                </span>
                <p className="text-white font-medium mb-2">Extraction Failed</p>
                <p className="text-white/60 text-sm mb-4">
                  {extractionError?.message ?? 'Unable to process the image. Please try again.'}
                </p>
                <button
                  onClick={handleRetake}
                  className={cn(
                    'px-6 py-3 rounded-xl',
                    'bg-primary text-white font-bold',
                    'hover:bg-primary-hover transition-colors'
                  )}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Sidebar - Show when we have results */}
        {step === 'results' && ocrResult && (
          <ExtractionResults
            result={ocrResult}
            onToggleSelect={toggleMedicineSelection}
            onUpdateMedicine={updateMedicine}
            onRemoveMedicine={removeMedicine}
            onAddManual={addManualMedicine}
            onSearchMedicines={handleSearchMedicines}
            onRetake={handleRetake}
          />
        )}
      </main>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload progress indicator */}
      {uploadState.isUploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-dark rounded-xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white font-medium">Processing image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrScannerPage;
