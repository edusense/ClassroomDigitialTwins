import * as THREE from './three/build/three.module.js';

// joints_name = ('Pelvis', 'R_Hip', 'R_Knee', 'R_Ankle', 'L_Hip', 'L_Knee', 'L_Ankle',
//  'Torso', 'Neck', 'Nose', 'Head', 'L_Shoulder', 'L_Elbow', 'L_Wrist', 'R_Shoulder', 'R_Elbow', 'R_Wrist', 'Thorax')

class Person {
    constructor(dummyModel) {
        this.model = dummyModel.clone();
        
        this.joints = [];
        this.skLines = [];

        var dir = new THREE.Vector3(0, 0, 0);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 0.5;
        var hex = 0xffff00;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        var colorIndex = 9 //Math.floor(Math.random() * 9);

        var jointColors = [
            0x1C4670,
            0x59981A,
            0x7E1E80,
            0xDB9124,
            0xc9a802,
            0xb07200,
            0xF01A30,
            0x3570DB,
            0x444444,
            0xbbbbbb,
        ]
        
        var skLineColor = [
            0x278AB0, 
            0x81B622,
            0xB637FB,
            0xFABD8C,
            0xD6D378,
            0xf08e26,
            0xDB6E6E,
            0x4DC4F0,
            0x747474,
            0x030303,
        ]
        
        this.totalJoints = 18;
        this.jointVisibilityList = [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
        // this.jointVisibilityList = [0, 1 , 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
        
        this.skeleton = [[17, 7], [0, 7], [17, 8], [8, 9], [9, 10], [8, 11], [11, 12], [12, 13], [8, 14], [14, 15], [15, 16], [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6] ]
        
        this.skeletonVisible = []

        for (var i = 0; i < this.skeleton.length; i++){
            if(this.jointVisibilityList.includes(this.skeleton[i][0]) && this.jointVisibilityList.includes(this.skeleton[i][1])) {
                this.skeletonVisible.push(this.skeleton[i])
            }
        }
        
        var jointGeometry = new THREE.SphereGeometry(0.03, 32, 32);
        for (var i = 0; i < this.totalJoints; i++) {
            var jointeMaterial = new THREE.MeshBasicMaterial({ color: jointColors[colorIndex] });
            var joint = new THREE.Mesh(jointGeometry, jointeMaterial);
            joint.visible = false;
            joint.castShadow = true;
            joint.position.set(0, 0, 0);

            // scene.add(joint);
            this.joints.push(joint);

        }

        for (var i = 0; i < this.skeletonVisible.length; i++){
            var line = this.addLine(new THREE.Vector3(0,0,0),new THREE.Vector3(1,1,1), skLineColor[colorIndex]);
            line.visible = false;
            this.skLines.push(line)
        }
    }

    addLine(p1,p2, color){       
        var mat = new THREE.LineBasicMaterial({color: color, linewidth: 4})
        var geo = new THREE.Geometry()
        geo.vertices.push( p1 )
        geo.vertices.push( p2 )
        return new THREE.Line(geo, mat)
    }
    
    update(rvec, tvec, params, scale) {
        
        var scale_unit = 1000
        
        var scale_x = scale.x
        var scale_y = scale.y
        var scale_z = scale.z

        if (scale.px == "r"){
            this.model.rotation.x = (scale.mr * rvec.r);
        }
        else if(scale.px == "p"){
            this.model.rotation.x = (scale.mp * rvec.p);
        }
        else if(scale.px == "y"){
            this.model.rotation.x = (scale.my * rvec.y);
        }

        if (scale.py == "r"){
            this.model.rotation.y = (scale.mr * rvec.r);
        }
        else if(scale.py == "p"){
            this.model.rotation.y = (scale.mp * rvec.p);
        }
        else if(scale.py == "y"){
            this.model.rotation.y = (scale.my * rvec.y);
        }

        if (scale.pz == "r"){
            this.model.rotation.z = (scale.mr * rvec.r);
        }
        else if(scale.pz == "p"){
            this.model.rotation.z = (scale.mp * rvec.p);
        }
        else if(scale.pz == "y"){
            this.model.rotation.z = (scale.my * rvec.y);
        }


        // this.model.rotation.y = (scale.mp * rvec.p * Math.PI) / 180;
        // this.model.rotation.z = (scale.my * rvec.y * Math.PI) / 180;

        this.model.rotation.x *= (Math.PI) / 180;
        this.model.rotation.y *= (Math.PI) / 180;
        this.model.rotation.z *= (Math.PI) / 180;


        // console.log(this.model.rotation)
        this.model.position.set((tvec.x * scale_x)/(scale_unit), 
                                (tvec.y * scale_y)/(scale_unit), 
                                (tvec.z * scale_z)/(scale_unit));

        // for Full body:
        // instructor.model.rotation.x += Math.PI / 2;
        // instructor.model.rotation.y += Math.PI / 2;
        // instructor.model.position.z = -1.7;

        // for Full Just Head:
        this.model.rotation.x += Math.PI;
        
        // console.log("Frame: " + currFrameId + " Pose: ")
        // console.log(instructor.model.position)

        var dir = this.model.getWorldDirection(new THREE.Vector3());
        var pos = this.model.getWorldPosition(new THREE.Vector3());
        dir.normalize();
        this.arrowHelper.setDirection(dir);
        this.arrowHelper.position.x = pos.x;
        this.arrowHelper.position.y = pos.y;
        this.arrowHelper.position.z = pos.z;

        this.model.position.y -= 0.1;

    }
    
    update_full_body(keypoints_3d, rvec){
        
        var scale_unit = 1000
        
        // HardCode:
        var scale_rootnet = 1

        var scale_total = scale_rootnet * scale_unit
        this.model.rotation.x = (rvec.p * Math.PI) / 180;
        this.model.rotation.y = (rvec.r * Math.PI) / 180;
        this.model.rotation.z = (rvec.y * Math.PI) / 180;

        // this.model.rotation.x = (0 * Math.PI) / 180;
        // this.model.rotation.y = (0 * Math.PI) / 180;
        // this.model.rotation.z = (0 * Math.PI) / 180;

        // this.model.position.set(-keypoints_3d[8][0]-keypoints_3d[10][0]/2000, 
        //     -keypoints_3d[8][2]-keypoints_3d[10][2]/2000, 
        //     -keypoints_3d[8][1]-keypoints_3d[10][1]/2000);

        this.model.position.set(keypoints_3d[9][0]/scale_unit, 
                                keypoints_3d[9][1]/scale_unit, 
                                keypoints_3d[9][2]/scale_total);
        this.model.rotation.z += Math.PI;
        this.model.rotation.y += Math.PI;


        var dir = this.model.getWorldDirection(new THREE.Vector3());
        var pos = this.model.getWorldPosition(new THREE.Vector3());
        dir.normalize();
        this.arrowHelper.setDirection(dir);
        this.arrowHelper.position.x = pos.x;
        this.arrowHelper.position.y = pos.y;
        this.arrowHelper.position.z = pos.z;

        let full_body = true;
        if (full_body){
          
            for (let i = 0; i < this.totalJoints; i++) {
                
                if (!this.jointVisibilityList.includes(i)){ continue }

                this.joints[i].position.set(keypoints_3d[i][0]/scale_unit, 
                                            keypoints_3d[i][1]/scale_unit, 
                                            keypoints_3d[i][2]/scale_total);

                this.joints[i].rotation.x += Math.PI / 2;
                this.joints[i].rotation.y += Math.PI;        
            }
            
            for (let j = 0; j < this.skLines.length; j++){
                // Start 
                this.skLines[j].geometry.vertices[0].x = keypoints_3d[this.skeletonVisible[j][0]][0]/scale_unit;
                this.skLines[j].geometry.vertices[0].y = keypoints_3d[this.skeletonVisible[j][0]][1]/scale_unit;
                this.skLines[j].geometry.vertices[0].z = keypoints_3d[this.skeletonVisible[j][0]][2]/scale_total;

                // End 
                this.skLines[j].geometry.vertices[1].x = keypoints_3d[this.skeletonVisible[j][1]][0]/scale_unit;
                this.skLines[j].geometry.vertices[1].y = keypoints_3d[this.skeletonVisible[j][1]][1]/scale_unit;
                this.skLines[j].geometry.vertices[1].z = keypoints_3d[this.skeletonVisible[j][1]][2]/scale_total;
                
            }
            
        }

    }
            
    
    setVisible(isVisible) {
        this.model.visible = isVisible;
        this.arrowHelper.visible = isVisible;
        for (let j = 0; j < this.skLines.length; j++){
            this.skLines[j].visible = false;
            this.skLines[j].geometry.verticesNeedUpdate = isVisible
        }

        for (let i = 0; i < this.totalJoints; i++) {
            this.joints[i].visible = false;
        }

    }

}


class Person1 {
    constructor(dummyModel) {
        this.model = dummyModel.clone();
        
        this.joints = [];
        this.skLines = [];

        var dir = new THREE.Vector3(0, 0, 0);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 0.5;
        var hex = 0xffff00;

        this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        var colorIndex = 9 //Math.floor(Math.random() * 9);

        var jointColors = [
            0x1C4670,
            0x59981A,
            0x7E1E80,
            0xDB9124,
            0xc9a802,
            0xb07200,
            0xF01A30,
            0x3570DB,
            0x444444,
            0xbbbbbb,
        ]
        
        var skLineColor = [
            0x278AB0, 
            0x81B622,
            0xB637FB,
            0xFABD8C,
            0xD6D378,
            0xf08e26,
            0xDB6E6E,
            0x4DC4F0,
            0x747474,
            0x030303,
        ]
        
        this.totalJoints = 18;
        // this.jointVisibilityList = [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
        this.jointVisibilityList = [0, 1, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 5, 6]
        
        this.skeleton = [[17, 7], [0, 7], [17, 8], [8, 9], [9, 10], [8, 11], [11, 12], [12, 13], [8, 14], [14, 15], [15, 16], [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6] ]
        
        this.skeletonVisible = []

        for (var i = 0; i < this.skeleton.length; i++){
            if(this.jointVisibilityList.includes(this.skeleton[i][0]) && this.jointVisibilityList.includes(this.skeleton[i][1])) {
                this.skeletonVisible.push(this.skeleton[i])
            }
        }
        
        var jointGeometry = new THREE.SphereGeometry(0.03, 32, 32);
        for (var i = 0; i < this.totalJoints; i++) {
            var jointeMaterial = new THREE.MeshBasicMaterial({ color: jointColors[colorIndex] });
            var joint = new THREE.Mesh(jointGeometry, jointeMaterial);
            joint.visible = false;
            joint.castShadow = true;
            joint.position.set(0, 0, 0);

            // scene.add(joint);
            this.joints.push(joint);

        }

        for (var i = 0; i < this.skeletonVisible.length; i++){
            var line = this.addLine(new THREE.Vector3(0,0,0),new THREE.Vector3(1,1,1), skLineColor[colorIndex]);
            line.visible = false;
            this.skLines.push(line)
        }
    }

