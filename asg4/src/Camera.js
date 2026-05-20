class Camera {
    constructor() {
        this.eye = new Vector3([0, .3, 2]);
        this.at = new Vector3([0, .3, -100]);
        this.up = new Vector3([0, 1, 0]);
    }
    foward(){
        const f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize().mul(0.05);
        this.eye.add(f);
        this.at.add(f);
    }
    back(){
        const f = new Vector3(this.eye.elements);
        f.sub(this.at).normalize().mul(0.05);        
        this.eye.add(f);
        this.at.add(f);
    }

    left(){
        const f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize();
        const s = Vector3.cross(this.up, f).normalize().mul(0.05);
        this.eye.add(s);
        this.at.add(s);
    }
    right(){
        const f = new Vector3(this.at.elements);
        f.sub(this.eye).normalize();
        const s = Vector3.cross(f, this.up).normalize().mul(0.05);
        this.eye.add(s);
        this.at.add(s);
    }

    panLeft(){
        this.pan(5);
    }

    panRight(){
        this.pan(-5);
    }

    pan(angle){
        const f = new Vector3(this.at.elements);
        f.sub(this.eye);
        const rot = new Matrix4();
        rot.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        const fPrime = rot.multiplyVector3(f);
        this.at = new Vector3(this.eye.elements);
        this.at.add(fPrime);
    }

    tilt(angle){
        const f = new Vector3(this.at.elements);
        f.sub(this.eye);
        const right = Vector3.cross(f, this.up).normalize();
        const rot = new Matrix4();
        rot.setRotate(angle, right.elements[0], right.elements[1], right.elements[2]);
        const fPrime = rot.multiplyVector3(f);
        this.at = new Vector3(this.eye.elements);
        this.at.add(fPrime);
    }
}
