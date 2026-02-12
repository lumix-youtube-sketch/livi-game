import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

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
        <mesh><sphereGeometry args={[0.52, 32, 16]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold' || isPreview === 'crown_gold') return (
        <group position={[0, isPreview?0:headY + 0.1, 0]}><mesh><cylinderGeometry args={[0.35, 0.25, 0.25, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh></group>
    );
    if (id === 'ears_bunny' || isPreview === 'ears_bunny') return (
        <group position={[0, isPreview?0:headY, 0]}>
             <mesh position={[-0.3, 0.4, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.3, 0.4, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.1, 0.5]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }
  if (type === 'body') return <group position={[0, isPreview?0:-0.2, 0]}><mesh><cylinderGeometry args={[0.52, 0.52, 0.5, 32]} />{mat}</mesh></group>;
  if (type === 'legs') return <group position={[0, isPreview?0:-0.65, 0]}><mesh position={[-0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3]} /><meshStandardMaterial color="#5352ed" /></mesh><mesh position={[0.22, 0, 0]}><capsuleGeometry args={[0.18, 0.3]} /><meshStandardMaterial color="#5352ed" /></mesh></group>;
  return null;
};

const PetModel = ({ color, shape, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const faceRef = useRef();
  const { viewport, mouse } = useThree();
  const [isBlinking, setBlinking] = useState(false);

  useEffect(() => {
    const blink = () => { setBlinking(true); setTimeout(() => setBlinking(false), 150); setTimeout(blink, Math.random() * 4000 + 2000); };
    const tid = setTimeout(blink, 2000); return () => clearTimeout(tid);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) meshRef.current.position.y = Math.sin(t * 2) * 0.04;
    if (faceRef.current) {
        faceRef.current.position.x = THREE.MathUtils.lerp(faceRef.current.position.x, (mouse.x * viewport.width) / 30, 0.1);
        faceRef.current.position.y = THREE.MathUtils.lerp(faceRef.current.position.y, (mouse.y * viewport.height) / 30 + (shape==='round'?0.2:0.15), 0.1);
    }
  });

  return (
    <group onClick={onClick}>
      <group ref={meshRef}>
          <mesh castShadow receiveShadow>
            {shape === 'round' ? <sphereGeometry args={[0.65, 64, 64]} /> : 
             shape === 'boxy' ? <boxGeometry args={[0.85, 0.85, 0.85]} /> :
             <capsuleGeometry args={[0.5, 0.8, 16, 32]} />}
            <meshPhysicalMaterial color={color || '#8c52ff'} roughness={0.2} metalness={0.1} clearcoat={1} transmission={0.1} thickness={0.5} />
          </mesh>
          <Accessory type="head" id={accessories?.head} shape={shape} textureUrl={customTextures?.head} />
          <Accessory type="body" id={accessories?.body} shape={shape} textureUrl={customTextures?.body} />
          <Accessory type="legs" id={accessories?.legs} shape={shape} textureUrl={customTextures?.legs} />
          <group ref={faceRef} position={[0, 0.15, 0.48]}>
              <mesh position={[-0.18, 0, 0]} scale={[1, isBlinking ? 0.1 : 1, 1]}><sphereGeometry args={[0.07, 32, 32]} /><meshStandardMaterial color="#111" roughness={0} /></mesh>
              <mesh position={[0.18, 0, 0]} scale={[1, isBlinking ? 0.1 : 1, 1]}><sphereGeometry args={[0.07, 32, 32]} /><meshStandardMaterial color="#111" roughness={0} /></mesh>
              <mesh position={[0, -0.1, 0]}><torusGeometry args={[0.04, 0.015, 8, 16, Math.PI]} rotation={[0,0,Math.PI]} /><meshBasicMaterial color="#111" /></mesh>
          </group>
      </group>
    </group>
  );
};

const Stage = ({ background }) => {
    return (
        <group position={[0, -1.2, 0]}>
            {/* Отражающий пол */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={40}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#101010"
                    metalness={0.5}
                />
            </mesh>
            <ContactShadows opacity={0.4} scale={10} blur={2} far={1.5} color="#000" />
        </group>
    );
};

const ModelViewer = ({ type, itemId, color, shape, accessories, customTextures, background, onPetClick, style, isLobby }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, isLobby ? 5.5 : 6.5]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8c52ff" />
        
        <Suspense fallback={null}>
          <PetModel color={color} shape={shape} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />
          {type === 'preview' && itemId && <Float speed={3} rotationIntensity={1}><Accessory type={itemId.split('_')[0]} id={itemId} isPreview={itemId} shape="capsule" /></Float>}
          {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh></group>}
          <Stage background={background} />
          {background === 'bg_space' ? <Sparkles count={100} scale={10} size={2} color="white" /> : <Environment preset="city" />}
        </Suspense>
        <EffectComposer disableNormalPass><Bloom intensity={0.4} luminanceThreshold={1} /><Vignette darkness={0.6} /></EffectComposer>
      </Canvas>
    </div>
  );
};

export default ModelViewer;