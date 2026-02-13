import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, useHelper } from '@react-three/drei';
import * as THREE from 'three';

// --- RICH ROOM DECOR ---
const Interior = () => (
  <group position={[0, -1, 0]}>
    {/* Infinite Floor Look */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[20, 32]} />
      <meshStandardMaterial color="#fdfcf0" roughness={1} />
    </mesh>
    
    {/* Minimalist Bed (Chibi Style) */}
    <group position={[2, 0, -1]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[1.5, 0.3, 2.5]} /><meshStandardMaterial color="#6c5ce7" /></mesh>
        <mesh position={[0, 0.35, -0.8]} castShadow><boxGeometry args={[1.3, 0.2, 0.6]} /><meshStandardMaterial color="white" /></mesh>
    </group>

    {/* Small Shelf */}
    <group position={[-2.5, 0, -2]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[1.2, 0.1, 0.6]} /><meshStandardMaterial color="#fab1a0" /></mesh>
        <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[1.2, 0.1, 0.6]} /><meshStandardMaterial color="#fab1a0" /></mesh>
        <mesh position={[-0.5, 0.4, 0]} castShadow><boxGeometry args={[0.1, 0.8, 0.5]} /><meshStandardMaterial color="#fab1a0" /></mesh>
        <mesh position={[0.5, 0.4, 0]} castShadow><boxGeometry args={[0.1, 0.8, 0.5]} /><meshStandardMaterial color="#fab1a0" /></mesh>
    </group>

    {/* Rug */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.5]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#dfe6e9" />
    </mesh>
  </group>
);

const Accessory = ({ type, id, isPreview }) => {
  if (!id) return null;
  const matProps = { roughness: 0.1, metalness: 0.3 };
  
  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.5, 0.1]} rotation={[-0.2, 0, 0]} scale={0.85}>
        <mesh><sphereGeometry args={[0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.75, 0]} scale={0.7}>
             <mesh><cylinderGeometry args={[0.4, 0.3, 0.3, 8]} /><meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} /></mesh>
        </group>
    );
  }
  
  if (type === 'body') {
      // Adjusted for Chibi body
      return (
        <group position={[0, -0.3, 0]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.48, 0.48, 0.4, 32]} />
                <meshStandardMaterial color={id === 'tshirt_blue' ? '#0984e3' : '#2d3436'} />
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
        if (!isSleeping) {
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        }
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
    <div style={{ width: '100%', height: '100%', minHeight: '100px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={35} />
        <fog attach="fog" args={['#fdfcf0', 5, 15]} />
        
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.2, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} mood={mood} />
                    <ContactShadows opacity={0.4} scale={10} blur={2.5} far={2} />
                </>
             )}
             <Interior /> 
          </group>
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;