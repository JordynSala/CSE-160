 // Vertex shader program
 var VSHADER_SOURCE = `
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main(){
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
      //v_Normal = a_Normal;
      v_VertPos = u_ModelMatrix * a_Position;
   }`

 
// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor; // uniform variable  
uniform sampler2D u_Sampler0;      
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform vec3 u_spotPos;
uniform vec3 u_spotDir;
uniform vec3 u_cameraPos;
varying vec4 v_VertPos;
uniform bool u_lightOn;
uniform bool u_spotOn;
uniform float u_spotCosCutoff;
void main() {
    if (u_whichTexture == -3){          //use Normal
        gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
    } else if (u_whichTexture == -2){          //use color
        gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){   //use uv debug color
        gl_FragColor = vec4(v_UV,1.0,1.0); 
    } else if (u_whichTexture == 0) {   // use texture0
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {   // use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {                            //error put redish
        gl_FragColor = vec4(1.0,.2,.2,1.0);
    }
    
    
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r=length(lightVector);
    /*
    if (r<1.0) {
        gl_FragColor= vec4(1,0,0,1);
    } else if (r<2.0) {
        gl_FragColor= vec4(0,1,0,1);  
    */
    //light falloff visualization 1/r^2
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1); 
    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize (v_Normal);
    float nDotL = max(dot(N,L),0.0);

    //Reflection
    vec3 R = reflect(-L,N);
    //eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
    //specular
    float specular = pow(max(dot(E,R), 0.0),64.0)*.8;

    //vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 diffuse = u_lightColor * vec3(gl_FragColor)*nDotL*0.7;

    vec3 ambient = vec3(gl_FragColor)* 0.2;
    vec3 finalColor = vec3(gl_FragColor);
    if(u_lightOn){
        if (u_whichTexture == 0 ){
            finalColor = specular + diffuse + ambient;
        } else{
            finalColor = diffuse + ambient;    
        }
    }

    if (u_spotOn) {
        vec3 spotToFrag = normalize(vec3(v_VertPos) - u_spotPos);
        float spotCos = dot(spotToFrag, normalize(u_spotDir));
        if (spotCos > u_spotCosCutoff) {
            vec3 Ls = normalize(u_spotPos - vec3(v_VertPos));
            float nDotLs = max(dot(N, Ls), 0.0);
            float spotStrength = smoothstep(u_spotCosCutoff, 1.0, spotCos);
            finalColor += vec3(gl_FragColor) * nDotLs * spotStrength * 0.9;
        }
    }
    gl_FragColor = vec4(finalColor, 1.0);
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
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_lightColor;
let u_spotPos;
let u_spotDir;
let a_Normal;
let u_cameraPos;
let u_lightOn;
let u_spotOn;
let u_spotCosCutoff;


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
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if(a_Normal < 0){
        console.log('Failed to get the storage location of a_Normal');
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
    // Get the  storage location of u_lightPos variable
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos'); 
    if(!u_lightPos){
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if(!u_lightColor){
        console.log('Failed to get the storage location of u_lightColor');
        return;
    }
    u_spotPos = gl.getUniformLocation(gl.program, 'u_spotPos');
    if(!u_spotPos){
        console.log('Failed to get the storage location of u_spotPos');
        return;
    }
    u_spotDir = gl.getUniformLocation(gl.program, 'u_spotDir');
    if(!u_spotDir){
        console.log('Failed to get the storage location of u_spotDir');
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
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix){
        console.log('Failed to get the storage location of u_NormalMatrix');
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
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos){
        console.log('Failed to get the storage location of u_cameraPos');
        return false;
    }
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn){
        console.log('Failed to get the storage location of u_lightOn');
        return false;
    }
    u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
    if (!u_spotOn){
        console.log('Failed to get the storage location of u_spotOn');
        return false;
    }
    u_spotCosCutoff = gl.getUniformLocation(gl.program, 'u_spotCosCutoff');
    if (!u_spotCosCutoff){
        console.log('Failed to get the storage location of u_spotCosCutoff');
        return false;
    }
    //Set an initial value for this matrix to identify
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix,false,identityM.elements);
    //gl.uniformMatrix4fv(u_NormalMatrix,false,identityM.elements);

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
//Might Remove
let g_keyDown = {};
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
//============
let g_normalOn = false;
let g_lightPos=[0,1,-2]
let g_lightColor=[1.0,1.0,0.9];
let g_lightOn = true;
let g_spotOn = true;
let g_pandaX = 2.2;
let g_pandaY = -.6;
let g_pandaZ = -1.3;
// Panda animation state (kept in JS so HTML does not need to define globals)
let g_headJointAngle = 0;
let g_headShakeAngle = 0;
let g_frontLeftLegAngle = 0;
let g_frontRightLegAngle = 0;
let g_backLeftLegAngle = 0;
let g_backRightLegAngle = 0;
let g_jointAnimation = true;
let g_pokeAnimation = false;
let g_pokeStartTime = 0;




//Set up actions for the HTML UI elemnts
function addActionsForHtmlUI(){
    document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
    document.getElementById('lightOff').onclick = function() {g_lightOn = false;};
    document.getElementById('spotOn').onclick = function() {g_spotOn = true;};
    document.getElementById('spotOff').onclick = function() {g_spotOn = false;};
    document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
    document.getElementById('normalOff').onclick = function() {g_normalOn = false;};
    //document.getElementById('animateYellowOffButton').onclick = function(){g_yellowAnimation=false;};
    //document.getElementById('animateYellowOnButton').onclick= function(){g_yellowAnimation=true;};
    //document.getElementById('animateMagentaOffButton').onclick = function(){g_magentaAnimation=false;};
    //document.getElementById('animateMagentaOnButton').onclick = function(){g_magentaAnimation=true;};
    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightPos[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightPos[2] = this.value/100; renderAllShapes();}});
    document.getElementById('lightColorR').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightColor[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightColorG').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightColor[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightColorB').addEventListener('mousemove', function(ev) {if(ev.buttons) {g_lightColor[2] = this.value/100; renderAllShapes();}});

    //document.getElementById('yellowSlide').addEventListener('mousemove', function(ev) {if(ev.button)})
    //document.getElementById('magentaSlide').addEventListener('mousemove', function(ev) {if(ev.button)})

    canvas.onmousemove = function(ev) {if(ev.buttons == 1){click(ev)}};
    //document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = 0})
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
}


