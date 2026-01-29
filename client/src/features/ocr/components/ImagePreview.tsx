/**
 * ImagePreview Component
 *
 * Shows the captured/uploaded image for review before OCR processing.
 * Allows user to confirm or retake the photo.
 */

import type { FC } from 'react';
import { cn } from '~lib/utils';

interface ImagePreviewProps {
  /** The image data URL to preview */
  imageDataUrl: string;
  /** Whether OCR processing is in progress */
  isProcessing?: boolean;
  /** Confirm and proceed with OCR */
  onConfirm: () => void;
  /** Retake/reselect the image */
  onRetake: () => void;
  /** Additional class names */
  className?: string;
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  imageDataUrl,
  isProcessing = false,
  onConfirm,
  onRetake,
  className,
}) => {
  return (
    <div className={cn('relative flex-1 bg-black h-full overflow-hidden', className)}>
      {/* Preview Image */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-3xl overflow-hidden bg-background-dark shadow-2xl">
          <img
            src={imageDataUrl}
            alt="Captured prescription"
            className="w-full h-full object-contain"
          />

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-background-dark/80 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Extracting medicines...</p>
                <p className="text-white/60 text-sm mt-1">This may take a few seconds</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isProcessing && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-4 px-4">
          <button
            onClick={onRetake}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl',
              'bg-white/10 backdrop-blur-sm text-white font-medium',
              'hover:bg-white/20 active:scale-95 transition-all'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            <span>Retake</span>
          </button>

          <button
            onClick={onConfirm}
            className={cn(
              'flex items-center gap-2 px-8 py-3 rounded-xl',
              'bg-primary text-white font-bold',
              'hover:bg-primary-hover active:scale-95 transition-all',
              'shadow-lg shadow-primary/30'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            <span>Scan Prescription</span>
          </button>
        </div>
      )}

      {/* Info Text */}
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-center">
        <div className="bg-background-dark/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white/80 text-sm font-medium">
            {isProcessing ? 'Processing...' : 'Review your prescription photo'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
