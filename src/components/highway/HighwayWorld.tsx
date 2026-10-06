import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import gsap from 'gsap'
import {
  Box3, DoubleSide, EquirectangularReflectionMapping, Group, InstancedMesh,
  Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, RepeatWrapping, SRGBColorSpace,
  Vector3, type Texture,
} from 'three'
import { useScrollState } from '../../architecture/scrollContext'
import { usePreferences } from '../../architecture/preferences'

const ASSETS = '/textures/highway/'
const MODEL = '/models/chevrolet_impala_1967-_supernatural.glb'

function tiled(source: Texture, repeat: [number, number], color = false) {
  const texture = source.clone()
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(...repeat)
  texture.anisotropy = 4
  if (color) texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function Road() {
  const maps = useTexture({ asphalt: ASSETS + 'asphalt-color.webp', roughness: ASSETS + 'asphalt-roughness.webp',
    height: ASSETS + 'asphalt-height.webp', ground: ASSETS + 'ground-color.webp',
    groundHeight: ASSETS + 'ground-height.webp', paint: ASSETS + 'worn-paint.webp', edge: ASSETS + 'road-edge.webp' })
  const road = useRef<Mesh>(null)
  const ground = useRef<Mesh>(null)
  const marks = useRef<InstancedMesh>(null)
  const { state } = useScrollState()
  const transform = useMemo(() => new Object3D(), [])
  const textures = useMemo(() => ({
    asphalt: tiled(maps.asphalt, [2, 60], true), roughness: tiled(maps.roughness, [2, 60]),
    height: tiled(maps.height, [2, 60]), ground: tiled(maps.ground, [24, 60], true),
    groundHeight: tiled(maps.groundHeight, [24, 60]), edge: tiled(maps.edge, [1, 9]),
  }), [maps.asphalt, maps.roughness, maps.height, maps.ground, maps.groundHeight, maps.edge])
  useLayoutEffect(() => () => { Object.values(textures).forEach(texture => texture.dispose()) }, [textures])
  useLayoutEffect(() => {
    // Shared physical travel keeps paint, asphalt and roadside texture in phase.
    const travel = gsap.parseEase('power1.inOut')(state.local) * 34
    textures.asphalt.offset.set(0, -travel / 4)
    textures.roughness.offset.set(0, -travel / 4)
    textures.height.offset.set(0, -travel / 4)
    textures.ground.offset.set(0, -travel / 4)
    textures.groundHeight.offset.set(0, -travel / 4)
    if (marks.current) {
      for (let i = 0; i < 44; i++) {
        transform.position.set(-.23, .017, 17 - i * 6 + (travel % 6))
        transform.rotation.set(-Math.PI / 2, 0, Math.sin(i * 8) * .003)
        transform.scale.set(1, 1, 1)
        transform.updateMatrix(); marks.current.setMatrixAt(i, transform.matrix)
      }
      marks.current.instanceMatrix.needsUpdate = true
    }
  }, [state.local, textures, transform])
  return <>
    <mesh ref={ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.023, -94]} receiveShadow>
      <planeGeometry args={[96, 240]} />
      <meshStandardMaterial map={textures.ground} bumpMap={textures.groundHeight} bumpScale={.08} color="#777c73" roughness={1} />
    </mesh>
    <mesh ref={road} rotation={[-Math.PI / 2, 0, 0]} position={[0, .006, -94]} receiveShadow renderOrder={1}>
      <planeGeometry args={[7.8, 240]} />
      <meshStandardMaterial map={textures.asphalt} roughnessMap={textures.roughness} bumpMap={textures.height}
        bumpScale={.025} alphaMap={textures.edge} transparent depthWrite={false} color="#737b82" roughness={.92} />
    </mesh>
    <instancedMesh ref={marks} args={[undefined, undefined, 44]} renderOrder={2} frustumCulled={false}>
      <planeGeometry args={[.095, 2.1]} />
      <meshStandardMaterial map={maps.paint} transparent alphaTest={.12} color="#b7af8e" emissive="#474337" emissiveIntensity={.18} roughness={1} depthWrite={false} />
    </instancedMesh>
  </>
}

