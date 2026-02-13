import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, PerspectiveCamera, Environment, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES (Premium Quality) ---
const Accessory = ({ type, id, isPreview }) => {
  if (!id && !isPreview) return null;
  const props = { roughness: 0.1, metalness: 0.4, clearcoat: 1 };
  const headY = 0.6;

  if (type === 'head') {
    if (id === 'cap_red' || isPreview) return (
      <group position={[0, headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.55, 32, 32, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshPhysicalMaterial color="#ff4757" {...props} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.04, 0.4]} /><meshPhysicalMaterial color="#ff4757" {...props} /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, headY + 0.15, 0]}>
             <mesh><cylinderGeometry args={[0.3, 0.2, 0.25, 8]} /><meshPhysicalMaterial color="#ffd700" metalness={1} roughness={0.1} clearcoat={1} /></mesh>
        </group>
    );
  }
  if (type === 'body') {
      return <group position={[0, -0.2, 0]}><mesh><cylinderGeometry args={[0.6, 0.6, 0.4, 32]} /><meshPhysicalMaterial color="#2f3542" {...props} /></mesh></group>;
  }
  return null;
};

// --- THE ULTIMATE CUTE PET ---
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
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, (mouse.x * viewport.width) / 40, 0.15);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, (mouse.y * viewport.height) / 40 + 0.2, 0.15);
    }
  });

  return (
    <group onClick={onClick} ref={groupRef}>
      <Sparkles count={40} scale={2} size={2} speed={0.4} opacity={0.5} color={color} />
      
      {/* Body - Soft Jelly Material */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.85, 64, 64]} />
        <MeshDistortMaterial 
            color={color || '#8c52ff'} 
            speed={2} 
            distort={0.15} 
            radius={1}
            roughness={0.1}
            metalness={0.1}
            transmission={0.3}
            thickness={1}
            clearcoat={1}
        />
      </mesh>
      
      {/* Cute Details */}
      <mesh position={[-0.55, -0.4, 0.3]} rotation={[0, 0, 0.6]}><capsuleGeometry args={[0.1, 0.2]} /><meshPhysicalMaterial color={color} roughness={0.2} /></mesh>
      <mesh position={[0.55, -0.4, 0.3]} rotation={[0, 0, -0.6]}><capsuleGeometry args={[0.1, 0.2]} /><meshPhysicalMaterial color={color} roughness={0.2} /></mesh>

      <Accessory type="head" id={accessories?.head} />
      <Accessory type="body" id={accessories?.body} />

      {/* Expressive Face */}
      <group ref={faceRef} position={[0, 0.2, 0.65]}>
          <group position={[-0.25, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.14, 32, 32]} /><meshStandardMaterial color="#0a0a0a" roughness={0} /></mesh>
              <mesh position={[0.04, 0.04, 0.11]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
          </group>
          <group position={[0.25, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.14, 32, 32]} /><meshStandardMaterial color="#0a0a0a" roughness={0} /></mesh>
              <mesh position={[0.04, 0.04, 0.11]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
          </group>
          
          <mesh position={[-0.4, -0.15, -0.1]}><sphereGeometry args={[0.1, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
          <mesh position={[0.4, -0.15, -0.1]}><sphereGeometry args={[0.1, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
          
          <mesh position={[0, -0.22, 0]} rotation={[0,0,Math.PI]}><torusGeometry args={[0.05, 0.015, 16, 32, Math.PI]} /><meshBasicMaterial color="#0a0a0a" /></mesh>
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, shape, accessories, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-5, -2, -5]} color="#6c5ce7" intensity={1} />
        <pointLight position={[0, 5, -5]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && <PetModel color={color} accessories={accessories} onClick={onPetClick} />}
             {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} isPreview={true} /></Float>}
             <ContactShadows opacity={0.4} scale={8} blur={2.5} far={1} color="#000" />
          </group>
          <Environment preset="city" />
          {!isLobby && (
              <EffectComposer multisampling={4}>
                <Bloom intensity={0.6} luminanceThreshold={1} mipmapBlur />
                <Vignette darkness={0.65} />
              </EffectComposer>
          )}
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.8} autoRotate={isLobby} autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;