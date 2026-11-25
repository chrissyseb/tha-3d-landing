import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Html, Float } from '@react-three/drei'
import gsap from 'gsap'

const OX = '#762D3B'
const IVORY = '#F5F0E8'
const GOLD = '#C9A227'

function Tree() {
  return (
    <group position={[-1.2, 0, 0]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 2.8, 16]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, 2.6, 0]} rotation={[0, 0, -1.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 1.9, 12]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.9} />
      </mesh>
      {[[0, 3.4, 0, 1.3], [1.1, 3.2, 0.3, 0.95], [-0.8, 3.1, -0.2, 0.9], [0.4, 3.9, -0.4, 0.8]].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[s, 2]} />
          <meshStandardMaterial color={i % 2 ? '#4f7a3a' : '#5e8c45'} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Apple({ apple }) {
  return (
    <group ref={apple} position={[0.4, 2.55, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshPhysicalMaterial color="#b3202c" roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.12, 8]} />
        <meshStandardMaterial color="#4a3324" />
      </mesh>
      <mesh position={[0.07, 0.27, 0]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.05, 0.14, 8]} />
        <meshStandardMaterial color="#5e8c45" />
      </mesh>
    </group>
  )
}

function GravityArrow({ arrow }) {
  return (
    <group ref={arrow} position={[0.95, 2.3, 0]} scale={0}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 12]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 16]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.3} />
      </mesh>
      <Html position={[0.25, -0.5, 0]} center={false} className="label">Gravity pulls it down</Html>
    </group>
  )
}

function Scene({ playKey, onStep }) {
  const apple = useRef()
  const arrow = useRef()
  const tl = useRef()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    tl.current?.kill()
    const a = apple.current, ar = arrow.current
    a.position.set(0.4, 2.55, 0); a.rotation.set(0, 0, 0); ar.scale.setScalar(0)
    const t = gsap.timeline({ defaults: { duration: reduce ? 0.01 : undefined } })
    t.call(() => onStep(0))
      .to(a.position, { x: 0.45, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.6)
      .call(() => onStep(1))
      .to(ar.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' })
      // Free fall: power2.in approximates constant acceleration (distance ∝ t²)
      .to(a.position, { y: 0.22, x: 0.5, duration: 0.75, ease: 'power2.in' }, '+=0.3')
      .to(a.rotation, { z: -1.2, duration: 0.75, ease: 'power2.in' }, '<')
      .to(a.position, { y: 0.42, duration: 0.18, ease: 'power1.out', yoyo: true, repeat: 1 })
      .call(() => onStep(2))
    tl.current = t
    return () => t.kill()
  }, [playKey])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment preset="sunset" />
      <Tree />
      <Apple apple={apple} />
      <GravityArrow arrow={arrow} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#d9cdb4" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={8} blur={2.5} far={4} />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2.1} target={[0, 1.6, 0]} />
    </>
  )
}

const STEPS = [
  'An apple hangs from a branch.',
  'When the stalk breaks, a force acts on it.',
  'Gravity is a pulling force towards the Earth. It makes the apple speed up as it falls.',
]

export default function App() {
  const [playKey, setPlayKey] = useState(0)
  const [step, setStep] = useState(0)
  return (
    <main className="wrap">
      <header>
        <p className="kicker">Thinking Hack Education · PSLE Science</p>
        <h1>Why does the apple fall?</h1>
        <p className="step" aria-live="polite">{STEPS[step]}</p>
      </header>
      <div className="stage" role="img" aria-label="3D animation of an apple falling from a tree, with an arrow showing gravity pulling it down">
        <Canvas shadows camera={{ position: [3.2, 2.6, 5.5], fov: 42 }} dpr={[1, 2]}>
          <Scene playKey={playKey} onStep={setStep} />
        </Canvas>
      </div>
      <button className="btn" type="button" onClick={() => setPlayKey(k => k + 1)}>Replay the Animation</button>
      <p className="hint">Drag to turn the scene around.</p>
    </main>
  )
}
