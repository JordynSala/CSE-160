class Cube{
    constructor(){
        this.type='cube';
        //this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32 = new Float32Array([
        0,0,0, 1,1,0, 1,0,0,
        0,0,0, 0,1,0, 1,1,0,
        0,1,0, 0,1,1, 1,1,1,
        0,1,0, 1,1,1, 1,1,0,
        1,1,0, 1,1,1, 1,0,0,
        1,0,0, 1,1,1, 1,0,1,
        0,1,0, 0,1,1, 0,0,0,
        0,0,0, 0,1,1, 0,0,1,
        0,0,0, 0,0,1, 1,0,1,
        0,0,0, 1,0,1, 1,0,0,
        0,0,1, 1,1,1, 1,0,1,
        0,0,1, 0,1,1, 1,1,1
        ]);
        this.cubeVerts = [
        0,0,0, 1,1,0, 1,0,0,
        0,0,0, 0,1,0, 1,1,0,
        0,1,0, 0,1,1, 1,1,1,
        0,1,0, 1,1,1, 1,1,0,
        1,1,0, 1,1,1, 1,0,0,
        1,0,0, 1,1,1, 1,0,1,
        0,1,0, 0,1,1, 0,0,0,
        0,0,0, 0,1,1, 0,0,1,
        0,0,0, 0,0,1, 1,0,1,
        0,0,0, 1,0,1, 1,0,0,
        0,0,1, 1,1,1, 1,0,1,
        0,0,1, 0,1,1, 1,1,1
        ];
        this.cubeVertsUV32 = new Float32Array([
        // Front
        0,0,0, 0,0,  1,1,0, 1,1,  1,0,0, 1,0,
        0,0,0, 0,0,  0,1,0, 0,1,  1,1,0, 1,1,
        // Top
        0,1,0, 0,0,  0,1,1, 0,1,  1,1,1, 1,1,
        0,1,0, 0,0,  1,1,1, 1,1,  1,1,0, 1,0,
        // Right
        1,1,0, 0,1,  1,1,1, 1,1,  1,0,0, 0,0,
        1,0,0, 0,0,  1,1,1, 1,1,  1,0,1, 1,0,
        // Left
        0,1,0, 1,1,  0,1,1, 0,1,  0,0,0, 1,0,
        0,0,0, 1,0,  0,1,1, 0,1,  0,0,1, 0,0,
        // Bottom
        0,0,0, 0,0,  0,0,1, 0,1,  1,0,1, 1,1,
        0,0,0, 0,0,  1,0,1, 1,1,  1,0,0, 1,0,
        // Back
        0,0,1, 0,0,  1,1,1, 1,1,  1,0,1, 1,0,
        0,0,1, 0,0,  0,1,1, 0,1,  1,1,1, 1,1
        ]);
    }
    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        //pass the texutre number
        gl.uniform1i(u_whichTexture, this.textureNum);

        //pass the color of a point ot u_FragColor variable
        gl.uniform4f(u_FragColor,rgba[0], rgba[1], rgba[2], rgba[3]);
        
        //pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //this.normalMatrix.setInverseOf(this.matrix);
        //this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        

        //Front fo the cube
        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1 ,0,0,-1, 0,0,-1]);
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1],[0,0,-1 ,0,0,-1, 0,0,-1]);
        //pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor,rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3]);
        //Top of cube
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1],[0,1,0 ,0,1,0, 0,1,0]);
        drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0 ,0,1,0, 0,1,0]);
        //pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor,rgba[0]*.8,rgba[1]*.8,rgba[2]*.8,rgba[3]);

        //Right of cube
        drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

        //pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor,rgba[0]*.7,rgba[1]*.7,rgba[2]*.7,rgba[3]);
        //left of the cube
        drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,1,0], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
        //Back of cube
        //gl.uniform4f(u_FragColor,rgba[0]*.5,rgba[1]*.5,rgba[2]*.5,rgba[3]);
        drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
        drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
        //pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor,rgba[0]*.6,rgba[1]*.6,rgba[2]*.6,rgba[3]);
        //Bottom of cube
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);

    }

    renderfast(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        //pass the texutre number
        //gl.uniform1i(u_whichTexture, this.textureNum);

        //pass the color of a point ot u_FragColor variable
        gl.uniform4f(u_FragColor,rgba[0], rgba[1], rgba[2], rgba[3]);
        
        //pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];
        //Front fo the cube
        allverts=allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts=allverts.concat([0,0,0, 0,1,0, 1,1,0]);
        //pass the color of a point to u_FragColor uniform variable
        //gl.uniform4f(u_FragColor,rgba[0]*.9,rgba[1]*.9,rgba[2]*.9,rgba[3]);
        //Top of cube
        allverts=allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts=allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        //Right of cube
        allverts=allverts.concat([1,0,0, 1,1,0, 1,1,1]);
        allverts=allverts.concat([1,0,0, 1,1,1, 1,0,1]);
        //left of the cube
        allverts=allverts.concat([0,0,0, 0,1,1, 0,1,0]);
        allverts=allverts.concat([0,0,0, 0,0,1, 0,1,1]);
        //Back of cube
        allverts=allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts=allverts.concat([0,0,1, 0,1,1, 1,1,1]);

        //Bottom of cube
        allverts=allverts.concat([0,0,0, 1,0,1, 1,0,0]);
        allverts=allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        drawTriangle3D(allverts);

    }

    renderfaster(){
        var rgba = this.color;
        //pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        //pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if(g_cubeVertexUVBuffer == null){
            g_cubeVertexUVBuffer = gl.createBuffer();
            if (!g_cubeVertexUVBuffer){
                console.log('Failed to create cube vertex buffer');
                return;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertsUV32, gl.DYNAMIC_DRAW);

        // Position: xyz, UV: uv (stride = 5 floats)
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}

var g_cubeVertexUVBuffer = null;

