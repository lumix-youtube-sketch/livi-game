import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, Stars, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- HIGH QUALITY PROPS ---
const Decor = () => (
  <group position={[0, -1, 0]}>
    {/* Soft Round Platform */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color="#2d3436" roughness={0.8} />
    </mesh>
    
    {/* Aesthetic Plants (Abstract 3D) */}
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[-3, 0, -2]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#55efc4" />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
                <meshStandardMaterial color="#2d3436" />
            </mesh>
        </group>
    </Float>

    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[3.5, 1.2, -1]}>
            <mesh castShadow>
                <torusGeometry args={[0.3, 0.1, 16, 32]} />
                <meshStandardMaterial color="#fd79a8" emissive="#fd79a8" emissiveIntensity={0.5} />
            </mesh>
            <pointLight color="#fd79a8" intensity={0.5} distance={3} />
        </group>
    </Float>

    {/* Background Wall Art */}
    <group position={[0, 2, -5]}>
        <mesh>
            <planeGeometry args={[15, 10]} />
            <meshStandardMaterial color="#1e272e" />
        </mesh>
        <Sparkles count={50} scale={10} size={1} speed={0.2} opacity={0.2} />
    </group>
  </group>
);

const Accessory = ({ type, id }) => {
  if (!id) return null;
  const headY = 0.55;
  if (type === 'head' && id === 'cap_red') return (
      <group position={[0, headY, 0.1]} rotation={[-0.2, 0, 0]} scale={0.8}>
        <mesh><sphereGeometry args={[0.55, 32, 32]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
  );
  return null;
};

// --- ANIMATED CHIBI PET ---
const PetModel = ({ color, accessories, isSleeping, isFeeding, isPlaying, mood, onClick }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const armL = useRef();
  const armR = useRef();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (isSleeping) return;
    const blinkLoop = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blinkLoop, Math.random() * 3000 + 2000);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, [isSleeping]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        // IDLE MOVEMENT
        groupRef.current.position.y = isSleeping ? Math.sin(t) * 0.02 - 0.2 : Math.sin(t * 2) * 0.05;
        groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;

        // HEAD ANIMATION
        if (!isSleeping) {
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
            headRef.current.rotation.x = Math.cos(t * 0.8) * 0.05;
        }

        // ARM ANIMATION (Waving if happy)
        if (mood > 70 && !isSleeping) {
            armL.current.rotation.z = 0.5 + Math.sin(t * 10) * 0.3;
            armR.current.rotation.z = -0.5 - Math.sin(t * 10) * 0.3;
        } else {
            armL.current.rotation.z = 0.5 + Math.sin(t * 2) * 0.1;
            armR.current.rotation.z = -0.5 - Math.sin(t * 2) * 0.1;
        }

        // FEEDING JIGGLE
        if (isFeeding) {
            groupRef.current.scale.setScalar(1 + Math.sin(t * 20) * 0.05);
        } else {
            const s = 1 + Math.sin(t * 4) * 0.01;
            groupRef.current.scale.set(1/s, s, 1/s);
        }
    }
  });

  const eyeScaleY = isSleeping ? 0.1 : (blinking ? 0.1 : 1);
  const bodyColor = color || '#8c52ff';

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* BODY */}
      <mesh castShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={1} />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} position={[0, 0.25, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[-0.4, 0.4, -0.1]} rotation={[0, 0, -0.4]}><sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
          <mesh position={[0.4, 0.4, -0.1]} rotation={[0, 0, 0.4]}><sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} /></mesh>

          {/* FACE */}
          <group position={[0, 0, 0.48]}>
              <mesh position={[-0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <sphereGeometry args={[0.12, 32, 32]} />
                  <meshStandardMaterial color="#1e272e" roughness={0} />
              </mesh>
              <mesh position={[0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <sphereGeometry args={[0.12, 32, 32]} />
                  <meshStandardMaterial color="#1e272e" roughness={0} />
              </mesh>
              <mesh position={[-0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.05, 0.01, 16, 16, Math.PI]} /><meshBasicMaterial color="#1e272e" /></mesh>
          </group>
          <Accessory type="head" id={accessories?.head} />
      </group>

      {/* ARMS */}
      <mesh ref={armL} position={[-0.45, -0.2, 0.1]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.08, 0.2]} /><meshPhysicalMaterial color={bodyColor} />
      </mesh>
      <mesh ref={armR} position={[0.45, -0.2, 0.1]} rotation={[0, 0, -0.5]} castShadow>
          <capsuleGeometry args={[0.08, 0.2]} /><meshPhysicalMaterial color={bodyColor} />
      </mesh>

      {/* LEGS */}
      <mesh position={[-0.2, -0.7, 0]} castShadow><capsuleGeometry args={[0.1, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[0.2, -0.7, 0]} castShadow><capsuleGeometry args={[0.1, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, accessories, onPetClick, style, isLobby, isSleeping, isFeeding, mood = 100 }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 6]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-5, 2, 5]} intensity={1} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} isFeeding={isFeeding} mood={mood} />
                    <ContactShadows opacity={0.5} scale={10} blur={2.5} far={2} />
                </>
             )}
             {type === 'preview' && itemId && (
                 <Float speed={4} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} /></Float>
             )}
             <Decor />
          </group>
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;