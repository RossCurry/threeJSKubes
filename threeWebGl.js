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
  // const geometry = new THREE.SphereGeometry(1, 32, 16);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // Setup a material
  // const materialBasic = new THREE.MeshBasicMaterial({
  //   color: getRandomColor(),
  //   // wireframe: true,
  //   // wireframeLinewidth: 5,
  //   // wireframeLinecap: "round", 
  // });
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
  for (let i = 0; i < 30; i++) {
    // materialBasic.setValues({color: getRandomColor()})
    const materialBasic = new THREE.MeshBasicMaterial({
      color: getRandomColor(),
    });
    const materialStandard = new THREE.MeshStandardMaterial({color: getRandomColor()});
    // const swapMaterial = Math.random() > .5 ? materialBasic : materialStandard
    // creation of mesh seems to be the most important part
    const mesh = new THREE.Mesh(
      geometry, 
      materialStandard
    );
    scene.add(mesh);
    // mesh.position.set(Math.random(), Math.random(), Math.random())
    mesh.position.set(
      Random.range(-1, 1), 
      Random.range(-1, 1), 
      Random.range(-1, 1)
    )
    mesh.scale.set(
      Random.range(-1, 1), 
      Random.range(-1, 1), 
      Random.range(-1, 1)
    )
    mesh.scale.multiplyScalar(0.5) // multiplys x, y, z by same value
    // mesh.rotation.y = 5 * i
    rotateFuncs.push(rotateMesh(mesh))
  }
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
      // scene rotation
      scene.rotation.y = time * .05
      scene.rotation.x = time * .05
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
