import * as THREE from './three/build/three.module.js';

class CameraModel {
    constructor(transformPath) {

        this.camGroup = new THREE.Group();

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });


    }

    update_class(transformPath){
        
        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });
    }


    init() {
        let transBackCam = this.hcam["translation"]
        let quatBackCam = this.hcam["quat"]
        
        var boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        let boxMat = new THREE.MeshNormalMaterial();
        this.camModel = new THREE.Mesh(boxGeo, boxMat);
        this.camGroup.add(this.camModel);

        var coneGeo = new THREE.ConeGeometry(0.1, 0.17, 50);
        var coneMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.camFov = new THREE.Mesh(coneGeo, coneMat);
        this.camFov.position.z = 0.1;
        this.camFov.rotation.x = -Math.PI/2;
        this.camGroup.add(this.camFov);

        // var coneGeo = new THREE.ConeGeometry(1, 10, 50);
        // var coneMat = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, transparent: true, opacity: 0.4 });
        // this.camFov = new THREE.Mesh(coneGeo, coneMat);
        // this.camFov.position.y = -5;
        // this.camFov.visible = false;
        // this.camGroup.add(this.camFov);

        var dir = new THREE.Vector3(0, 0, 1);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 8.5;
        var hex = 0xffffff;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        this.camGroup.add(this.arrowHelper );

        this.camGroup.position.set(transBackCam.x, transBackCam.y, transBackCam.z);
        
        // TODO:
        let quat = new THREE.Quaternion(quatBackCam.x, quatBackCam.y, quatBackCam.z, quatBackCam.w)
        let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        // this.camGroup.setRotationFromQuaternion(quat);
        this.camGroup.rotation.x = euler.x;
        this.camGroup.rotation.y = euler.y;
        this.camGroup.rotation.z = euler.z;
         
    }

    update() {

    }
}

class CameraModel1 {
    constructor(transformPath) {

        this.camGroup = new THREE.Group();

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });


    }

    update_class(transformPath){
        
        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });
    }


    init() {
        let transBackCam = this.hcam["translation"]
        let quatBackCam = this.hcam["quat"]
        
        var boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        let boxMat = new THREE.MeshNormalMaterial();
        this.camModel = new THREE.Mesh(boxGeo, boxMat);
        this.camGroup.add(this.camModel);

        var coneGeo = new THREE.ConeGeometry(0.1, 0.17, 50);
        var coneMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.camFov = new THREE.Mesh(coneGeo, coneMat);
        this.camFov.position.z = 0.1;
        this.camFov.rotation.x = -Math.PI/2;
        this.camGroup.add(this.camFov);

        // var coneGeo = new THREE.ConeGeometry(1, 10, 50);
        // var coneMat = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, transparent: true, opacity: 0.4 });
        // this.camFov = new THREE.Mesh(coneGeo, coneMat);
        // this.camFov.position.y = -5;
        // this.camFov.visible = false;
        // this.camGroup.add(this.camFov);

        var dir = new THREE.Vector3(0, 0, 1);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 8.5;
        var hex = 0xffffff;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        this.arrowHelper.visible = false
        this.camGroup.add(this.arrowHelper );

        this.camGroup.position.set(transBackCam.x, transBackCam.y, transBackCam.z-1.8);
        
        // TODO:
        let quat = new THREE.Quaternion(quatBackCam.x, quatBackCam.y, quatBackCam.z, quatBackCam.w)
        let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        // this.camGroup.setRotationFromQuaternion(quat);
        this.camGroup.rotation.x = euler.x;
        this.camGroup.rotation.y = euler.y;
        this.camGroup.rotation.z = euler.z;
        
    }

    update() {

    }
}

class CameraModel2 {
    constructor(transformPath) {

        this.camGroup = new THREE.Group();

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });


    }

    update_class(transformPath){
        
        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hcam = data;
                this.init()
            }
        });
    }

    init() {
        let transBackCam = this.hcam["translation"]
        let quatBackCam = this.hcam["quat"]
        
        var boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        let boxMat = new THREE.MeshNormalMaterial();
        this.camModel = new THREE.Mesh(boxGeo, boxMat);
        this.camGroup.add(this.camModel);

        var coneGeo = new THREE.ConeGeometry(0.1, 0.17, 50);
        var coneMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.camFov = new THREE.Mesh(coneGeo, coneMat);
        this.camFov.position.z = 0.1;
        this.camFov.rotation.x = -Math.PI/2;
        this.camGroup.add(this.camFov);

        // var coneGeo = new THREE.ConeGeometry(1, 10, 50);
        // var coneMat = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, transparent: true, opacity: 0.4 });
        // this.camFov = new THREE.Mesh(coneGeo, coneMat);
        // this.camFov.position.y = -5;
        // this.camFov.visible = false;
        // this.camGroup.add(this.camFov);

        var dir = new THREE.Vector3(0, 0, 1);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 8.5;
        var hex = 0xffffff;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        this.arrowHelper.visible = false
        this.camGroup.add(this.arrowHelper );

        this.camGroup.position.set(transBackCam.x, transBackCam.y, transBackCam.z-1.3);
        
        // TODO:
        let quat = new THREE.Quaternion(quatBackCam.x, quatBackCam.y, quatBackCam.z, quatBackCam.w)
        let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        // this.camGroup.setRotationFromQuaternion(quat);
        
        this.camGroup.rotation.x = euler.x;
        this.camGroup.rotation.y = euler.y;
        this.camGroup.rotation.z = euler.z;
        
    }

    update() {

    }
}


