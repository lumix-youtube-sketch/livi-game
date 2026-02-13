import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- COZY CYBER ATTIC ---
const Room = () => (
  <group position={[0, -1, 0]}>
    {/* Soft Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[15, 32]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
    </mesh>
    
    {/* Window with Stars View */}
    <group position={[0, 3, -6]}>
        <mesh>
            <planeGeometry args={[12, 8]} />
            <meshBasicMaterial color="#05050a" />
        </mesh>
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
    </group>

    {/* Stylish Floating Lamp */}
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[-3, 2.5, -2]}>
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial emissive="#a29bfe" emissiveIntensity={2} color="#a29bfe" />
            </mesh>
            <pointLight color="#a29bfe" intensity={1} distance={5} />
        </group>
    </Float>

    {/* Low Table/Shelf */}
    <mesh position={[3, 0.2, -2]} castShadow>
        <boxGeometry args={[2, 0.4, 1.5]} />
        <meshStandardMaterial color="#2d3436" />
    </mesh>
  </group>
);

const Accessory = ({ type, id, isPreview }) => {
  if (!id) return null;
  const matProps = { roughness: 0.1, metalness: 0.5 };
  
  // Pivot points for Chibi Pet
  const headY = 0.55;
  const bodyY = -0.3;

  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, headY, 0.1]} rotation={[-0.2, 0, 0]} scale={0.85}>
        <mesh><sphereGeometry args={[0.55, 32, 32, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshPhysicalMaterial color="#ff4757" {...matProps} clearcoat={1} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshPhysicalMaterial color="#ff4757" {...matProps} clearcoat={1} /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, headY + 0.15, 0]} scale={0.7}>
             <mesh><cylinderGeometry args={[0.4, 0.3, 0.3, 8]} /><meshPhysicalMaterial color="#ffd700" metalness={1} roughness={0.1} clearcoat={1} /></mesh>
        </group>
    );
  }
  
  if (type === 'body') {
      return (
        <group position={[0, bodyY, 0]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.48, 0.48, 0.4, 32]} />
                <meshPhysicalMaterial color={id === 'tshirt_blue' ? '#0984e3' : '#2d3436'} roughness={0.5} />
            </mesh>
        </group>
      );
  }
  return null;
};

const PetModel = ({ color, accessories, isSleeping, mood, onClick }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (isSleeping) return;
    const blinkLoop = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blinkLoop, Math.random() * 4000 + 2000);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, [isSleeping]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.position.y = isSleeping ? -0.2 + Math.sin(t) * 0.02 : Math.sin(t * 2) * 0.05;
        if (!isSleeping) headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  const eyeScaleY = isSleeping ? 0.1 : (blinking ? 0.1 : 1);
  const bodyColor = color || '#8c52ff';

  return (
    <group ref={groupRef} onClick={onClick}>
      {!isSleeping && mood > 80 && <Sparkles count={15} scale={2} size={2} speed={0.5} opacity={0.5} color="#ffd700" />}

      {/* BODY */}
      <mesh castShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={0.5} />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} position={[0, 0.25, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={0.5} />
          </mesh>
          <mesh position={[-0.4, 0.4, -0.1]} rotation={[0, 0, -0.4]}><sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
          <mesh position={[0.4, 0.4, -0.1]} rotation={[0, 0, 0.4]}><sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} /></mesh>

          {/* FACE */}
          <group position={[0, 0, 0.48]}>
              <group position={[-0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <mesh><sphereGeometry args={[0.12, 32, 16]} /><meshStandardMaterial color="#1e272e" roughness={0} /></mesh>
                  {!isSleeping && !blinking && <mesh position={[0.04, 0.04, 0.09]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>}
              </group>
              <group position={[0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <mesh><sphereGeometry args={[0.12, 32, 16]} /><meshStandardMaterial color="#1e272e" roughness={0} /></mesh>
                  {!isSleeping && !blinking && <mesh position={[0.04, 0.04, 0.09]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>}
              </group>
              <mesh position={[-0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]} scale={[1, isSleeping ? 0.5 : 1, 1]}><torusGeometry args={[0.05, 0.015, 16, 16, Math.PI]} /><meshBasicMaterial color="#1e272e" /></mesh>
          </group>

          <Accessory type="head" id={accessories?.head} />
      </group>

      <Accessory type="body" id={accessories?.body} />

      {/* LIMBS */}
      <mesh position={[-0.4, -0.2, 0.2]} rotation={[0, 0, 0.5]} castShadow><capsuleGeometry args={[0.08, 0.25]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[0.4, -0.2, 0.2]} rotation={[0, 0, -0.5]} castShadow><capsuleGeometry args={[0.08, 0.25]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[-0.2, -0.7, 0]} castShadow><capsuleGeometry args={[0.1, 0.3]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[0.2, -0.7, 0]} castShadow><capsuleGeometry args={[0.1, 0.3]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, accessories, onPetClick, style, isLobby, isSleeping, mood = 100 }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 1, 6.5]} fov={35} /> {/* отодвинул камеру */}
        
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={1} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} mood={mood} />
                    <ContactShadows opacity={0.6} scale={12} blur={3} far={2} color="#000" />
                </>
             )}
             {/* Shop Preview Logic */}
             {type === 'preview' && itemId && (
                 <Float speed={4} rotationIntensity={1} floatIntensity={1}>
                     <Accessory type={itemId.split('_')[0]} id={itemId} isPreview={true} />
                 </Float>
             )}
             <Room /> 
          </group>
          <Environment preset="night" />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;