function Woodland({ variant }: { variant: number }) {
  const map = useTexture(ASSETS + `woodland-${variant}.webp`)
  const cards = useRef<InstancedMesh>(null)
  const { state } = useScrollState()
  const dummy = useMemo(() => new Object3D(), [])
  useLayoutEffect(() => {
    if (!cards.current) return
    const travel = gsap.parseEase('power1.inOut')(state.local) * 34
    for (let i = 0; i < 64; i++) {
      const layer = i % 3
      const side = i % 2 ? 1 : -1
      const seed = i * 15.73 + variant * 19.19
      const shrub = i >= 48
      const height = shrub ? 1.1 + (Math.sin(seed) + 1) * .8 : 7 + layer * 2 + (Math.sin(seed) + 1) * 3.5
      const width = height * (.68 + .12 * Math.cos(seed * 2))
      // Four layers: a few close crowns, near shoulder, deeper woodland, then fog.
      const z = (shrub ? -5 : 16) - ((Math.floor(i / 2) * 10.1 + variant * 4.3 - travel + 440) % 220)
      const x = side * (shrub ? 4.1 + (Math.cos(seed) + 1) * .6 : 6 + layer * 6.5 + (Math.cos(seed) + 1) * 2)
      dummy.position.set(x, height / 2 - .15, z)
      dummy.rotation.set(0, side * -.16 + Math.sin(seed) * .2, 0)
      dummy.scale.set(width, height, 1)
      dummy.updateMatrix(); cards.current.setMatrixAt(i, dummy.matrix)
    }
    cards.current.instanceMatrix.needsUpdate = true
  }, [state.local, variant, dummy])
  return <instancedMesh ref={cards} args={[undefined, undefined, 64]}>
    <planeGeometry />
    <meshStandardMaterial map={map} color="#19232c" alphaTest={.48} side={DoubleSide} roughness={1} />
  </instancedMesh>
}

function Mist() {
  const texture = useTexture(ASSETS + 'mist.webp')
  return <group>
    {[-28, -62, -112].map((z, index) => <mesh key={z} position={[index % 2 ? -8 : 6, 1.3 + index * .6, z]}>
      <planeGeometry args={[54 + index * 18, 5 + index * 3]} />
      <meshBasicMaterial map={texture} color="#637b8c" transparent opacity={.13 + index * .025} depthWrite={false} side={DoubleSide} />
    </mesh>)}
  </group>
}

function Vehicle() {
  const { scene } = useGLTF(MODEL, false)
  const vehicle = useMemo(() => {
    const source = scene.clone(true)
    const owned: MeshStandardMaterial[] = []
    const geometries: Mesh['geometry'][] = []
    source.traverse(object => {
      if (!(object instanceof Mesh)) return
      // The supplied atlas contains an embedded ground quad; remove it rather
      // than displaying a rectangular platform underneath the vehicle.
      const geometry = object.geometry.clone()
      const positions = geometry.attributes.position
      geometry.computeBoundingBox()
      const extent = geometry.boundingBox!.getSize(new Vector3())
      const indices = geometry.index
      if (indices) {
        const filtered: number[] = []
        for (let i = 0; i < indices.count; i += 3) {
          const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2)
          const flat = Math.abs(positions.getZ(a) - positions.getZ(b)) < .01 && Math.abs(positions.getZ(a) - positions.getZ(c)) < .01
          const spanX = Math.max(positions.getX(a), positions.getX(b), positions.getX(c)) - Math.min(positions.getX(a), positions.getX(b), positions.getX(c))
          const spanY = Math.max(positions.getY(a), positions.getY(b), positions.getY(c)) - Math.min(positions.getY(a), positions.getY(b), positions.getY(c))
          if (flat && spanX > extent.x * .9 && spanY > extent.y * .9) continue
          filtered.push(a, b, c)
        }
        geometry.setIndex(filtered)
      }
      object.geometry = geometry; geometries.push(geometry)
      const originals = Array.isArray(object.material) ? object.material : [object.material]
      const materials = originals.map(original => {
        const sourceMaterial = original as MeshStandardMaterial
        const material = new MeshStandardMaterial({
          map: sourceMaterial.map, metalnessMap: sourceMaterial.metalnessMap,
          roughnessMap: sourceMaterial.roughnessMap,
          metalness: .7, roughness: .42, color: '#c0c5cc',
          emissiveMap: sourceMaterial.emissiveMap, emissive: '#ffffff', emissiveIntensity: .8,
          envMapIntensity: 1.25, side: DoubleSide, alphaTest: .08,
        })
        owned.push(material)
        return material
      })
      object.material = Array.isArray(object.material) ? materials : materials[0]
      object.castShadow = true; object.receiveShadow = true
    })
    const box = new Box3().setFromObject(source)
    const size = box.getSize(new Vector3())
    const aligned = new Group()
    aligned.add(source)
    aligned.rotation.y = -Math.PI / 2 // Source rear lamps lie on positive X.
    aligned.scale.setScalar(5.45 / size.x)
    const bounds = new Box3().setFromObject(aligned)
    const center = bounds.getCenter(new Vector3())
    aligned.position.set(-center.x, -bounds.min.y + .018, -center.z)
    return { model: aligned, owned, geometries }
  }, [scene])
  useLayoutEffect(() => () => { vehicle.owned.forEach(material => material.dispose()); vehicle.geometries.forEach(geometry => geometry.dispose()) }, [vehicle])
  return <group position={[1.55, 0, -2.4]} dispose={null}>
    <primitive object={vehicle.model} />
    <pointLight position={[0, .62, 2.3]} color="#a43521" intensity={.65} distance={3.4} decay={2} />
  </group>
}

