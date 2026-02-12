import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, ContactShadows, Environment, Sparkles, useCursor, SoftShadows, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// Premium Falling Item
const FallingItem = ({ type, onComplete }) => {
  const mesh = useRef();
  const [active, setActive] = useState(true);

  useFrame((state, delta) => {
    if (!active) return;
    if (mesh.current.position.y > -0.5) {
      mesh.current.position.y -= delta * 4;
      mesh.current.rotation.x += delta * 5;
      mesh.current.rotation.z += delta * 3;
    } else {
      setActive(false);
      if (onComplete) onComplete();
    }
  });

  if (!active) return null;

  return (
    <mesh ref={mesh} position={[0, 3, 0.5]} castShadow receiveShadow>
      {type === 'feed' ? (
        <dodecahedronGeometry args={[0.35, 0]} />
      ) : (
        <icosahedronGeometry args={[0.35, 0]} />
      )}
      <meshStandardMaterial 
        color={type === 'feed' ? "#ff7675" : "#74b9ff"} 
        emissive={type === 'feed' ? "#d63031" : "#0984e3"}
        emissiveIntensity={2} // Glows with Bloom
        roughness={0.2}
      />
    </mesh>
  );
};

// Ultra Coin Model
export const CoinModel = () => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 1.5;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <cylinderGeometry args={[0.45, 0.45, 0.08, 64]} />
      <meshPhysicalMaterial 
        color="#ffd700" 
        emissive="#ffbf00"
        emissiveIntensity={0.2}
        metalness={1} 
        roughness={0.15} 
        clearcoat={1}
      />
    </mesh>
  );
};

// Ultra Egg Model
export const EggModel = () => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial 
          color="#f0ead6" 
          roughness={0.15} 
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.1}
        />
      </mesh>
      <Sparkles count={40} scale={4} size={3} speed={0.4} opacity={0.6} color="#ffeaa7" noise={0.2} />
    </Float>
  );
};

// AAA Pet Model (S-Tier Shader)
export const PetModel = ({ mood, color = '#FFD700', onClick }) => {
  const meshRef = useRef();
  const eyesRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);
  
  useCursor(hovered);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Organic Breathing
    if (mood === 'sleepy') {
        meshRef.current.scale.set(1.1, 0.9 + Math.sin(t) * 0.05, 1.1);
    } else {
        meshRef.current.position.y = Math.sin(t * 2.5) * 0.08;
        // Subtle Squash & Stretch
        const scaleY = 1 + Math.sin(t * 5) * 0.02;
        meshRef.current.scale.set(1 / Math.sqrt(scaleY), scaleY, 1 / Math.sqrt(scaleY));
    }

    // Smooth Eye Tracking
    if (mood !== 'sleepy' && eyesRef.current) {
        const x = (mouse.x * viewport.width) / 5;
        const y = (mouse.y * viewport.height) / 5;
        eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, x, 0.1);
        eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, y + 0.2, 0.1);
    }
  });

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <Float speed={mood === 'sleepy' ? 1 : 3} rotationIntensity={0.2} floatIntensity={0.1} floatingRange={[-0.1, 0.1]}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[1, 128, 128]} />
          {/* S-Tier Material: High Gloss, Subsurface feel, Iridescence */}
          <MeshDistortMaterial
            color={color}
            envMapIntensity={2} // Strong reflections
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0.3}
            roughness={0.1}
            transmission={0} 
            speed={mood === 'happy' ? 4 : 1.5}
            distort={0.25} // Organic wobbling
            radius={1}
          />
          
          {/* Face Group */}
          <group ref={eyesRef} position={[0, 0.2, 0.88]}>
             <group>
                <mesh position={[-0.32, 0, 0]}>
                    <sphereGeometry args={[mood === 'sleepy' ? 0.02 : 0.11, 32, 32]} />
                    <meshStandardMaterial color="#1e272e" roughness={0.1} />
                </mesh>
                <mesh position={[0.32, 0, 0]}>
                    <sphereGeometry args={[mood === 'sleepy' ? 0.02 : 0.11, 32, 32]} />
                    <meshStandardMaterial color="#1e272e" roughness={0.1} />
                </mesh>
                {mood !== 'sleepy' && (
                    <>
                        <mesh position={[-0.28, 0.05, 0.08]}>
                            <sphereGeometry args={[0.035, 16, 16]} />
                            <meshBasicMaterial color="white" toneMapped={false} />
                        </mesh>
                        <mesh position={[0.36, 0.05, 0.08]}>
                            <sphereGeometry args={[0.035, 16, 16]} />
                            <meshBasicMaterial color="white" toneMapped={false} />
                        </mesh>
                    </>
                )}
             </group>
          </group>

          {/* Mouth */}
          <mesh position={[0, -0.15, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
             {mood === 'happy' ? (
                 <torusGeometry args={[0.12, 0.035, 16, 32, Math.PI]} />
             ) : mood === 'sad' ? (
                 <torusGeometry args={[0.12, 0.035, 16, 32, Math.PI]} rotation={[0, 0, Math.PI]} />
             ) : (
                 <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
             )}
             <meshStandardMaterial color="#1e272e" roughness={0.5} />
          </mesh>
        </mesh>
      </Float>
    </group>
  );
};

const ModelViewer = ({ type, mood, color, activeAction, onPetClick, style }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.7} color="#a29bfe" />
        <spotLight 
            position={[5, 8, 5]} 
            angle={0.25} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
            color="#ffeaa7"
        />
        {/* Rim Light for contour */}
        <spotLight position={[-5, 5, -5]} intensity={5} color="#6c5ce7" distance={20} />
        
        {/* Fill Light */}
        <pointLight position={[0, -2, 2]} intensity={0.5} color="#fd79a8" />

        <Environment preset="city" blur={1} />

        <Suspense fallback={null}>
          <group position={[0, -0.3, 0]}>
            {type === 'egg' && <EggModel />}
            {type === 'pet' && (
                <>
                    <PetModel mood={mood} color={color} onClick={onPetClick} />
                    {activeAction && <FallingItem key={Date.now()} type={activeAction} />}
                </>
            )}
            {type === 'coin' && <CoinModel />}
            
            <ContactShadows 
                position={[0, -1.3, 0]} 
                opacity={0.6} 
                scale={10} 
                blur={2.5} 
                far={1.6} 
                color="#000000"
            />
          </group>
          
          {/* Depth Particles */}
          {type === 'pet' && (
             <Sparkles count={50} scale={8} size={2} speed={0.5} opacity={0.5} color={color} />
          )}

          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.7} 
            minPolarAngle={Math.PI / 2.5}
            rotateSpeed={0.5}
          />
        </Suspense>

        {/* Post-Processing Effects */}
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.4} />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
            <Noise opacity={0.02} /> {/* Film grain for realism */}
        </EffectComposer>

      </Canvas>
    </div>
  );
};

export default ModelViewer;
