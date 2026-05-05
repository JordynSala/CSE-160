 // Vertex shader program
 var VSHADER_SOURCE = `
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main(){
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
   }`

 
// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor; // uniform variable  
uniform sampler2D u_Sampler0;      
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform float u_Brightness;
void main() {
    if (u_whichTexture == -2){          //use color
        gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){   //use uv debug color
        gl_FragColor = vec4(v_UV,1,1); 
    } else if (u_whichTexture == 0) {   // use texture0
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {   // use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {                            //error put redish
        gl_FragColor = vec4(1,.2,.2,1);
    }
    gl_FragColor.rgb *= u_Brightness;
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_Brightness; //for rain


function setupWebGL(){
    canvas = document.getElementById('webgl');
    //get rendering context for webgl
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if(!gl){
        gl = getWebGLContext(canvas);
    }
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if(a_UV < 0){
        console.log('Failed to get the storage location of a_UV');
        return;
    } 

    // Get the storage location of a_Position variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }    
    
    // Get the  storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); 
    if(!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }  
    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix){
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix){
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix){
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix){
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    // get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0){
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1){
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture){
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }
    //For rain
    u_Brightness = gl.getUniformLocation(gl.program, 'u_Brightness');
    if (!u_Brightness){
        console.log('Failed to get the storage location of u_Brightness');
        return false;
    }
    gl.uniform1f(u_Brightness, 1.0);



    //Set an initial value for this matrix to identify
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix,false,identityM.elements);

}
//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//Glovals related to ui
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=true;
let g_magentaAnimation=true;
let g_keyDown = {};
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
//for rain
let g_isRaining = false;
let g_rainDrops = [];
const g_rainDropCount = 160;

//Set up actions for the HTML UI elemnts
function addActionsForHtmlUI(){
    /*
    document.getElementById('animateOffButton').onclick = function(){
        g_yellowAnimation = false;
        g_magentaAnimation = false;
    };
    document.getElementById('animateOnButton').onclick = function(){
        g_yellowAnimation = true;
        g_magentaAnimation = true;
    };*/

    //Color slider events
    /*
    document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value;renderAllShapes();});
    document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value;renderAllShapes();});
    */
    canvas.onmousedown = function(ev){
        g_isDragging = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    };
    canvas.onmouseup = function(){ g_isDragging = false; };
    canvas.onmouseleave = function(){ g_isDragging = false; };
    canvas.onmousemove = function(ev) {
        if (!g_isDragging) return;
        const dx = ev.clientX - g_lastMouseX;
        const dy = ev.clientY - g_lastMouseY;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;

        const sensitivity = 0.25;
        g_camera.pan(-dx * sensitivity);
        g_camera.tilt(-dy * sensitivity);
    };
    //Angle slider
    /*
    document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = this.value; renderAllShapes();});
    */
    //fr
    const rainButton = document.getElementById('rainToggleButton');
    if (rainButton) {
        rainButton.onclick = toggleRain;
    }
}

function initTextures(gl,n){
    var wallImage = new Image();
    var dirtImage = new Image();
    if(!wallImage || !dirtImage){
        console.log('Failed to create the image object');
        return false;
    }
    wallImage.onload = function(){sendImageToTextureUnit(wallImage, 0, u_Sampler0);};
    dirtImage.onload = function(){sendImageToTextureUnit(dirtImage, 1, u_Sampler1);};
    wallImage.src = 'wall.png';
    dirtImage.src = 'dirt.png';
    return true;
}

function sendImageToTextureUnit(image, unit, sampler){
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1); // Flip the images y axis
    //enable texture unit
    if (unit === 0) {
        gl.activeTexture(gl.TEXTURE0);
    } else if (unit === 1) {
        gl.activeTexture(gl.TEXTURE1);
    }
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
    //set texture unit to sampler
    gl.uniform1i(sampler,unit);

    console.log('finished loadTexture');
}

function updateWeatherUI(){
    const rainButton = document.getElementById('rainToggleButton');
    if (rainButton) rainButton.textContent = g_isRaining ? 'Stop Rain' : 'Start Rain';
}

function seedRainDrops(){
    g_rainDrops = [];
    for (let i = 0; i < g_rainDropCount; i++) {
        g_rainDrops.push({
            x: (Math.random() - 0.5) * 12,
            y: Math.random() * 6 + 1,
            z: (Math.random() - 0.5) * 12,
            speed: Math.random() * 0.18 + 0.12
        });
    }
}

function toggleRain(){
    g_isRaining = !g_isRaining;
    if (g_isRaining && g_rainDrops.length === 0) {
        seedRainDrops();
    }
    updateWeatherUI();
}

function updateRain(){
    if (!g_isRaining) return;
    for (let i = 0; i < g_rainDrops.length; i++) {
        const d = g_rainDrops[i];
        d.y -= d.speed;
        if (d.y < -0.7) {
            d.y = Math.random() * 6 + 1;
            d.x = (Math.random() - 0.5) * 12;
            d.z = (Math.random() - 0.5) * 12;
        }
    }
}

