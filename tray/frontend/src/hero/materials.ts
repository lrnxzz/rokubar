import * as THREE from "three";

/** One set of materials for every TV model, made once when the 3D loads. */
export const materials = {
  plastic: new THREE.MeshStandardMaterial({
    color: "#141416",
    roughness: 0.55,
    metalness: 0.05,
  }),
  plasticGloss: new THREE.MeshStandardMaterial({
    color: "#0c0c0e",
    roughness: 0.28,
    metalness: 0.1,
  }),
  recess: new THREE.MeshStandardMaterial({
    color: "#070708",
    roughness: 0.8,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: "#040507",
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.6,
  }),
  steel: new THREE.MeshStandardMaterial({
    color: "#7c8188",
    roughness: 0.42,
    metalness: 0.85,
  }),
  aluminum: new THREE.MeshStandardMaterial({
    color: "#b7bbc1",
    roughness: 0.3,
    metalness: 0.9,
  }),
  pcb: new THREE.MeshStandardMaterial({
    color: "#1d4a33",
    roughness: 0.6,
    metalness: 0.1,
  }),
  chip: new THREE.MeshStandardMaterial({
    color: "#18181a",
    roughness: 0.45,
  }),
  gold: new THREE.MeshStandardMaterial({
    color: "#c9a24a",
    roughness: 0.35,
    metalness: 1,
  }),
  kapton: new THREE.MeshStandardMaterial({
    color: "#c98a2b",
    roughness: 0.5,
    transparent: true,
    opacity: 0.9,
  }),
  white: new THREE.MeshStandardMaterial({
    color: "#eeeeec",
    roughness: 0.9,
  }),
  diffuser: new THREE.MeshPhysicalMaterial({
    color: "#e9edf3",
    roughness: 0.85,
    transparent: true,
    opacity: 0.62,
  }),
  film: new THREE.MeshPhysicalMaterial({
    color: "#cfe3ff",
    roughness: 0.2,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  }),
  cable: new THREE.MeshStandardMaterial({
    color: "#262628",
    roughness: 0.7,
  }),
  usb: new THREE.MeshStandardMaterial({
    color: "#1f6fd1",
    roughness: 0.5,
  }),
  ferrite: new THREE.MeshStandardMaterial({
    color: "#2a2a2c",
    roughness: 0.8,
  }),
  tape: new THREE.MeshStandardMaterial({
    color: "#d9b830",
    roughness: 0.7,
  }),
  rubber: new THREE.MeshStandardMaterial({
    color: "#202022",
    roughness: 0.95,
  }),
  led: new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#fff6e8",
    emissiveIntensity: 2.4,
    roughness: 0.2,
  }),
  lens: new THREE.MeshPhysicalMaterial({
    color: "#dfe7ef",
    roughness: 0.1,
    transparent: true,
    opacity: 0.55,
  }),
  standby: new THREE.MeshBasicMaterial({
    color: "#ff2a2a",
  }),
};

/** The accent the panel keeps as CSS channels ("168 108 232"), as a three.js color. */
export function accentColor(accent: string): THREE.Color {
  return new THREE.Color(`rgb(${accent.split(" ").join(",")})`);
}
