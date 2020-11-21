import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { SceneLoader } from '@babylonjs/core/Loading'

// Required side effects to populate the Create methods on the mesh class.
// Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import '@babylonjs/core/Meshes/meshBuilder'

import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader"
import "@babylonjs/core/Loading/loadingScreen"
import '@babylonjs/core/Materials/standardMaterial'
import '@babylonjs/core/Physics/physicsEngineComponent'
import '@babylonjs/loaders/glTF'

import { initPhysics, addPhysicsImposter } from './physics'
import { addPostProcess } from './addPostProcess'

const antialias = true
const adaptToDeviceRatio = true
const engineOptions = {}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio)
const scene = new Scene(engine)

const noPreventDefault = true
const camera = new FreeCamera('camera', new Vector3(-4, 5, 10), scene)
camera.setTarget(Vector3.Zero())
camera.attachControl(canvas, noPreventDefault)

{
  const name = 'hemisphericLight'
  const direction = new Vector3(0, 1, 0)
  const light = new HemisphericLight(name, direction, scene)
  light.intensity = 0.4
}

{
  const name = 'spotLight'
  const position = new Vector3(0, 3, 0)
  const direction = new Vector3(0, -1, 0)
  const angle = Math.PI / 3
  const exponent = 2
  const light = new SpotLight(name, position, direction, angle, exponent, scene)
  light.intensity = 40
}

const init = async () => {
  const promises: [Promise<Scene>?, Promise<void>?, Promise<any>?] = []

  promises.push(SceneLoader.AppendAsync('./assets/glb/', 'pixel_room.glb', scene))
  promises.push(initPhysics(scene))

  if (import.meta.env.MODE === 'development') {
    promises.push(import('@babylonjs/core/Debug/debugLayer'))
    promises.push(import('@babylonjs/inspector'))

    let inspectorOpen = true

    addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'i') {
        if (inspectorOpen === true) {
          scene.debugLayer.hide()
        } else {
          scene.debugLayer.show()
        }
      }
    })
  }

  const [gltf] = await Promise.all(promises)

  scene.debugLayer.show()

  const NEAREST_NEAREST = 8
  for (const texture of gltf.textures) {
    texture.updateSamplingMode(NEAREST_NEAREST)
  }

  {
    const width = 3.8
    const height = 3.8
    const subdivisions = 1
    const ground = Mesh.CreateGround('ground', width, height, subdivisions, scene)
    ground.position.y = -0.01
    addPhysicsImposter(ground, 'BoxImpostor', scene, 0)
  }

  {
    const segments = 32
    const diameter = 1
    const sphere = Mesh.CreateSphere('sphere', segments, diameter, scene)
    sphere.position.y = 5
    addPhysicsImposter(sphere, 'SphereImpostor', scene)
  }

  addPostProcess(scene, [camera])

  engine.runRenderLoop(() => {
    scene.render()
  })
}

init()
