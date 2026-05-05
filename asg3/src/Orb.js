class Orb{
    constructor(){
        this.type = 'orb';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.center = [0, 0, 0];
        this.size = 5.0;
        this.sCount = 8;
    }

    render() {
        // Collectible is a small orange cube rotated to appear diamond-like.
        const gem = new Cube();
        gem.color = [1.0, 0.55, 0.05, 1.0];
        gem.textureNum = -2;
        gem.matrix = new Matrix4(this.matrix);
        gem.matrix.rotate(45, 0, 1, 0);
        gem.matrix.rotate(35, 1, 0, 0);
        gem.matrix.scale(0.32, 0.32, 0.32);
        gem.matrix.translate(-0.5, -0.5, -0.5);
        gem.renderfaster();
    }
}
