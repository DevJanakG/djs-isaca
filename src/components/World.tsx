import { Component, lazy, Suspense, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box, Sphere, Torus } from '@react-three/drei'
import gsap from 'gsap'
import { PCFShadowMap, type Group } from 'three'
import { scenes } from '../data/scenes'
import { useScrollState } from '../architecture/scrollContext'
import { usePreferences } from '../architecture/preferences'

const HighwayWorld = lazy(() => import('./highway/HighwayWorld'))

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p className="fallback">3D unavailable. All sections remain accessible below.</p> : this.props.children }
}
function PlaceholderWorld() {
  const { camera, invalidate } = useThree()
  const { progress, state } = useScrollState()
  const group = useRef<Group>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  useLayoutEffect(() => {
    const motion = gsap.timeline({ paused: true })
    scenes.forEach((scene, index) => {
      motion.to(camera.position, { x: index % 2 ? .8 : 0, y: index % 3 * .3, z: 7 - index % 3 * .5, duration: scene.end - scene.start, ease: 'power2.inOut' }, scene.start)
    })
    timeline.current = motion
    return () => { motion.kill(); timeline.current = null }
  }, [camera])
  useLayoutEffect(() => { invalidate() }, [state.global, invalidate])
  useFrame(() => {
    if (state.active.id === 'S01') return
    timeline.current?.progress(progress.current)
    camera.lookAt(0, 0, 0)
    if (group.current) group.current.rotation.y = state.local * .6
  })
  return <>
    <group visible={state.active.id !== 'S01'}>
    <ambientLight intensity={1.5} />
    <directionalLight position={[3, 4, 5]} intensity={2} />
    <group ref={group} position={[1.7, 0, 0]}>
      {scenes.map((scene, index) => <group key={scene.id} visible={scene.id === state.active.id}>
        <Box args={[1.5, .15, 1.5]} position={[0, -1, .6]}><meshStandardMaterial color="#555555" /></Box>
        {index % 3 === 0 ? <Box><meshStandardMaterial color="#899b84" wireframe /></Box> : index % 3 === 1 ? <Sphere args={[.7, 16, 12]}><meshStandardMaterial color="#899b84" wireframe /></Sphere> : <Torus args={[.65, .2, 8, 16]}><meshStandardMaterial color="#899b84" wireframe /></Torus>}
        <Box args={[3, 3, .1]} position={[0, 0, -2]}><meshStandardMaterial color="#181818" /></Box>
      </group>)}
    </group>
    </group>
  </>
}
export default function World() {
  const { simple } = usePreferences()
  const { state } = useScrollState()
  const highway = state.active.id === 'S01'
  // The S00 visual base uses DOM layers only.
  if (state.active.id === 'S00') return null
  return <div className="world" style={{ zIndex: highway ? 2 : 0 }} aria-hidden="true">
    {simple ? highway ? null : <div className="static-placeholder">Static scene fallback</div> : <CanvasBoundary><Canvas shadows={highway ? { type: PCFShadowMap } : false} style={{ pointerEvents: highway ? 'none' : undefined }} dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 0, 7], fov: 45 }} fallback={<p className="fallback">3D unavailable.</p>}><>{highway && <fogExp2 attach="fog" args={['#131e2b', .018]} />}<Suspense fallback={null}><PlaceholderWorld />{highway && <Suspense fallback={null}><HighwayWorld /></Suspense>}</Suspense></></Canvas></CanvasBoundary>}
  </div>
}
