import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, PerspectiveCamera, Environment, Stars, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Selection, Select } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES (Upgraded to Physical Materials) ---
const Accessory = ({ type, id, isPreview, textureUrl }) => {
  if (!id && !textureUrl && !isPreview) return null;
  let texture = null;
  if (textureUrl && textureUrl.startsWith('/uploads')) {
      try { texture = useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`); } catch (e) {}
  }
  
  const accProps = { roughness: 0.1, metalness: 0.4, clearcoat: 1 };
  const headY = 0.65;

  if (type === 'head') {
    if (id === 'cap_red' || isPreview === 'cap_red') return (
      <group position={[0, isPreview ? 0 : headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.55, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshPhysicalMaterial color="#ff4757" {...accProps} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshPhysicalMaterial color="#ff4757" {...accProps} /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, isPreview ? 0 : headY + 0.1, 0]}>
             <mesh><cylinderGeometry args={[0.35, 0.25, 0.25, 8]} /><meshPhysicalMaterial color="#ffd700" metalness={1} roughness={0.1} clearcoat={1} /></mesh>
        </group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, isPreview ? 0 : headY, 0]}>
             <mesh position={[-0.3, 0.4, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshPhysicalMaterial color="#fff" {...accProps} /></mesh>
             <mesh position={[0.3, 0.4, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshPhysicalMaterial color="#fff" {...accProps} /></mesh>
        </group>
    );
    if (id === 'glasses_cool' || isPreview === 'glasses_cool') return (
        <group position={[0, isPreview ? 0 : 0.45, 0.55]}>
            <mesh position={[-0.15, 0, 0]}><boxGeometry args={[0.25, 0.1, 0.05]} /><meshPhysicalMaterial color="#111" roughness={0} metalness={0.8} /></mesh>
            <mesh position={[0.15, 0, 0]}><boxGeometry args={[0.25, 0.1, 0.05]} /><meshPhysicalMaterial color="#111" roughness={0} metalness={0.8} /></mesh>
        </group>
    );
    if (id === 'hat_wizard' || isPreview === 'hat_wizard') return (
        <group position={[0, isPreview ? 0 : 0.8, 0]} rotation={[-0.2, 0, 0]}>
            <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.6, 0.6, 0.05, 32]} /><meshPhysicalMaterial color="#4834d4" metalness={0.5} roughness={0.3} /></mesh>
            <mesh position={[0, 0.4, 0]}><coneGeometry args={[0.35, 1, 32]} /><meshPhysicalMaterial color="#4834d4" metalness={0.5} roughness={0.3} /></mesh>
        </group>
    );
  }
  if (type === 'body') {
      const bodyMat = texture ? <meshPhysicalMaterial map={texture} {...accProps} /> : <meshPhysicalMaterial color={id === 'tshirt_blue' ? '#3742fa' : '#2f3542'} {...accProps} />;
      return <group position={[0, isPreview ? 0 : -0.15, 0]}><mesh><cylinderGeometry args={[0.55, 0.55, 0.55, 32]} />{bodyMat}</mesh></group>;
  }
  return null;
};

// --- PRO PET MODEL (AAA QUALITY) ---
const PetModel = ({ color, accessories, customTextures, onClick }) => {
  const groupRef = useRef();
  const faceRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const { viewport, mouse } = useThree();
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => { setBlinking(true); setTimeout(() => setBlinking(false), 150); setTimeout(blink, Math.random() * 4000 + 2000); };
    const tid = setTimeout(blink, 2000); return () => clearTimeout(tid);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 1.2) * 0.05;
        const s = 1 + Math.sin(t * 2.4) * 0.02;
        groupRef.current.scale.set(1/s, s, 1/s);
    }
    if (faceRef.current) {
        const targetX = (mouse.x * viewport.width) / 40;
        const targetY = (mouse.y * viewport.height) / 40 + 0.2;
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, targetX, 0.1);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, targetY, 0.1);
    }
  });

  const bodyMaterial = useMemo(() => (
    <meshPhysicalMaterial 
        color={color || '#8c52ff'}
        roughness={0.15}
        metalness={0.1}
        transmission={0.1}
        thickness={1}
        clearcoat={1}
        clearcoatRoughness={0.05}
    />
  ), [color]);

  return (
    <group onClick={onClick} ref={groupRef}>
      {/* Body Parts - Combined for organic look */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.7, 64, 64]} />
        {bodyMaterial}
      </mesh>
      <mesh position={[0, -0.45, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.78, 64, 64]} />
        {bodyMaterial}
      </mesh>
      
      {/* Accessories */}
      <Accessory type="head" id={accessories?.head} textureUrl={customTextures?.head} />
      <Accessory type="body" id={accessories?.body} textureUrl={customTextures?.body} />

      {/* High-End Expression Face */}
      <group ref={faceRef} position={[0, 0.2, 0.6]}>
          {/* Eyes with Depth */}
          <group position={[-0.22, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color="#080808" roughness={0} /></mesh>
              <mesh position={[0.04, 0.04, 0.1]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>
          </group>
          <group position={[0.22, 0, 0]} scale={[1, blinking ? 0.05 : 1, 1]}>
              <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color="#080808" roughness={0} /></mesh>
              <mesh position={[0.04, 0.04, 0.1]}><sphereGeometry args={[0.04]} /><meshBasicMaterial color="white" /></mesh>
          </group>
          
          {/* Cute Blush */}
          <mesh position={[-0.35, -0.15, -0.05]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.3} /></mesh>
          <mesh position={[0.35, -0.15, -0.05]}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.3} /></mesh>
          
          {/* Mouth */}
          <mesh position={[0, -0.2, 0]} rotation={[0,0,Math.PI]}><torusGeometry args={[0.06, 0.015, 16, 32, Math.PI]} /><meshBasicMaterial color="#080808" /></mesh>
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, shape, accessories, customTextures, background, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        {!isLobby && <color attach="background" args={[background === 'bg_space' ? '#05050a' : '#0a0a0f']} />}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-5, -5, -5]} color="#6c5ce7" intensity={1} />
        
        <Suspense fallback={null}>
          <group position={[0, -0.2, 0]}>
             {type === 'pet' && <PetModel color={color} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />}
             {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} isPreview={true} /></Float>}
             <ContactShadows opacity={0.4} scale={10} blur={2} far={1.5} color="#000" />
          </group>
          <Environment preset="city" />
          {!isLobby && (
              <EffectComposer multisampling={4}>
                <Bloom intensity={0.4} luminanceThreshold={1} mipmapBlur />
                <Vignette darkness={0.6} />
              </EffectComposer>
          )}
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.8} autoRotate={isLobby} autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;