export default function HighwayWorld() {
  const { camera, invalidate } = useThree()
  const { state } = useScrollState()
  const { reducedMotion, mobile } = usePreferences()
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const target = useRef({ x: 1.5, y: 1.22, z: -17 })
  const sky = useTexture(ASSETS + 'moon-sky.jpg')
  const environment = useMemo(() => {
    const texture = sky.clone()
    texture.mapping = EquirectangularReflectionMapping
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [sky])
  useLayoutEffect(() => () => environment.dispose(), [environment])
  useLayoutEffect(() => {
    const oldPosition = camera.position.clone()
    const oldRotation = camera.quaternion.clone()
    const perspective = camera as PerspectiveCamera
    const oldFocalLength = perspective.getFocalLength()
    perspective.setFocalLength(perspective.getFilmHeight() / (2 * Math.tan((mobile ? 46 : 38) * Math.PI / 360)))
    perspective.updateProjectionMatrix()
    // Trunk-height, rear left. No pointer steering, roll, wobble or orbit controller.
    camera.position.set(-4.8, 1.25, 10.8)
    target.current = { x: 1.5, y: 1.34, z: -16 }
    const animation = gsap.timeline({ paused: true })
      .to(camera.position, { z: 9.5, duration: .6, ease: 'power1.inOut' }, 0)
      .to(camera.position, { x: -5.75, y: 1.27, z: 8.8, duration: .25, ease: 'power2.inOut' }, .6)
      .to(target.current, { x: 1.9, y: 1.36, z: -15, duration: .25, ease: 'power2.inOut' }, .6)
      .to({}, { duration: .15 }, .85)
    timeline.current = animation
    invalidate()
    return () => {
      animation.kill(); timeline.current = null
      camera.position.copy(oldPosition); camera.quaternion.copy(oldRotation)
      perspective.setFocalLength(oldFocalLength); perspective.updateProjectionMatrix(); invalidate()
    }
  }, [camera, invalidate, mobile])
  useFrame(() => {
    timeline.current?.progress(reducedMotion ? .5 : state.local)
    camera.lookAt(target.current.x, target.current.y, target.current.z)
  })
  return <>
    <primitive object={environment} attach="environment" />
    <hemisphereLight args={['#72899d', '#020304', .14]} />
    <directionalLight position={[-9, 14, 5]} color="#9caec7" intensity={2.3} castShadow
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10}
      shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-far={45}
      shadow-normalBias={.035} shadow-bias={-.0003} shadow-radius={3} />
    <Road />
    <Woodland variant={0} /><Woodland variant={1} /><Woodland variant={2} />
    <Mist /><Vehicle />
  </>
}
