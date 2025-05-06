import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useControls } from "leva";
import * as THREE from "three";

// Custom Shader Material with all required uniforms
const MyShaderMaterial = shaderMaterial(
   {
      uTime: 0,
      uColor: new THREE.Color("blue"),

      uBigElevation: 0.2,
      uBigWavesFrequencey: new THREE.Vector2(4, 1.5),
      uBigwaveSpeed: 0.75,

      surface: new THREE.Color("#ffe83b"),
      depthColor: new THREE.Color("#4a90a1"),

      uColorOffect: 0.27,
      uColorMultyplier: 3,
   },
   // ✅ Vertex Shader
   /* glsl */ `
    uniform float uTime;
    uniform float uBigElevation;
    uniform vec2 uBigWavesFrequencey;
    uniform float uBigwaveSpeed;

    attribute float aCustom;

    varying vec2 vUv;
    varying float vElevation;
    varying float vCustom;

    vec4 permute(vec4 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
    }
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec3 fade(vec3 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
    }
    float cnoise(vec3 P) {
      vec3 Pi0 = floor(P);
      vec3 Pi1 = Pi0 + vec3(1.0);
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P);
      vec3 Pf1 = Pf0 - vec3(1.0);
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);

      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);

      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
      return 2.2 * n_xyz;
    }

    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      float elevation = sin(modelPosition.x * uBigWavesFrequencey.x + uTime * uBigwaveSpeed) *
                        sin(modelPosition.z * uBigWavesFrequencey.y + uTime * uBigwaveSpeed) * uBigElevation;

      for (float i = 1.0; i < 4.0; i++) {
        elevation -= abs(cnoise(vec3(modelPosition.xz * 3.0 * i, uTime * 0.2)) * 0.15 / i);
      }

      modelPosition.y += elevation;

      gl_Position = projectionMatrix * viewMatrix * modelPosition;

      vUv = uv;
      vCustom = aCustom;
      vElevation = elevation;
    }
  `,
   // ✅ Fragment Shader
   /* glsl */ `
    varying vec2 vUv;
    varying float vCustom;
    varying float vElevation;

    uniform float uTime;
    uniform float uColorOffect;
    uniform float uColorMultyplier;

    uniform vec3 depthColor;
    uniform vec3 surface;

    void main() {
      float mixStrength = (vElevation + uColorOffect) * uColorMultyplier;
      vec3 color = mix(depthColor, surface, mixStrength);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ MyShaderMaterial });

export const Vji = (props) => {
   const ref = useRef();

   const {
      uBigElevation,
      uBigwaveSpeed,
      uBigWavesFrequenceyX,
      uBigWavesFrequenceyY,
      uColorOffect,
      uColorMultyplier,
      surface,
      depthColor,
   } = useControls("Shader", {
      uBigElevation: { value: 0.04, min: 0, max: 1, step: 0.01 },
      uBigwaveSpeed: { value: 0.22, min: 0, max: 2, step: 0.01 },
      uBigWavesFrequenceyX: { value: 4.0, min: 0, max: 10, step: 0.1 },
      uBigWavesFrequenceyY: { value: 1.2, min: 0, max: 10, step: 0.1 },
      uColorOffect: { value: 0.14, min: 0, max: 1, step: 0.01 },
      uColorMultyplier: { value: 7.9, min: 0, max: 10, step: 0.1 },
      surface: "#9bd8ff",
      depthColor: "#186691",
   });

   const geometry = new THREE.PlaneGeometry(11, 11, 512, 512);
   const customAttribute = new Float32Array(geometry.attributes.position.count);
   for (let i = 0; i < customAttribute.length; i++) {
      customAttribute[i] = Math.random();
   }
   geometry.setAttribute(
      "aCustom",
      new THREE.BufferAttribute(customAttribute, 1)
   );

   useFrame((_, delta) => {
      ref.current.uTime += delta;

      ref.current.uBigElevation = uBigElevation;
      ref.current.uBigWavesFrequencey.set(
         uBigWavesFrequenceyX,
         uBigWavesFrequenceyY
      );
      ref.current.uBigwaveSpeed = uBigwaveSpeed;
      ref.current.uColorOffect = uColorOffect;
      ref.current.uColorMultyplier = uColorMultyplier;
      ref.current.surface.set(surface);
      ref.current.depthColor.set(depthColor);
   });

   return (
      <>
         <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} {...props}>
            <myShaderMaterial ref={ref} side={THREE.DoubleSide} />
         </mesh>
      </>
   );
};