function initTextures(gl,n){
    var image0 = new Image(); //create the new image
    if (!image0){
        console.log('Failed to create the image object');
        return false;
    }
    //register the even handler to be called on loading an image
    image0.onload = function(){sendImageToTEXTURE0(image0);};
    //tell the browser to load an image
    image0.src = 'dirt.png';
    var image1 = new Image(); //create the new image
    if (!image1){
        console.log('Failed to create the image object');
        return false;
    }
    //register the even handler to be called on loading an image
    image1.onload = function(){sendImageToTEXTURE1(image1);};
    //tell the browser to load an image
    image1.src = 'sky.jpg';

    return true;
}
/*
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
}*/
/*
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
}*/
function sendImageToTEXTURE0( image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Create a texture object

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);//Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture objct to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    //gl.clear(gl.COLOR_BUFFER_BIT); //clear <canvas>

    //gl.drawArrays(g1.TRIANGLE_STRIP, 0,n);//Draw the rectangle
    console.log('finished loadTexture');
}
function sendImageToTEXTURE1( image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Create a texture object

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);//Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture objct to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);

    //gl.clear(gl.COLOR_BUFFER_BIT); //clear <canvas>

    //gl.drawArrays(g1.TRIANGLE_STRIP, 0,n);//Draw the rectangle
    console.log('finished loadTexture');
} 
function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = handleClicks;
    //canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev); };
    document.onkeydown = function(ev){
        g_keyDown[ev.keyCode] = true;
    };
    document.onkeyup = function(ev){
        g_keyDown[ev.keyCode] = false;
    };
    
    initTextures();
    bunny = new Model(gl, "bunny.obj");
    
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
    //update animation angles
    updateAnimationAngles();
    //draw everything
    renderAllShapes();
    //tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

