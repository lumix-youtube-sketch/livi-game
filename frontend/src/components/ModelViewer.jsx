import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES ---
const Accessory = ({ type, id }) => {
  if (!id) return null;

  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.5, 0.1]} rotation={[-0.2, 0, 0]}>
        <mesh>
            <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI/2]} />
            <meshStandardMaterial color="#ff4757" />
        </mesh>
        <mesh position={[0, -0.1, 0.5]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.4]} />
            <meshStandardMaterial color="#ff4757" />
        </mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.6, 0]}>
             <mesh>
                <cylinderGeometry args={[0.3, 0.25, 0.25, 8]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
  }

  if (type === 'body') {
     const color = id === 'tshirt_blue' ? '#3742fa' : '#2f3542';
     return (
        <group position={[0, -0.1, 0]}>
            <mesh>
                 <cylinderGeometry args={[0.55, 0.52, 0.6, 32]} />
                 <meshStandardMaterial color={color} />
            </mesh>
        </group>
     );
  }
  
  if (type === 'legs') {
     const color = id === 'jeans_classic' ? '#5352ed' : '#ff6b81';
      return (
        <group position={[0, -0.6, 0]}>
            <mesh position={[-0.2, 0, 0]}>
                 <cylinderGeometry args={[0.18, 0.15, 0.3, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.2, 0, 0]}>
                 <cylinderGeometry args={[0.18, 0.15, 0.3, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
        </group>
     );
  }

  return null;
};

// --- PET MODEL (NEW AAA TOON SHAPE) ---
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
        const s = 0.8 + Math.sin(t * 10) * 0.01; // Smaller base scale
        meshRef.current.scale.set(s, s, s);
    }
    
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 10;
        const y = (mouse.y * viewport.height) / 10;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.15);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + 0.1, 0.15);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={meshRef}>
            {/* Body Shape - Pill like */}
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[0.5, 0.6, 16, 32]} />
              <meshToonMaterial color={color} />
            </mesh>

            {/* Little Hands */}
            <mesh position={[-0.6, -0.1, 0]} rotation={[0,0,0.2]}>
                <sphereGeometry args={[0.15]} />
                <meshToonMaterial color={color} />
            </mesh>
            <mesh position={[0.6, -0.1, 0]} rotation={[0,0,-0.2]}>
                <sphereGeometry args={[0.15]} />
                <meshToonMaterial color={color} />
            </mesh>
            
            <Accessory type="head" id={accessories?.head} />
            <Accessory type="body" id={accessories?.body} />
            <Accessory type="legs" id={accessories?.legs} />

            {/* Face */}
            <group ref={eyesRef} position={[0, 0.3, 0.45]}>
                <group position={[-0.2, 0, 0]}>
                    <mesh><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#1e272e" /></mesh>
                    <mesh position={[0.03, 0.03, 0.05]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
                <group position={[0.2, 0, 0]}>
                    <mesh><sphereGeometry args={[0.08]} /><meshBasicMaterial color="#1e272e" /></mesh>
                    <mesh position={[0.03, 0.03, 0.05]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                </group>
            </group>

            <mesh position={[0, 0.1, 0.5]}>
                <torusGeometry args={[0.08, 0.02, 16, 32, Math.PI]} rotation={[0,0,Math.PI]} />
                <meshBasicMaterial color="#1e272e" />
            </mesh>
        </group>
      </Float>
    </group>
  );
};

// --- MINI GAMES MODELS ---
const GameBall = () => {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.5;
        mesh.current.rotation.x += 0.05;
    });
    return (
        <mesh ref={mesh} position={[0.8, -0.5, 0.5]}>
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
                   <mesh castShadow>
                     <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
                     <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                   </mesh>
               </group>
             )}
             
             {type === 'egg' && (
                <Float speed={2} rotationIntensity={0.5}>
                    <mesh castShadow>
                        <sphereGeometry args={[0.8, 32, 32]} />
                        <meshStandardMaterial color="#f5f6fa" roughness={0.5} />
                    </mesh>
                    <Sparkles count={20} color="#f5f6fa" />
                </Float>
             )}

             <ContactShadows opacity={0.5} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.6} minPolarAngle={Math.PI/2.5} rotateSpeed={0.5} />
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