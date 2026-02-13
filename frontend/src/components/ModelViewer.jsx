import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --- CUTE ROOM ---
const Room = () => (
  <group position={[0, -1, 0]}>
    {/* Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#f0f2f5" roughness={0.8} />
    </mesh>
    {/* Back Wall */}
    <mesh position={[0, 2.5, -3]} receiveShadow>
      <planeGeometry args={[10, 5]} />
      <meshStandardMaterial color="#dfe6e9" roughness={0.8} />
    </mesh>
  </group>
);

// --- ACCESSORIES ---
const Accessory = ({ type, id }) => {
  if (!id) return null;
  const matProps = { roughness: 0.2, metalness: 0.4 };
  if (type === 'head' && id === 'cap_red') return (
      <group position={[0, 0.55, 0.1]} rotation={[-0.2, 0, 0]} scale={0.8}>
        <mesh><sphereGeometry args={[0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
      </group>
  );
  return null;
};

// --- CHIBI PET MODEL ---
const PetModel = ({ color, accessories, isSleeping, mood, onClick }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const [blinking, setBlinking] = useState(false);

  // Blink Logic
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

  // Idle / Sleep Animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        // Floating/Breathing
        groupRef.current.position.y = isSleeping 
            ? -0.2 + Math.sin(t * 1) * 0.02 // Lower and slower when sleeping
            : Math.sin(t * 2) * 0.05;       // Bouncy when awake
            
        // Rotation (looking around slightly)
        if (!isSleeping) {
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
            headRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
        } else {
            headRef.current.rotation.z = 0.1; // Head tilt when sleeping
            headRef.current.rotation.x = 0.2; // Head down
        }
    }
  });

  const eyeScaleY = isSleeping ? 0.1 : (blinking ? 0.1 : 1);
  const bodyColor = color || '#8c52ff';

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Sparkles if Happy */}
      {!isSleeping && mood > 80 && <Sparkles count={10} scale={1.5} size={2} speed={0.4} opacity={0.5} color="#ffd700" position={[0, 0.5, 0]} />}
      {isSleeping && <Sparkles count={5} scale={1} size={3} speed={0.2} opacity={0.5} color="#fff" position={[0.5, 0.8, 0]} />} {/* Zzz placeholder */}

      {/* --- BODY (Tiny) --- */}
      <mesh castShadow receiveShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial color={bodyColor} roughness={0.2} metalness={0.1} clearcoat={0.5} />
      </mesh>

      {/* --- HEAD (Big) --- */}
      <group ref={headRef} position={[0, 0.25, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.2} metalness={0.1} clearcoat={0.5} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.4, 0.4, -0.1]} rotation={[0, 0, -0.4]} castShadow>
              <sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0.4, 0.4, -0.1]} rotation={[0, 0, 0.4]} castShadow>
              <sphereGeometry args={[0.15]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>

          {/* FACE */}
          <group position={[0, 0, 0.48]}>
              {/* Eyes */}
              <group position={[-0.2, 0.05, 0]}>
                  <mesh scale={[1, eyeScaleY, 1]}>
                      <sphereGeometry args={[0.12, 32, 16]} />
                      <meshStandardMaterial color="#1e272e" roughness={0} />
                  </mesh>
                  {/* Highlight */}
                  {!isSleeping && !blinking && <mesh position={[0.04, 0.04, 0.09]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>}
              </group>
              <group position={[0.2, 0.05, 0]}>
                  <mesh scale={[1, eyeScaleY, 1]}>
                      <sphereGeometry args={[0.12, 32, 16]} />
                      <meshStandardMaterial color="#1e272e" roughness={0} />
                  </mesh>
                  {!isSleeping && !blinking && <mesh position={[0.04, 0.04, 0.09]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>}
              </group>

              {/* Cheeks */}
              <mesh position={[-0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0.3, -0.1, -0.05]} scale={[1, 0.6, 1]}><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>

              {/* Mouth */}
              <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]} scale={[1, isSleeping ? 0.5 : 1, 1]}>
                  <torusGeometry args={[0.05, 0.015, 16, 16, Math.PI]} />
                  <meshBasicMaterial color="#1e272e" />
              </mesh>
          </group>

          <Accessory type="head" id={accessories?.head} />
      </group>

      {/* --- LIMBS --- */}
      {/* Arms */}
      <group position={[-0.4, -0.2, 0.2]} rotation={[0, 0, 0.5]}>
          <mesh castShadow><capsuleGeometry args={[0.08, 0.25]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      </group>
      <group position={[0.4, -0.2, 0.2]} rotation={[0, 0, -0.5]}>
          <mesh castShadow><capsuleGeometry args={[0.08, 0.25]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      </group>

      {/* Legs */}
      <group position={[-0.2, -0.7, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.1, 0.3]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      </group>
      <group position={[0.2, -0.7, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.1, 0.3]} /><meshPhysicalMaterial color={bodyColor} /></mesh>
      </group>

    </group>
  );
};

const ModelViewer = ({ type, itemId, color, shape, accessories, onPetClick, style, isLobby, isSleeping, mood = 100 }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
        
        <ambientLight intensity={0.7} />
        <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]} scale={0.9}> {/* Scale down slightly */}
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} mood={mood} />
                    <ContactShadows opacity={0.4} scale={5} blur={2} far={1.2} />
                </>
             )}
             {/* Only show Room in Game Mode or if specifically requested, but for Lobby we might want transparency. Let's keep Room for both for now to see "Room on background" */}
             <Room /> 
          </group>
        </Suspense>
        
        {/* Orbit Controls restricted */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI / 2.5} 
            maxPolarAngle={Math.PI / 1.8} 
            autoRotate={isLobby} 
            autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer;