import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DnaHelixProps {
  interactive?: boolean;
  scale?: number;
  speed?: number;
}

export const DnaHelix: React.FC<DnaHelixProps> = ({
  interactive = true,
  scale = 1.0,
  speed = 0.35
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized device coordinates (-1 to 1)
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Compute double-helix geometry parameters
  const { rungs, backbone1Nodes, backbone2Nodes } = useMemo(() => {
    const numPairs = 42; // Number of base pairs along the vertical axis
    const radius = 2.4;
    const height = 24;
    const turns = 3.5;
    const rungList = [];
    const bb1 = [];
    const bb2 = [];

    // Coordinating biological palette for base pairs
    const baseColors = [
      '#173F35', // Adenine (Deep Forest)
      '#2A6F5E', // Cytosine (Teal Forest)
      '#8FAE91', // Guanine (Soft Sage)
      '#C89B6D', // Thymine (Warm Amber Sand)
    ];

    for (let i = 0; i < numPairs; i++) {
      const t = i / (numPairs - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      // Strand 1 position
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      // Strand 2 position (antiparallel, 180 deg phase shift)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      bb1.push(new THREE.Vector3(x1, y, z1));
      bb2.push(new THREE.Vector3(x2, y, z2));

      // Calculate midpoint and orientation for the rung connecting the two strands
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;
      const distance = Math.hypot(x2 - x1, z2 - z1);

      // Colors for this pair
      const colorA = baseColors[i % 4];
      const colorB = baseColors[(i + 2) % 4];

      rungList.push({
        id: i,
        pos1: [x1, y, z1] as [number, number, number],
        pos2: [x2, y, z2] as [number, number, number],
        mid: [midX, y, midZ] as [number, number, number],
        angle,
        length: distance,
        colorA,
        colorB
      });
    }

    return { rungs: rungList, backbone1Nodes: bb1, backbone2Nodes: bb2 };
  }, []);

  // Shared sphere geometry & materials for optimal performance
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.22, 16, 16), []);
  const smallSphereGeo = useMemo(() => new THREE.SphereGeometry(0.14, 12, 12), []);
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 1, 10), []);

  const strand1Mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#102F28',
    roughness: 0.3,
    metalness: 0.2,
  }), []);

  const strand2Mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2A6F5E',
    roughness: 0.3,
    metalness: 0.2,
  }), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Continuous smooth rotation
    groupRef.current.rotation.y += delta * speed;

    // Subtle parallax tilt following mouse
    if (interactive) {
      const targetRotX = mouseRef.current.y * 0.15;
      const targetRotZ = -mouseRef.current.x * 0.12;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 2.5);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, delta * 2.5);
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Strand 1 Backbone Nodes */}
      {backbone1Nodes.map((pos, idx) => (
        <mesh key={`bb1-${idx}`} position={[pos.x, pos.y, pos.z]} geometry={sphereGeo} material={strand1Mat} />
      ))}

      {/* Strand 2 Backbone Nodes */}
      {backbone2Nodes.map((pos, idx) => (
        <mesh key={`bb2-${idx}`} position={[pos.x, pos.y, pos.z]} geometry={sphereGeo} material={strand2Mat} />
      ))}

      {/* Connecting Nucleotide Pairs (Rungs) */}
      {rungs.map((rung) => {
        // Half-rung 1
        const midA = [
          (rung.pos1[0] + rung.mid[0]) / 2,
          rung.pos1[1],
          (rung.pos1[2] + rung.mid[2]) / 2,
        ] as [number, number, number];

        // Half-rung 2
        const midB = [
          (rung.pos2[0] + rung.mid[0]) / 2,
          rung.pos2[1],
          (rung.pos2[2] + rung.mid[2]) / 2,
        ] as [number, number, number];

        return (
          <group key={`rung-${rung.id}`}>
            {/* Hydrogen bond central junction indicator */}
            <mesh position={rung.mid} geometry={smallSphereGeo}>
              <meshStandardMaterial color="#DCE8D9" roughness={0.4} />
            </mesh>

            {/* Base A Segment */}
            <group position={midA} rotation={[0, -rung.angle, Math.PI / 2]}>
              <mesh geometry={cylinderGeo} scale={[1, rung.length / 2, 1]}>
                <meshStandardMaterial color={rung.colorA} roughness={0.35} metalness={0.15} />
              </mesh>
            </group>

            {/* Base B Segment */}
            <group position={midB} rotation={[0, -rung.angle, Math.PI / 2]}>
              <mesh geometry={cylinderGeo} scale={[1, rung.length / 2, 1]}>
                <meshStandardMaterial color={rung.colorB} roughness={0.35} metalness={0.15} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};
