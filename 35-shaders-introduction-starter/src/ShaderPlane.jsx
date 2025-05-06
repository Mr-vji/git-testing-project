export const ShaderPlane = ({ ...props }) => {
  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={"black"} />
    </mesh>
  );
};
