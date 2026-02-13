import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

const PetModel = ({ color }) => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={color || '#6c5ce7'} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.25, 0.2, 0.65]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[0.25, 0.2, 0.65]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      {/* Blush */}
      <mesh position={[-0.4, -0.1, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff7675" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.4, -0.1, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff7675" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

const ModelViewer = ({ color, style }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', ...style }}>
      👾
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas 
        gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          if (!gl) setHasError(true);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <PetModel color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;