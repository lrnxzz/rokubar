import { Environment, Lightformer } from "@react-three/drei";

/** The lights every TV model is shown under, made in place so no HDR file is fetched. */
export function Studio() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-2, 3, 4]} intensity={1.1} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[-2.5, 2.5, 3]} rotation={[0.6, 0.5, 0]} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[3, -1, 2.5]} rotation={[0, -0.8, 0]} scale={[2, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#9fb4ff" position={[0, -3, 2]} rotation={[-1, 0, 0]} scale={[6, 1, 1]} />
      </Environment>
    </>
  );
}
