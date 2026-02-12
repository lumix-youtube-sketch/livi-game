import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, useCursor, PerspectiveCamera, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- TEXTURED ACCESSORY ---
const TexturedAccessory = ({ type, id, shape, textureUrl }) => {
  const texture = textureUrl ? useLoader(THREE.TextureLoader, `https://livi-backend.onrender.com${textureUrl}`) : null;
  const mat = texture 
    ? <meshStandardMaterial map={texture} /> 
    : <meshStandardMaterial color={id === 'tshirt_blue' ? '#3742fa' : '#2f3542'} />;

  if (type === 'body') {
     return (
        <group position={[0, shape==='capsule'?0:-0.1, 0]}>
            <mesh>
                 <cylinderGeometry args={[0.53, 0.53, shape==='capsule'?0.7:0.5, 32]} />
                 {mat}
            </mesh>
        </group>
     );
  }
  return null;
};

// --- STANDARD ACCESSORY ---
const Accessory = ({ type, id, shape, textureUrl }) => {
  if (!id && !textureUrl) return null;
  if (textureUrl && type === 'body') return <TexturedAccessory type={type} id={id} shape={shape} textureUrl={textureUrl} />;

  // HEAD
  const headY = shape === 'capsule' ? 0.7 : 0.55;
  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, headY, 0.1]} rotation={[-0.1, 0, 0]}>
        <mesh><sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI/2]} /><meshStandardMaterial color="#ff4757" /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.65, 0.04, 0.5]} /><meshStandardMaterial color="#ff4757" /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, headY + 0.1, 0]}>
             <mesh><cylinderGeometry args={[0.3, 0.25, 0.3, 8]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
        </group>
    );
    if (id === 'ears_bunny') return (
        <group position={[0, headY, 0]}>
             <mesh position={[-0.2, 0.3, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.08, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.2, 0.3, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.08, 0.4, 4, 8]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }
  
  // LEGS
  if (type === 'legs') {
     const legsY = shape === 'capsule' ? -0.5 : -0.45;
     return (
        <group position={[0, legsY, 0]}>
            <mesh position={[-0.22, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color="#5352ed" /></mesh>
            <mesh position={[0.22, 0, 0]}><cylinderGeometry args={[0.2, 0.18, 0.3, 16]} /><meshStandardMaterial color="#5352ed" /></mesh>
        </group>
     );
  }
  return null;
};

// --- PET MODEL ---
const PetModel = ({ mood, color, shape, accessories, customTextures, onClick }) => {
  const meshRef = useRef();
  const eyesRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(t * 2.5) * 0.05;
        meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 15;
        const y = (mouse.y * viewport.height) / 15;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.1);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + (shape==='capsule'?0.3:0.2), 0.1);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
        <group ref={meshRef}>
            {/* Body */}
            <mesh castShadow receiveShadow>
              {shape === 'capsule' && <capsuleGeometry args={[0.5, 0.6, 32, 64]} />}
              {shape === 'round' && <sphereGeometry args={[0.65, 64, 64]} />}
              {shape === 'boxy' && <boxGeometry args={[0.85, 0.85, 0.85]} />}
              {/* Toon Shader with Rim Light */}
              <meshToonMaterial color={color} gradientMap={null} /> 
            </mesh>

            <Accessory type="head" id={accessories?.head} shape={shape} textureUrl={customTextures?.head} />
            <Accessory type="body" id={accessories?.body} shape={shape} textureUrl={customTextures?.body} />
            <Accessory type="legs" id={accessories?.legs} shape={shape} textureUrl={customTextures?.legs} />

            {/* Cute Face */}
            <group ref={eyesRef} position={[0, shape==='capsule'?0.3:0.2, 0.48]}>
                {/* Eyes */}
                <mesh position={[-0.2, 0, 0]} rotation={[0.1,0,0]}>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshStandardMaterial color="#1e272e" roughness={0.1} />
                </mesh>
                <mesh position={[0.2, 0, 0]} rotation={[0.1,0,0]}>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshStandardMaterial color="#1e272e" roughness={0.1} />
                </mesh>
                {/* Blush */}
                <mesh position={[-0.28, -0.12, -0.05]} rotation={[0,0,0]}>
                    <circleGeometry args={[0.06, 32]} />
                    <meshBasicMaterial color="#ff9ff3" opacity={0.6} transparent />
                </mesh>
                <mesh position={[0.28, -0.12, -0.05]} rotation={[0,0,0]}>
                    <circleGeometry args={[0.06, 32]} />
                    <meshBasicMaterial color="#ff9ff3" opacity={0.6} transparent />
                </mesh>
            </group>

            {/* Mouth */}
            <mesh position={[0, shape==='capsule'?0.15:0.05, 0.51]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.06, 0.02, 16, 32, Math.PI]} rotation={[0,0,Math.PI]} />
                <meshBasicMaterial color="#1e272e" />
            </mesh>
        </group>
      </Float>
    </group>
  );
};

// ... (Rest of ModelViewer)
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

const Background = ({ id }) => {
    if (id === 'bg_space') return <Sparkles count={100} scale={10} size={4} speed={0.2} opacity={0.8} color="#fff" />;
    if (id === 'bg_park') return <Environment preset="park" background blur={0.6} />;
    if (id === 'bg_room') return <Environment preset="apartment" background blur={0.8} />;
    return null; // Default
};

const ModelViewer = ({ type, mood, color, shape, accessories, customTextures, background, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={40} />
        
        {/* LIGHTING */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#8c52ff" />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel mood={mood} color={color || '#8c52ff'} shape={shape || 'capsule'} accessories={accessories} customTextures={customTextures} onClick={onPetClick} />
                    {activeAction === 'play' && <GameBall />}
                </>
             )}
             {type === 'coin' && <group rotation={[Math.PI/2, 0, 0]}><mesh castShadow><cylinderGeometry args={[0.5, 0.5, 0.1, 32]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh></group>}
             <ContactShadows opacity={0.4} scale={10} blur={2.5} far={1.5} color="#000" />
          </group>
          
          <Background id={background} />
          
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/1.6} minPolarAngle={Math.PI/2.5} />
        </Suspense>
        
        <EffectComposer disableNormalPass>
            <Bloom intensity={0.4} luminanceThreshold={0.9} radius={0.6} />
            <Vignette darkness={0.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default ModelViewer;