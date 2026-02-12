import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment, Decal, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES ---
const Accessory = ({ type, id, isPreview, textureUrl }) => {
  if (!id && !textureUrl && !isPreview) return null;
  const texture = textureUrl ? useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`) : null;
  const mat = texture ? <meshStandardMaterial map={texture} /> : <meshStandardMaterial color={id === 'tshirt_blue' ? '#3742fa' : '#2f3542'} />;

  // HEAD
  if (type === 'head') {
    if (id === 'cap_red' || isPreview === 'cap_red') return (
      <group position={[0, 0.55, 0]} rotation={[-0.2, 0, 0]}>
        <mesh><sphereGeometry args={[0.52, 32, 32, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.1, 0.5]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.4]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, 0.7, 0]} rotation={[0.1,0,0]}>
             <mesh><cylinderGeometry args={[0.35, 0.25, 0.25, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} /></mesh>
        </group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, 0.5, 0]}>
             <mesh position={[-0.3, 0.4, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.5, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.3, 0.4, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.1, 0.5, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }

  // BODY
  if (type === 'body') {
     return (
        <group position={[0, -0.2, 0]}>
            <mesh>
                 <cylinderGeometry args={[0.52, 0.52, 0.5, 32]} />
                 {mat}
            </mesh>
        </group>
     );
  }
  
  // LEGS
  if (type === 'legs') {
      return (
        <group position={[0, -0.65, 0]}>
            <mesh position={[-0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3, 4, 8]} /><meshStandardMaterial color="#5352ed" /></mesh>
            <mesh position={[0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3, 4, 8]} /><meshStandardMaterial color="#5352ed" /></mesh>
        </group>
     );
  }
  return null;
};

// --- KAWAII BEAN MODEL ---
const PetModel = ({ mood, color, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const faceRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        // Idle Bounce
        meshRef.current.position.y = Math.sin(t * 3) * 0.05;
        meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
    // Face Tracking
    if (faceRef.current) {
        const x = (mouse.x * viewport.width) / 20;
        const y = (mouse.y * viewport.height) / 20;
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, x, 0.1);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, y + 0.15, 0.1);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <group ref={meshRef}>
          {/* Main Body: Capsule Shape */}
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.5, 0.8, 8, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>

          {/* Simple Cute Hands */}
          <mesh position={[-0.55, 0, 0]} rotation={[0,0,0.5]}>
              <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0.55, 0, 0]} rotation={[0,0,-0.5]}>
              <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>

          {/* Simple Cute Feet */}
          <group position={[0, -0.6, 0]}>
              <mesh position={[-0.2, 0, 0.1]} rotation={[0.5,0,0]}>
                  <capsuleGeometry args={[0.15, 0.25, 4, 8]} />
                  <meshStandardMaterial color={color} roughness={0.4} />
              </mesh>
              <mesh position={[0.2, 0, 0.1]} rotation={[0.5,0,0]}>
                  <capsuleGeometry args={[0.15, 0.25, 4, 8]} />
                  <meshStandardMaterial color={color} roughness={0.4} />
              </mesh>
          </group>

          <Accessory type="head" id={accessories?.head} textureUrl={customTextures?.head} />
          <Accessory type="body" id={accessories?.body} textureUrl={customTextures?.body} />
          <Accessory type="legs" id={accessories?.legs} textureUrl={customTextures?.legs} />

          {/* KAWAII FACE (Simple Geometry) */}
          <group ref={faceRef} position={[0, 0.15, 0.46]}>
              {/* Black Eyes */}
              <mesh position={[-0.18, 0, 0]}>
                  <capsuleGeometry args={[0.06, 0.08, 4, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.1} />
              </mesh>
              <mesh position={[0.18, 0, 0]}>
                  <capsuleGeometry args={[0.06, 0.08, 4, 8]} />
                  <meshStandardMaterial color="#111" roughness={0.1} />
              </mesh>
              
              {/* White Glint (Reflection) */}
              <mesh position={[-0.15, 0.05, 0.05]}>
                  <sphereGeometry args={[0.02]} />
                  <meshBasicMaterial color="white" />
              </mesh>
              <mesh position={[0.21, 0.05, 0.05]}>
                  <sphereGeometry args={[0.02]} />
                  <meshBasicMaterial color="white" />
              </mesh>

              {/* Tiny Mouth */}
              <mesh position={[0, -0.1, 0]}>
                  <torusGeometry args={[0.04, 0.015, 8, 16, Math.PI]} rotation={[0,0,Math.PI]} />
                  <meshBasicMaterial color="#111" />
              </mesh>
              
              {/* Blush */}
              <mesh position={[-0.28, -0.05, -0.05]}>
                  <circleGeometry args={[0.05]} />
                  <meshBasicMaterial color="#ff9ff3" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0.28, -0.05, -0.05]}>
                  <circleGeometry args={[0.05]} />
                  <meshBasicMaterial color="#ff9ff3" transparent opacity={0.6} />
              </mesh>
          </group>
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, mood, color, accessories, customTextures, background, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={35} />
        
        {/* Soft "Studio" Lighting */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#a29bfe" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && <PetModel mood={mood} color={color || '#8c52ff'} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />}
             
             {type === 'preview' && (
                 <Float speed={3} rotationIntensity={1}>
                    <Accessory type={itemId.split('_')[0] === 'bg' ? 'background' : itemId.split('_')[0]} id={itemId} isPreview={itemId} />
                 </Float>
             )}

             {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh castShadow><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh></group>}
             
             <ContactShadows opacity={0.4} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          {background && background !== 'bg_default' && <Environment preset="city" background blur={0.8} />}
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.6} />
        </Suspense>
        <EffectComposer disableNormalPass><Bloom intensity={0.2} luminanceThreshold={1} /><Vignette darkness={0.4} /></EffectComposer>
      </Canvas>
    </div>
  );
};

export default ModelViewer;