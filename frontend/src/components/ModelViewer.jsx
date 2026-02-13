import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Decor = () => (
  <group position={[0, -1, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[10, 32]} />
      <meshStandardMaterial color="#1a1a1a" roughness={1} />
    </mesh>
    <Float speed={2} floatIntensity={0.5}>
        <mesh position={[-4, 1, -3]}><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#6c5ce7" emissive="#6c5ce7" /></mesh>
    </Float>
    <Float speed={3} floatIntensity={1}>
        <mesh position={[4, 2, -4]}><torusGeometry args={[0.2, 0.05]} /><meshStandardMaterial color="#fd79a8" /></mesh>
    </Float>
  </group>
);

const PetModel = ({ color, accessories, isSleeping, isFeeding, mood, onClick }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blinkLoop = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blinkLoop, Math.random() * 3000 + 2000);
    };
    const timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.position.y = isSleeping ? -0.2 : Math.sin(t * 2) * 0.05;
        if (!isSleeping) headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
        if (isFeeding) groupRef.current.scale.setScalar(1 + Math.sin(t * 20) * 0.03);
    }
  });

  const bodyColor = color || '#8c52ff';
  const eyeScaleY = isSleeping || blinking ? 0.1 : 1;

  return (
    <group ref={groupRef} onClick={onClick}>
      <mesh castShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={1} />
      </mesh>
      <group ref={headRef} position={[0, 0.25, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.2} clearcoat={1} />
          </mesh>
          <group position={[0, 0, 0.48]}>
              <mesh position={[-0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}><sphereGeometry args={[0.12, 32, 32]} /><meshStandardMaterial color="#111" /></mesh>
              <mesh position={[0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}><sphereGeometry args={[0.12, 32, 32]} /><meshStandardMaterial color="#111" /></mesh>
              <mesh position={[-0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
          </group>
      </group>
      <mesh position={[-0.45, -0.2, 0.1]} rotation={[0, 0, 0.5]}><capsuleGeometry args={[0.07, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[0.45, -0.2, 0.1]} rotation={[0, 0, -0.5]}><capsuleGeometry args={[0.07, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[-0.2, -0.7, 0]}><capsuleGeometry args={[0.09, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      <mesh position={[0.2, -0.7, 0]}><capsuleGeometry args={[0.09, 0.2]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, accessories, onPetClick, style, isLobby, isSleeping, isFeeding }) => {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 7.5]} fov={30} /> {/* Камера дальше */}
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.3} intensity={2} castShadow />
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} isFeeding={isFeeding} />
                    <ContactShadows opacity={0.4} scale={8} blur={2} far={2} />
                </>
             )}
             {!isLobby && <Decor />}
          </group>
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;