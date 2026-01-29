/**
 * useCamera Hook
 *
 * Manages camera stream for prescription scanning.
 * Supports front/back camera switching and photo capture.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CameraFacingMode, CameraState } from '../types';

interface UseCameraOptions {
  /** Initial facing mode - defaults to 'environment' (back camera) for prescriptions */
  initialFacingMode?: CameraFacingMode;
  /** Video constraints override */
  videoConstraints?: MediaTrackConstraints;
}

interface UseCameraReturn {
  /** Reference to attach to the video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Current camera state */
  state: CameraState;
  /** Start the camera stream */
  startCamera: () => Promise<void>;
  /** Stop the camera stream */
  stopCamera: () => void;
  /** Switch between front and back camera */
  toggleFacingMode: () => void;
  /** Capture a photo from the current video frame */
  capturePhoto: () => string | null;
  /** Toggle flash (if supported) */
  toggleFlash: () => Promise<void>;
}

const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  aspectRatio: { ideal: 4 / 3 },
};

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    initialFacingMode = 'environment',
    videoConstraints = DEFAULT_VIDEO_CONSTRAINTS,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    facingMode: initialFacingMode,
    flashEnabled: false,
    error: null,
  });

  /** Start the camera stream */
  const startCamera = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...videoConstraints,
          facingMode: state.facingMode,
        },
        audio: false,
      });

      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      
      // Provide user-friendly error messages
      let friendlyMessage = errorMessage;
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        friendlyMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        friendlyMessage = 'No camera found on this device.';
      } else if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
        friendlyMessage = 'Camera is in use by another application.';
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        error: friendlyMessage,
      }));
    }
  }, [state.facingMode, videoConstraints]);

  /** Stop the camera stream */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      isLoading: false,
    }));
  }, []);

  /** Switch between front and back camera */
  const toggleFacingMode = useCallback(() => {
    const newFacingMode = state.facingMode === 'environment' ? 'user' : 'environment';
    setState(prev => ({ ...prev, facingMode: newFacingMode }));
    
    // Restart camera with new facing mode if currently active
    if (state.isActive) {
      stopCamera();
      // Small delay before restarting with new facing mode
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [state.facingMode, state.isActive, stopCamera, startCamera]);

  /** Capture a photo from the current video frame */
  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !state.isActive) {
      return null;
    }

    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Return as data URL (JPEG for smaller file size)
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [state.isActive]);

  /** Toggle flash (if supported) */
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      // Check if torch is supported
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (!capabilities.torch) {
        console.warn('Flash/torch is not supported on this device');
        return;
      }

      const newFlashState = !state.flashEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as MediaTrackConstraintSet],
      });

      setState(prev => ({ ...prev, flashEnabled: newFlashState }));
    } catch (error) {
      console.error('Failed to toggle flash:', error);
    }
  }, [state.flashEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    state,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
    toggleFlash,
  };
}

export type { UseCameraReturn };
