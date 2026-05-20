class Triangle{
    constructor(){
        this.type='triangle';
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.size=5.0;
    }
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        //pass the position of a point to a_Position ariable
        // pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        // pass the size to u_Size
        gl.uniform1f(u_Size, size);
        //Draw
        var d = this.size / 200.0;
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);

    }
}
function drawTriangle(vertices) {
    var n = 3; // The number of vertices
    //create a buffer object
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer=null;
function initTriangle3D(){
    //create a buffer object
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    //bind the buffer object to target 
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
    //Enable the assignment to a_Position Variable
    gl.enableVertexAttribArray(a_Position);
}

function drawTriangle3D(vertices) {
    //var n = 3; // The number of vertices
    var n = vertices.length/3;   
    if(g_vertexBuffer==null){
        initTriangle3D();
    }

    /*
    //create a buffer object
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_Position);
    */

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv){
    var n = 3; //the number of vertices
    // create the buffer object for the positions
    var n = 3; // The number of vertices

    //create a buffer object
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    
    //create buffer object for UV
    var uvBuffer = gl.createBuffer();
    if(!uvBuffer){
        console.log('Failed to create the buffer object');
        return -1;  
    }

    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    g_vertexBuffer = null;
}

function drawTriangle3DUVNormal(vertices, uv, normals){
    // create the buffer object for the positions
    var n = vertices.length/3;; // The number of vertices

    //create a buffer object
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    
    //create buffer object for UV
    var uvBuffer = gl.createBuffer();
    if(!uvBuffer){
        console.log('Failed to create the buffer object');
        return -1;  
    }

    //Bind the buffer object ot the target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0,0);

    //Enable the assignment to a a_Position variabel

    gl.enableVertexAttribArray(a_UV);

    //Create a buffer object for normals
    var normalBuffer = gl.createBuffer();
    if(!normalBuffer){
        console.log('Failed to create a buffer object');
        return -1;
    }
    //bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

     //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0,0);

    //Enable the assignment ot a_Position variable
    gl.enableVertexAttribArray(a_Normal);

    //Draw triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);

    g_vertexBuffer = null;
}

