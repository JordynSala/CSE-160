import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path, repeatX = 1, repeatY = 1) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

const grassTexture = loadTexture('./src/grass.jpg', 2, 2);
const sandTexture = loadTexture('./src/sand.jpg', 2, 2);
const stoneTexture = loadTexture('./src/stone.jpg', 2, 2);
const skyTexture = textureLoader.load('./src/dcloudy-small.jpg');
skyTexture.colorSpace = THREE.SRGBColorSpace;
skyTexture.mapping = THREE.EquirectangularReflectionMapping;

class Tree extends THREE.Group {
  constructor(scale = 1) {
    super();

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f7d32 });

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 1.2, 8),
      trunkMat
    );
    trunk.position.y = 0.6;
    this.add(trunk);

    const branches = [
      [-0.35, 1.0, 0.1, 0.7, 0.25],
      [0.35, 0.95, -0.1, 0.65, -0.25],
    ];

    for (const [x, y, z, length, rotZ] of branches) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, length, 8),
        trunkMat
      );
      branch.position.set(x, y, z);
      branch.rotation.z = rotZ;
      this.add(branch);
    }

    const leaves = [
      [0, 1.45, 0, 0.8],
      [-0.45, 1.25, 0.15, 0.55],
      [0.45, 1.25, -0.15, 0.55],
      [0.1, 1.05, 0.4, 0.5],
    ];

    for (const [x, y, z, radius] of leaves) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 12, 8),
        leafMat
      );
      leaf.position.set(x, y, z);
      this.add(leaf);
    }

    this.scale.setScalar(scale);
  }
}

function makeTiledMaterial(baseTexture, repeatX, repeatY) {
  const texture = baseTexture.clone();
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return new THREE.MeshLambertMaterial({ map: texture });
}

