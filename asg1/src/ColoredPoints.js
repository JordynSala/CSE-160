 // ColoredPoints.js
 // Vertex shader program
 var VSHADER_SOURCE = `
   attribute vec4 a_Position;
   uniform float u_Size;
   void main() {
     gl_Position = a_Position;
     //gl_PointSize = 10.0;
     gl_PointSize = u_Size;
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

function setupWebGL(){
    canvas = document.getElementById('webgl', { preserveDrawingBuffer: true});
    //get rendering context for webgl
    gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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
        console.log('Failed to get the storage location of a_position');
        return;
    }    
    // Get the  storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); 
    if(!u_FragColor){
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }  
    u_Size = gl.getUniformLocation(gl.program, 'u_Size'); 
    if(!u_Size){
        console.log('Failed to get the storage location of u_Size');
        return;
    }  
}
//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//Glovals related to ui
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments = 10;
// Bouncing ball animation state
let g_bouncingBall = null;
let g_lastTime = 0;
let g_animationRequest = 0;
//Set up actions for the HTML UI elemnts
function addActionsForHtmlUI(){
    //button events (shape type)
    //document.getElementById('green').onclick=function(){g_selectedColor = [0.0,1.0,0.0,1.0];};
    //document.getElementById('red').onclick=function(){g_selectedColor = [1.0,0.0,0.0,1.0];};
    document.getElementById('clearButton').onclick=function(){clearCanvas();};

    document.getElementById('pointButton').onclick=function(){g_selectedType=POINT; };
    document.getElementById('triangleButton').onclick=function(){g_selectedType=TRIANGLE; };
    document.getElementById('circleButton').onclick=function(){g_selectedType=CIRCLE; };
    document.getElementById('rabbitButton').onclick=function(){loadRabbitArt(); };
    document.getElementById('ballButton').onclick=function(){toggleBouncingBall(); };


    //slider events
    document.getElementById("redSlide").addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById("greenSlide").addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
    document.getElementById("blueSlide").addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});

    //size slider events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize=this.value;});
    //segment slider events
    document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegments=this.value;});
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) handleClicks(ev); };
    //specift the color for clearing canvas
    gl.clearColor(0.0,0.0,0.0,1.0); 
    //clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}
function loadRabbitArt() {
    g_shapesList = [];
    g_shapesList.push(new Rabbit());
    renderAllShapes();
}

function clearCanvas() {
    g_shapesList = [];
    if (g_bouncingBall) {
        // Stop and remove the animated ball
        g_bouncingBall.active = false;
        g_bouncingBall = null;
    }
    if (g_animationRequest) {
        //cancelAnimationFrame stops scheduled animation request
        cancelAnimationFrame(g_animationRequest);
        g_animationRequest = 0;
    }
    renderAllShapes();
}

function toggleBouncingBall() {
    //if the ball doesnt exist yet then create it 
    if (!g_bouncingBall) {
        // First-time creation of the ball
        g_bouncingBall = new BouncingBall();
        g_bouncingBall.setColor(g_selectedColor);
        g_bouncingBall.setRandomDirection();
        //record the current time for animation timing
        g_lastTime = performance.now();
        renderAllShapes();
        //animation loop
        animate();
        return;
    }

    // Toggle pause/resume
    g_bouncingBall.active = !g_bouncingBall.active;
    if (g_bouncingBall.active) {
        //when resuming reset color and direction
        g_bouncingBall.setColor(g_selectedColor);
        g_bouncingBall.setRandomDirection();
        //reset timing
        g_lastTime = performance.now();
        renderAllShapes();
        animate();
    }
}

function animate() {
    //stop animation if ball doesnt exist or is inactive
    if (!g_bouncingBall || !g_bouncingBall.active) {
        g_animationRequest = 0;
        return;
    }
    //calc time diff since last frame
    const now = performance.now();
    const dt = (now - g_lastTime) / 1000;
    g_lastTime = now;
    //update ball position based on time
    g_bouncingBall.update(dt);
    renderAllShapes();
    //get next animation frame, RequestAnimationFrame() to sync animation updates with browser rendering cycle
    g_animationRequest = requestAnimationFrame(animate);
}

var g_shapesList = [];
//var g_points = [];  // The array for a mouse press
//var g_colors = [];  // The array to store the color of a point 
//var g_sizes = [];

function handleClicks(ev) { 
    //Extract the event clicka dn return it in webGl coordinates
    let [x,y] = convertCoordinatesEventToGL(ev);

    //create and store the new point
    let point;
    if (g_selectedType==POINT){
        point = new Point();
    } else if (g_selectedType==TRIANGLE){
        point = new Triangle(); 
    } else {
        point = new Circle();
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    if (point.type === 'circle') {
        point.segments = g_selectedSegments;
    }
    g_shapesList.push(point);
    
    //Draw every shape that is suppose to be in the canvas
    renderAllShapes();
} 

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

//Draw every shape that is suppose to be in the canvas
function renderAllShapes(){
    // check the time at the start of this function
    var starTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //var len = g_points.length;
    var len = g_shapesList.length
    for(var i = 0; i < len; i++) {

        g_shapesList[i].render();
    }

    if (g_bouncingBall) {
        // Keep the ball color synced to the RGB sliders
        g_bouncingBall.setColor(g_selectedColor);
        g_bouncingBall.render();
    }
    
}
