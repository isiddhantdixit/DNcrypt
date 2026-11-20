import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { DnaHelix } from './DnaHelix';

interface DnaCanvasProps {
  variant?: 'hero' | 'background' | 'compact' | 'side-stage';
  opacity?: number;
  className?: string;
}

export const DnaCanvas: React.FC<DnaCanvasProps> = ({
  variant = 'background',
  opacity = 0.85,
  className = ''
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <svg className="w-80 h-80 text-[#173F35] animate-spin" viewBox="0 0 100 100" style={{ animationDuration: '30s' }}>
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6 6" />
        </svg>
      </div>
    );
  }

  // Camera distance and scale
  const cameraZ = variant === 'side-stage' ? 13 : variant === 'hero' ? 15 : variant === 'compact' ? 12 : 18;
  const helixScale = variant === 'side-stage' ? 1.05 : variant === 'hero' ? 1.0 : variant === 'compact' ? 0.75 : 0.85;
  const speed = variant === 'side-stage' ? 0.38 : 0.25;

  return (
    <div
      className={`pointer-events-none transition-opacity duration-1000 ${
        variant === 'side-stage'
          ? 'relative w-full h-full'
          : 'absolute inset-0 -z-10'
      } ${className}`}
      style={{ opacity }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.6} color="#FCFBF7" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#8FAE91" />
        <pointLight position={[0, 0, 8]} intensity={0.9} color="#DCE8D9" />

        <Suspense fallback={null}>
          <DnaHelix scale={helixScale} speed={speed} />
        </Suspense>
      </Canvas>
    </div>
  );
};
