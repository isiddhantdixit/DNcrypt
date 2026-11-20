import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  Split,
  Eye,
  Info,
  Layers,
  Binary,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type SimulationMode = 'encoding' | 'inspect' | 'mutation' | 'unzip';

interface BasePairData {
  index: number;
  base1: 'A' | 'C' | 'G' | 'T';
  base2: 'A' | 'C' | 'G' | 'T';
  bits: string;
  byteIndex: number;
  isMutated: boolean;
  originalBase1?: 'A' | 'C' | 'G' | 'T';
}

const BASE_META: Record<string, {
  name: string;
  complement: 'A' | 'C' | 'G' | 'T';
  color: string;
  type: 'Purine' | 'Pyrimidine';
  hBonds: number;
  bits: string;
}> = {
  A: { name: 'Adenine', complement: 'T', color: '#173F35', type: 'Purine', hBonds: 2, bits: '00' },
  C: { name: 'Cytosine', complement: 'G', color: '#2A6F5E', type: 'Pyrimidine', hBonds: 3, bits: '01' },
  G: { name: 'Guanine', complement: 'C', color: '#8FAE91', type: 'Purine', hBonds: 3, bits: '10' },
  T: { name: 'Thymine', complement: 'A', color: '#C89B6D', type: 'Pyrimidine', hBonds: 2, bits: '11' },
};

// 3D Scene Inside the Canvas
interface SceneProps {
  pairs: BasePairData[];
  activeStep: number;
  mode: SimulationMode;
  unzipProgress: number;
  rotationSpeed: number;
  selectedRung: number | null;
  onSelectRung: (index: number) => void;
  hoveredRung: number | null;
  onHoverRung: (index: number | null) => void;
}

