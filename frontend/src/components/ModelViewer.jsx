import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- CUTE ACCESSORIES ---
const Accessory = ({ type, id }) => {
  if (!id) return null;
  const matProps = { roughness: 0.2, metalness: 0.5, color: id === 'cap_red' ? '#ff4757' : '#ffd700' };
  
  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.6, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshStandardMaterial {...matProps} /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.8, 0]}><mesh><cylinderGeometry args={[0.3, 0.2, 0.25, 8]} /><meshStandardMaterial {...matProps} metalness={1} /></mesh></group>
    );
  }
  return null;
};

// --- THE CUTEST PET EVER ---
const PetModel = ({ color, accessories, onClick }) => {
  const groupRef = useRef();
  const faceRef = useRef();
  const { viewport, mouse } = useThree();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => { setBlinking(true); setTimeout(() => setBlinking(false), 120); setTimeout(blink, Math.random() * 4000 + 2000); };
    const tid = setTimeout(blink, 2000); return () => clearTimeout(tid);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
        const s = 1 + Math.sin(t * 3) * 0.02;
        groupRef.current.scale.set(1/s, s, 1/s);
    }
    if (faceRef.current) {
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, (mouse.x * viewport.width) / 30, 0.1);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, (mouse.y * viewport.height) / 30 + 0.2, 0.1);
    }
  });

  const bodyColor = color || '#8c52ff';

  return (
    <group onClick={onClick} ref={groupRef}>
      <Sparkles count={30} scale={2.5} size={2} speed={0.5} opacity={0.6} color={bodyColor} />
      
      {/* Body - Round and Soft */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshStandardMaterial color={bodyColor} roughness={0.1} metalness={0.1} />
      </mesh>
      
      {/* Tiny Ears */}
      <mesh position={[-0.4, 0.7, -0.1]} rotation={[0.4, 0, -0.3]}>
          <capsuleGeometry args={[0.15, 0.2]} /><meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.4, 0.7, -0.1]} rotation={[0.4, 0, 0.3]}>
          <capsuleGeometry args={[0.15, 0.2]} /><meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Little Arms */}
      <mesh position={[-0.6, -0.4, 0.3]} rotation={[0, 0, 0.6]}>
          <capsuleGeometry args={[0.12, 0.2]} /><meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.6, -0.4, 0.3]} rotation={[0, 0, -0.6]}>
          <capsuleGeometry args={[0.12, 0.2]} /><meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Little Tail */}
      <mesh position={[0, -0.5, -0.7]} rotation={[-0.5, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={bodyColor} />
      </mesh>

      <Accessory type="head" id={accessories?.head} />

      {/* Face Design */}
      <group ref={faceRef} position={[0, 0.25, 0.7]}>
          {/* Eyes with double sparkle */}
          <group position={[-0.25, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshStandardMaterial color="#0a0a0a" roughness={0} /></mesh>
              <mesh position={[0.06, 0.06, 0.12]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
              <mesh position={[-0.04, -0.04, 0.12]}><sphereGeometry args={[0.02]} /><meshBasicMaterial color="white" opacity={0.6} transparent /></mesh>
          </group>
          <group position={[0.25, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshStandardMaterial color="#0a0a0a" roughness={0} /></mesh>
              <mesh position={[0.06, 0.06, 0.12]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
              <mesh position={[-0.04, -0.04, 0.12]}><sphereGeometry args={[0.02]} /><meshBasicMaterial color="white" opacity={0.6} transparent /></mesh>
          </group>
          
          {/* Cheeks */}
          <mesh position={[-0.45, -0.15, -0.1]}><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.5} /></mesh>
          <mesh position={[0.45, -0.15, -0.1]}><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.5} /></mesh>
          
          {/* Sweet Mouth */}
          <mesh position={[0, -0.25, 0]} rotation={[0,0,Math.PI]}><torusGeometry args={[0.06, 0.015, 16, 32, Math.PI]} /><meshBasicMaterial color="#0a0a0a" /></mesh>
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, shape, accessories, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        
        {/* Safe Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -2, -5]} color="#6c5ce7" intensity={1} />
        <pointLight position={[0, 5, -5]} intensity={0.5} color="#ffffff" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && <PetModel color={color} accessories={accessories} onClick={onPetClick} />}
             {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} /></Float>}
             <ContactShadows opacity={0.4} scale={8} blur={2.5} far={1} color="#000" />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.8} autoRotate={isLobby} autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;