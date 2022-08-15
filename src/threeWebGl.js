// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const Random = require("canvas-sketch-util/random")

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#012", 1);

  // Setup a camera
  // const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  // camera.position.set(0, 2, -3); // x, y, z
  // camera.lookAt(new THREE.Vector3());
  const camera = new THREE.OrthographicCamera()

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  // geometries are expensive, try to only make one
  const geometrySphere = new THREE.SphereGeometry(1, 32, 16);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // Setup a material
  const materialBasic = new THREE.MeshBasicMaterial({
    color: getRandomColor(),
    wireframe: true,
  });
  const materialNormal = new THREE.MeshNormalMaterial();
  const materialStandard = new THREE.MeshStandardMaterial();

  // Setup a mesh with geometry + material
  function rotateMesh(mesh, i = 1) {
    const value = Math.max(1, Math.random() * 10 * i) 
    return (time) => {
      mesh.rotation.y = time / value
      mesh.rotation.x = time / value
    }
  }
  const rotateFuncs = []
  const mesh = addMeshObject(scene, geometry, {x: 0, y: 0})
  rotateFuncs.push(rotateMesh(mesh))
  // LIGHTS
  const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.9)
  // lightDirectional.position.x = 50
  // lightDirectional.position.y = 50
  // lightDirectional.position.z = 100
  lightDirectional.position.set(
    Random.range(0, 10), 
    Random.range(10, 20), 
    100
  )
  scene.add(lightDirectional)
  // const light = new THREE.AmbientLight(0x404040)
  const light = new THREE.AmbientLight("hsl(360, 50%, 20%)")
  scene.add(light)

  document.addEventListener("click", (mouseEvent) => {
    const numOfBoxes = rotateFuncs.length
    if (numOfBoxes >= 40) {
      // set scene rotation
      return
    };
    const color = getRandomColor()
    drawRipple(mouseEvent, color)
    const {x, y} = mouseEvent
    const mesh = addMeshObject(scene, geometry, {x, y}, color)
    rotateFuncs.push(rotateMesh(mesh))
    if (rotateFuncs.length >= 40) {
      drawMessage()
    }
  })
  document.documentElement.style.cursor = "pointer"


  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      loadOrthographicCameraInfo(camera, viewportWidth, viewportHeight)
    },
    // Update & render your scene here
    render({ time }) {
      // mesh rotation
      for (let func of rotateFuncs){
        // mesh.rotation.y = time / 5
        func(time)
      }
      const numOfBoxes = rotateFuncs.length
      if (numOfBoxes >= 40){
        // drawMessage()
        // scene rotation
        const slowerTime = time * 0.2
        // scene.rotation.y = slowerTime
        // scene.rotation.x = slowerTime
        // scene.rotation.z = slowerTime
        scene.rotation.set(slowerTime, slowerTime * 3, slowerTime * 2)
      }
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);


function loadOrthographicCameraInfo(camera, viewportWidth, viewportHeight) {
  const aspect = viewportWidth / viewportHeight;

// Ortho zoom
// bigger number => further away
  const zoom = 1.5;

// Bounds
camera.left = -zoom * aspect;
camera.right = zoom * aspect;
camera.top = zoom;
camera.bottom = -zoom;

// Near/Far
camera.near = -100;
camera.far = 100;

// Set position & look at world center
camera.position.set(zoom, zoom, zoom);
camera.lookAt(new THREE.Vector3());

// Update the camera
camera.updateProjectionMatrix();
}

function getRandomColor() {
  return (`rgb(${Math.floor(Math.random() * 365)}, ${Math.floor(Math.random() * 365)}, ${Math.floor(Math.random() * 365)})`); 
}


function addMeshObject(scene, geometry, mousePosition, color) {
  function estimateRelativePosition({x, y}) {
    const h = document.documentElement.clientHeight
    const w = document.documentElement.clientWidth
    const halfW = w / 2
    const halfH = h / 2
    const relX =  -(halfW - x) / halfW
    const relY =  (halfH - y) / halfH
    // const aspectRatio = w > h ?  w / h : h / w
    const aspectRatio = w / h
    console.log("aspectRatio", aspectRatio)
    return {
      // multiplier here should be some sort of aspect ratio
      // used math.maax to adjust for mobile view ratio
      relX: relX * aspectRatio ,
      relY: relY * Math.max(2, aspectRatio)  ,
    }
  }
  // creation of mesh seems to be the most important part
  const materialBasic = new THREE.MeshBasicMaterial({
    color: getRandomColor(),
  });
  // const materialStandard = new THREE.MeshStandardMaterial({color: getRandomColor()});
  const materialStandard = new THREE.MeshStandardMaterial({color});
  const mesh = new THREE.Mesh(
    geometry, 
    materialStandard
  );
  let relX = 0
  let relY = 0
  if (mousePosition.x){
    const position = estimateRelativePosition(mousePosition)
    relX = position.relX
    relY = position.relY
  }
  mesh.position.set(
    relX, relY, -relX
  )
  mesh.scale.set(
    Random.range(-1, 1), 
    Random.range(-1, 1), 
    Random.range(-1, 1)
  )
  mesh.scale.multiplyScalar(0.5) // multiplys x, y, z by same value
  scene.add(mesh);
  return mesh
}

function drawRipple(clickEvent, color) {
  const {x, y} = clickEvent
  const circle = document.createElement("div")
  circle.classList.add("ripple")
  circle.style.left = x + "px"
  circle.style.top = y + "px"
  // circle.style.borderColor = getRandomColor()
  circle.style.borderColor = color
  circle.addEventListener("animationend", () => {
    console.log("drawRipple")
    circle.remove()
  })
  const body = document.querySelector("body")
  body.appendChild(circle)
}

function drawMessage() {
  console.log("drawMessage")
  const message = document.createElement("div")
  message.textContent = "FULL"
  message.classList.add("message")
  const body = document.querySelector("body")
  message.addEventListener("animationend", () => {
    message.remove()
  })
  body.appendChild(message)
}


const link = document.createElement('link');
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "style.css";
  document.head.appendChild(link)

///////////// for loop  /////////
// for (let i = 0; i < 1; i++) {
//   // materialBasic.setValues({color: getRandomColor()})
//   const materialBasic = new THREE.MeshBasicMaterial({
//     color: getRandomColor(),
//   });
//   const materialStandard = new THREE.MeshStandardMaterial({color: getRandomColor()});
//   // const swapMaterial = Math.random() > .5 ? materialBasic : materialStandard
//   // creation of mesh seems to be the most important part
//   const mesh = new THREE.Mesh(
//     geometry, 
//     materialStandard
//   );
//   scene.add(mesh);
//   // mesh.position.set(Math.random(), Math.random(), Math.random())
//   mesh.position.set(
//     Random.range(-1, 1), 
//     Random.range(-1, 1), 
//     Random.range(-1, 1)
//   )
//   mesh.scale.set(
//     Random.range(-1, 1), 
//     Random.range(-1, 1), 
//     Random.range(-1, 1)
//   )
//   mesh.scale.multiplyScalar(0.5) // multiplys x, y, z by same value
//   // mesh.rotation.y = 5 * i
//   rotateFuncs.push(rotateMesh(mesh))
// }