    addLine(p1,p2, color){       
        var mat = new THREE.LineBasicMaterial({color: color, linewidth: 4})
        var geo = new THREE.Geometry()
        geo.vertices.push( p1 )
        geo.vertices.push( p2 )
        return new THREE.Line(geo, mat)
    }

    update(rvec, tvec, params, scale) {
        
        var scale_unit = 1000
        
        var scale_x = scale.x
        var scale_y = scale.y
        var scale_z = scale.z
        
        if (scale.px == "r"){
            this.model.rotation.x = (scale.mr * rvec.r);
        }
        else if(scale.px == "p"){
            this.model.rotation.x = (scale.mp * rvec.p);
        }
        else if(scale.px == "y"){
            this.model.rotation.x = (scale.my * rvec.y);
        }

        if (scale.py == "r"){
            this.model.rotation.y = (scale.mr * rvec.r);
        }
        else if(scale.py == "p"){
            this.model.rotation.y = (scale.mp * rvec.p);
        }
        else if(scale.py == "y"){
            this.model.rotation.y = (scale.my * rvec.y);
        }
        
        if (scale.pz == "r"){
            this.model.rotation.z = (scale.mr * rvec.r);
        }
        else if(scale.pz == "p"){
            this.model.rotation.z = (scale.mp * rvec.p);
        }
        else if(scale.pz == "y"){
            this.model.rotation.z = (scale.my * rvec.y);
        }
        
        // console.log(this.model.rotation)

        
        // this.model.rotation.y = (scale.mp * rvec.p * Math.PI) / 180;
        this.model.rotation.x += 30;
        // this.model.rotation.y += 120;

        
        this.model.rotation.x *= (Math.PI) / 180;
        this.model.rotation.y *= (Math.PI) / 180;
        this.model.rotation.z *= (Math.PI) / 180;


        // console.log(this.model.rotation)
        this.model.position.set((tvec.x * scale_x)/(scale_unit), 
                                (tvec.y * scale_y)/(scale_unit), 
                                (tvec.z * scale_z)/(scale_unit));

        // for Full body:
        // instructor.model.rotation.x += Math.PI / 2;
        // instructor.model.rotation.y += Math.PI / 2;
        // instructor.model.position.z = -1.7;

        // for Full Just Head:
        this.model.rotation.x += Math.PI;
        
        // console.log("Frame: " + currFrameId + " Pose: ")
        // console.log(instructor.model.position)

        var dir = this.model.getWorldDirection(new THREE.Vector3());
        var pos = this.model.getWorldPosition(new THREE.Vector3());
        dir.normalize();
        this.arrowHelper.setDirection(dir);
        this.arrowHelper.position.x = pos.x;
        this.arrowHelper.position.y = pos.y;
        this.arrowHelper.position.z = pos.z;

        this.model.position.z -= 0.08;
        this.model.position.y -= 0.05;

    }
    
    
    update_full_body(keypoints_3d, rvec){
        
        var scale_unit = 1000
        
        // HardCode:
        var scale_rootnet = 0.9

        var scale_total = scale_rootnet * scale_unit
        this.model.rotation.x = (rvec.p * Math.PI) / 180;
        this.model.rotation.y = (rvec.r * Math.PI) / 180;
        this.model.rotation.z = (rvec.y * Math.PI) / 180;

        // this.model.position.set(-keypoints_3d[8][0]-keypoints_3d[10][0]/2000, 
        //     -keypoints_3d[8][2]-keypoints_3d[10][2]/2000, 
        //     -keypoints_3d[8][1]-keypoints_3d[10][1]/2000);

        this.model.position.set(keypoints_3d[9][0]/scale_unit, 
                                keypoints_3d[9][1]/scale_unit, 
                                keypoints_3d[9][2]/scale_total);
        this.model.rotation.z += Math.PI;
        this.model.rotation.y += Math.PI;


        var dir = this.model.getWorldDirection(new THREE.Vector3());
        var pos = this.model.getWorldPosition(new THREE.Vector3());
        dir.normalize();
        this.arrowHelper.setDirection(dir);
        this.arrowHelper.position.x = pos.x;
        this.arrowHelper.position.y = pos.y;
        this.arrowHelper.position.z = pos.z;

        let full_body = true;
        if (full_body){
          
            for (let i = 0; i < this.totalJoints; i++) {
                
                if (!this.jointVisibilityList.includes(i)){ continue }

                this.joints[i].position.set(keypoints_3d[i][0]/scale_unit, 
                                            keypoints_3d[i][1]/scale_unit, 
                                            keypoints_3d[i][2]/scale_total);

                this.joints[i].rotation.x += Math.PI / 2;
                this.joints[i].rotation.y += Math.PI;        
            }
            
            for (let j = 0; j < this.skLines.length; j++){
                // Start 
                this.skLines[j].geometry.vertices[0].x = keypoints_3d[this.skeletonVisible[j][0]][0]/scale_unit;
                this.skLines[j].geometry.vertices[0].y = keypoints_3d[this.skeletonVisible[j][0]][1]/scale_unit;
                this.skLines[j].geometry.vertices[0].z = keypoints_3d[this.skeletonVisible[j][0]][2]/scale_total;

                // End 
                this.skLines[j].geometry.vertices[1].x = keypoints_3d[this.skeletonVisible[j][1]][0]/scale_unit;
                this.skLines[j].geometry.vertices[1].y = keypoints_3d[this.skeletonVisible[j][1]][1]/scale_unit;
                this.skLines[j].geometry.vertices[1].z = keypoints_3d[this.skeletonVisible[j][1]][2]/scale_total;
                
            }
            
        }

    }
            
    
    setVisible(isVisible) {
        this.model.visible = isVisible;
        this.arrowHelper.visible = isVisible;
        for (let j = 0; j < this.skLines.length; j++){
            this.skLines[j].visible = false;
            this.skLines[j].geometry.verticesNeedUpdate = isVisible
        }

        for (let i = 0; i < this.totalJoints; i++) {
            this.joints[i].visible = false;
        }

    }

}
export { Person, Person1 };
