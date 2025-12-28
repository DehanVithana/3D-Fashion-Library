import React, { Suspense, useEffect, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, Stage, Resize, Center, Loader } from '@react-three/drei';
import { HandControllerProps } from '../types';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';

// Define the R3F elements interface manually to ensure they exist in JSX
interface ThreeElementsImpl {
  ambientLight: any;
  pointLight: any;
  spotLight: any;
  perspectiveCamera: any;
  mesh: any;
  torusKnotGeometry: any;
  meshStandardMaterial: any;
  group: any;
  primitive: any;
}

// Augment React's JSX namespace (primary fix for React 18+)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElementsImpl {}
  }
}

// Augment global JSX namespace (fallback for older environments/libs)
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElementsImpl {}
  }
}

// Error Boundary for Model Loading
class ModelErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("Model Loading Error:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Default model component if nothing loaded or error
const DefaultModel = () => {
  return (
    <mesh castShadow receiveShadow>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial color="#0a192f" roughness={0.1} metalness={0.8} />
    </mesh>
  );
};

// Model Loader Component
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  
  // Clone to avoid mutation issues with cached GLTFs
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useLayoutEffect(() => {
    // Robust Material & Geometry Optimization
    clonedScene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Fix disappearing meshes due to bad bounding boxes
        mesh.frustumCulled = false; 

        // Enhance materials
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
             // Ensure materials react to environment light
             if ((mat as THREE.MeshStandardMaterial).envMapIntensity !== undefined) {
               (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.0;
             }
             // Ensure double sided rendering for thin geometry (cloth)
             mat.side = THREE.DoubleSide;
             mat.needsUpdate = true;
          });
        }
      }
    });
  }, [clonedScene]);

  return <primitive object={clonedScene} />;
};

interface Viewer3DProps extends Omit<HandControllerProps, 'onGestureChange'> {
  modelUrl: string | null;
}

// Camera Controller to sync R3F camera with external ref
const CameraController = ({ cameraRef }: { cameraRef: React.MutableRefObject<PerspectiveCamera | null> }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Assign the default R3F camera to the ref
    cameraRef.current = camera as PerspectiveCamera;
    
    // Ensure initial position and orientation
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    // Initialize user data for Orbit controls logic
    if (!camera.userData.spherical) {
        camera.userData.spherical = new THREE.Spherical(5, Math.PI / 2, 0);
    }
  }, [camera, cameraRef]);

  return null;
};

export const Viewer3D: React.FC<Viewer3DProps> = ({ sceneRef, cameraRef, modelUrl }) => {
  return (
    <div className="w-full h-full bg-[#F3F4F6]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <CameraController cameraRef={cameraRef} />

        {/* 
           Stage: Professional Studio Environment.
           - adjustCamera={false}: We control the camera via HandController.
           - intensity: Brightness of the studio lights.
           - shadows: Soft contact shadows.
           - environment: "city" is a good generic HDRI for reflections.
        */}
        <Stage adjustCamera={false} intensity={0.6} environment="city" shadows="contact">
            <group ref={sceneRef}>
              <ModelErrorBoundary key={modelUrl} fallback={<DefaultModel />}>
                <Suspense fallback={null}>
                   {/* 
                      Resize: Forces the model to fit into a box of size 4.
                      This guarantees visibility regardless of original file scale.
                   */}
                   <Resize scale={4}>
                      {/* Center: Ensures rotation pivot is accurate */}
                      <Center top>
                        {modelUrl ? <Model url={modelUrl} /> : <DefaultModel />}
                      </Center>
                   </Resize>
                </Suspense>
              </ModelErrorBoundary>
            </group>
        </Stage>

      </Canvas>
      
      {/* Loading Overlay built into Drei */}
      <Loader 
        containerStyles={{ background: '#F3F4F6' }}
        innerStyles={{ width: '200px', height: '2px', background: '#e2e8f0' }}
        barStyles={{ height: '2px', background: '#0a192f' }}
        dataStyles={{ fontSize: '12px', fontFamily: 'Inter', color: '#64748b' }}
      />
    </div>
  );
};