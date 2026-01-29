/**
 * ScannerFrame Component
 *
 * The animated scanner overlay with corner brackets and scanning line.
 * Provides visual guide for positioning the prescription.
 */

import type { FC } from 'react';
import { cn } from '~lib/utils';

interface ScannerFrameProps {
  /** Whether the scanner is actively scanning */
  isScanning?: boolean;
  /** Optional message to display in the frame */
  message?: string;
  /** Additional class names */
  className?: string;
}

export const ScannerFrame: FC<ScannerFrameProps> = ({
  isScanning = true,
  message = 'I-posisyon ang reseta sa loob ng frame',
  className,
}) => {
  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-[6px] border-l-[6px] border-primary rounded-tl-xl" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t-[6px] border-r-[6px] border-primary rounded-tr-xl" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-[6px] border-l-[6px] border-primary rounded-bl-xl" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-[6px] border-r-[6px] border-primary rounded-br-xl" />

      {/* Scanning Line - Animated */}
      {isScanning && (
        <div 
          className={cn(
            'absolute left-4 right-4 h-0.5 bg-primary',
            'shadow-[0_0_15px_3px_rgba(13,236,218,0.6)]',
            'animate-scanner-line'
          )}
          style={{ top: '50%' }}
        >
          <span className="absolute right-0 -top-3 text-primary text-[10px] font-mono bg-black/50 px-1.5 py-0.5 rounded">
            SCANNING...
          </span>
        </div>
      )}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13, 236, 218, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13, 236, 218, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Instruction Toast */}
      {message && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="bg-background-dark/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
            <p className="text-white text-sm md:text-base font-medium text-center whitespace-nowrap">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerFrame;