function createKeyboardControls(camera, canvas) {
  const keys = new Set();
  const moveSpeed = 18;
  const turnSpeed = Math.PI * 0.75;
  const lookSpeed = 0.003;
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  let dragging = false;

  euler.setFromQuaternion(camera.quaternion);

  window.addEventListener('keydown', (event) => {
    keys.add(event.code);
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener('mousedown', () => {
    dragging = true;
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  window.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    euler.y -= event.movementX * lookSpeed;
    euler.x -= event.movementY * lookSpeed;
    euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
    camera.quaternion.setFromEuler(euler);
  });

  return {
    update(delta) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
      const movement = new THREE.Vector3();

      if (keys.has('KeyW')) movement.add(forward);
      if (keys.has('KeyS')) movement.sub(forward);
      if (keys.has('KeyD')) movement.add(right);
      if (keys.has('KeyA')) movement.sub(right);
      if (keys.has('Space')) movement.y += 1;
      if (keys.has('ShiftLeft') || keys.has('ShiftRight')) movement.y -= 1;

      if (movement.lengthSq() > 0) {
        movement.normalize().multiplyScalar(moveSpeed * delta);
        camera.position.add(movement);
      }

      if (keys.has('KeyQ')) euler.y += turnSpeed * delta;
      if (keys.has('KeyE')) euler.y -= turnSpeed * delta;
      camera.quaternion.setFromEuler(euler);
    },
  };
}

function main() {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 300);
	camera.position.set(25, 10, 65);
  camera.lookAt(0, 0, 0);


	const controls = createKeyboardControls(camera, canvas);
	let lastRenderTime = 0;
	const scene = new THREE.Scene();
	scene.background = skyTexture;
  const sceneFog = new THREE.FogExp2(0xbfd7ff, 0.015);
  scene.fog = sceneFog;

	const world = new THREE.Group();
	scene.add(world);

	addLights(scene);
	const ocean = createOcean();
	const island = createIsland();
	world.add(ocean);
	world.add(island);
  
	const cliffA = createCliff();
	cliffA.rotation.y = Math.PI / 2; // 90 degrees
	world.add(cliffA);
	const cliffB = createCliff();
	cliffB.rotation.y = Math.PI / 2; 
	cliffB.position.set(-2, 0, 10);
	world.add(cliffB);
  const cliffC = createCliff();
	cliffC.rotation.y = Math.PI / 2; 
	world.add(cliffC);
	const cliffD = createCliff();
	cliffD.rotation.y = Math.PI / 2; 
	cliffD.position.set(0, 0, 22);
	world.add(cliffD);
  const cliffE = createCliff();
	cliffE.rotation.y = Math.PI / 2; 
	cliffE.position.set(-2, 0, -10);
	world.add(cliffE);
  const cliffF = createCliff();
	cliffF.rotation.y = Math.PI / 2; 
	cliffF.position.set(0, 0, -22);
	world.add(cliffF);

	const cliffG = createCliff();
  cliffG.position.set(-34, 0, -1);
  world.add(cliffG);	
  const cliffH = createCliff();
  cliffH.position.set(-44, 0, 0);
	world.add(cliffH);
	
  const cliffI = createCliff();
	cliffI.rotation.y = Math.PI / 2; 
	world.add(cliffI);
	const cliffJ = createCliff();
	cliffJ.rotation.y = Math.PI / 2; 
	cliffJ.position.set(-20, 0, 10);
	world.add(cliffJ);
  const cliffK = createCliff();
	cliffK.rotation.y = Math.PI / 2; 
	cliffK.position.set(-22,0,0);
	world.add(cliffK);
	const cliffL = createCliff();
	cliffL.rotation.y = Math.PI / 2; 
	cliffL.position.set(-22, 0, 22);
	world.add(cliffL);
  const cliffM = createCliff();
	cliffM.rotation.y = Math.PI / 2; 
	cliffM.position.set(-20, 0, -10);
	world.add(cliffM);
  const cliffO = createCliff();
	cliffO.rotation.y = Math.PI / 2; 
	cliffO.position.set(-22, 0, -22);
	world.add(cliffO);	

	const cliffP = createCliff();
  cliffP.position.set(-34, 0, 53);
  world.add(cliffP);	
  const cliffQ = createCliff();
  cliffQ.position.set(-44, 0, 54);
	world.add(cliffQ);


	addLighthouse(world);
  const lighthouseLight = createLighthouseSpotlight();
  world.add(lighthouseLight);
  const rain = createBlockRain(180);
  world.add(rain);
  addBoat(world);
  world.add(createBoatPointLight());
  const redBuoy = createRedBuoy();
  world.add(redBuoy);
  addTrees(world);
  setupWeatherToggle(scene, sceneFog, [rain, lighthouseLight.userData.beam]);
  
  
	function resizeRendererToDisplaySize() {
		const c = renderer.domElement;
		const width = c.clientWidth;
		const height = c.clientHeight;
		const needResize = c.width !== width || c.height !== height;
		if (needResize) {
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		}
	}

	function render(time) {
		time *= 0.001;
    const delta = lastRenderTime ? time - lastRenderTime : 0;
    lastRenderTime = time;
		resizeRendererToDisplaySize();

    redBuoy.position.y = 0.7 + Math.sin(time * 1.6) * 0.35;
    lighthouseLight.rotation.y = time * 0.8;
    rain.position.set(camera.position.x, camera.position.y - 5, camera.position.z);
    updateBlockRain(rain, delta);
    controls.update(delta);

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

function addLights(scene) {
  {
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
}

function createOcean() {
  const oceanGroup = new THREE.Group();

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(960, 960),
    new THREE.MeshLambertMaterial({
      color: 0x3b79b8,
      side: THREE.DoubleSide,
    })
  );
  surface.position.y = .5;
  surface.rotation.x = -Math.PI / 2;

  oceanGroup.add(surface);
  oceanGroup.userData.surface = surface;
  return oceanGroup;
}

function createIsland() {
  const island = new THREE.Group();
  const landMat = new THREE.MeshLambertMaterial({ map: grassTexture });
  const dirtMat = new THREE.MeshLambertMaterial({ map: sandTexture });
  

  const layers = [
    { size: [38, 2, 14], y: 0.5, mat: dirtMat },
    { size: [28, 2, 62], x: -38, y: 0.5, z: -1, mat: dirtMat },
    { size: [34, 2, 11], y: 2.0, mat: dirtMat },
    { size: [30, 2, 8], y: 3.5, mat: landMat },
	{ size: [19.9, 2, 53.9], x: -38, y: 16, z: 0, mat: landMat},

  ];

  for (const layer of layers) {
    const [w, h, d] = layer.size;
    const tileX = Math.max(1, w / 6);
    const tileY = Math.max(1, d / 6);
    const mat = makeTiledMaterial(layer.mat.map, tileX, tileY);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat
    );
    mesh.position.set(layer.x ?? -10, layer.y ?? 0, layer.z ?? 0);
    island.add(mesh);
  }

  return island;
}

function createCliff() {
  const cliff = new THREE.Group();
  const cliffMat = new THREE.MeshLambertMaterial({ map: stoneTexture });

  const blocks = [
    [1, 3.5, -9, 12, 9, 4],
    [1, 10, -10, 12, 5, 3],
    [1, 15, -10.5, 12, 5, 2],
  ];

  for (const [x, y, z, w, h, d] of blocks) {
    const tileX = Math.max(1, w / 3);
    const tileY = Math.max(1, h / 3);
    const mat = makeTiledMaterial(cliffMat.map, tileX, tileY);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, -27);
	cliff.add(mesh);
	
  }

  return cliff;
}

function addLighthouse(parent) {
  loadObjModel({
    parent,
    mtlPath: './src/lighthouse.mtl',
    objPath: './src/lighthouse.obj',
    scale: 5.5,
    position: [0, 12, 0],
    rotationY: 3.1,
  });
}