function drawRain(){
    if (!g_isRaining) return;
    const eye = g_camera.eye.elements;
    for (let i = 0; i < g_rainDrops.length; i++) {
        const d = g_rainDrops[i];
        const drop = new Cube();
        drop.color = [0.70, 0.82, 1.0, 1.0];
        drop.textureNum = -2;
        drop.matrix.translate(eye[0] + d.x, d.y, eye[2] + d.z);
        drop.matrix.scale(0.02, 0.22, 0.02);
        drop.renderfaster();
    }
}
function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = handleClicks;
    //canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev); };
    document.onkeydown = function(ev){
        if (!g_keyDown[ev.keyCode]) {
            if (ev.key === '=' || ev.key === '+') { // = or + to add block in front
                changeBlockInFront(1);
                renderAllShapes();
            } else if (ev.key === '-' || ev.key === '_') { // - or _ t0 delete block in front
                changeBlockInFront(-1);
                renderAllShapes();
            }
        }
        g_keyDown[ev.keyCode] = true;
    };
    document.onkeyup = function(ev){ g_keyDown[ev.keyCode] = false; };
    
    initTextures(gl,0);
    initOrbsFromLayout();
    updateOrbsCountUI();
    updateWeatherUI();
    //specift the color for clearing canvas
    gl.clearColor(0.0,0.0,0.0,1.0); 
    //clear canvas
    //gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(tick);
}  

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000-g_startTime;
function tick(){
    //print some debug information so we know we are running
    g_seconds = performance.now()/1000-g_startTime;
    updateCameraFromKeys();
    collectOrbs();
    updateRain();
    //update animation angles
    updateAnimationAngles();
    //draw everything
    renderAllShapes();
    //tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

var g_shapesList = [];

function handleClicks(ev) { 
    if (ev.target !== canvas) return;

    if (ev.shiftKey && ev.type === 'mousedown') {
        startPokeAnimation();
        return;
    }

    // Map cursor position over canvas directly to global rotation angles.
    let [x,y] = convertCoordinatesEventToGL(ev);
    g_globalAngleX = x * 180;
    g_globalAngleY = y * 180;
    renderAllShapes();
} 
/*
function startPokeAnimation() {
    g_pokeAnimation = true;
    g_pokeStartTime = g_seconds;
}*/
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

 
//update hook for optional animation logic
function updateAnimationAngles(){
    if (g_yellowAnimation) {
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(3*g_seconds));
    }
}

function updateCameraFromKeys(){
    let moved = false;
    if(g_keyDown[87]){ //W
        g_camera.foward();
        moved = true;
    }
    if(g_keyDown[83]){ //S
        g_camera.back();
        moved = true;
    }
    if(g_keyDown[65]){ //A
        g_camera.left();
        moved = true;
    }
    if(g_keyDown[68]){ //D
        g_camera.right();
        moved = true;
    }
    if(g_keyDown[81]){ //Q
        g_camera.panLeft();
        moved = true;
    }
    if(g_keyDown[69]){ //E
        g_camera.panRight();
        moved = true;
    }
    return moved;
}

function clamp(v, min, max){
    return Math.max(min, Math.min(max, v));
}

function getWallHeight(x, y){
    return (typeof g_map[x][y] === 'number') ? g_map[x][y] : 0;
}

function changeBlockInFront(delta){
    const eye = g_camera.eye.elements;
    const at = g_camera.at.elements;
    const dx = at[0] - eye[0];
    const dz = at[2] - eye[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len === 0) return;

    const fx = dx / len;
    const fz = dz / len;
    const cellSize = 0.4;
    const frontDist = 0.6; // one map square ahead
    const worldX = eye[0] + fx * frontDist;
    const worldZ = eye[2] + fz * frontDist;
    const mapX = clamp(Math.floor((worldX / cellSize) + 16), 0, 31);
    const mapY = clamp(Math.floor((worldZ / cellSize) + 16), 0, 31);

    // dont build on orbs
    if (g_map[mapX][mapY] === 'x') return;

    const height = getWallHeight(mapX, mapY);
    if (delta > 0) {
        g_map[mapX][mapY] = clamp(height + 1, 0, 8);
    } else if (delta < 0) {
        g_map[mapX][mapY] = clamp(height - 1, 0, 8);
    }
}
//var g_eye=[0,0,3];
//var g_at=[0,0,-100];
//var g_up=[0,1,0];
var g_map=[
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 'x', 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 'x', 0, 4],
    [4, 0, 3, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 0, 1, 2, 2, 3, 0, 0, 0, 0, 0, 2, 0, 0, 2, 3, 2, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 3, 0, 0, 0, 1, 3, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 'x', 0, 2, 2, 1, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4],
    [4, 0, 0, 1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 'x', 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 'x', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 4, 2, 2, 2, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 1, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4],
    [4, 3, 0, 0, 2, 3, 4, 3, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4],
    [4, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 'x', 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 'x', 0, 0, 1, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
];
var g_camera = new Camera();
var g_orbs = [];
var g_orbsCollected = 0;
var g_orbsTotal = 0;

