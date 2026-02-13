import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Float, Sparkles, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --- STYLISH STUDIO ---
const Decor = () => (
  <group position={[0, -0.8, 0]}>
    {/* Infinite Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[10, 64]} />
      <meshStandardMaterial color="#121212" roughness={0.6} metalness={0.2} />
    </mesh>
    
    {/* Floating Neon Elements */}
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-3, 2, -2]}>
            <torusKnotGeometry args={[0.4, 0.1, 64, 8]} />
            <meshStandardMaterial color="#6c5ce7" emissive="#6c5ce7" emissiveIntensity={0.8} />
        </mesh>
    </Float>
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[3, 1, -3]}>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#00cec9" emissive="#00cec9" emissiveIntensity={0.5} />
        </mesh>
    </Float>
  </group>
);

// --- ACCESSORIES (Fixed & Scaled) ---
const Accessory = ({ type, id }) => {
  if (!id) return null;
  const matProps = { roughness: 0.2, metalness: 0.4 };

  if (type === 'head') {
    if (id === 'cap_red') return (
      <group position={[0, 0.38, 0.1]} rotation={[-0.2, 0, 0]} scale={0.85}>
        <mesh castShadow><sphereGeometry args={[0.56, 32, 32, 0, Math.PI*2, 0, Math.PI/1.8]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
        <mesh position={[0, -0.05, 0.55]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.45]} /><meshStandardMaterial color="#ff4757" {...matProps} /></mesh>
      </group>
    );
    if (id === 'crown_gold') return (
        <group position={[0, 0.6, 0]} rotation={[0.1, 0, 0]} scale={0.7}>
             <mesh castShadow><cylinderGeometry args={[0.4, 0.3, 0.3, 8]} /><meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} /></mesh>
        </group>
    );
    if (id === 'ears_bunny') return (
        <group position={[0, 0.5, 0]}>
             <mesh position={[-0.3, 0.3, 0]} rotation={[0,0,-0.2]} castShadow><capsuleGeometry args={[0.1, 0.5]} /><meshStandardMaterial color="white" /></mesh>
             <mesh position={[0.3, 0.3, 0]} rotation={[0,0,0.2]} castShadow><capsuleGeometry args={[0.1, 0.5]} /><meshStandardMaterial color="white" /></mesh>
        </group>
    );
  }
  
  // Body items (Shirts, etc)
  if (type === 'body') {
      return (
        <group position={[0, 0, 0]} scale={1.02}>
            <mesh castShadow>
                <sphereGeometry args={[0.45, 32, 32]} />
                <meshStandardMaterial color={id === 'tshirt_blue' ? '#0984e3' : '#2d3436'} {...matProps} />
            </mesh>
        </group>
      );
  }
  return null;
};