function addBoat(parent) {
  loadObjModel({
    parent,
    mtlPath: './src/materials.mtl',
    objPath: './src/model.obj',
    scale: 6,
    position: [40, 4, 35],  
    rotationY: -0.8,
  });
}

function addTrees(parent) {
  const treePositions = [
    [-5, 4, -3, 1.1],
    [-13, 4, 3, 0.9],
    [-36, 16.5, -12, 1.0],
    [-40, 16.5, 0, 1.0],
    [-44, 16.5, 12, 1.2],
  ];

  for (const [x, y, z, scale] of treePositions) {
    const tree = new Tree(scale*3);
    tree.position.set(x, y, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    parent.add(tree);
  }
}

function createLighthouseSpotlight() {
  const lightGroup = new THREE.Group();
  lightGroup.position.set(.7, 17, 0);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshBasicMaterial({ color: 0xfff2a6 })
  );
  lightGroup.add(lamp);

  const spotLight = new THREE.SpotLight(0xfff2a6, 120, 70, Math.PI / 9, 0.35, 1.2);
  spotLight.position.set(0, 0, 0);
  lightGroup.add(spotLight);

  const target = new THREE.Object3D();
  target.position.set(30, -6, 0);
  lightGroup.add(target);
  spotLight.target = target;

  const beamLength = 38;
  const beamDirection = new THREE.Vector3().copy(target.position).normalize();
  const beamGeo = new THREE.ConeGeometry(5.5, beamLength, 32, 1, true);
  beamGeo.translate(0, -beamLength / 2, 0);
  const beam = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfff2a6,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  );
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDirection);
  lightGroup.add(beam);
  lightGroup.userData.beam = beam;

  return lightGroup;
}

function createBlockRain(count) {
  const rain = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.035, 0.36, 0.035),
    new THREE.MeshBasicMaterial({
      color: 0xb7d7ff,
      transparent: true,
      opacity: 0.72,
    }),
    count
  );

  rain.userData.drops = [];
  rain.userData.areaSize = 18;
  rain.userData.height = 12;
  rain.userData.bottom = -1;
  rain.userData.dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    rain.userData.drops.push({
      x: (Math.random() - 0.5) * rain.userData.areaSize,
      y: Math.random() * rain.userData.height,
      z: (Math.random() - 0.5) * rain.userData.areaSize,
      speed: 7 + Math.random() * 5,
    });
  }

  updateBlockRainMatrices(rain);
  return rain;
}

function updateBlockRain(rain, delta) {
  for (const drop of rain.userData.drops) {
    drop.y -= drop.speed * delta;
    if (drop.y < rain.userData.bottom) {
      drop.x = (Math.random() - 0.5) * rain.userData.areaSize;
      drop.y = rain.userData.height;
      drop.z = (Math.random() - 0.5) * rain.userData.areaSize;
      drop.speed = 7 + Math.random() * 5;
    }
  }

  updateBlockRainMatrices(rain);
}

function updateBlockRainMatrices(rain) {
  const dummy = rain.userData.dummy;
  rain.userData.drops.forEach((drop, i) => {
    dummy.position.set(drop.x, drop.y, drop.z);
    dummy.updateMatrix();
    rain.setMatrixAt(i, dummy.matrix);
  });
  rain.instanceMatrix.needsUpdate = true;
}

function setupWeatherToggle(scene, sceneFog, weatherObjects) {
  const button = document.querySelector('#fog-toggle');
  if (!button) return;

  let enabled = true;
  button.textContent = 'Weather On';

  button.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
    }
  });

  button.addEventListener('click', () => {
    enabled = !enabled;
    scene.fog = enabled ? sceneFog : null;
    for (const object of weatherObjects) {
      object.visible = enabled;
    }
    button.textContent = enabled ? 'Weather On' : 'Weather Off';
    button.setAttribute('aria-pressed', String(enabled));
    button.blur();
  });
}

function createBoatPointLight() {
  const lightGroup = new THREE.Group();
  lightGroup.position.set(36, 8.33, 31);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.MeshBasicMaterial({ color: 0xff2222 })
  );
  lightGroup.add(lamp);

  const pointLight = new THREE.PointLight(0xff2222, 30, 25, 2);
  pointLight.position.set(0, 0, 0);
  lightGroup.add(pointLight);

  return lightGroup;
}

function createRedBuoy() {
  const buoy = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 24, 16),
    new THREE.MeshLambertMaterial({ color: 0xd91f1f })
  );
  buoy.position.set(18, 0.7, 18);
  return buoy;
}

function loadObjModel({ parent, mtlPath, objPath, scale, position, rotationY = 0 }) {
  const mtlLoader = new MTLLoader();
  mtlLoader.setResourcePath('./src/');
  mtlLoader.load(mtlPath, (mtl) => {
    mtl.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    objLoader.load(objPath, (root) => {
      root.scale.setScalar(scale);
      root.position.set(position[0], position[1], position[2]);
      root.rotation.y = rotationY;
      parent.add(root);
    });
  });
}
main();