/*
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
} */
/*
function startPokeAnimation() {
    g_pokeAnimation = true;
    g_pokeStartTime = g_seconds;
}*/
/*
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}*/

 
//update hook for optional animation logic
function updateAnimationAngles(){
    if (g_yellowAnimation) {
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(3*g_seconds));
    }

    g_lightPos[0] = Math.cos(g_seconds/2)*3;
    updatePandaAnimationAngles();
}

function updatePandaAnimationAngles(){
    if (g_jointAnimation) {
        g_headJointAngle = 20 * Math.sin(g_seconds);
        g_frontLeftLegAngle = 35 * Math.sin(3 * g_seconds);
        g_backRightLegAngle = g_frontLeftLegAngle;
        g_frontRightLegAngle = -g_frontLeftLegAngle;
        g_backLeftLegAngle = g_frontRightLegAngle;

        // Optional slider sync when those controls are present.
        const headJointSlide = document.getElementById("headJointSlide");
        const frontLeftLegSlide = document.getElementById("frontLeftLegSlide");
        const frontRightLegSlide = document.getElementById("frontRightLegSlide");
        const backLeftLegSlide = document.getElementById("backLeftLegSlide");
        const backRightLegSlide = document.getElementById("backRightLegSlide");
        if (headJointSlide) headJointSlide.value = g_headJointAngle;
        if (frontLeftLegSlide) frontLeftLegSlide.value = g_frontLeftLegAngle;
        if (frontRightLegSlide) frontRightLegSlide.value = g_frontRightLegAngle;
        if (backLeftLegSlide) backLeftLegSlide.value = g_backLeftLegAngle;
        if (backRightLegSlide) backRightLegSlide.value = g_backRightLegAngle;
    }

    if (g_pokeAnimation) {
        const pokeDuration = 1.0;
        const t = g_seconds - g_pokeStartTime;
        if (t < pokeDuration) {
            const damping = 1.0 - (t / pokeDuration);
            g_headShakeAngle = 38 * damping * Math.sin(t * 38);
        } else {
            g_pokeAnimation = false;
            g_headShakeAngle = 0;
        }
    } else {
        g_headShakeAngle = 0;
    }
}

