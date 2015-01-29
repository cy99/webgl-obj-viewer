var mat4                = require("gl-mat4")
var vec3                = require("gl-vec3")
var Clock               = require("./Clock")
var Camera              = require("./Camera")
var Cache               = require("./Cache")
var Renderer            = require("./Renderer")
var glUtils             = require("./gl-utils")
var Loader              = require("./Loader")
var Assemblages         = require("./Assemblages")
var capsuleSchema       = require("./capsuleSchema.json")
var loadModelFromSchema = Loader.loadModelFromSchema
var bufferModels        = glUtils.bufferModels
var bufferMesh          = glUtils.bufferMesh
var Renderable          = Assemblages.Renderable
var canvas              = document.getElementById("canvas")
var gl                  = canvas.getContext("webgl")

var clock       = new Clock
var cache       = new Cache
var camera      = new Camera(canvas, 0, 0, -3.5, 0, 0, 0)
var renderer    = new Renderer(gl)
var renderables = []

function makeRender () {
  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.colorMask(true, true, true, true)

  return function render () {
    var ent
    var modelMat
    var viewMat
    var projMat

    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (var i = 0, len = renderables.length; i < len; i++) {
      ent      = renderables[i]
      modelMat = ent.physics.modelMat
      viewMat  = camera.viewMatrix 
      projMat  = camera.projectionMatrix
        
      for (var j = 0, meshCount = ent.model.meshes.length; j < meshCount; j++) {
        renderer.drawMesh(
          ent.physics.rotMat,
          ent.physics.modelMat, 
          camera.viewMatrix,
          camera.projectionMatrix,
          ent.model.meshes[j]
        )
      }
    }

    requestAnimationFrame(render) 
  }
}

function makeUpdate () {
  return function update () {
    renderables[0].physics.rotation[0] += (Math.PI / 180) % (Math.PI * 2)
    clock.tick()
  }
}

function boot () {
  canvas.width  = 600
  canvas.height = 600
  requestAnimationFrame(makeRender())
  setInterval(makeUpdate(), 25)
}

function init () {
  loadModelFromSchema(cache, capsuleSchema, function (err, model) {
    var capsule = new Renderable(model, 0, 0, 0)

    for (var i = 0; i < capsule.model.meshes.length; i++) {
      renderer.loadProgram(capsule.model.meshes[i].program)
      renderer.bufferGeometry(capsule.model.meshes[i].geometry)
      //renderer.bufferTextures(...
    }  
  
    renderables.push(capsule)

    if (err) return console.log(err)
    else            boot()
  })
}

window.onload = init
