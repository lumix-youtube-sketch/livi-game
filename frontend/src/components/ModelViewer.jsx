import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES WITH SHAPE ADAPTATION ---
const Accessory = ({ type, id, shape }) => {
  if (!id) return null;

  // Head height based on shape
  const headY = shape === 'capsule' ? 0.7 : 0.55;
  const bodyY = shape === 'capsule' ? 0 : -0.1;
  const legsY = shape === 'capsule' ? -0.5 : -0.45;

  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, headY + 0.1, 0]}>
             <mesh><cylinderGeometry args={[0.3, 0.25, 0.3, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
        </group>
    );
  }

  if (type === 'body') {
     const color = id === 'tshirt_blue' ? '#3742fa' : '#2f3542';
     const height = shape === 'capsule' ? 0.7 : 0.5;
     return (
        <group position={[0, bodyY, 0]}>
            <mesh><cylinderGeometry args={[0.53, 0.53, height, 32]} /><meshStandardMaterial color={color} /></mesh>
        </group>
     );
  }
  
  if (type === 'legs') {
     const color = id === 'jeans_classic' ? '#5352ed' : '#ff6b81';
      return (
        <group position={[0, legsY, 0]}>
            <mesh position={[-0.22, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color={color} /></mesh>
            <mesh position={[0.22, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color={color} /></mesh>
        </group>
     );
  }
  return null;
};

// --- PET MODEL ---
const PetModel = ({ mood, color, shape, accessories, onClick }) => {
  const meshRef = useRef();
  const eyesRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t * 3) * 0.05;
        const s = 0.85; 
        meshRef.current.scale.set(s, s, s);
    }
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 15;
        const y = (mouse.y * viewport.height) / 15;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.15);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + (shape==='capsule'?0.3:0.2), 0.15);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
              {shape === 'capsule' && <capsuleGeometry args={[0.5, 0.6, 16, 32]} />}
              {shape === 'round' && <sphereGeometry args={[0.65, 32, 32]} />}
              {shape === 'boxy' && <boxGeometry args={[0.9, 0.9, 0.9]} />}
              <meshToonMaterial color={color} />
            </mesh>

            <Accessory type="head" id={accessories?.head} shape={shape} />
            <Accessory type="body" id={accessories?.body} shape={shape} />
            <Accessory type="legs" id={accessories?.legs} shape={shape} />

            {/* Eyes */}
            <group ref={eyesRef} position={[0, shape==='capsule'?0.3:0.2, 0.5]}>
                <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#000" /></mesh>
                <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#000" /></mesh>
            </group>
        </group>
      </Float>
    </group>
  );
};

// ... (ModelViewer with standard lights and post-processing)
const ModelViewer = ({ type, mood, color, shape, accessories, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && <PetModel mood={mood} color={color || '#8c52ff'} shape={shape || 'capsule'} accessories={accessories} onClick={onPetClick} />}
             {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="gold" /></mesh></group>}
             <ContactShadows opacity={0.5} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
        <EffectComposer disableNormalPass><Bloom intensity={0.3} luminanceThreshold={1} /><Vignette darkness={0.5} /></EffectComposer>
      </Canvas>
    </div>
  );
};

import { useState } from 'react'; // Fix missing useState
export default ModelViewer;