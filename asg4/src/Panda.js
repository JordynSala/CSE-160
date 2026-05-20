function drawAllShapes(){
   var black = [0.0, 0.0, 0.0, 1];
   var white = [1, 1, 1, 1.0];
   const pandaX = (typeof g_pandaX !== 'undefined') ? g_pandaX : 0;
   const pandaY = (typeof g_pandaY !== 'undefined') ? g_pandaY : 0;
   const pandaZ = (typeof g_pandaZ !== 'undefined') ? g_pandaZ : 0;
   const pandaRoot = new Matrix4();
   pandaRoot.translate(pandaX, pandaY, pandaZ);
   pandaRoot.rotate(180, 0, 1, 0);
   const useNormalDebug = (typeof g_normalOn !== 'undefined') ? g_normalOn : false;

   const headAnimation = (typeof g_headJointAngle !== 'undefined') ? g_headJointAngle : 0;
   const headShakeAngle = (typeof g_headShakeAngle !== 'undefined') ? g_headShakeAngle : 0;
   const frontLeftLegAngle = (typeof g_frontLeftLegAngle !== 'undefined') ? g_frontLeftLegAngle : 0;
   const frontRightLegAngle = (typeof g_frontRightLegAngle !== 'undefined') ? g_frontRightLegAngle : 0;
   const backLeftLegAngle = (typeof g_backLeftLegAngle !== 'undefined') ? g_backLeftLegAngle : 0;
   const backRightLegAngle = (typeof g_backRightLegAngle !== 'undefined') ? g_backRightLegAngle : 0;
   function renderCubeWithNormals(cube) {
      if (useNormalDebug) cube.textureNum = -3;
      cube.normalMatrix.setInverseOf(cube.matrix);
      cube.normalMatrix.transpose();
      cube.render();
   }

   // body -------------------------
   var body = new Cube();
   body.color = white;
   body.matrix = new Matrix4(pandaRoot);
   body.matrix.scale(.3, 0.3, 0.5);
   body.matrix.translate(-.5, 0, -0.25);
   renderCubeWithNormals(body);
   var body1 = new Cube();
   body1.color = black;
   body1.matrix = new Matrix4(pandaRoot);
   body1.matrix.scale(.31, 0.32, 0.15);
   body1.matrix.translate(-.5, -.01, -0.84);
   renderCubeWithNormals(body1);
   var body2 = new Cube();
   body2.color = black;
   body2.matrix = new Matrix4(pandaRoot);
   body2.matrix.scale(.31, 0.13, 0.13);
   body2.matrix.translate(-.51, -0.01, 1.89);
   renderCubeWithNormals(body2);

   // head ----------

   var head = new Cube();
   head.color = white;
   head.matrix = new Matrix4(pandaRoot);
   // head.matrix.rotate(-10, 1, 0, 0);
   head.matrix.rotate(-headAnimation, 0, 1, 0);
   head.matrix.rotate(headShakeAngle, 0, 0, 1);
   head.matrix.scale(0.35, 0.35, 0.35);
   head.matrix.translate(-.5, 0.25, -1.25);
   renderCubeWithNormals(head);

   var face = new Cube();
   face.color = white;
   face.matrix = new Matrix4(pandaRoot);
   face.matrix.rotate(-headAnimation, 0, 1, 0);
   face.matrix.rotate(headShakeAngle, 0, 0, 1);
   face.matrix.scale(0.30, 0.30, 0.03);
   face.matrix.translate(-.5, 0.35, -15.5);
   renderCubeWithNormals(face);
   
   var leftEar = new Cylinder();
   leftEar.color = black;
   leftEar.textureNum = useNormalDebug ? -3 : -2;
   leftEar.matrix = new Matrix4(head.matrix);
   leftEar.matrix.translate(-0.1, 0.9, 0.15);
   leftEar.matrix.scale(0.22, 0.25, 0.22);
   leftEar.render();

   var rightEar = new Cylinder();
   rightEar.color = black;
   rightEar.textureNum = useNormalDebug ? -3 : -2;
   rightEar.matrix = new Matrix4(head.matrix);
   rightEar.matrix.translate(0.87, 0.9, 0.15);
   rightEar.matrix.scale(0.22, 0.25, 0.22);
   rightEar.render();

   var lefteye = new Cube();
   lefteye.color = [1,1,1,1];
   lefteye.matrix = new Matrix4(pandaRoot);
   lefteye.matrix.rotate(-headAnimation, 0, 1, 0);
   lefteye.matrix.rotate(headShakeAngle, 0, 0, 1);
   lefteye.matrix.scale(0.036, 0.031, 0.04);
   lefteye.matrix.translate(-3, 8, -12.06);
   renderCubeWithNormals(lefteye);

   var lefteyeblack = new Cube();
   lefteyeblack.color = [0,0,0,1];
   lefteyeblack.matrix = new Matrix4(pandaRoot);
   lefteyeblack.matrix.rotate(-headAnimation, 0,1, 0);
   lefteyeblack.matrix.rotate(headShakeAngle, 0, 0, 1);
   lefteyeblack.matrix.scale(0.1, 0.1, 0.04);
   lefteyeblack.matrix.translate(-1.49, 2.2, -12.05);
   renderCubeWithNormals(lefteyeblack);
   
   var righteye = new Cube();
   righteye.color = [1,1,1,1];
   righteye.matrix = new Matrix4(pandaRoot);
   righteye.matrix.rotate(-headAnimation, 0, 1, 0);
   righteye.matrix.rotate(headShakeAngle, 0, 0, 1);
   righteye.matrix.scale(0.036, 0.031, 0.04);
   righteye.matrix.translate(2.4, 8, -12.06);
   renderCubeWithNormals(righteye);
   

   var righteyeblack = new Cube();
   righteyeblack.color = [0,0,0,1];
   righteyeblack.matrix = new Matrix4(pandaRoot);
   righteyeblack.matrix.rotate(-headAnimation,0, 1, 0);
   righteyeblack.matrix.rotate(headShakeAngle, 0, 0, 1);
   righteyeblack.matrix.scale(0.1, 0.1, 0.04);
   righteyeblack.matrix.translate(0.49, 2.2, -12.05);
   renderCubeWithNormals(righteyeblack);
   
   var snout = new Cube();
   snout.color = [1,1,1,1];
   snout.matrix = new Matrix4(pandaRoot);
   snout.matrix.rotate(-headAnimation, 0, 1, 0);
   snout.matrix.rotate(headShakeAngle, 0, 0, 1);
   snout.matrix.scale(0.15, 0.1, .15);
   snout.matrix.translate(-0.47, .9, -3.8);
   renderCubeWithNormals(snout);

   var nose = new Cube();
   nose.color = [0,0,0,1];
   nose.matrix = new Matrix4(pandaRoot);
   nose.matrix.rotate(-headAnimation, 0, 1, 0);
   nose.matrix.rotate(headShakeAngle, 0, 0, 1);
   nose.matrix.scale(0.1, 0.05, .15);
   nose.matrix.translate(-0.47, 2.6, -3.9);
   renderCubeWithNormals(nose);

   var mouth1 = new Cube();
   mouth1.color = [0,0,0,1];
   mouth1.matrix = new Matrix4(pandaRoot);
   mouth1.matrix.rotate(-headAnimation, 0, 1, 0);
   mouth1.matrix.rotate(headShakeAngle, 0, 0, 1);
   mouth1.matrix.scale(0.01, 0.05, .15);
   mouth1.matrix.translate(-0.47, 2, -3.9);
   renderCubeWithNormals(mouth1);
   var mouth2 = new Cube();
   mouth2.color = [0,0,0,1];
   mouth2.matrix = new Matrix4(pandaRoot);
   mouth2.matrix.rotate(-headAnimation, 0, 1, 0);
   mouth2.matrix.rotate(headShakeAngle, 0, 0, 1);
   mouth2.matrix.scale(0.14, 0.01, .15);
   mouth2.matrix.translate(-0.47, 9.5, -3.9);
   renderCubeWithNormals(mouth2);

   // legs (hip pivots) --------------------------
   function renderLeg(hipX, hipY, hipZ, upperAngle, lowerAngle) {
      var upper = new Cube();
      upper.color = black;
      upper.matrix = new Matrix4(pandaRoot);
      upper.matrix.translate(hipX, hipY, hipZ);
      upper.matrix.rotate(upperAngle, 1, 0, 0);
      var kneeCoord = new Matrix4(upper.matrix);
      upper.matrix.scale(0.10, -0.10, 0.10);
      upper.matrix.translate(-0.5, 0, -0.5);
      renderCubeWithNormals(upper);

      var lower = new Cube();
      lower.color = black;
      lower.matrix = kneeCoord;
      lower.matrix.translate(0, -0.10, 0);
      lower.matrix.rotate(lowerAngle, 1, 0, 0);
      lower.matrix.scale(0.08, -0.08, 0.08);
      lower.matrix.translate(-0.5, 0, -0.5);
      renderCubeWithNormals(lower);
   }

   var leftHipX = -0.099;
   var rightHipX = 0.099;
   var hipY = 0.03;
   var frontHipZ = -0.075;
   var rearHipZ = 0.259;

   // One slider per leg, both upper and lower joints for that leg
   renderLeg(leftHipX, hipY, frontHipZ, frontLeftLegAngle, frontLeftLegAngle);
   renderLeg(rightHipX, hipY, frontHipZ, frontRightLegAngle, frontRightLegAngle);
   renderLeg(leftHipX, hipY, rearHipZ, backLeftLegAngle, backLeftLegAngle);
   renderLeg(rightHipX, hipY, rearHipZ, backRightLegAngle, backRightLegAngle);
}
