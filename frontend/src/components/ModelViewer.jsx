import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES (Simple Geometric Placeholders) ---
const Accessory = ({ type, id }) => {
  if (!id) return null;

  // HEAD
  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.65, 0.1]} rotation={[-0.2, 0, 0]}>
        {/* Cap Body */}
        <mesh>
            <sphereGeometry args={[0.71, 32, 32, 0, Math.PI * 2, 0, Math.PI/2.5]} />
            <meshStandardMaterial color="#ff4757" roughness={0.8} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, -0.05, 0.65]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.7, 0.05, 0.5]} />
            <meshStandardMaterial color="#ff4757" roughness={0.8} />
        </mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.85, 0]} rotation={[0.1,0,0]}>
             <mesh>
                <cylinderGeometry args={[0.4, 0.3, 0.3, 8]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                 <sphereGeometry args={[0.05]} />
                 <meshStandardMaterial color="red" />
            </mesh>
        </group>
    );
  }

  // BODY
  if (type === 'body') {
     const color = id === 'tshirt_blue' ? '#3742fa' : '#2f3542';
     return (
        <group position={[0, -0.4, 0]}>
            {/* Simple band for shirt */}
            <mesh>
                 <cylinderGeometry args={[0.95, 0.9, 0.6, 32]} />
                 <meshStandardMaterial color={color} roughness={1} />
            </mesh>
            {/* Logo */}
            {id === 'hoodie_black' && (
                <mesh position={[0, 0, 0.96]}>
                    <planeGeometry args={[0.3, 0.3]} />
                    <meshBasicMaterial color="#ff4757" />
                </mesh>
            )}
        </group>
     );
  }
  
  // LEGS
  if (type === 'legs') {
     const color = id === 'jeans_classic' ? '#5352ed' : '#ff6b81';
      return (
        <group position={[0, -0.9, 0]}>
            <mesh position={[-0.3, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.3, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
                 <meshStandardMaterial color={color} />
            </mesh>
        </group>
     );
  }

  return null;
};

// --- PET MODEL (TOON STYLE) ---
const PetModel = ({ mood, color = '#FFD700', accessories = {}, onClick }) => {
  const meshRef = useRef();
  const eyesRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Bounce
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t * 3) * 0.05;
        // Squish
        const s = 1 + Math.sin(t * 10) * 0.01;
        meshRef.current.scale.set(s, 1/s, s);
    }
    
    // Eyes
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 6;
        const y = (mouse.y * viewport.height) / 6;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.15);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + 0.2, 0.15);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 64, 64]} />
              {/* TOON SHADER: Matte, Cartoonish */}
              <meshToonMaterial color={color} gradientMap={null} />
            </mesh>
            
            {/* ACCESSORIES ATTACHMENT */}
            {accessories && (
                <>
                    <Accessory type="head" id={accessories.head} />
                    <Accessory type="body" id={accessories.body} />
                    <Accessory type="legs" id={accessories.legs} />
                </>
            )}

            {/* Face */}
            <group ref={eyesRef} position={[0, 0.2, 0.88]}>
                <group position={[-0.32, 0, 0]}>
                    <mesh rotation={[0,0,0]}>
                        <capsuleGeometry args={[0.11, 0.15, 4, 8]} />
                        <meshBasicMaterial color="#1e272e" />
                    </mesh>
                    <mesh position={[0.05, 0.05, 0.08]}>
                        <sphereGeometry args={[0.04]} />
                        <meshBasicMaterial color="#fff" />
                    </mesh>
                </group>
                <group position={[0.32, 0, 0]}>
                    <mesh rotation={[0,0,0]}>
                        <capsuleGeometry args={[0.11, 0.15, 4, 8]} />
                        <meshBasicMaterial color="#1e272e" />
                    </mesh>
                    <mesh position={[0.05, 0.05, 0.08]}>
                        <sphereGeometry args={[0.04]} />
                        <meshBasicMaterial color="#fff" />
                    </mesh>
                </group>
            </group>

            {/* Mouth */}
            <mesh position={[0, -0.2, 0.9]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.1, 0.03, 16, 32, Math.PI]} rotation={[0,0,Math.PI]} />
                <meshBasicMaterial color="#1e272e" />
            </mesh>
        </group>
      </Float>
    </group>
  );
};

const ModelViewer = ({ type, mood, color, accessories, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.2 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        
        {/* Soft Cartoon Lighting */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight 
            position={[5, 8, 5]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.2, 0]}>
             {type === 'pet' && (
                <PetModel mood={mood} color={color} accessories={accessories} onClick={onPetClick} />
             )}
             
             {type === 'coin' && (
               <group rotation={[Math.PI/2, 0, 0]}>
                   <mesh castShadow>
                     <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
                     <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                   </mesh>
               </group>
             )}
             
             {type === 'egg' && (
                <Float speed={2} rotationIntensity={0.5}>
                    <mesh castShadow>
                        <sphereGeometry args={[1, 32, 32]} />
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
            <Bloom intensity={0.4} luminanceThreshold={0.9} radius={0.5} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>

      </Canvas>
    </div>
  );
};

export default ModelViewer;