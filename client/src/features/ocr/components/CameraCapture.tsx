/**
 * CameraCapture Component
 *
 * Camera viewfinder with capture controls for prescription scanning.
 * Supports camera switching, flash toggle, and file upload fallback.
 */

import type { FC } from 'react';
import { useEffect } from 'react';
import { cn } from '~lib/utils';
import { ScannerFrame } from './ScannerFrame';
import type { CameraState } from '../types';

interface CameraCaptureProps {
  /** Reference to the video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Current camera state */
  cameraState: CameraState;
  /** Start the camera */
  onStartCamera: () => void;
  /** Capture a photo */
  onCapture: () => void;
  /** Toggle camera facing mode */
  onToggleFacingMode: () => void;
  /** Toggle flash */
  onToggleFlash: () => void;
  /** Open file picker as alternative */
  onUploadClick: () => void;
  /** Additional class names */
  className?: string;
}

export const CameraCapture: FC<CameraCaptureProps> = ({
  videoRef,
  cameraState,
  onStartCamera,
  onCapture,
  onToggleFacingMode,
  onToggleFlash,
  onUploadClick,
  className,
}) => {
  // Auto-start camera on mount
  useEffect(() => {
    if (!cameraState.isActive && !cameraState.isLoading && !cameraState.error) {
      onStartCamera();
    }
  }, [cameraState.isActive, cameraState.isLoading, cameraState.error, onStartCamera]);

  return (
    <div className={cn('relative flex-1 bg-black h-full overflow-hidden', className)}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'absolute inset-0 w-full h-full object-cover',
          !cameraState.isActive && 'hidden'
        )}
      />

      {/* Dark Overlay when camera not active */}
      {!cameraState.isActive && (
        <div className="absolute inset-0 bg-background-dark flex items-center justify-center">
          {cameraState.isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 text-sm">Starting camera...</p>
            </div>
          ) : cameraState.error ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center max-w-sm">
              <span className="material-symbols-outlined text-5xl text-danger">
                videocam_off
              </span>
              <p className="text-white/80 text-sm">{cameraState.error}</p>
              <div className="flex gap-3">
                <button
                  onClick={onStartCamera}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onUploadClick}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors"
                >
                  Upload Instead
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onStartCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-5xl text-primary">
                photo_camera
              </span>
              <p className="text-white font-medium">Tap to start camera</p>
            </button>
          )}
        </div>
      )}

      {/* Scanner Frame Overlay */}
      {cameraState.isActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
          {/* Semi-transparent dimming overlay outside the frame */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Clear scan area with scanner frame animation */}
          <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-3xl overflow-hidden z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
            <ScannerFrame isScanning={true} />
          </div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-6">
        {/* Flash Toggle */}
        <button
          onClick={onToggleFlash}
          disabled={!cameraState.isActive}
          className={cn(
            'size-14 rounded-full flex items-center justify-center transition-colors',
            'bg-surface-dark text-white hover:bg-surface-dark/80',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            cameraState.flashEnabled && 'bg-primary text-white'
          )}
          title="Toggle Flash"
        >
          <span className="material-symbols-outlined">
            {cameraState.flashEnabled ? 'flash_on' : 'flash_off'}
          </span>
        </button>

        {/* Capture Button */}
        <button
          onClick={onCapture}
          disabled={!cameraState.isActive}
          className={cn(
            'size-16 rounded-full border-4 border-white bg-transparent',
            'flex items-center justify-center',
            'hover:bg-white/10 active:scale-95 transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Capture"
        >
          <div className="size-12 bg-white rounded-full" />
        </button>

        {/* Camera Switch */}
        <button
          onClick={onToggleFacingMode}
          disabled={!cameraState.isActive}
          className={cn(
            'size-14 rounded-full flex items-center justify-center transition-colors',
            'bg-surface-dark text-white hover:bg-surface-dark/80',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Switch Camera"
        >
          <span className="material-symbols-outlined">cameraswitch</span>
        </button>
      </div>

      {/* Upload Alternative Button (top right) */}
      <button
        onClick={onUploadClick}
        className={cn(
          'absolute top-4 right-4 z-20',
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium',
          'hover:bg-white/20 hover:text-white transition-colors'
        )}
      >
        <span className="material-symbols-outlined text-[20px]">upload_file</span>
        <span className="hidden md:inline">Upload</span>
      </button>
    </div>
  );
};

export default CameraCapture;
