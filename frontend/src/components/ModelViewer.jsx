import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- ACCESSORIES ---
const Accessory = ({ type, id, isPreview, textureUrl, shape }) => {
  if (!id && !textureUrl && !isPreview) return null;
  let texture = null;
  if (textureUrl && textureUrl.startsWith('/uploads')) {
      try { texture = useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`); } catch (e) {}
  }
  const mat = texture ? <meshStandardMaterial map={texture} /> : <meshStandardMaterial color={id === 'tshirt_blue' ? '#3742fa' : '#2f3542'} />;
  const headY = shape === 'round' ? 0.5 : 0.7;

  if (type === 'head') {
    if (id === 'cap_red' || isPreview === 'cap_red') return (
      <group position={[0, isPreview?0:headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.52, 32, 16, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, isPreview?0:headY + 0.1, 0]} rotation={[0.1,0,0]}>
             <mesh><cylinderGeometry args={[0.35, 0.25, 0.25, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
        </group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, isPreview?0:headY, 0]}>
             <mesh position={[-0.3, 0.4, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.5, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.3, 0.4, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.1, 0.5, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }
  if (type === 'body') return <group position={[0, isPreview?0:-0.2, 0]}><mesh><cylinderGeometry args={[0.52, 0.52, 0.5, 32]} />{mat}</mesh></group>;
  if (type === 'legs') return <group position={[0, isPreview?0:-0.65, 0]}><mesh position={[-0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3, 4, 8]} /><meshStandardMaterial color="#5352ed" /></mesh><mesh position={[0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3, 4, 8]} /><meshStandardMaterial color="#5352ed" /></mesh></group>;
  return null;
};

// --- PET MODEL ---
const PetModel = ({ color, shape, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const faceRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) meshRef.current.position.y = Math.sin(t * 3) * 0.05;
    if (faceRef.current) {
        const x = (mouse.x * viewport.width) / 30;
        const y = (mouse.y * viewport.height) / 30;
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, x, 0.1);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, y + 0.15, 0.1);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <group ref={meshRef}>
          <mesh castShadow receiveShadow>
            {shape === 'round' ? <sphereGeometry args={[0.65, 32, 32]} /> : 
             shape === 'boxy' ? <boxGeometry args={[0.85, 0.85, 0.85]} /> :
             <capsuleGeometry args={[0.5, 0.8, 8, 16]} />}
            <meshStandardMaterial color={color || '#8c52ff'} roughness={0.4} />
          </mesh>
          <Accessory type="head" id={accessories?.head} shape={shape} textureUrl={customTextures?.head} />
          <Accessory type="body" id={accessories?.body} shape={shape} textureUrl={customTextures?.body} />
          <Accessory type="legs" id={accessories?.legs} shape={shape} textureUrl={customTextures?.legs} />
          <group ref={faceRef} position={[0, 0.15, 0.46]}>
              <mesh position={[-0.18, 0, 0]}><capsuleGeometry args={[0.06, 0.08, 4, 8]} /><meshStandardMaterial color="#111" roughness={0.1} /></mesh>
              <mesh position={[0.18, 0, 0]}><capsuleGeometry args={[0.06, 0.08, 4, 8]} /><meshStandardMaterial color="#111" roughness={0.1} /></mesh>
              <mesh position={[0, -0.1, 0]}><torusGeometry args={[0.04, 0.015, 8, 16, Math.PI]} rotation={[0,0,Math.PI]} /><meshBasicMaterial color="#111" /></mesh>
          </group>
      </group>
    </group>
  );
};

const Background = ({ id }) => {
    if (id === 'bg_space') return <group><Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /><Sparkles count={50} scale={10} size={2} color="white" /></group>;
    if (id === 'bg_park') return <Environment preset="park" background blur={0.5} />;
    if (id === 'bg_room') return <Environment preset="apartment" background blur={0.7} />;
    return null;
};

const ModelViewer = ({ type, itemId, color, shape, accessories, customTextures, background, activeAction, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100px', ...style }}>
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        {!isLobby && background && <color attach="background" args={[background === 'bg_space' ? '#020205' : '#0f0f14']} />}
        <PerspectiveCamera makeDefault position={[0, 0, isLobby ? 5.5 : 6]} fov={35} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        
        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
             {type === 'pet' && <PetModel color={color} shape={shape} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />}
             {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} isPreview={itemId} shape="capsule" /></Float>}
             {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh></group>}
             <ContactShadows opacity={0.4} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          {!isLobby && <Background id={background} />}
        </Suspense>
        {!isLobby && <EffectComposer disableNormalPass><Bloom intensity={0.2} luminanceThreshold={1} /><Vignette darkness={0.5} /></EffectComposer>}
      </Canvas>
    </div>
  );
};

export default ModelViewer;