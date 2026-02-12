import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES (REFINED FOR CAPSULE SHAPE) ---
const Accessory = ({ type, id }) => {
  if (!id) return null;

  // HEAD: Top of capsule is at y=0.8
  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.7, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh>
            <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI/2]} />
            <meshStandardMaterial color="#ff4757" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.65, 0.04, 0.5]} />
            <meshStandardMaterial color="#ff4757" roughness={0.5} />
        </mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.85, 0]}>
             <mesh>
                <cylinderGeometry args={[0.3, 0.25, 0.3, 8]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <mesh key={i} position={[Math.cos(i*Math.PI/4)*0.3, 0.2, Math.sin(i*Math.PI/4)*0.3]}>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#ffd700" />
                </mesh>
            ))}
        </group>
    );
  }

  // BODY: Central part of capsule
  if (type === 'body') {
     const color = id === 'tshirt_blue' ? '#3742fa' : '#2f3542';
     return (
        <group position={[0, 0, 0]}>
            <mesh>
                 <cylinderGeometry args={[0.52, 0.52, 0.7, 32]} />
                 <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Sleeves */}
            <mesh position={[-0.55, 0.1, 0]} rotation={[0,0,0.5]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.55, 0.1, 0]} rotation={[0,0,-0.5]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
     );
  }
  
  // LEGS: Bottom of capsule
  if (type === 'legs') {
     const color = id === 'jeans_classic' ? '#5352ed' : '#ff6b81';
      return (
        <group position={[0, -0.5, 0]}>
            <mesh position={[-0.22, -0.1, 0]}>
                 <cylinderGeometry args={[0.22, 0.2, 0.4, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.22, -0.1, 0]}>
                 <cylinderGeometry args={[0.22, 0.2, 0.4, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
            {/* Waist band */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.53, 0.53, 0.15, 32]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
     );
  }

  return null;
};

// --- PET MODEL ---
const PetModel = ({ mood, color = '#FFD700', accessories = {}, onClick }) => {
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
        const x = (mouse.x * viewport.width) / 12;
        const y = (mouse.y * viewport.height) / 12;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.15);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + 0.3, 0.15);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.5, 0.6, 16, 32]} />
              <meshToonMaterial color={color} />
            </mesh>

            <Accessory type="head" id={accessories?.head} />
            <Accessory type="body" id={accessories?.body} />
            <Accessory type="legs" id={accessories?.legs} />

            {/* Face */}
            <group ref={eyesRef} position={[0, 0.3, 0.48]}>
                <group position={[-0.2, 0, 0]}>
                    <mesh><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#1e272e" /></mesh>
                    <mesh position={[0.03, 0.03, 0.06]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
                <group position={[0.2, 0, 0]}>
                    <mesh><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#1e272e" /></mesh>
                    <mesh position={[0.03, 0.03, 0.06]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
            </group>

            <mesh position={[0, 0.1, 0.52]}>
                <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} rotation={[0,0,Math.PI]} />
                <meshBasicMaterial color="#1e272e" />
            </mesh>
        </group>
      </Float>
    </group>
  );
};

// ... (Rest of ModelViewer with Coin and Egg)
const GameBall = () => {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.5 - 0.5;
        mesh.current.rotation.x += 0.05;
    });
    return (
        <mesh ref={mesh} position={[0.8, 0, 0.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ff4757" roughness={0.3} />
        </mesh>
    );
};

const ModelViewer = ({ type, mood, color, accessories, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
        <ambientLight intensity={1} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#8c52ff" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel mood={mood} color={color} accessories={accessories} onClick={onPetClick} />
                    {activeAction === 'play' && <GameBall />}
                </>
             )}
             {type === 'coin' && (
               <group rotation={[Math.PI/2, 0, 0]}>
                   <mesh castShadow><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
               </group>
             )}
             {type === 'egg' && (
                <Float speed={2} rotationIntensity={0.5}><mesh castShadow><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#f5f6fa" roughness={0.5} /></mesh><Sparkles count={20} color="#f5f6fa" /></Float>
             )}
             <ContactShadows opacity={0.5} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.6} minPolarAngle={Math.PI/2.5} />
        </Suspense>
        <EffectComposer disableNormalPass>
            <Bloom intensity={0.3} luminanceThreshold={1} radius={0.5} />
            <Vignette darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default ModelViewer;