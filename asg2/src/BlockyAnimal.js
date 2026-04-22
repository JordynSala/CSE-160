 // ColoredPoints.js
 // Vertex shader program
 var VSHADER_SOURCE = `
   attribute vec4 a_Position;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   void main(){
      gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
   }`

 
// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor; // uniform variable                      
void main() {
    gl_FragColor = u_FragColor;                                       
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalAngleX = -45;
let g_globalAngleY = 0;


function setupWebGL(){
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true});
    //get rendering context for webgl
    gl = getWebGLContext(canvas);
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
        console.log('Failed ot get the storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix){
        console.log('Failed ot get the storage location of u_GlobalRotateMatrix');
        return;
    }


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
let g_headJointAngle = 0;
let g_headShakeAngle = 0;
let g_frontLeftLegAngle = 0;
let g_frontRightLegAngle = 0;
let g_backLeftLegAngle = 0;
let g_backRightLegAngle = 0;
let g_jointAnimation = false;
let g_pokeAnimation = false;
let g_pokeStartTime = 0;


let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments = 10;
// Bouncing ball animation state
let g_bouncingBall = null;
let g_lastTime = 0;
let g_animationRequest = 0;
//Set up actions for the HTML UI elemnts
function addActionsForHtmlUI(){
    document.getElementById("allJointsSlide").addEventListener('input', function() {
        setAllJoints(Number(this.value));
        renderAllShapes();
    });
    document.getElementById("headJointSlide").addEventListener('input', function() {
        g_headJointAngle = Number(this.value);
        renderAllShapes();
    });
    document.getElementById("frontLeftLegSlide").addEventListener('input', function() {
        g_frontLeftLegAngle = Number(this.value);
        renderAllShapes();
    });
    document.getElementById("frontRightLegSlide").addEventListener('input', function() {
        g_frontRightLegAngle = Number(this.value);
        renderAllShapes();
    });
    document.getElementById("backLeftLegSlide").addEventListener('input', function() {
        g_backLeftLegAngle = Number(this.value);
        renderAllShapes();
    });
    document.getElementById("backRightLegSlide").addEventListener('input', function() {
        g_backRightLegAngle = Number(this.value);
        renderAllShapes();
    });
    document.getElementById("animateOnButton").addEventListener('click', function() {
        g_jointAnimation = true;
    });
    document.getElementById("animateOffButton").addEventListener('click', function() {
        g_jointAnimation = false;
    });

    //Angle slider
    document.getElementById('angleSlide').addEventListener('input', function() {
        g_globalAngleX = Number(this.value);
        renderAllShapes();
    });
}

function setAllJoints(angle){
    g_headJointAngle = angle;
    g_frontLeftLegAngle = angle;
    g_frontRightLegAngle = angle;
    g_backLeftLegAngle = angle;
    g_backRightLegAngle = angle;

    document.getElementById("headJointSlide").value = angle;
    document.getElementById("frontLeftLegSlide").value = angle;
    document.getElementById("frontRightLegSlide").value = angle;
    document.getElementById("backLeftLegSlide").value = angle;
    document.getElementById("backRightLegSlide").value = angle;
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev); };
    //specift the color for clearing canvas
    gl.clearColor(0.0,0.0,0.7,1.0); 
    //clear canvas
    //gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(tick);
}  

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000-g_startTime;
function tick(){
    //print some debug information so we know we are running
    g_seconds = performance.now()/1000-g_startTime;
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

function startPokeAnimation() {
    g_pokeAnimation = true;
    g_pokeStartTime = g_seconds;
}

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
    if (g_jointAnimation) {
        g_headJointAngle = 20 * Math.sin(g_seconds);
        g_frontLeftLegAngle = 35 * Math.sin(3 * g_seconds);
        g_backRightLegAngle = g_frontLeftLegAngle;
        g_frontRightLegAngle = -g_frontLeftLegAngle;
        g_backLeftLegAngle = g_frontRightLegAngle;

        // Keep sliders visually in sync while animation is running.
        document.getElementById("headJointSlide").value = g_headJointAngle;
        document.getElementById("frontLeftLegSlide").value = g_frontLeftLegAngle;
        document.getElementById("frontRightLegSlide").value = g_frontRightLegAngle;
        document.getElementById("backLeftLegSlide").value = g_backLeftLegAngle;
        document.getElementById("backRightLegSlide").value = g_backRightLegAngle;
    }

    if (g_pokeAnimation) {
        const pokeDuration = 1.0;
        const t = g_seconds - g_pokeStartTime;
        if (t < pokeDuration) {
            // head shake (roll on Z) damped over time.
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
//Draw every shape that is suppose to be in the canvas
function renderAllShapes(){
    // check the time at the start of this function
    var startTime = performance.now();

    //pass the matrix to u_ModelMatrix.attribute
    var globalRotMat = new Matrix4()
        .rotate(g_globalAngleX,0,-1,0)
        .rotate(g_globalAngleY,1,0,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    /*
    //Draw the body cube
    var body = new Cube();
    body.color = [1,0,0,1];
    body.matrix.translate(-.25,-.75,0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(.5,.3,.5);
    body.render();

    //Draw a left arm
    var yellow = new Cube();
    yellow.color = [1,1,0,1];
    yellow.matrix.setTranslate(0,-.5,0,0);
    yellow.matrix.rotate(-5,1,0,0);
    yellow.matrix.rotate(-g_yellowAngle,0,0,1);
    */
    /*
    if (g_yellowAnimation){
        yellow.matrix.rotate(45*Math.sin(g_seconds),0,0,1);
    } else { 
    yellow.matrix.rotate(-g_yellowAngle,0,0,1);
    }
    */
    /*
    var yellowCoordinatesMat = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25,.7,.5);
    yellow.matrix.translate(-.5,0,0)
    yellow.render();

    // Test nox
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,.65,0);
    box.matrix.rotate(-g_magentaAngle,0,0,1);
    box.matrix.scale(0.3,.3,.3);
    box.matrix.translate(-.5,0,-0.001);


    //box.matrix.translate(-.1,.1,0,0);
    //box.matrix.rotate(-30,1,0,0);
    //box.matrix.scale(.2,.4,.2);
    box.render();
    */

    // Draw the imported animal model if present.
    
    if (typeof drawAllShapes === 'function') {
        drawAllShapes();
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
