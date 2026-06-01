import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const Core = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (groupRef.current) {
      // make it track mouse slightly
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (state.pointer.x * Math.PI) / 4, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (state.pointer.y * -Math.PI) / 4, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#06B6D4" />
      <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#4F46E5" />
      
      {/* The inner plasma core */}
      <Sphere args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#06B6D4"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* The outer mechanical shell */}
      <Icosahedron
        ref={meshRef}
        args={[1.6, 1]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshPhysicalMaterial
          color="#050507"
          wireframe={true}
          transparent={true}
          opacity={0.8}
          roughness={0.1}
          metalness={1}
          emissive={hovered ? "#4F46E5" : "#000000"}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </Icosahedron>
    </group>
  );
};

export const HeroCore3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Core />
      </Canvas>
    </div>
  );
};