class Wall {
    constructor(transformPath, color) {

        var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        var geometry = new THREE.PlaneGeometry(20, 3);
        this.wall = new THREE.Mesh(geometry, material);
        
        var sphereGeometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.visible = false;

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                this.init()
            }
        });


    }

    update_class(transformPath){
        
        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                this.init()
            }
        });
    }


    init() {
        let transWall = this.hwall["translation"]
        let quatWall = this.hwall["quat"]
        
        this.wall.position.set(transWall.x, transWall.y, transWall.z);
        this.sphere.position.set(transWall.x, transWall.y, transWall.z);
        
        let quat = new THREE.Quaternion(quatWall.x, quatWall.y, quatWall.z, quatWall.w)
        let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("Wall x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        this.wall.rotation.x = euler.x;
        this.wall.rotation.y = euler.y;
        this.wall.rotation.z = euler.z;

    }

    update() {

    }
}

class WallBack {
    constructor(transformPath, color) {

        var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        var geometry = new THREE.PlaneGeometry(20, 3.2);
        this.wall = new THREE.Mesh(geometry, material);
        
        var sphereGeometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.visible = false

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                this.init()
            }
        });


    }

    update_class(transformPath){
        
        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                this.init()
            }
        });
    }


    init() {
        let transWall = this.hwall["translation"]
        let quatWall = this.hwall["quat"]
        
        this.wall.position.set(transWall.x, transWall.y, transWall.z);
        this.sphere.position.set(transWall.x, transWall.y, transWall.z);
        
        let quat = new THREE.Quaternion(quatWall.x, quatWall.y, quatWall.z, quatWall.w)
        let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("Wall Back x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        
        this.wall.rotation.x = euler.x;
        this.wall.rotation.y = euler.y;
        this.wall.rotation.z = euler.z;

    }

    update() {

    }
}

class WallNew {
    constructor(transformPath, color, type, w, h) {
        this.type = type
        var material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        var geometry = new THREE.PlaneGeometry(w, h);
        this.wall = new THREE.Mesh(geometry, material);
        
        var sphereGeometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.visible = false

        this.wall.position.set(10, 10, 0);
        this.sphere.position.set(10, 10, 0);

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                try {
                    this.init()
                    this.wall.visible = true;
                    this.sphere.visible = true;
                }
                catch(err) {
                    console.log(err)
                    this.wall.visible = false;
                    this.sphere.visible = false;
                } 
            }
        });


    }

    update_class(transformPath){

        $.ajax({
            url: transformPath,
            format: "json",
            context: this,
            success: function (data) {
                this.hwall = data;
                try {
                    this.init()
                    this.wall.visible = true;
                    this.sphere.visible = true;
                }
                catch(err) {
                    this.wall.visible = false;
                    this.sphere.visible = false;
                }             
                
            }
        });
    }

    init() {
        var data;

        // console.log(this.hwall)

        if (this.type == "front"){
            for (var i = 0; i < this.hwall.length; i ++){
                // console.log(this.hwall[i])
                if (this.hwall[i]['id'] == 6){
                    data = this.hwall[i]
                }
            }
            if (data == undefined){
                throw "Front wall not found";
            }
            this.wall.rotation.x = -Math.PI/2;

        }

        else if (this.type == "back"){
            for (var i = 0; i < this.hwall.length; i ++){
                // console.log(this.hwall[i])
                if (this.hwall[i]['id'] == 7){
                    data = this.hwall[i]
                }
            }
            if (data == undefined){
                throw "Back wall not found";
            }
            this.wall.rotation.x = -Math.PI/2;
        }
        else if (this.type == "left"){
            for (var i = 0; i < this.hwall.length; i ++){
                // console.log(this.hwall[i])
                if (this.hwall[i]['id'] == 8){
                    data = this.hwall[i]
                }
            }

            if (data == undefined){
                this.wall.position.set(10, 10, 0);
                this.sphere.position.set(10, 10, 0);        
                throw "Left wall not found";
            }

            this.wall.rotation.x = -Math.PI/2;
            this.wall.rotation.y = -Math.PI/2;
        }
        else if (this.type == "right"){
            for (var i = 0; i < this.hwall.length; i ++){
                // console.log(this.hwall[i])
                if (this.hwall[i]['id'] == 9){
                    data = this.hwall[i]
                }
            }
            if (data == undefined){
                this.wall.position.set(10, 10, 0);
                this.sphere.position.set(10, 10, 0);        
                throw "Right wall not found";
            }
            this.wall.rotation.x = -Math.PI/2;
            this.wall.rotation.y = -Math.PI/2;
        }

        var transWall = data["translation"]
        // let quatWall = this.hwall["quat"]
        
        this.wall.position.set(transWall.x, transWall.y, transWall.z);
        this.sphere.position.set(transWall.x, transWall.y, transWall.z);
        
        // let quat = new THREE.Quaternion(quatWall.x, quatWall.y, quatWall.z, quatWall.w)
        // let euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
        // console.log("Wall Back x: " + euler.x * 180 / Math.PI)
        // console.log("y: " + euler.y * 180 / Math.PI)
        // console.log("z: " + euler.z * 180 / Math.PI)
        
        // this.wall.rotation.x = euler.x;
        // this.wall.rotation.y = euler.y;
        // this.wall.rotation.z = euler.z;
        this.once = true;
        this.count = 0;
    }   

    update() {

        if (this.once && this.count > 40){
            
            var wallPos = new THREE.Vector3();
            this.sphere.getWorldPosition(wallPos);

            this.wall.position.x = wallPos.x
            this.wall.position.y = wallPos.y
            this.wall.position.z = wallPos.z
            
            if (this.type == "front"){
                this.wall.position.y = wallPos.y - 0.2
            }
            this.once = false

        }
        else{
            this.count ++;
        }

    }
}

export { CameraModel, CameraModel1, CameraModel2, Wall, WallBack, WallNew };