// 32x32 map where each number is wall height at [x][y].
// Paste your full 32-array literal here.
//var g_map = Array.from({ length: 32 }, () => Array(32).fill(0));

function initOrbsFromLayout(){
    g_orbs = [];
    g_orbsTotal = 0;

    for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
            if (g_map[x][y] === 'x') {
                g_orbs.push({
                    mapX: x,
                    mapY: y,
                    x: ((x - 16) * 0.4) + 0.2,
                    y: -0.55,
                    z: ((y - 16) * 0.4) + 0.2,
                    collected: false
                });
            g_orbsTotal += 1;
            }
        }
    }
}

function drawOrbs(){
    for (let i = 0; i < g_orbs.length; i++) {
        const s = g_orbs[i];
        if (s.collected) continue;
        const orb = new Orb();
        orb.color = [1, 0.9, 0.2, 1];
        orb.matrix.translate(s.x, s.y, s.z);
        orb.matrix.scale(0.4, 0.4, 0.4);
        orb.render();
    }
}

function collectOrbs(){
    const eye = g_camera.eye.elements;
    for (let i = 0; i < g_orbs.length; i++) {
        const s = g_orbs[i];
        if (s.collected) continue;
        const dx = eye[0] - s.x;
        const dz = eye[2] - s.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.24) {
            s.collected = true;
            g_map[s.mapX][s.mapY] = 0;
            g_orbsCollected += 1;
            updateOrbsCountUI();
        }
    }
}

function updateOrbsCountUI(){
    sendTextToHTML("Orbs collected: " + g_orbsCollected + "/" + g_orbsTotal + " total", "orbCount");
}

function drawMap(){
    for (let x = 0; x < 32; x++){
        for (let y = 0; y < 32; y++){
            const wallHeight = getWallHeight(x, y);
            for (let h = 0; h < wallHeight; h++) {
                var body = new Cube();
                body.color = [0.8,1,1,1];
                body.textureNum = (x==0 || x==31 || y==0 || y==31) ? 0 : 1;
                body.matrix.translate(0,-.75 + (h * 0.4),0);
                body.matrix.scale(.4,.4,.4);
                body.matrix.translate(x-16,0,y-16);
                body.renderfaster();
            }
        }
    }

}
//Draw every shape that is suppose to be in the canvas
function renderAllShapes(){
    // check the time at the start of this function
    var startTime = performance.now();
    
    //pass the proejctio matrix
    var projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width/canvas.height, .1,100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    //pass the view matrix
    var viewMat = new Matrix4();
    //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); //(eye, at, up)
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    //pass the matrix to u_ModelMatrix attribute
    var globalRotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);
    gl.uniform1f(u_Brightness, g_isRaining ? 0.55 : 1.0);


    //pass the matrix to u_ModelMatrix.attribute
    /*
    var globalRotMat = new Matrix4()
        .rotate(g_globalAngleX,0,-1,0)
        .rotate(g_globalAngleY,1,0,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);
    */
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawMap();
    drawOrbs();

    //Draw the floor
    var body = new Cube();
    body.color = [0.25,0.65,0.25,1];
    body.textureNum = -2;
    body.matrix.translate(0,-.75,0);
    body.matrix.scale(100,0,100);
    body.matrix.translate(-.5,0,-.5);
    body.render();

    //Draw the body cube
    var body = new Cube();
    body.color = [1,0,0,1];
    body.textureNum=0;
    body.matrix.translate(-.25,-.75,0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(.5,.3,.5);
    body.render();

    //Draw the sky
    var sky = new Cube();
    sky.color = [0.53,0.81,0.92,1];
    sky.textureNum = -2;
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.render();

    //Draw a left arm
    var yellow = new Cube();
    yellow.color = [1,1,0,1];
    yellow.textureNum=0;
    yellow.matrix.setTranslate(0,-.5,0,0);
    yellow.matrix.rotate(-5,1,0,0);
    yellow.matrix.rotate(-g_yellowAngle,0,0,1);
    
    /*
    if (g_yellowAnimation){
        yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else { 
    yellow.matrix.rotate(-g_yellowAngle,0,0,1);
    }*/
    
    
    var yellowCoordinatesMat = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25,.7,.5);
    yellow.matrix.translate(-.5,0,0)
    yellow.render();

    // Test nox
    var box = new Cube();
    box.color = [1,0,1,1];
    box.textureNum=0;
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,.65,0);
    box.matrix.rotate(-g_magentaAngle,0,0,1);
    box.matrix.scale(0.3,.3,.3);
    box.matrix.translate(-.5,0,-0.001);


    //box.matrix.translate(-.1,.1,0,0);
    //box.matrix.rotate(-30,1,0,0);
    //box.matrix.scale(.2,.4,.2);
    box.render();
    

    // Draw the imported animal model if present.
    
    if (typeof drawAllShapes === 'function') {
        drawAllShapes();
    }

    drawRain();

    //check the time at the end of the functiona and show on webpage
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/ duration), "numdot");

}

//set the text of the HTML element
function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
