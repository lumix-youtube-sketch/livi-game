import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- DETAILED ACCESSORY ---
const Accessory = ({ type, id, shape, textureUrl, isPreview }) => {
  if (!id && !textureUrl && !isPreview) return null;
  const texture = textureUrl ? useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`) : null;
  
  const headY = shape === 'round' ? 0.5 : 0.7;
  
  if (type === 'head') {
    if (id === 'cap_red' || isPreview === 'cap_red') return (
      <group position={[0, isPreview?0:headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.52, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, isPreview?0:headY + 0.1, 0]}>
             <mesh><cylinderGeometry args={[0.3, 0.2, 0.3, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
        </group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, isPreview?0:headY, 0]}>
             <mesh position={[-0.2, 0.3, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.08, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.2, 0.3, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.08, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }

  if (type === 'body') {
     const color = id === 'tshirt_blue' || isPreview === 'tshirt_blue' ? '#3742fa' : '#2f3542';
     return (
        <group position={[0, isPreview?0:-0.1, 0]}>
            <mesh>
                 <cylinderGeometry args={[0.55, 0.55, 0.6, 32]} />
                 {texture ? <meshStandardMaterial map={texture} /> : <meshStandardMaterial color={color} />}
            </mesh>
        </group>
     );
  }
  
  if (type === 'legs') {
      return (
        <group position={[0, isPreview?0:-0.6, 0]}>
            <mesh position={[-0.2, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color="#5352ed" /></mesh>
            <mesh position={[0.2, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color="#5352ed" /></mesh>
        </group>
     );
  }
  return null;
};

// --- ULTRA DETAILED PET ---
const PetModel = ({ mood, color, shape, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const eyesRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t * 2) * 0.05;
        // Breathing effect
        const s = 0.9 + Math.sin(t * 4) * 0.01;
        meshRef.current.scale.set(s, 1/s, s);
    }
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 15;
        const y = (mouse.y * viewport.height) / 15;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.1);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + (shape==='round'?0.2:0.3), 0.1);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <group ref={meshRef}>
          {/* Main Body - Organic Soft Shape */}
          <mesh castShadow receiveShadow>
            {shape === 'round' ? <sphereGeometry args={[0.65, 64, 64]} /> : 
             shape === 'boxy' ? <boxGeometry args={[0.9, 0.9, 0.9]} /> :
             <capsuleGeometry args={[0.5, 0.7, 32, 64]} />}
            <MeshDistortMaterial color={color} speed={2} distort={0.2} radius={1} />
          </mesh>

          {/* Hands with small fingers */}
          <group position={[0, 0, 0]}>
              <mesh position={[-0.6, -0.1, 0]} rotation={[0,0,0.3]}>
                  <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                  <meshStandardMaterial color={color} />
              </mesh>
              <mesh position={[0.6, -0.1, 0]} rotation={[0,0,-0.3]}>
                  <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                  <meshStandardMaterial color={color} />
              </mesh>
          </group>

          {/* Feet */}
          <group position={[0, -0.7, 0]}>
              <mesh position={[-0.25, 0, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color={color} /></mesh>
              <mesh position={[0.25, 0, 0.1]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color={color} /></mesh>
          </group>

          <Accessory type="head" id={accessories?.head} shape={shape} textureUrl={customTextures?.head} />
          <Accessory type="body" id={accessories?.body} shape={shape} textureUrl={customTextures?.body} />
          <Accessory type="legs" id={accessories?.legs} shape={shape} textureUrl={customTextures?.legs} />

          {/* High-Detail Face */}
          <group ref={eyesRef} position={[0, 0.3, 0.48]}>
              {/* Eyes with Pupils */}
              <group position={[-0.22, 0, 0]}>
                  <mesh><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial color="white" roughness={0.1} /></mesh>
                  <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#1e272e" /></mesh>
                  <mesh position={[0.03, 0.03, 0.08]}><sphereGeometry args={[0.02, 8, 8]} /><meshBasicMaterial color="white" /></mesh>
              </group>
              <group position={[0.22, 0, 0]}>
                  <mesh><sphereGeometry args={[0.1, 32, 32]} /><meshStandardMaterial color="white" roughness={0.1} /></mesh>
                  <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#1e272e" /></mesh>
                  <mesh position={[0.03, 0.03, 0.08]}><sphereGeometry args={[0.02, 8, 8]} /><meshBasicMaterial color="white" /></mesh>
              </group>
          </group>

          {/* Cute Mouth */}
          <mesh position={[0, 0.1, 0.52]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.07, 0.02, 16, 32, Math.PI]} rotation={[0,0,Math.PI]} />
              <meshBasicMaterial color="#1e272e" />
          </mesh>
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, mood, color, shape, accessories, customTextures, background, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#8c52ff" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.2, 0]}>
             {type === 'pet' && <PetModel mood={mood} color={color || '#8c52ff'} shape={shape || 'capsule'} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />}
             
             {type === 'preview' && (
                 <Float speed={3} rotationIntensity={2}>
                    <Accessory type={itemId.split('_')[0] === 'bg' ? 'background' : itemId.split('_')[0]} id={itemId} isPreview={itemId} />
                 </Float>
             )}

             {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh castShadow><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh></group>}
             
             <ContactShadows opacity={0.4} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          {background && background !== 'bg_default' && <Environment preset="city" background blur={0.8} />}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
        <EffectComposer disableNormalPass><Bloom intensity={0.4} luminanceThreshold={1} /><Vignette darkness={0.5} /></EffectComposer>
      </Canvas>
    </div>
  );
};

export default ModelViewer;