// Rabbit.js - triangle art data and renderer
const RABBIT_TRIANGLES = [
  // Background
  { color: [0, 0, 1, 1.0], vertices: [-1, -1, 1, 1, 1, -1] },
  { color: [0, 0, 1, 1.0], vertices: [-1, -1, -1, 1, 1, 1] },
  { color: [0, 1, 0, 1.0], vertices: [-1, -1, 1, -.9, 1, -1] },
  { color: [0, 1, 0, 1.0], vertices: [-1, -1, -1, -.9, 1, -.9] },

  // Body (light gray)

  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.33, -.5, -0.33, -.16, 0, -.33] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, 0, -.16, .5, -.66] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, 0, -.16, .5, -.66] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, .5, -.66, .5, -.83] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, .5, -.66, .5, -1] },

  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.33, -1, -0.33, -.5, 0, -.33] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.33, -.5, -0.33, -.16, 0, -.33] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, 0, -.16, .5, -.66] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, 0, -.16, .5, -.66] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, .5, -.66, .5, -.83] },
  { color: [0.82, 0.82, 0.82, 1.0], vertices: [-0.16, -.66, .5, -.66, .5, -1] },

  // Head (slightly darker)
  { color: [0.78, 0.78, 0.78, 1.0], vertices: [0.0, -0.33, -.5, -0.16, -.5, 0.16] },
  { color: [0.78, 0.78, 0.78, 1.0], vertices: [0.0, -0.33, -.5, 0.16, -.16, 0.33] },
  { color: [0.78, 0.78, 0.78, 1.0], vertices: [0.0, -0.33, -.16, 0.33, 0.05, 0] },
  { color: [0, 0, 0, 1], vertices: [-.36, .1, -.3, 0.2, -.25, .1] },

  // ear 
  { color: [0.8, 0.8, 0.8, 1.0], vertices: [-0.2, 0, 0, 0.7, .14, 0.4] },
  { color: [0.8, 0.8, 0.8, 1.0], vertices: [-0.2, 0, .16, 0.7, .3, 0.45] },
  { color: [1.0, 0.75, 0.75, 1.0], vertices: [-0.15, .05, 0, 0.6, .1, 0.4] },

  // Tail (white)
  { color: [0.95, 0.95, 0.95, 1.0], vertices: [0.5, -0.83, 0.5, -0.66, 0.57, -.75] },

  // Feet (darker gray)
  { color: [0.7, 0.7, 0.7, 1.0], vertices: [-0.5, -1, -0.33, -1, -0.33, -0.83] },
  { color: [0.7, 0.7, 0.7, 1.0], vertices: [.16, -1, .5, -1, .33, -.83] },

  // Initials 
  { color: [0, 0, 0, 1.0], vertices: [0.5, .83, .5, .79, .33, .83] },
  { color: [0, 0, 0, 1.0], vertices: [.45, .83, .45, .66, .38, .66] },
  { color: [0, 0, 0, 1.0], vertices: [.45, .66, .33, .66, .33, .75] },
  
  { color: [0, 0, 0, 1.0], vertices: [.83, .83, .66, .83, .66, .75] },
  { color: [0, 0, 0, 1.0], vertices: [.66, .83, .66, .75, .83, .70] },
  { color: [0, 0, 0, 1.0], vertices: [.83, .70, .83, .66, .66, .66] },




];

class Rabbit {
  constructor() {
    this.type = 'rabbit';
  }

  render() {
    for (let i = 0; i < RABBIT_TRIANGLES.length; i++) {
      const tri = RABBIT_TRIANGLES[i];
      gl.uniform4f(u_FragColor, tri.color[0], tri.color[1], tri.color[2], tri.color[3]);
      drawTriangle(tri.vertices);
    }
  }
}
