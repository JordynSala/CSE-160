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
    if (!g_triangle2DBuffer) {
        g_triangle2DBuffer = gl.createBuffer();
        if (!g_triangle2DBuffer){
            console.log('Failed to create 2D triangle buffer object');
            return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, g_triangle2DBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 6 * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, g_triangle2DBuffer);
    }

    // Reuse typed-array storage instead of allocating every draw call.
    if (vertices.length === 6) {
        g_triangle2DData.set(vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, g_triangle2DData);
    } else {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    }
  
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0,0);
    //Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES,0,n);
    //return n;
}

function drawTriangle3D(vertices) {
    var n = 3; // The number of vertices
    if (!g_triangle3DBuffer) {
        g_triangle3DBuffer = gl.createBuffer();
        if (!g_triangle3DBuffer){
            console.log('Failed to create 3D triangle buffer object');
            return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, g_triangle3DBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 9 * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, g_triangle3DBuffer);
    }

    // Reuse typed array storage instead of allocating every draw call
    if (vertices.length === 9) {
        g_triangle3DData.set(vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, g_triangle3DData);
    } else {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    }
  
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
   


    //Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES,0,n);
    //return n;
}

// Shared buffers to avoid per triangle GPU object allocation.
let g_triangle2DBuffer = null;
let g_triangle3DBuffer = null;
let g_triangle2DData = new Float32Array(6);
let g_triangle3DData = new Float32Array(9);
