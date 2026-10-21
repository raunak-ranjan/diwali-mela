import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { soundEngine } from '../../../audio/soundEngine';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: THREE.Color;
  life: number;
  maxLife: number;
}

export const FireworksShow = ({ active }: { active: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const maxParticles = 600;
  const particles = useRef<Particle[]>([]);

  // Pre-allocate buffer attributes
  const { positions, colors } = useMemo(() => {
    return {
      positions: new Float32Array(maxParticles * 3),
      colors: new Float32Array(maxParticles * 3),
    };
  }, []);

  const spawnBurst = (x: number, y: number, z: number) => {
    soundEngine.playFireworkExplosion();

    const burstColors = [
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#FF3366'), // Festive Crimson
      new THREE.Color('#00E5FF'), // Peacock Cyan
      new THREE.Color('#76FF03'), // Radiant Green
      new THREE.Color('#FF9100'), // Saffron
      new THREE.Color('#E040FB'), // Purple
    ];
    const burstColor = burstColors[Math.floor(Math.random() * burstColors.length)];

    for (let i = 0; i < 70; i++) {
      if (particles.current.length >= maxParticles) {
        particles.current.shift();
      }

      // Spherical velocity distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 4.0 + Math.random() * 7.0;

      particles.current.push({
        x,
        y,
        z,
        vx: speed * Math.sin(phi) * Math.cos(theta),
        vy: speed * Math.cos(phi) + 2.0,
        vz: speed * Math.sin(phi) * Math.sin(theta),
        color: burstColor,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
      });
    }
  };

  // Launch fireworks on timer when active
  const lastLaunchRef = useRef(0);
  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;
    const now = clock.getElapsedTime();

    if (active && now - lastLaunchRef.current > 1.2) {
      lastLaunchRef.current = now;
      const rx = (Math.random() - 0.5) * 35;
      const ry = 18 + Math.random() * 12;
      const rz = (Math.random() - 0.5) * 30 + 10;
      spawnBurst(rx, ry, rz);
    }

    // Update active particles
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    const gravity = -9.8 * delta;

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      p.vy += gravity * 0.4;
      p.vx *= 0.98;
      p.vz *= 0.98;

      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;

      const alpha = 1 - p.life / p.maxLife;

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      colors[i * 3] = p.color.r * alpha;
      colors[i * 3 + 1] = p.color.g * alpha;
      colors[i * 3 + 2] = p.color.b * alpha;
    }

    // Hide remainder
    for (let i = particles.current.length; i < maxParticles; i++) {
      positions[i * 3 + 1] = -1000;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
