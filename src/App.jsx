import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";

function App() {
   return (
      <Canvas shadows camera={{ position: [0, 0.3, 6], fov: 30 }}>
         <color attach="background" args={["#1A2130"]} />
         <Experience />
      </Canvas>
   );
}

export default App;
