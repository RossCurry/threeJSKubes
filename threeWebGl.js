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
  const randomColor = getRandomColor()
  console.log("randomColor", randomColor)
  // Setup a material
  const materialBasic = new THREE.MeshBasicMaterial({
    color: randomColor,
    wireframe: true
  });
  const material = new THREE.MeshNormalMaterial();
  const materialStandar = new THREE.MeshStandardMaterial();

  // Setup a mesh with geometry + material
  function rotateMesh(mesh, i = 1) {
    const value = Math.max(1, Math.random() * 10 * i) 
    return (time) => {
      mesh.rotation.y = time / value
    }
  }
  const rotateFuncs = []
  for (let i = 0; i < 10; i++) {
    console.log("count", i)
    const swapMaterial = Math.random() > .5 ? materialBasic : material
    const mesh = new THREE.Mesh(
      geometry, 
      swapMaterial
    );
    scene.add(mesh);
    // mesh.position.set(Math.random(), Math.random(), Math.random())
    mesh.position.set(
      Random.range(-1, .5), 
      Random.range(-1, .5), 
      Random.range(-1, .5)
    )
    mesh.scale.multiplyScalar(0.2)
    // mesh.rotation.y = 5 * i
    rotateFuncs.push(rotateMesh(mesh, i))
  }

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
      for (let func of rotateFuncs){
        // mesh.rotation.y = time / 5
        func(time)
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
  const zoom = 1.0;

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