// --- MAIN CHARACTER ---
const PetModel = ({ color, accessories, isSleeping, isFeeding, mood, onClick }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const bodyRef = useRef();
  const { viewport, mouse } = useThree();
  const [blinking, setBlinking] = useState(false);

  // Smooth Blinking
  useEffect(() => {
    if (isSleeping) return;
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      setTimeout(blink, Math.random() * 4000 + 2000);
    };
    const t = setTimeout(blink, 2000);
    return () => clearTimeout(t);
  }, [isSleeping]);

  // Procedural Animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
        // Smooth breathing (not shaking)
        const breathe = Math.sin(t * 1.5) * 0.03;
        groupRef.current.position.y = isSleeping ? -0.1 : breathe;
        
        // Body subtle squash/stretch
        const scale = 1 + Math.sin(t * 3) * 0.01;
        groupRef.current.scale.set(1/scale, scale, 1/scale);
    }

    if (headRef.current && !isSleeping) {
        // Look at mouse smoothly
        const targetX = (mouse.x * viewport.width) / 20;
        const targetY = (mouse.y * viewport.height) / 20;
        
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX * 0.5, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY * 0.3, 0.1);
    }
  });

  const bodyColor = color || '#8c52ff';
  const eyeScaleY = isSleeping ? 0.1 : (blinking ? 0.1 : 1);

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* --- BODY GROUP --- */}
      <group ref={bodyRef} position={[0, -0.35, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.3} clearcoat={0.5} />
          </mesh>
          
          {/* Arms */}
          <mesh position={[-0.42, 0.1, 0.1]} rotation={[0, 0, 0.5]} castShadow>
              <capsuleGeometry args={[0.09, 0.25]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0.42, 0.1, 0.1]} rotation={[0, 0, -0.5]} castShadow>
              <capsuleGeometry args={[0.09, 0.25]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>

          {/* Legs */}
          <mesh position={[-0.2, -0.35, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.25]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>
          <mesh position={[0.2, -0.35, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.25]} /><meshPhysicalMaterial color={bodyColor} />
          </mesh>

          {/* CLOTHES (Body) */}
          <Accessory type="body" id={accessories?.body} />
      </group>

      {/* --- HEAD GROUP --- */}
      <group ref={headRef} position={[0, 0.28, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color={bodyColor} roughness={0.3} clearcoat={0.5} />
          </mesh>

          {/* Face */}
          <group position={[0, 0, 0.48]}>
              {/* Eyes */}
              <group position={[-0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color="black" roughness={0.1} /></mesh>
                  {!isSleeping && !blinking && (
                      <>
                        <mesh position={[0.04, 0.04, 0.1]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
                        <mesh position={[-0.03, -0.03, 0.1]}><sphereGeometry args={[0.02]} /><meshBasicMaterial color="white" opacity={0.5} transparent /></mesh>
                      </>
                  )}
              </group>
              <group position={[0.2, 0.05, 0]} scale={[1, eyeScaleY, 1]}>
                  <mesh><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color="black" roughness={0.1} /></mesh>
                  {!isSleeping && !blinking && (
                      <>
                        <mesh position={[0.04, 0.04, 0.1]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="white" /></mesh>
                        <mesh position={[-0.03, -0.03, 0.1]}><sphereGeometry args={[0.02]} /><meshBasicMaterial color="white" opacity={0.5} transparent /></mesh>
                      </>
                  )}
              </group>

              {/* Blush */}
              <mesh position={[-0.32, -0.12, -0.05]}><sphereGeometry args={[0.09]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>
              <mesh position={[0.32, -0.12, -0.05]}><sphereGeometry args={[0.09]} /><meshBasicMaterial color="#ff7675" transparent opacity={0.4} /></mesh>

              {/* Mouth */}
              <mesh position={[0, -0.18, 0]} rotation={[0,0,Math.PI]} scale={[1, isSleeping ? 0.5 : 1, 1]}>
                  <torusGeometry args={[0.05, 0.015, 16, 16, Math.PI]} />
                  <meshBasicMaterial color="#2d3436" />
              </mesh>
          </group>

          {/* CLOTHES (Head) */}
          <Accessory type="head" id={accessories?.head} />
      </group>
    </group>
  );
};

const ModelViewer = ({ type, itemId, color, accessories, onPetClick, style, isLobby, isSleeping, isFeeding }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '150px', ...style }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={40} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.7} />
        <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-5, 2, -5]} intensity={0.8} color="#a29bfe" />
        <pointLight position={[0, -2, 3]} intensity={0.3} color="white" /> {/* Fill light */}

        <Suspense fallback={null}>
          <group position={[0, -0.4, 0]}>
             {type === 'pet' && (
                <>
                    <PetModel color={color} accessories={accessories} onClick={onPetClick} isSleeping={isSleeping} isFeeding={isFeeding} />
                    <ContactShadows opacity={0.5} scale={8} blur={2.5} far={1.5} />
                </>
             )}
             {type === 'preview' && itemId && (
                 <Float speed={3} rotationIntensity={0.5}>
                     <Accessory type={itemId.split('_')[0]} id={itemId} />
                 </Float>
             )}
             {!isLobby && type !== 'preview' && <Decor />}
          </group>
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/2.5} maxPolarAngle={Math.PI/1.8} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;