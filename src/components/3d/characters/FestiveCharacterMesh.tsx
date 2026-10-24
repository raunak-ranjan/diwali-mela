import React from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { NpcOutfit } from '../../../types/npc';

interface FestiveCharacterMeshProps {
  outfit: NpcOutfit;
  accessory?: 'diya' | 'sparkler' | 'mala';
  isVendor?: boolean;
  walkBob?: number;
}

// Pre-batched symmetrical geometries (shared across all characters to save draw calls)
const batchedLegsGeometry = (() => {
  const left = new THREE.CylinderGeometry(0.085, 0.075, 0.7, 8).translate(-0.13, 0.35, 0);
  const right = new THREE.CylinderGeometry(0.085, 0.075, 0.7, 8).translate(0.13, 0.35, 0);
  return BufferGeometryUtils.mergeGeometries([left, right]) || left;
})();

const batchedShoesGeometry = (() => {
  const left = new THREE.BoxGeometry(0.14, 0.09, 0.26).translate(-0.13, 0.05, 0.05);
  const right = new THREE.BoxGeometry(0.14, 0.09, 0.26).translate(0.13, 0.05, 0.05);
  return BufferGeometryUtils.mergeGeometries([left, right]) || left;
})();

const batchedVendorHandsGeometry = (() => {
  const left = new THREE.BoxGeometry(0.06, 0.14, 0.04)
    .rotateZ(0.4)
    .rotateY(-0.2)
    .rotateX(0.4)
    .translate(-0.05, 0, 0);
  const right = new THREE.BoxGeometry(0.06, 0.14, 0.04)
    .rotateZ(-0.4)
    .rotateY(0.2)
    .rotateX(0.4)
    .translate(0.05, 0, 0);
  return BufferGeometryUtils.mergeGeometries([left, right]) || left;
})();

export const FestiveCharacterMesh: React.FC<FestiveCharacterMeshProps> = ({
  outfit,
  accessory,
  isVendor = false,
  walkBob = 0,
}) => {
  return (
    <group position={[0, walkBob, 0]}>
      {/* Head */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.21, 14, 14]} />
        <meshStandardMaterial color={outfit.skinColor} roughness={0.7} />
      </mesh>

      {/* Pagri (Turban) - if specified */}
      {outfit.pagriColor && (
        <group position={[0, 1.61, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.23, 0.2, 12]} />
            <meshStandardMaterial
              color={outfit.pagriColor}
              roughness={0.4}
              metalness={0.3}
            />
          </mesh>
          {outfit.pagriAccentColor && (
            <mesh position={[0, 0.12, 0.16]}>
              <coneGeometry args={[0.05, 0.16, 8]} />
              <meshStandardMaterial
                color={outfit.pagriAccentColor}
                emissive={outfit.pagriAccentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Stole / Dupatta draped over shoulder - if specified */}
      {outfit.stoleColor && (
        <mesh position={[0.08, 0.98, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.14, 0.82, 0.4]} />
          <meshStandardMaterial
            color={outfit.stoleColor}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* Kurta Torso - Primary representative silhouette shadow caster */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.33, 0.78, 12]} />
        <meshStandardMaterial color={outfit.kurtaColor} roughness={0.5} />
      </mesh>

      {/* Pyjama Legs - Batched into 1 draw call */}
      <mesh geometry={batchedLegsGeometry}>
        <meshStandardMaterial color={outfit.pyjamaColor} roughness={0.7} />
      </mesh>

      {/* Traditional Jutti Shoes - Batched into 1 draw call */}
      <mesh geometry={batchedShoesGeometry}>
        <meshStandardMaterial color={outfit.juttiColor} metalness={0.3} />
      </mesh>

      {/* Vendor Pranam / Welcoming Namaste Hands - Batched hands into 1 draw call */}
      {isVendor && (
        <group position={[0, 1.05, 0.22]}>
          <mesh geometry={batchedVendorHandsGeometry}>
            <meshStandardMaterial color={outfit.skinColor} />
          </mesh>
          {/* Golden Namaste Motif */}
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* Accessory: Held Clay Diya */}
      {accessory === 'diya' && (
        <group position={[0.3, 0.85, 0.22]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.05, 0.05, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
          {/* Diya Flame */}
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.035, 0.1, 8]} />
            <meshStandardMaterial
              color="#fff7d6"
              emissive="#ff7700"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {/* Accessory: Held Sparkler */}
      {accessory === 'sparkler' && (
        <group position={[0.3, 0.95, 0.2]}>
          {/* Sparkler Wire */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
            <meshStandardMaterial color="#78716c" metalness={0.8} />
          </mesh>
          {/* Sparkling Tip */}
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#f59e0b"
              emissiveIntensity={3.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
