class Cylinder{
    constructor(){
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.segments = 10;
    }

    render(){
        var rgba = this.color;
        var segs = Math.max(3, this.segments | 0);
        var step = (2 * Math.PI) / segs;
        var cx = 0.5;
        var cz = 0.5;
        var r = 0.5;
        var yBottom = 0.0;
        var yTop = 1.0;

        // Pass color, texture mode, and matrices.
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        for (let i = 0; i < segs; i++){
            let a0 = i * step;
            let a1 = (i + 1) * step;

            let x0 = cx + Math.cos(a0) * r;
            let z0 = cz + Math.sin(a0) * r;
            let x1 = cx + Math.cos(a1) * r;
            let z1 = cz + Math.sin(a1) * r;
            let nx0 = Math.cos(a0);
            let nz0 = Math.sin(a0);
            let nx1 = Math.cos(a1);
            let nz1 = Math.sin(a1);

            // Side surface (two triangles form one quad slice).
            drawTriangle3DUVNormal(
                [x0, yBottom, z0, x0, yTop, z0, x1, yTop, z1],
                [0,0, 0,1, 1,1],
                [nx0,0,nz0, nx0,0,nz0, nx1,0,nz1]
            );
            drawTriangle3DUVNormal(
                [x0, yBottom, z0, x1, yTop, z1, x1, yBottom, z1],
                [0,0, 1,1, 1,0],
                [nx0,0,nz0, nx1,0,nz1, nx1,0,nz1]
            );

            // Top cap.
            gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
            drawTriangle3DUVNormal(
                [cx, yTop, cz, x0, yTop, z0, x1, yTop, z1],
                [0.5,0.5, 0,0, 1,0],
                [0,1,0, 0,1,0, 0,1,0]
            );

            // Bottom cap.
            gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
            drawTriangle3DUVNormal(
                [cx, yBottom, cz, x1, yBottom, z1, x0, yBottom, z0],
                [0.5,0.5, 1,1, 0,1],
                [0,-1,0, 0,-1,0, 0,-1,0]
            );

            // Reset side color for next segment.
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        }
    }
}
