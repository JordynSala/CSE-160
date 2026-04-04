// asg0.js
function main(){
    //Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    /* part 1
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
    
    //Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color
    */

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    //black background
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; //set a black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // fill the canvas with the color

    /* part 2
    // Create v1 z = 0
    var v1 = new Vector3([2.25, 2.25, 0.0]);
    // Draw v1 in red
    drawVector(v1, 'red');
    */
}
function drawVector(v, color){
    var canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(
        canvas.width/2 + v.elements[0] * 20,
        canvas.height/2 - v.elements[1] * 20
    );
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');
    var x1 = document.getElementById('xcoord1').value;
    var y1 = document.getElementById('ycoord1').value;
    var x2 = document.getElementById('xcoord2').value;
    var y2 = document.getElementById('ycoord2').value;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; //set a black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // fill the canvas with the color

    // Draw new vector
    var v1 = new Vector3([x1, y1, 0.0]);
    drawVector(v1, "red");
    // Draw new vector
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");
    
}
function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');
    var x1 = document.getElementById('xcoord1').value;
    var y1 = document.getElementById('ycoord1').value;
    var x2 = document.getElementById('xcoord2').value;
    var y2 = document.getElementById('ycoord2').value;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; //set a black background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // fill the canvas with the color

    // Draw new vector
    var v1 = new Vector3([x1, y1, 0.0]);
    drawVector(v1, "red");
    // Draw new vector
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");

    var operator = document.getElementById('opt').value;
    // Add or Subtract
    if (operator == "Add"){
        v1.add(v2);
        drawVector(v1, "green");
    } else if (operator == "Subtract"){
        v1.sub(v2);
        drawVector(v1, "green");
    } else if (operator == "Multiply"){
        var s = document.getElementById('scalar').value;
        v1.mul(s);
        drawVector(v1, "green");
        v2.mul(s);
        drawVector(v2, "green");
    } else if (operator == "Divide"){
        var s = document.getElementById('scalar').value;
        v1.div(s);
        drawVector(v1, "green");
        v2.div(s);
        drawVector(v2, "green");
    } else if (operator == "Magnitude"){
        console.log("Magnitude v1: "+ v1.magnitude());
        console.log("Magnitude v2: "+ v2.magnitude());
    } else if (operator == "Normalize"){
        var v1norm = v1.normalize();
        drawVector(v1norm, "green");
        var v2norm = v2.normalize();
        drawVector(v2norm, "green");
    } else if (operator == "Angle"){
        console.log("Angle: "+ angleBetween(v1,v2));
    } else if (operator == "Area"){
        console.log("Area of the triangle: " + (areaTriangle(v1, v2)));
   }
    function angleBetween(v1, v2){
        var m1 = v1.magnitude();
        var m2 = v2.magnitude();
        var alpha = Math.acos((Vector3.dot(v1, v2))/(m1*m2));
        alpha *= 180/Math.PI; //convert to degress
        return alpha;
    }

    function areaTriangle(v1, v2){
        //area = 1/2 * magnitude(v1 cross v2)
        const cross = Vector3.cross(v1, v2);
        return cross.magnitude() / 2;
    }

        
}