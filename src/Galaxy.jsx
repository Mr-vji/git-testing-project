import { Instance, Instances, Plane } from "@react-three/drei";
import { useMemo, useRef } from "react";

export const Galaxy = ({ nbParticles = 1000 }) => {
   const particles = useMemo(() => {
      Array.from({ nbParticles }, (_, index) => ({
         position: [
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
         ],
      }));
   }, []);
   return (
      <>
         <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={"green"} />
         </mesh>
         {/* <Instances range={nbParticles} limit={nbParticles}>
            <Particles position={[1, 1, 1]} />
            <meshNormalMaterial />
         </Instances> */}
      </>
   );
};

const Particles = ({ position }) => {
   const ref = useRef();
   return <Instance ref={ref} position={position} />;
};
