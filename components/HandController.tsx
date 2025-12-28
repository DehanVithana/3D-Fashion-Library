import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import * as THREE from 'three';
import { HandControllerProps, ViewerState, HandControllerHandle } from '../types';
import { APP_CONFIG } from '../constants';
import { Camera, RefreshCw } from 'lucide-react';

const TASKS_VISION_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

export const HandController = forwardRef<HandControllerHandle, HandControllerProps>(({ sceneRef, cameraRef, onGestureChange }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logic State (Refs to avoid re-renders)
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const requestRef = useRef<number>(0);
  
  // Interaction State
  // RotX = Phi (Elevation), RotY = Theta (Azimuth)
  const viewerState = useRef<ViewerState>({
    targetRotationX: Math.PI / 2, // Start at Equator (90 deg)
    targetRotationY: 0,
    targetZoom: APP_CONFIG.DEFAULT_CAMERA_Z,
    isTracking: false,
    gesture: 'IDLE'
  });

  const lastHandPos = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      viewerState.current = {
        targetRotationX: Math.PI / 2,
        targetRotationY: 0,
        targetZoom: APP_CONFIG.DEFAULT_CAMERA_Z,
        isTracking: false,
        gesture: 'IDLE'
      };
      // Force immediate update to reset visual
      update3DScene();
    }
  }));

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(TASKS_VISION_CDN);
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        startWebcam();
      } catch (err) {
        console.error(err);
        setError("Failed to load hand tracking models.");
        setLoading(false);
      }
    };

    initMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWebcam = async () => {
    try {
      // Request HD resolution for clarity
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Camera access denied.");
      setLoading(false);
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    // Detect resizing
    if (videoRef.current.videoWidth !== canvasRef.current.width) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }

    const canvasCtx = canvasRef.current.getContext("2d");
    if(!canvasCtx) return;

    let startTimeMs = performance.now();
    
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      // Draw the webcam feed first (Visible Camera)
      canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.landmarks) {
        const drawingUtils = new DrawingUtils(canvasCtx);
        
        // Draw landmarks on top
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#ff0000",
            lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, { color: "#FFFFFF", radius: 2 });
        }

        handleGestures(results.landmarks);
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const handleGestures = (landmarksArray: any[][]) => {
    const state = viewerState.current;
    
    if (landmarksArray.length === 0) {
      state.gesture = 'IDLE';
      lastHandPos.current = null;
      lastPinchDist.current = null;
    } else if (landmarksArray.length === 1) {
      // ROTATION LOGIC (One Hand)
      state.gesture = 'ROTATE';
      const landmarks = landmarksArray[0];
      // Use wrist (0) and middle finger mcp (9) average for stability
      const x = landmarks[9].x;
      const y = landmarks[9].y;

      if (lastHandPos.current) {
        // Multiplier for sensitivity
        const deltaX = (x - lastHandPos.current.x) * 4; 
        const deltaY = (y - lastHandPos.current.y) * 4;

        // Update Target Angles for Orbit (Spherical)
        // Horizontal Drag -> Theta (Azimuth)
        state.targetRotationY -= deltaX * Math.PI * 2; 
        
        // Vertical Drag -> Phi (Elevation)
        state.targetRotationX -= deltaY * Math.PI;

        // Clamp Phi to prevent camera flipping over poles
        state.targetRotationX = Math.max(0.1, Math.min(Math.PI - 0.1, state.targetRotationX));
      }
      
      lastHandPos.current = { x, y };
      lastPinchDist.current = null;
    } else if (landmarksArray.length === 2) {
      // ZOOM LOGIC (Two Hands)
      state.gesture = 'ZOOM';
      
      const hand1 = landmarksArray[0][9]; // Middle finger MCP
      const hand2 = landmarksArray[1][9];
      
      // Calculate distance
      const dist = Math.sqrt(
        Math.pow(hand1.x - hand2.x, 2) + 
        Math.pow(hand1.y - hand2.y, 2)
      );

      if (lastPinchDist.current) {
        const delta = lastPinchDist.current - dist; // + if moving closer (zoom out), - if moving apart (zoom in)
        
        // Map distance change to Radius
        let newZoom = state.targetZoom + (delta * 15); 
        
        // Clamp
        newZoom = Math.max(APP_CONFIG.MIN_ZOOM, Math.min(APP_CONFIG.MAX_ZOOM, newZoom));
        state.targetZoom = newZoom;
      }

      lastPinchDist.current = dist;
      lastHandPos.current = null;
    }

    // Update the parent's refs directly for the Render Loop to pick up
    update3DScene();
    onGestureChange(state.gesture);
  };

  const update3DScene = () => {
    const state = viewerState.current;
    const factor = APP_CONFIG.SMOOTHING_FACTOR;

    if (cameraRef.current) {
      // 1. Interpolate Values for Smoothing
      // We store current smoothed values in a userdata object on the camera to persist state across frames
      if (!cameraRef.current.userData.spherical) {
         cameraRef.current.userData.spherical = new THREE.Spherical(state.targetZoom, state.targetRotationX, state.targetRotationY);
      }
      
      const s = cameraRef.current.userData.spherical as THREE.Spherical;
      
      // Smoothly interpolate towards targets
      s.phi += (state.targetRotationX - s.phi) * factor;
      s.theta += (state.targetRotationY - s.theta) * factor;
      s.radius += (state.targetZoom - s.radius) * factor;

      // 2. Apply Spherical to Cartesian
      // Set camera position based on orbit
      cameraRef.current.position.setFromSpherical(s);
      
      // 3. Ensure camera always looks at the center of the scene
      cameraRef.current.lookAt(0, 0, 0);
      
      cameraRef.current.updateProjectionMatrix();
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center animate-fade-in-up">
      {error && (
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded mb-2 shadow-lg">
          {error}
        </div>
      )}
      
      <div className="relative w-48 h-36 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
             <RefreshCw className="animate-spin" />
          </div>
        )}
        
        {/* Hidden video source - used for processing */}
        <video 
          ref={videoRef} 
          className="absolute opacity-0 pointer-events-none" 
          autoPlay 
          playsInline 
        />
        
        {/* Visible Canvas Drawing - Shows Camera + Landmarks */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
        />
        
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm p-1 rounded-full">
          <Camera size={14} className="text-white" />
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hand Tracking Active</p>
    </div>
  );
});

HandController.displayName = "HandController";