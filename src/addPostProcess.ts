import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Scene } from '@babylonjs/core/scene'

import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'

export const addPostProcess = (scene: Scene, cameras: Camera[]) => {
  const hdr = true
  const pipeline = new DefaultRenderingPipeline('standardPipeline', hdr, scene, cameras)

  // MSAA
  pipeline.samples = 4

  // Bloom
  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.2
  pipeline.bloomWeight = 0.3
  pipeline.bloomKernel = 64
  pipeline.bloomScale = 0.5

  // Depth of field
  pipeline.depthOfFieldEnabled = true
  // distance of the current focus point from the camera in millimeters considering 1 scene unit is 1 meter
  pipeline.depthOfField.focusDistance = 2000
  // focal length of the camera in millimeters  
  pipeline.depthOfField.focalLength = 40
  // aka F number of the camera defined in stops as it would be on a physical device
  pipeline.depthOfField.fStop = 1.4
}
