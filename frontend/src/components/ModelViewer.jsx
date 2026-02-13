import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment, Stars, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Outline, Selection, Select } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES ---
const Accessory = ({ type, id, isPreview, textureUrl, shape }) => {
  if (!id && !textureUrl && !isPreview) return null;
  let texture = null;
  if (textureUrl && textureUrl.startsWith('/uploads')) {
      try { texture = useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`); } catch (e) {}
  }
  const mat = texture ? <meshStandardMaterial map={texture} /> : <meshToonMaterial color={id === 'tshirt_blue' ? '#3742fa' : '#2f3542'} />;
  const headY = 0.65;

  if (type === 'head') {
    if (id === 'cap_red' || isPreview === 'cap_red') return (
      <group position={[0, isPreview?0:headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshToonMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshToonMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, isPreview?0:headY + 0.1, 0]} rotation={[0.1,0,0]}>
             <mesh><cylinderGeometry args={[0.35, 0.25, 0.25, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
        </group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, isPreview?0:headY, 0]}>
             <mesh position={[-0.3, 0.4, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshToonMaterial color="#fff" /></mesh>
             <mesh position={[0.3, 0.4, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshToonMaterial color="#fff" /></mesh>
        </group>
    );
    if (id === 'glasses_cool' || isPreview === 'glasses_cool') return (
        <group position={[0, isPreview?0:0.45, 0.55]}>
            <mesh position={[-0.15, 0, 0]}><boxGeometry args={[0.25, 0.1, 0.05]} /><meshStandardMaterial color="black" roughness={0.2} /></mesh>
            <mesh position={[0.15, 0, 0]}><boxGeometry args={[0.25, 0.1, 0.05]} /><meshStandardMaterial color="black" roughness={0.2} /></mesh>
            <mesh position={[0, 0, -0.02]}><boxGeometry args={[0.05, 0.02, 0.02]} /><meshStandardMaterial color="black" /></mesh>
        </group>
    );
    if (id === 'hat_wizard' || isPreview === 'hat_wizard') return (
        <group position={[0, isPreview?0:0.8, 0]} rotation={[-0.2, 0, 0]}>
            <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.6, 0.6, 0.05, 32]} /><meshStandardMaterial color="#4834d4" /></mesh>
            <mesh position={[0, 0.4, 0]}><coneGeometry args={[0.35, 1, 32]} /><meshStandardMaterial color="#4834d4" /></mesh>
        </group>
    );
  }
  if (type === 'body') {
      if (id === 'scarf_winter' || isPreview === 'scarf_winter') return (
          <group position={[0, isPreview?0:0.35, 0]} rotation={[0.2,0,0]}>
              <mesh><torusGeometry args={[0.45, 0.15, 16, 32]} /><meshStandardMaterial color="#e056fd" /></mesh>
              <mesh position={[0.3, -0.3, 0.4]} rotation={[0.5,0.5,0]}><boxGeometry args={[0.2, 0.6, 0.1]} /><meshStandardMaterial color="#e056fd" /></mesh>
          </group>
      );
      if (id === 'suit_formal' || isPreview === 'suit_formal') return (
          <group position={[0, isPreview?0:0.1, 0.55]}>
              <mesh position={[0, 0, 0]}><boxGeometry args={[0.2, 0.1, 0.05]} /><meshStandardMaterial color="black" /></mesh>
              <mesh position={[0, 0, 0.02]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color="red" /></mesh>
          </group>
      );
      return <group position={[0, isPreview?0:-0.15, 0]}><mesh><cylinderGeometry args={[0.55, 0.55, 0.55, 32]} />{mat}</mesh></group>;
  }
  if (type === 'legs') {
      if (id === 'shorts_beach' || isPreview === 'shorts_beach') return (
          <group position={[0, isPreview?0:-0.6, 0]}>
            <mesh position={[-0.22, 0, 0]}><capsuleGeometry args={[0.22, 0.35]} /><meshToonMaterial color="#ff9f43" /></mesh>
            <mesh position={[0.22, 0, 0]}><capsuleGeometry args={[0.22, 0.35]} /><meshToonMaterial color="#ff9f43" /></mesh>
          </group>
      );
      return <group position={[0, isPreview?0:-0.6, 0]}><mesh position={[-0.22, 0, 0]}><capsuleGeometry args={[0.2, 0.3]} /><meshToonMaterial color="#5352ed" /></mesh><mesh position={[0.22, 0, 0]}><capsuleGeometry args={[0.2, 0.3]} /><meshToonMaterial color="#5352ed" /></mesh></group>;
  }
  return null;
};

// --- THE NEW AAA CHARACTER ---
const PetModel = ({ color, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const faceRef = useRef();
  const { viewport, mouse } = useThree();
  const [isBlinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => { setBlinking(true); setTimeout(() => setBlinking(false), 120); setTimeout(blink, Math.random() * 5000 + 2000); };
    const tid = setTimeout(blink, 2000); return () => clearTimeout(tid);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t * 2.5) * 0.05;
        // Squish & Stretch effect
        const s = 1 + Math.sin(t * 5) * 0.02;
        meshRef.current.scale.set(1/s, s, 1/s);
    }
    if (faceRef.current) {
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, (mouse.x * viewport.width) / 25, 0.15);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, (mouse.y * viewport.height) / 25 + 0.25, 0.15);
    }
  });

  return (
    <Select enabled>
        <group onClick={onClick}>
          <group ref={meshRef}>
              {/* Organic Body */}
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.7, 64, 64]} />
                <meshToonMaterial color={color || '#8c52ff'} />
              </mesh>
              <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.75, 64, 64]} />
                <meshToonMaterial color={color || '#8c52ff'} />
              </mesh>

              <Accessory type="head" id={accessories?.head} textureUrl={customTextures?.head} />
              <Accessory type="body" id={accessories?.body} textureUrl={customTextures?.body} />
              <Accessory type="legs" id={accessories?.legs} textureUrl={customTextures?.legs} />

              {/* Expression Face */}
              <group ref={faceRef} position={[0, 0.25, 0.55]}>
                  <mesh position={[-0.2, 0, 0]} scale={[1, isBlinking ? 0.1 : 1, 1]}>
                      <sphereGeometry args={[0.1, 32, 32]} />
                      <meshStandardMaterial color="#111" roughness={0} />
                      <mesh position={[0.03, 0.03, 0.08]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                  </mesh>
                  <mesh position={[0.2, 0, 0]} scale={[1, isBlinking ? 0.1 : 1, 1]}>
                      <sphereGeometry args={[0.1, 32, 32]} />
                      <meshStandardMaterial color="#111" roughness={0} />
                      <mesh position={[0.03, 0.03, 0.08]}><sphereGeometry args={[0.03]} /><meshBasicMaterial color="#fff" /></mesh>
                  </mesh>
                  <mesh position={[0, -0.15, 0]} rotation={[0,0,Math.PI]}><torusGeometry args={[0.06, 0.02, 16, 32, Math.PI]} /><meshBasicMaterial color="#111" /></mesh>
              </group>
          </group>
        </group>
    </Select>
  );
};

const EnvironmentHelper = ({ id }) => {
    if (id === 'bg_space') return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            <Sparkles count={100} scale={15} size={3} speed={0.2} color="#fff" />
        </group>
    );
    if (id === 'bg_park') return <Environment preset="park" background blur={0.4} />;
    if (id === 'bg_room') return <Environment preset="apartment" background blur={0.6} />;
    return null;
};

const ModelViewer = ({ type, itemId, color, shape, accessories, customTextures, background, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        {/* Cinematic Lighting */}
        {!isLobby && <color attach="background" args={[background === 'bg_space' ? '#020205' : background === 'bg_park' ? '#87ceeb' : '#0f0f14']} />}
        <PerspectiveCamera makeDefault position={[0, 0, isLobby ? 5.5 : 6]} fov={35} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.8} color="#8c52ff" />
        
        <Suspense fallback={null}>
          <Selection>
              <group position={[0, -0.2, 0]}>
                 {type === 'pet' && <PetModel color={color} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />}
                 {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} isPreview={itemId} shape="capsule" /></Float>}
                 <ContactShadows opacity={0.5} scale={10} blur={2.5} far={1.5} color="#000" />
              </group>
              <EnvironmentHelper id={background} />
              {!isLobby && (
                  <EffectComposer multisampling={8} autoClear={false}>
                    <Outline selectionLayer={1} visibleEdgeColor={0x000000} edgeStrength={5} width={1024} />
                    <Bloom intensity={0.3} luminanceThreshold={1} />
                    <Vignette darkness={0.5} />
                  </EffectComposer>
              )}
          </Selection>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.6} autoRotate={isLobby} autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;