// Animated circle that moves in the canvas  and bounces off canvas edges
class BouncingBall {
  constructor() {
    // Ball state
    this.type = 'bouncingBall';
    this.position = [0.0, 0.0, 0.0];
    this.velocity = [0.7, 0.5]; // units per second
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 16.0; // circle size 
    this.segments = 20;
    this.active = true;
  }

  setColor(rgba) {
    // Color changes as the rgb slides change
    this.color = rgba.slice();
  }

  setRandomDirection() {
    // Pick a random direction with constant speed
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.9;
    this.velocity = [Math.cos(angle) * speed, Math.sin(angle) * speed];
  }

  update(dt) {
    // move by velocity scaled by time
    if (!this.active) return;

    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;

    // Bounce off canvas bounds using ball radius, chek in both x and y
    const radius = this.size / 200.0;

    if (this.position[0] + radius > 1.0) {
      this.position[0] = 1.0 - radius;
      this.velocity[0] = -Math.abs(this.velocity[0]);
    } else if (this.position[0] - radius < -1.0) {
      this.position[0] = -1.0 + radius;
      this.velocity[0] = Math.abs(this.velocity[0]);
    }

    if (this.position[1] + radius > 1.0) {
      this.position[1] = 1.0 - radius;
      this.velocity[1] = -Math.abs(this.velocity[1]);
    } else if (this.position[1] - radius < -1.0) {
      this.position[1] = -1.0 + radius;
      this.velocity[1] = Math.abs(this.velocity[1]);
    }
  }

  render() {
    // Draw circle as fan of triangles, taken from circle file render()
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    //pass the color of a point ot u_FragColor variable
    gl.uniform4f(u_FragColor,rgba[0], rgba[1], rgba[2], rgba[3]);
    //Draw 
    var d = this.size/200.0; //delta
    let angleStep = 360/this.segments;
    for(var angle = 0; angle < 360; angle=angle+angleStep){
        let centerPt = [xy[0],xy[1]];
        let angle1=angle;
        let angle2=angle+angleStep;
        let vec1=[Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        let vec2=[Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
        let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
        drawTriangle([xy[0],xy[1],pt1[0],pt1[1],pt2[0],pt2[1]]);
    }
  }
}