const Dna3DModel: React.FC<SceneProps> = ({
  pairs,
  activeStep,
  mode,
  unzipProgress,
  rotationSpeed,
  selectedRung,
  onSelectRung,
  hoveredRung,
  onHoverRung,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Compute 3D positions for the double helix
  const helixData = useMemo(() => {
    const radius = 2.4;
    const height = 22;
    const turns = 3.0;
    const num = Math.max(pairs.length, 16);

    return pairs.map((pair, i) => {
      const t = i / (num - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      // Base strand 1 position
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      // Base strand 2 position (antiparallel, phase shifted by PI)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Unzip separation offset when in unzip mode
      const unzipOffset = unzipProgress * 2.8;
      const finalX1 = x1 - Math.cos(angle) * unzipOffset;
      const finalZ1 = z1 - Math.sin(angle) * unzipOffset;
      const finalX2 = x2 + Math.cos(angle) * unzipOffset;
      const finalZ2 = z2 + Math.sin(angle) * unzipOffset;

      const midX = (finalX1 + finalX2) / 2;
      const midZ = (finalZ1 + finalZ2) / 2;
      const dist = Math.hypot(finalX2 - finalX1, finalZ2 - finalZ1);

      return {
        ...pair,
        pos1: [finalX1, y, finalZ1] as [number, number, number],
        pos2: [finalX2, y, finalZ2] as [number, number, number],
        mid: [midX, y, midZ] as [number, number, number],
        angle,
        length: dist,
      };
    });
  }, [pairs, unzipProgress]);

  // Shared geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.24, 16, 16), []);
  const hBondSphereGeo = useMemo(() => new THREE.SphereGeometry(0.08, 10, 10), []);
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, 1, 12), []);

  // Backbone materials
  const backbone1Mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#102F28', roughness: 0.35, metalness: 0.2 }),
    []
  );
  const backbone2Mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2A6F5E', roughness: 0.35, metalness: 0.2 }),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {helixData.map((rung, i) => {
        const isSynthesized = mode !== 'encoding' || i <= activeStep;
        const isCurrentActive = mode === 'encoding' && i === activeStep;
        const isSelected = selectedRung === i;
        const isHovered = hoveredRung === i;

        const base1Color = rung.isMutated ? '#E06D53' : BASE_META[rung.base1].color;
        const base2Color = rung.isMutated ? '#F2A65A' : BASE_META[rung.base2].color;

        // Half rung midpoints
        const midA: [number, number, number] = [
          (rung.pos1[0] + rung.mid[0]) / 2,
          rung.pos1[1],
          (rung.pos1[2] + rung.mid[2]) / 2,
        ];
        const midB: [number, number, number] = [
          (rung.pos2[0] + rung.mid[0]) / 2,
          rung.pos2[1],
          (rung.pos2[2] + rung.mid[2]) / 2,
        ];

        const rungOpacity = isSynthesized ? 1.0 : 0.15;
        const scaleMul = isCurrentActive || isSelected ? 1.25 : isHovered ? 1.12 : 1.0;

        return (
          <group
            key={`rung-${i}`}
            scale={[scaleMul, scaleMul, scaleMul]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectRung(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverRung(i);
            }}
            onPointerOut={() => onHoverRung(null)}
          >
            {/* Strand 1 Backbone Sphere */}
            <mesh position={rung.pos1} geometry={sphereGeo} material={backbone1Mat} />

            {/* Strand 2 Backbone Sphere */}
            <mesh position={rung.pos2} geometry={sphereGeo} material={backbone2Mat} />

            {/* Base 1 Cylinder */}
            <group position={midA} rotation={[0, -rung.angle, Math.PI / 2]}>
              <mesh geometry={cylinderGeo} scale={[1, rung.length / 2, 1]}>
                <meshStandardMaterial
                  color={base1Color}
                  roughness={0.3}
                  metalness={0.15}
                  transparent={rungOpacity < 1.0}
                  opacity={rungOpacity}
                  emissive={isCurrentActive || isSelected ? base1Color : '#000000'}
                  emissiveIntensity={isCurrentActive ? 0.6 : isSelected ? 0.4 : 0}
                />
              </mesh>
            </group>

            {/* Base 2 Cylinder */}
            <group position={midB} rotation={[0, -rung.angle, Math.PI / 2]}>
              <mesh geometry={cylinderGeo} scale={[1, rung.length / 2, 1]}>
                <meshStandardMaterial
                  color={base2Color}
                  roughness={0.3}
                  metalness={0.15}
                  transparent={rungOpacity < 1.0}
                  opacity={rungOpacity}
                  emissive={isCurrentActive || isSelected ? base2Color : '#000000'}
                  emissiveIntensity={isCurrentActive ? 0.6 : isSelected ? 0.4 : 0}
                />
              </mesh>
            </group>

            {/* Hydrogen Bonds (Center Rung Junction) */}
            {unzipProgress < 0.6 && isSynthesized && (
              <group position={rung.mid}>
                {Array.from({ length: BASE_META[rung.base1].hBonds }).map((_, hIdx) => {
                  const offsetY = (hIdx - (BASE_META[rung.base1].hBonds - 1) / 2) * 0.16;
                  return (
                    <mesh key={`hb-${hIdx}`} position={[0, offsetY, 0]} geometry={hBondSphereGeo}>
                      <meshStandardMaterial
                        color={rung.isMutated ? '#E06D53' : '#DCE8D9'}
                        roughness={0.2}
                        emissive={rung.isMutated ? '#E06D53' : '#DCE8D9'}
                        emissiveIntensity={0.5}
                      />
                    </mesh>
                  );
                })}
              </group>
            )}

            {/* 3D Label tag on selected rung */}
            {isSelected && (
              <Html position={[rung.pos1[0] * 1.3, rung.pos1[1], rung.pos1[2] * 1.3]} center>
                <div className="bg-[#102F28]/95 text-[#FCFBF7] text-[10px] font-mono px-2 py-1 rounded-md shadow-lg border border-[#8FAE91] whitespace-nowrap pointer-events-none">
                  #{i + 1}: {rung.base1}-{rung.base2} ({BASE_META[rung.base1].bits})
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Main Exported Interactive Simulation Component
interface Props {
  initialText?: string;
  className?: string;
  standalone?: boolean;
}

export const InteractiveDnaSimulation: React.FC<Props> = ({
  initialText = 'DNA',
  className = '',
  standalone = false,
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [mode, setMode] = useState<SimulationMode>('encoding');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.25);
  const [unzipProgress, setUnzipProgress] = useState<number>(0);
  const [selectedRung, setSelectedRung] = useState<number | null>(null);
  const [hoveredRung, setHoveredRung] = useState<number | null>(null);
  const [mutatedIndices, setMutatedIndices] = useState<Set<number>>(new Set());
  const [repairSuccess, setRepairSuccess] = useState<boolean>(false);

  // Encode input text into base pairs using 2-bit digital mapping
  const pairs: BasePairData[] = useMemo(() => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(inputText || 'DNcrypt');
    const result: BasePairData[] = [];

    let pairIdx = 0;
    for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
      const b = bytes[byteIdx];
      // 4 pairs of 2 bits per byte
      for (let shift = 6; shift >= 0; shift -= 2) {
        const val = (b >> shift) & 0x03;
        const bits = val.toString(2).padStart(2, '0');
        let b1: 'A' | 'C' | 'G' | 'T' = 'A';
        if (val === 0) b1 = 'A';
        else if (val === 1) b1 = 'C';
        else if (val === 2) b1 = 'G';
        else b1 = 'T';

        const isMutated = mutatedIndices.has(pairIdx);
        // If mutated, flip base to simulate a point substitution
        const displayedBase1 = isMutated ? (b1 === 'A' ? 'G' : b1 === 'C' ? 'T' : 'A') : b1;
        const b2 = BASE_META[displayedBase1].complement;

        result.push({
          index: pairIdx,
          base1: displayedBase1,
          base2: b2,
          bits,
          byteIndex: byteIdx,
          isMutated,
          originalBase1: b1,
        });
        pairIdx++;
        if (result.length >= 36) break; // Keep optimal 3D viewport density
      }
      if (result.length >= 36) break;
    }

    // Pad if short so double helix has realistic length
    while (result.length < 16) {
      const padIdx = result.length;
      const b1 = (['A', 'C', 'G', 'T'][padIdx % 4]) as 'A' | 'C' | 'G' | 'T';
      result.push({
        index: padIdx,
        base1: b1,
        base2: BASE_META[b1].complement,
        bits: BASE_META[b1].bits,
        byteIndex: 0,
        isMutated: mutatedIndices.has(padIdx),
      });
    }

    return result;
  }, [inputText, mutatedIndices]);

  // Stepping timer for encoding simulation
  useEffect(() => {
    if (!isPlaying || mode !== 'encoding') return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= pairs.length - 1) {
          return 0; // Loop encoding
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, mode, speed, pairs.length]);

  // Unzip animation effect
  useEffect(() => {
    if (mode === 'unzip') {
      let current = unzipProgress;
      const timer = setInterval(() => {
        if (current < 1) {
          current = Math.min(1, current + 0.05);
          setUnzipProgress(current);
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setUnzipProgress(0);
    }
  }, [mode]);

  // Trigger synthetic mutation
  const handleSimulateMutation = () => {
    const targetIdx = selectedRung !== null ? selectedRung : Math.floor(Math.random() * pairs.length);
    setMutatedIndices((prev) => {
      const next = new Set(prev);
      next.add(targetIdx);
      return next;
    });
    setSelectedRung(targetIdx);
    setRepairSuccess(false);
  };

  // Trigger Reed-Solomon repair
  const handleExecuteRepair = () => {
    setMutatedIndices(new Set());
    setRepairSuccess(true);
    setTimeout(() => setRepairSuccess(false), 2500);
  };

  // Calculate live statistics
  const totalBases = pairs.length;
  const gcCount = pairs.filter((p) => p.base1 === 'G' || p.base1 === 'C').length;
  const gcPercent = Math.round((gcCount / totalBases) * 100);

  const activeRungData = selectedRung !== null ? pairs[selectedRung] : pairs[activeStep];

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#FCFBF7] border border-[#DCE8D9] shadow-sm overflow-hidden flex flex-col ${
        standalone ? 'h-[750px] lg:h-[820px]' : 'h-[620px]'
      } ${className}`}
    >
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#DCE8D9] bg-[#F5F1E7]/70 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#173F35] flex items-center justify-center text-[#8FAE91]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#102F28] flex items-center gap-2">
              <span>3D DNA & Digital Encoding Simulation</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#DCE8D9] text-[#173F35] font-semibold">
                Interactive Three.js
              </span>
            </h3>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center rounded-xl bg-[#EAF0E9] p-1 text-xs">
          {[
            { id: 'encoding', label: '1. Bit-to-Base Encoding', icon: Binary },
            { id: 'inspect', label: '2. 3D Inspection', icon: Eye },
            { id: 'mutation', label: '3. Mutation & Repair', icon: Zap },
            { id: 'unzip', label: '4. Strand Unzip', icon: Split },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id as SimulationMode);
                  if (tab.id === 'encoding') setIsPlaying(true);
                  else setIsPlaying(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                  active
                    ? 'bg-[#173F35] text-[#FCFBF7] shadow-xs'
                    : 'text-[#202B25] hover:text-[#173F35] hover:bg-[#FCFBF7]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#8FAE91]' : 'text-[#777C76]'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Viewport & Interactive 3D Canvas */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-[#EAF0E9]/40 via-[#FCFBF7] to-[#F5F1E7]/40 overflow-hidden">
        {/* Three.js Canvas */}
        <Canvas
          camera={{ position: [0, 0, 14], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={1.3} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} color="#FCFBF7" />
          <directionalLight position={[-10, -10, -5]} intensity={0.7} color="#8FAE91" />
          <pointLight position={[0, 0, 8]} intensity={0.8} color="#DCE8D9" />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={22}
            rotateSpeed={0.8}
            dampingFactor={0.05}
          />

          <Dna3DModel
            pairs={pairs}
            activeStep={activeStep}
            mode={mode}
            unzipProgress={unzipProgress}
            rotationSpeed={rotationSpeed}
            selectedRung={selectedRung}
            onSelectRung={(idx) => {
              setSelectedRung(idx);
              if (mode === 'encoding') setActiveStep(idx);
            }}
            hoveredRung={hoveredRung}
            onHoverRung={setHoveredRung}
          />
        </Canvas>

        {/* Top Floating Text Input Bar */}
        <div className="absolute top-4 left-4 right-4 max-w-md mx-auto z-10">
          <div className="flex items-center space-x-2 p-1.5 pl-3 rounded-2xl bg-[#FCFBF7]/90 backdrop-blur-md border border-[#DCE8D9] shadow-sm">
            <span className="text-[11px] font-mono text-[#777C76] flex-shrink-0">Input Text:</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to synthesize..."
              className="bg-transparent text-xs font-semibold text-[#173F35] focus:outline-none flex-1 font-mono"
              maxLength={12}
            />
            <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF0E9] text-[#173F35]">
              {pairs.length} Base Pairs
            </div>
          </div>
        </div>

        {/* Live Active Rung Chemistry Card (Left Float) */}
        {activeRungData && (
          <div className="absolute left-4 bottom-20 z-10 w-64 p-3.5 rounded-2xl bg-[#FCFBF7]/95 backdrop-blur-md border border-[#DCE8D9] shadow-md space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#DCE8D9] pb-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-heading font-bold text-[#102F28]">
                  Rung #{activeRungData.index + 1}
                </span>
                {activeRungData.isMutated ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Mutated
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#DCE8D9] text-[#173F35] font-semibold">
                    Normal
                  </span>
                )}
              </div>
              <span className="font-mono text-xs font-extrabold text-[#173F35]">
                {activeRungData.base1} ⮀ {activeRungData.base2}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#777C76] block text-[10px]">2-Bit Value:</span>
                <span className="font-mono font-bold text-[#173F35] bg-[#EAF0E9] px-1.5 py-0.5 rounded">
                  {activeRungData.bits}
                </span>
              </div>
              <div>
                <span className="text-[#777C76] block text-[10px]">Hydrogen Bonds:</span>
                <span className="font-bold text-[#2A6F5E]">
                  {BASE_META[activeRungData.base1].hBonds} Bonds
                </span>
              </div>
              <div>
                <span className="text-[#777C76] block text-[10px]">Base 1 ({activeRungData.base1}):</span>
                <span className="text-[#202B25] truncate block">
                  {BASE_META[activeRungData.base1].name}
                </span>
              </div>
              <div>
                <span className="text-[#777C76] block text-[10px]">Base 2 ({activeRungData.base2}):</span>
                <span className="text-[#202B25] truncate block">
                  {BASE_META[activeRungData.base2].name}
                </span>
              </div>
            </div>

            {/* Quick Action in Card */}
            {mode === 'mutation' && (
              <div className="pt-1 flex items-center gap-1.5">
                <button
                  onClick={handleSimulateMutation}
                  className="flex-1 py-1 rounded-lg bg-rose-600 text-[#FCFBF7] text-[10px] font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Mutate Base
                </button>
                <button
                  onClick={handleExecuteRepair}
                  className="flex-1 py-1 rounded-lg bg-[#173F35] text-[#FCFBF7] text-[10px] font-semibold hover:bg-[#102F28] transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-[#8FAE91]" /> RS Repair
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Float: Live Sequence & Encoding Stream */}
        <div className="absolute right-4 top-16 bottom-20 w-44 hidden md:flex flex-col rounded-2xl bg-[#FCFBF7]/90 backdrop-blur-md border border-[#DCE8D9] shadow-sm p-3 z-10 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#DCE8D9] pb-1.5 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#777C76]">
              Synthesized Stream
            </span>
            <span className="text-[10px] font-mono text-[#173F35]">
              {mode === 'encoding' ? `${activeStep + 1}/${pairs.length}` : `${pairs.length} bp`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
            {pairs.map((p, idx) => {
              const isCurr = (mode === 'encoding' && idx === activeStep) || selectedRung === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRung(idx)}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                    isCurr
                      ? 'bg-[#173F35] text-[#FCFBF7] font-bold'
                      : p.isMutated
                      ? 'bg-rose-100 text-rose-800'
                      : 'hover:bg-[#EAF0E9] text-[#202B25]'
                  }`}
                >
                  <span className="text-[10px] opacity-60">#{idx + 1}</span>
                  <div className="flex items-center space-x-1.5">
                    <span style={{ color: isCurr ? '#FCFBF7' : BASE_META[p.base1].color }}>
                      {p.base1}
                    </span>
                    <span className="text-[10px] opacity-40">|</span>
                    <span style={{ color: isCurr ? '#FCFBF7' : BASE_META[p.base2].color }}>
                      {p.base2}
                    </span>
                  </div>
                  <span className="text-[9px] opacity-75">{p.bits}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Repair Feedback Toast */}
        {repairSuccess && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-[#173F35] text-[#FCFBF7] text-xs font-semibold flex items-center space-x-2 shadow-lg animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#8FAE91]" />
            <span>Reed-Solomon Error Correction applied! Nucleotide restored.</span>
          </div>
        )}
      </div>

      {/* 3. Bottom Controls & Analytical Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-t border-[#DCE8D9] bg-[#F5F1E7]/90 z-10">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          {mode === 'encoding' && (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-[#173F35] text-[#FCFBF7] flex items-center justify-center hover:bg-[#102F28] transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % pairs.length)}
                className="w-8 h-8 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] text-[#173F35] flex items-center justify-center hover:bg-[#EAE3D2] transition-colors"
                title="Next Base"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveStep(0)}
                className="w-8 h-8 rounded-lg bg-[#FCFBF7] border border-[#DCE8D9] text-[#173F35] flex items-center justify-center hover:bg-[#EAE3D2] transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Mutation Simulator Controls */}
          {mode === 'mutation' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSimulateMutation}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-[#FCFBF7] text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate UV Damage</span>
              </button>

              <button
                onClick={handleExecuteRepair}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#173F35] text-[#FCFBF7] text-xs font-semibold hover:bg-[#102F28] transition-colors shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8FAE91]" />
                <span>RS Error Recovery</span>
              </button>
            </div>
          )}

          {/* Unzip Mode Indicator */}
          {mode === 'unzip' && (
            <div className="flex items-center space-x-2 text-xs text-[#173F35]">
              <Split className="w-4 h-4 text-[#2A6F5E]" />
              <span className="font-semibold">Strand Separation:</span>
              <span className="font-mono">{Math.round(unzipProgress * 100)}% denatured</span>
            </div>
          )}
        </div>

        {/* Real-time Analytical Metrics */}
        <div className="flex items-center space-x-4 text-xs font-mono text-[#202B25]">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#777C76]">GC-Ratio:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                gcPercent >= 40 && gcPercent <= 60
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {gcPercent}% {gcPercent >= 40 && gcPercent <= 60 ? 'Optimal' : 'Skewed'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5">
            <span className="text-[#777C76]">Density:</span>
            <span className="font-bold text-[#173F35]">2 bits / bp</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5">
            <span className="text-[#777C76]">Auto-Rotate:</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-[#DCE8D9] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