function keydown(ev) {
if (ev.keyCode == 39) {// Right arrow
    g_camera.turnright();
} else
if (ev.keyCode == 37) {// left arrow
    g_camera.turnleft();
}
if (ev.keyCode == 87) {g_camera.forward();}
if (ev.keyCode == 83) {g_camera.back(); }
if (ev.keyCode == 65) {g_camera.left(); }
if (ev.keyCode == 68) {g_camera.right(); }
if (ev.keyCode == 81) {g_camera.turnleft(); }
if (ev.keyCode == 69) {g_camera.turnright(); }

renderAllShapes();
console.log(ev.keyCode);
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


var g_camera = new Camera();
let bunny = null;
//Draw every shape that is suppose to be in the canva
var g_map=[
[1, 1, 1, 1, 1, 1,1, 1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1, 0,0,1,1,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,1,0,0,1],
[1,0,0,0,0,0,0,1],
];

function drawMap() {
    var body = new Cube();
    for (i=0;i<2;i++) {
        for (x=0;x<32;x++){
            for (y=0;y<32;y++){
                //var body = new Cube();
                body.color = [0.8,1.0,1.0,1.0];
                body.matrix.setTranslate(0, -.75,0);
                body.matrix.scale(.4,.4,.4);
                body.matrix.translate(x-16, 0, y-16);
                body.renderfaster();
            }
        }
    }
}

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
    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //pass the ligt position to glsl    
    gl.uniform3f(u_lightPos,g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    gl.uniform3f(u_lightColor,g_lightColor[0],g_lightColor[1],g_lightColor[2]);
    //pass the ligt camera to glsl    
    gl.uniform3f(u_cameraPos,g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    
    //pass the ligt status
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_spotOn, g_spotOn);
    gl.uniform1f(u_spotCosCutoff, Math.cos(Math.PI / 8)); // 22.5 degree cone

    // Spotlight aimed at bunny location.
    const spotPos = [0.8, 1.6, 1.2];
    const bunnyTarget = [3.2, -0.95, -1.4];
    const dx = bunnyTarget[0] - spotPos[0];
    const dy = bunnyTarget[1] - spotPos[1];
    const dz = bunnyTarget[2] - spotPos[2];
    const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
    gl.uniform3f(u_spotPos, spotPos[0], spotPos[1], spotPos[2]);
    gl.uniform3f(u_spotDir, dx/mag, dy/mag, dz/mag);
    //Draw the light
    var light = new Cube();
    light.color = [g_lightColor[0]*2.0,g_lightColor[1]*2.0,g_lightColor[2]*2.0,1];
    light.matrix.translate(g_lightPos[0],g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.render();

    // Draw a marker cube for the spotlight source.
    var spotMarker = new Cube();
    spotMarker.color = [0.9,0.9,1.0,1.0];
    spotMarker.textureNum = -2;
    spotMarker.matrix.translate(spotPos[0], spotPos[1], spotPos[2]);
    spotMarker.matrix.scale(-.08,-.08,-.08);
    spotMarker.matrix.translate(-.5,-.5,-.5);
    spotMarker.render();

    //Draw sphere
    var sp = new Sphere();
    if (g_normalOn) sp.textureNum = -3;
    sp.matrix.translate(-1,0,-1.5);
    sp.render();


    //Draw the floor
    var body = new Cube();
    body.color = [0.25,0.65,0.25,1];
    body.textureNum = -2;
    if (g_normalOn) body.textureNum = -3;
    body.matrix.translate(0,-.75,0);
    body.matrix.scale(100,0,100);
    body.matrix.translate(-.5,0,-.5);
    body.render();

    //Draw cube
    var c = new Cube();
    c.color = [.5,.5,.5,1];
    if (g_normalOn) c.textureNum=-3;
    c.matrix.translate(-3,-.75,-1.5);
    c.matrix.scale(.5,.5,.5);
    c.render();

    //Draw the body cube
    var body = new Cube();
    body.color = [1,0,0,1];
    if (g_normalOn) body.textureNum=-3;
    body.matrix.translate(.625,-.75,-1.5);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(.5,.3,.5);
    //body.normalMatrix.setInverseOf(body.matrix).transpose();

    body.render();

    //Draw the sky
    var sky = new Cube();
    sky.color = [0.53,0.81,0.92,1];
    if (g_normalOn) sky.textureNum = -3;
    sky.matrix.scale(-50,-50,-50);
    sky.matrix.translate(-.5,-.5,-.5);
    sky.render();

    //Draw a left arm
    var yellow = new Cube();
    yellow.color = [1,1,0,1];
    if (g_normalOn) yellow.textureNum=-3;
    yellow.matrix.setTranslate(.88,-.5,-1.5);
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
    yellow.normalMatrix.setInverseOf(yellow.matrix).transpose();
    //gl.uniformMatrix4fv(u_NormalMatrix, false, yellow.normalMatrix.elements);

    yellow.render();

    // Test nox
    var box = new Cube();
    box.color = [1,0,1,1];
    if (g_normalOn) box.textureNum=-3;
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,.65,0);
    box.matrix.rotate(-g_magentaAngle,0,0,1);
    box.matrix.scale(0.3,.3,.3);
    box.matrix.translate(-.5,0,-0.001);

    box.normalMatrix.setInverseOf(box.matrix).transpose();

    //box.matrix.translate(-.1,.1,0,0);
    //box.matrix.rotate(-30,1,0,0);
    //box.matrix.scale(.2,.4,.2);
    box.render();
    
    // Draw the imported animal model if present.
    
    if (typeof drawAllShapes === 'function') {
        drawAllShapes();
    }
    if (bunny) {
        bunny.color = g_normalOn ? [1.0, 1.0, 1.0, 1.0] : [0.92, 0.92, 0.92, 1.0];
        bunny.matrix.setIdentity();
        bunny.matrix.translate(3.2, -.95, -1.4);
        bunny.matrix.rotate(0, 1, 0, 0);
        bunny.matrix.scale(0.2, 0.2, 0.2);
        bunny.render();
    }

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
