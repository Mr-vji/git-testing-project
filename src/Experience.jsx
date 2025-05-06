import { Environment, OrbitControls, Stage } from "@react-three/drei";
import { Vji } from "./Vji";
import { useRef } from "react";
import { Galaxy } from "./Galaxy";

export const Experience = () => {
   const ref = useRef();

   return (
      <>
         <color attach="background" args={["#9bd8ff"]} />
         <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.2} />
         {/* <OrbitControls /> */}
         <Environment preset="city" />
         {/* <Vji /> */}

         {/* <ZebraCrossing /> */}
         {/* <mesh visible={true} position={[-0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={"red"} />
         </mesh> */}

         <Stage adjustCamera={false}>
            <Galaxy />
         </Stage>
      </>
   );
};
