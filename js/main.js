// Imports

import * as THREE from './three/build/three.module.js';

// import * as CREATE from "../node_modules/createjs/builds/1.0.0/createjs.js"
import { TWEEN} from './three/examples/jsm/libs/tween.module.min.js'

import Stats from './three/examples/jsm/libs/stats.module.js';
import { GUI } from './three/examples/jsm/libs/dat.gui.module.js';
import { FBXLoader } from './three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from './three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from './three/examples/jsm/webxr/VRButton.js';

// Import Custom Classes
import { Person, Person1 } from "./person.js"
import { CameraModel, CameraModel1,  CameraModel2, Wall, WallBack, WallNew } from './sceneObjects.js';

var url = ""
var modelPath = 'models/student_head.fbx';
var model_path_stl = 'models/lego_head.stl';
var frontCamTransformPath = url + "Hjsons/HCftoOg.json"
var backCamTransformPath =  url + "Hjsons/HCbtoOg.json"
var classScenePath = url + "Hjsons/back.json"
var backTransformPath = url + "Hjsons/back.json"
var frontTransformPath = url + "Hjsons/front.json"

// import { Math } from 'mathjs';
// import { fs } from 'file-system';

var all_frame_data_stud = [];
var all_frame_data_inst = [];
var tries = 0;
var z_shift = -1.3;

// Global Variables
var mainCam, controls, scene, renderer, stats, gui_controls;
var podium;
var whiteboard1, whiteboard2 ;
var screen1, screen2;
var heatMapPlane, heatMapInst;
var currFrameId = 1450, maxFrames = 9000;
var instructor = [], instructorData, maxInsts = 60;
var students = [], studentData, maxStudents = 60;
var backCamGroup, frontCamGroup;
var tvec_conf = 0;
var play_button, time_slider;
var prev_loc = {rvec: undefined, tvec:undefined}
var currFrameInstrIdx = 0;
var podium_plane, wb1_plane, wb2_plane, sc1_plane, sc2_plane, inst_plane;

var printOnce = true

var classData, arucoMarkers = [];
var currFrameStudentsLen;
var currFrameInstructorLen;
var count = 0
var front_wall, right_wall, left_wall, back_wall;

var params = {
    isAutoPlay: false,
    isUpdateCharacters: true,
    isFixInstructor: false,
    isClipping: false,
    isInstructor: true,
    isStudents: true,
    isNotSceneSetup:true,
    isClassSelected: false,
    isInstHeatmap: false,
    isStudHeatmap: false,
    isStudDwellTime: false,
    // isInstUpdated: false,
    // isStudUpdated: false,
};

var backClipPlane, frontClipPlane, rightClipPlane, leftClipPlane, downClipPlane, upClipPlane;

var class_params = {
    Classroom:"1", 
    Semester:"1",
    Date: "1"
}
var ground;

// Fps and speed
var now, delta, then = Date.now();
var fps = 15
var interval = 1000/fps;

// Ray-cast
var raycaster, intersection;
var ray_dir = new THREE.Vector3();
var spheres = [], inst_sphere;
var spheresIndex = 0;
var mouse = new THREE.Vector2();

var tempLine;

var iterator = get_next_scale()
var min_scale;
var min_dist = 10000;
var cameraOrtho, sceneOrtho;

var frame_student_img = document.getElementById("frame_s");
var frame_instructor_img = document.getElementById("frame_i");

var inst_user_study_map = {
    0:22, 
    1:20, 
    2:18, 
    3:15, 
    4:13, 
    5:21, 
    6:14, 
    7:17, 
    8:19, 
    9:16, 
}

var xrCamera;

var median_array = [], median_idx = 0, median_hist = 35;

function loadModel() {
    // var self = this
    return new Promise(function (resolve, reject) {
        
        var cb = function (model) {
            model.traverse(function (child) {
                
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                
            });
            
            model.scale.set(0.006, 0.006, 0.006);
            resolve(model)
            
        }
        
        var loader = new FBXLoader();
        loader.load(modelPath, cb);
    });
}

function load_model_stl(){
    return new Promise(function (resolve, reject) {
        
        var cb = function (geometry) {
            
            const material = new THREE.MeshPhongMaterial( { color: 0xFFF200, shininess: 100 } );
            const mesh = new THREE.Mesh( geometry, material );

            mesh.position.set( 0, 0, 0 );
            mesh.scale.set( 0.0025, 0.0025, 0.0025 );

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            resolve(mesh)
            
        }
        
        var loader = new STLLoader();
        console.log("Here");

        loader.load(model_path_stl, cb);
    });
}

load_model_stl().then(function (model) {
    try{
        init(model);
    }
    catch(err){
        console.log(err);
    }

    animate();
}, function () { console.log("Model Loading Failed") })

function addLine(p1,p2, color){       
    var mat = new THREE.LineBasicMaterial({color: color, linewidth: 10})
    var geo = new THREE.Geometry()
    geo.vertices.push( p1 )
    geo.vertices.push( p2 )
    return new THREE.Line(geo, mat)
}

function init(dummyModel) {

    // Camera Setup
    var aspect = window.innerWidth / window.innerHeight;
    mainCam = new THREE.PerspectiveCamera(60, aspect, 1, 100);
    mainCam.position.set( 0, 1, 0 );
    // mainCam.position.x = 6;
    // mainCam.position.y = 6;
    // mainCam.position.z = 6;
    // mainCam.lookAt(0, 0, 0);   
    mainCam.up.set(0, 0, 1);
    mainCam.lookAt(0, -10, 10);
    
    
    // sceneOrtho = new THREE.Scene(); // overlay scene
    
    // cameraOrtho = new THREE.OrthographicCamera( - window.innerWidth  / 2, window.innerWidth  / 2,  window.innerHeight / 2, -  window.innerHeight / 2, 0, 30 );
    // cameraOrtho.position.z = 10;
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    
    // renderer
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.outputEncoding = THREE.sRGBEncoding;        
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false; // to allow overlay
    renderer.localClippingEnabled = true;
    renderer.xr.enabled = true;
    // renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild(renderer.domElement);

    createControls(mainCam, renderer);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    document.body.appendChild( VRButton.createButton( renderer ) );

    // Raycaster
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1;

    // RayCast Helper
    var sphereGeometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var totalSpheres = 60;

    for (var i = 0; i < totalSpheres; i++) {

        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);
        spheres.push(sphere);
        sphere.visible = false;

    }
    
    var sphereGeometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    inst_sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(inst_sphere)
    inst_sphere.visible = params.isClipping;


    const light = new THREE.PointLight( 0xFFFFFF, 0.7, 100 );
    light.position.set( 0, 0, 10 );
    scene.add( light );

    // Plane
    var stud_frame_path = "frame_data/students/img_0.jpg";
    var texture = new THREE.TextureLoader().load( stud_frame_path );
    var geometry = new THREE.PlaneGeometry(20, 5, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, side: THREE.DoubleSide, transparent: true, opacity: 0.8, /*map: texture*/ });
    heatMapPlane = new THREE.Mesh(geometry, material);
    heatMapPlane.visible = params.isClipping;
    heatMapPlane.rotateX(-Math.PI / 2);
    heatMapPlane.position.y = -2.7;
    heatMapPlane.position.z = 2.5;
    scene.add(heatMapPlane);

    var geometry = new THREE.PlaneGeometry(20, 6, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, side: THREE.DoubleSide, transparent: true, opacity: 0.8, /*map: texture*/ });
    heatMapInst = new THREE.Mesh(geometry, material);
    heatMapInst.visible = params.isClipping && params.isInstructor;
    heatMapInst.position.y = 2;
    heatMapInst.position.z = 0.9;
    scene.add(heatMapInst);

    // var hm_inst = "hm/inst.png";
    // var texture = new THREE.TextureLoader().load( stud_frame_path );
    var geometry = new THREE.PlaneGeometry(20, 8, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3, side: THREE.DoubleSide, transparent: true, opacity: 0.8, /*map: texture*/ });
    inst_plane = new THREE.Mesh(geometry, material);
    inst_plane.visible = params.isInstHeatmap;
    inst_plane.position.y = 1;
    inst_plane.position.z = 0.9;
    scene.add(inst_plane);

    setupScene()

    // Camera and Groups 
    backCamGroup = new CameraModel1(backCamTransformPath)
    scene.add(backCamGroup.camGroup);

    frontCamGroup = new CameraModel2(frontCamTransformPath)
    scene.add(frontCamGroup.camGroup);

    var wall_height = 10
    // Add Back Wall 
    back_wall = new WallNew(frontTransformPath, 0xdbd9d9, "back", 20, wall_height);
    scene.add(back_wall.wall);
    scene.add(back_wall.sphere);
    // frontCamGroup.camGroup.add(back_wall.wall)
    frontCamGroup.camGroup.add(back_wall.sphere)

    // Add Front Wall
    front_wall = new WallNew(backTransformPath, 0xdbd9d9, "front", 20, wall_height)
    scene.add(front_wall.wall);
    scene.add(front_wall.sphere);
    // backCamGroup.camGroup.add(front_wall.wall)
    backCamGroup.camGroup.add(front_wall.sphere)
    

    // Add Left Wall
    
    left_wall = new WallNew(frontTransformPath, 0xdbd9d9, "left", 20, wall_height)
    scene.add(left_wall.wall);
    scene.add(left_wall.sphere);
    frontCamGroup.camGroup.add(left_wall.sphere) 

    // left_wall = new WallNew(backTransformPath, 0xdbd9d9, "left", 20, wall_height)
    // scene.add(left_wall.wall);
    // scene.add(left_wall.sphere);
    // backCamGroup.camGroup.add(left_wall.sphere)

    
    // Add Right Wall

    right_wall = new WallNew(backTransformPath, 0xdbd9d9, "right", 20, wall_height)
    scene.add(right_wall.wall);
    scene.add(right_wall.sphere);
    backCamGroup.camGroup.add(right_wall.sphere)        

    // right_wall = new WallNew(frontTransformPath, 0xdbd9d9, "right", 20, wall_height)
    // scene.add(right_wall.wall);
    // scene.add(right_wall.sphere);
    // frontCamGroup.camGroup.add(right_wall.sphere)
    
    //Plane Clipping 
    backClipPlane = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 10 );
    frontClipPlane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 10 );
    
    rightClipPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 10 );
    leftClipPlane = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 10 );
    
    downClipPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), Math.abs(z_shift));
    upClipPlane = new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), 4 + z_shift);
    
    left_wall.wall.material.clippingPlanes = [backClipPlane, frontClipPlane, upClipPlane, downClipPlane];
    right_wall.wall.material.clippingPlanes = [backClipPlane, frontClipPlane, upClipPlane, downClipPlane];
    
    front_wall.wall.material.clippingPlanes = [upClipPlane, downClipPlane];
    back_wall.wall.material.clippingPlanes = [upClipPlane, downClipPlane];
    
    ground.material.clippingPlanes = [frontClipPlane, backClipPlane]
    
    front_wall.wall.material.clippingPlanes.push(leftClipPlane)
    back_wall.wall.material.clippingPlanes.push(leftClipPlane)
    ground.material.clippingPlanes.push(leftClipPlane)

    front_wall.wall.material.clippingPlanes.push(rightClipPlane)
    back_wall.wall.material.clippingPlanes.push(rightClipPlane)
    ground.material.clippingPlanes.push(rightClipPlane)
   
    
    // Add instructor 
    // Add People from instructor view
    for (var i = 0; i < maxInsts; i++) {
        
        var ins = new Person1(dummyModel)
        ins.setVisible(false)
        instructor.push(ins);
        backCamGroup.camGroup.add(ins.model);
        scene.add(ins.arrowHelper);
    
        for (let j = 0; j < ins.totalJoints; j++) {
            scene.add(ins.joints[j])
            backCamGroup.camGroup.add(ins.joints[j]);
        } 
        
        for (let k = 0; k < ins.skLines.length; k++) {
            scene.add(ins.skLines[k])
            backCamGroup.camGroup.add(ins.skLines[k]);
        } 
        
    }

    
    // Add Students
    for (var i = 0; i < maxStudents; i++) {

        var stud = new Person(dummyModel)
        stud.setVisible(false)
        students.push(stud)
        frontCamGroup.camGroup.add(stud.model);
        scene.add(stud.arrowHelper);
        
        for (let j = 0; j < stud.totalJoints; j++) {
            scene.add(stud.joints[j])
            frontCamGroup.camGroup.add(stud.joints[j]);
        } 
        
        for (let k = 0; k < stud.skLines.length; k++) {
            scene.add(stud.skLines[k])
            frontCamGroup.camGroup.add(stud.skLines[k]);
        } 
        
    }

    // Read Frame Data
    readFramesJSON("407SC_104")
    updateClass(classScenePath)

    var sphereGeometry = new THREE.SphereBufferGeometry(0.1, 32, 32);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    var totalSpheres = 11;
    for (var i = 0; i < totalSpheres; i++) {

        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);
        arucoMarkers.push(sphere);
        sphere.visible = false;
        backCamGroup.camGroup.add(sphere);
    }
    
    // Control Bar and Dat GUI
    stats = new Stats();
    document.body.appendChild(stats.dom);

    var gui = new GUI();
    gui_controls = {

        get 'Enabled'() {

            return heatMapPlane.visible;

        },

        set 'Enabled'(v) {

            for (var i = 0; i < spheres.length; i++) {

                var sphere = spheres[i];
                sphere.visible = v

            }

            heatMapPlane.visible = v;
            params.isClipping = v;

        },

        get 'Inst Heatmap'() {

            return params.isInstHeatmap;

        },

        set 'Inst Heatmap'(v) {

            params.isInstHeatmap = v;
            var textureLoader = new THREE.TextureLoader()
            var hm_path = "hm/inst_hm.png";
            inst_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            inst_plane.visible = params.isInstHeatmap;

        },  

        get 'Student Heatmap'() {

            return params.isStudHeatmap;

        },

        set 'Student Heatmap'(v) {

            params.isStudHeatmap = v;
            
            var textureLoader = new THREE.TextureLoader()
            
            var hm_path = "hm/pod.png";
            podium_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            podium_plane.visible = params.isStudHeatmap;
            
            var hm_path = "hm/sc_1.png";
            sc1_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            sc1_plane.visible = params.isStudHeatmap;
            
            var hm_path = "hm/sc_2.png";
            sc2_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            sc2_plane.visible = params.isStudHeatmap;
            
            var hm_path = "hm/wb_1.png";
            wb1_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            wb1_plane.visible = params.isStudHeatmap;
            
            var hm_path = "hm/wb_2.png";
            wb2_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            wb2_plane.visible = params.isStudHeatmap;
            
        },

        get 'Student Dwell Time'() {

            return params.isStudDwellTime;

        },

        set 'Student Dwell Time'(v) {

            params.isStudDwellTime = v;
            
            var textureLoader = new THREE.TextureLoader()
            
            var hm_path = "dwell_times/pod.png";
            podium_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            podium_plane.visible = params.isStudDwellTime;
            
            var hm_path = "dwell_times/sc_1.png";
            sc1_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            sc1_plane.visible = params.isStudDwellTime;
            
            var hm_path = "dwell_times/sc_2.png";
            sc2_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            sc2_plane.visible = params.isStudDwellTime;
            
            var hm_path = "dwell_times/wb_1.png";
            wb1_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            wb1_plane.visible = params.isStudDwellTime;
            
            var hm_path = "dwell_times/wb_2.png";
            wb2_plane.material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: textureLoader.load( hm_path ) });
            wb2_plane.visible = params.isStudDwellTime;
            
        },

        get 'Autoplay'() {

            return params.isAutoPlay;

        },
        set 'Autoplay'(v) {

            params.isAutoPlay = v;

        },

        get 'Fix Instructor'() {

            return params.isFixInstructor;

        },
        set 'Fix Instructor'(v) {

            params.isFixInstructor = v;

        },

        get 'Show Students'() {

            return params.isStudents;

        },
        set 'Show Students'(v) {

            params.isStudents = v;
            params.isUpdateCharacters = true;

        },

        get 'Show Instructor'() {

            return params.isInstructor;

        },
        set 'Show Instructor'(v) {

            params.isInstructor = v;
            params.isUpdateCharacters = true;

        },

        get 'Shadows'() {

            return material.clipShadows;

        },
        set 'Shadows'(v) {

            material.clipShadows = v;

        },

        get 'Plane'() {

            return heatMapPlane.position.y;

        },
        set 'Plane'(v) {

            heatMapPlane.position.y = v;

        },
        get 'Time'() {

            return currFrameId;

        },
        set 'Time'(v) {
            currFrameId = v;
            params.isUpdateCharacters = true;
        },

        get 'Conf Filter'() {

            return tvec_conf;

        },
        set 'Conf Filter'(v) {
            tvec_conf = v;
            params.isUpdateCharacters = true;
        },
        
        Classroom: "407SC_104",
        Semester: "Fall 2020",
        Date: "1-Sept",

        // Course: "",
        // Semester: "",
        // Date: "",


        "Play/Pause": function(){ 
            params.isAutoPlay = !params.isAutoPlay
            if(params.isAutoPlay){
                // pause
                play_button.name("Pause")
                play_button.domElement.previousSibling.style.backgroundImage = 'url(img/pause.png)';
                play_button.domElement.previousSibling.style.backgroundSize = "10px";
                
            }
            else{
                // Play
                play_button.name("Play")
                play_button.domElement.previousSibling.style.backgroundImage = 'url(img/play.png)';
            }
        },

    };

    gui.add(gui_controls, 'Classroom', [ "407SC_104", "DH_1209", "PH_A18C", "PH_A20A", "PH_A21A" ] )
        .listen().onChange(function(className){
            
            console.log(className)
            backCamGroup.update_class(url+"Hjsons/" + className + "_HCtoO_back.json")
            frontCamGroup.update_class(url+"Hjsons/" + className + "_HCtoO_front.json")
            
            back_wall.update_class(url+"Hjsons/" + className + "_front.json")
            front_wall.update_class(url+"Hjsons/" + className + "_back.json")
            
            if (right_wall){
                right_wall.update_class(url+"Hjsons/" + className + "_back.json")    
            }

            if (left_wall){
                left_wall.update_class(url+"Hjsons/" + className + "_front.json")
            }
                        
            updateClass(url+"Hjsons/" + className + "_back.json")
            params.isNotSceneSetup = true;
            tries = 0;

            readFramesJSON(className)
            
        });

    gui.add(gui_controls, "Semester", [ "Fall 2020", "Summer 2020", "Spring 2020" ] );
    gui.add(gui_controls, "Date", [ "1-Sept", "3-Sept", "8-Sept", "10-Sept" ] );

    time_slider = gui.add(gui_controls, 'Time').min(0).max(maxFrames).step(1);
    
    // console.log(time_slider)

    play_button = gui.add(gui_controls, "Play/Pause");
    play_button.name("Play")

    var playStyle = play_button.domElement.previousSibling.style;
    playStyle.backgroundImage = 'url(img/play.png)';
    playStyle.backgroundRepeat = 'no-repeat';
    playStyle.backgroundPosition = 'right';
    playStyle.backgroundSize = "15px";

    // gui.add(controls, 'Autoplay');
    // gui.add(controls, "Fix Instructor")
    gui.add(gui_controls, "Show Instructor");
    gui.add(gui_controls, "Show Students");
    // gui.add(controls, 'Conf Filter').min(0).max(100).step(1);

    // var clippingFolder = gui.addFolder('Clipping');
    // clippingFolder.add(gui_controls, 'Enabled');
    // clippingFolder.add(gui_controls, 'Plane', -10, 10);
    // clippingFolder.closed = true;

    // var AdvFolder = gui.addFolder('Advanced');
    // AdvFolder.add(gui_controls, 'Inst Heatmap');
    // AdvFolder.add(gui_controls, 'Student Heatmap');
    // AdvFolder.add(gui_controls, 'Student Dwell Time');
    // AdvFolder.closed = false;

    document.addEventListener("keydown", onDocumentKeyDown, false);
}

function moveAndLookAt(camera, dstpos, dstrot, options, autor) {
    options || (options = {duration: 2500});
    
    // controls.enabled = false;

    var origpos = new THREE.Vector3().copy(camera.position); // original position
    var origrot = new THREE.Euler().copy(camera.rotation); // original rotation
  
    camera.position.set(dstpos.x, dstpos.y, dstpos.z);
    controls.target = dstrot;
    // var dstrot = new THREE.Euler().copy(camera.rotation)
  
    // reset original position and rotation
    camera.position.set(origpos.x, origpos.y, origpos.z);
    camera.rotation.set(origrot.x, origrot.y, origrot.z);
  
    //
    // Tweening
    //
    

    // position
    new TWEEN.Tween(camera.position)
    .to({
      x: dstpos.x,
      y: dstpos.y,
      z: dstpos.z
    }, options.duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(function(){
        controls.autoRotate = autor;
    })
    .start();;
  
    // rotation (using slerp)
    (function () {
      var qa = qa = new THREE.Quaternion().copy(camera.quaternion); // src quaternion
      var qb = new THREE.Quaternion().setFromEuler(dstrot); // dst quaternion
      var qm = new THREE.Quaternion();
      camera.quaternion = qm;
      
      var o = {t: 0};
      new TWEEN.Tween(o)
      .to({t: 1}, options.duration)
      .onUpdate(function () {
        THREE.Quaternion.slerp(qa, qb, qm, o.t);
        camera.quaternion.set(qm.x, qm.y, qm.z, qm.w);
      })
      .onComplete(function(){
          controls.autoRotate = autor;
      })
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    }).call(this);
  }



function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 78) {
        currFrameId++;
        printOnce = true
    }
    else if (keyCode == 80) {
        currFrameId--;
        printOnce = true
    }
    else if (keyCode == 49) {

        controls.autoRotate = false;
        var dstPose = new THREE.Vector3(6, 6, 6);
        var dstLookat = new THREE.Vector3(0,0,0);

        moveAndLookAt(mainCam, dstPose, dstLookat, false)

        // mainCam.position.set(6,6,6);
        // controls.target = new THREE.Vector3(0,0,0);
        // mainCam.up.set(0, 0, 1);  
        // console.log(mainCam.rotation)


    }
    else if (keyCode == 50) {

        controls.autoRotate = false;
        var dstPose = new THREE.Vector3(0, 4.5, 2.5);
        var dstLookat = new THREE.Vector3(0,0,0.5);

        moveAndLookAt(mainCam, dstPose, dstLookat, false)
        
        // mainCam.position.set(0, 4.5, 2.5);
        // controls.target = new THREE.Vector3(0, 0, 0.5);
        // mainCam.up.set(0, 0, 1);  
        // console.log(mainCam.rotation)
        
    }
    else if (keyCode == 51 ){

        controls.autoRotate = false;
        var dstPose = new THREE.Vector3(0, 2, 10);
        var dstLookat = new THREE.Vector3(0,1.8,0);

        moveAndLookAt(mainCam, dstPose, dstLookat, false)

        // controls.target = new THREE.Vector3(0, 0, 0);
        // mainCam.position.set(0, 0, 10);
        // mainCam.up.set(0, -1, 0);  
        // console.log(mainCam.rotation)
    }

    else if (keyCode == 52 ){
        
        // controls.autoRotate = false;
        var dstPose = new THREE.Vector3(10, 10, 10);
        var dstLookat = new THREE.Vector3(0,0,0);

        moveAndLookAt(mainCam, dstPose, dstLookat, false)
    }

    else if (keyCode == 53 ){
        controls.autoRotate = !controls.autoRotate;
    }

    else if (keyCode == 54) {

        controls.autoRotate = false;
        var dstPose = new THREE.Vector3(0, 1, 2.5);
        var dstLookat = new THREE.Vector3(0,0,2.0);

        moveAndLookAt(mainCam, dstPose, dstLookat, false)
        
        // mainCam.position.set(0, 4.5, 2.5);
        // controls.target = new THREE.Vector3(0, 0, 0.5);
        // mainCam.up.set(0, 0, 1);  
        // console.log(mainCam.rotation)
        
    }

};

function setupScene() {
    // Draw Axes
    // var axesHelper = new THREE.AxesHelper(1);
    // scene.add(axesHelper);

    // Grid
    var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.rotation.x = - Math.PI / 2;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    // scene.add(grid);

    // lights

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    var light = new THREE.DirectionalLight(0x002288);
    light.position.set(- 1, - 1, - 1);
    scene.add(light);

    var light = new THREE.AmbientLight(0x222222);
    scene.add(light);

    // Walls 
    var groundMaterial = new THREE.MeshBasicMaterial({ color: 0xcdaa7d, side: THREE.DoubleSide });
    var frontWallMaterial = new THREE.MeshBasicMaterial({ color: 0xeee2dc, side: THREE.DoubleSide })
    var sideWallMaterial = new THREE.MeshBasicMaterial({ color: 0xbab2b5, side: THREE.DoubleSide })
    var backWallMaterial = new THREE.MeshBasicMaterial({ color: 0xdbd9d9, side: THREE.DoubleSide })

    var groundGeometry = new THREE.PlaneGeometry(25, 15, 32);
    var frontGeometry = new THREE.PlaneGeometry(25, 4, 32);
    var sideGeometry = new THREE.PlaneGeometry(25, 4, 32);
    var backGeometry = new THREE.PlaneGeometry(20, 3.2, 32);

    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(0, 0, z_shift);
    scene.add(ground);

    var front = new THREE.Mesh(frontGeometry, frontWallMaterial);
    front.position.set(0, -5, 2);
    front.rotation.x = Math.PI / 2;
    // scene.add(front);

    var back = new THREE.Mesh(backGeometry, backWallMaterial);
    back.position.set(0, 5, 3.2/2);
    back.rotation.x = Math.PI / 2;
    // scene.add(back);

    var side = new THREE.Mesh(sideGeometry, sideWallMaterial);
    side.position.set(5, 0, 2);
    side.rotation.x = Math.PI / 2;
    side.rotation.y = Math.PI / 2;
    // scene.add(side);


    var loader = new FBXLoader();
    loader.load( 'models/podium.fbx', function ( object ) {

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        object.visible = true;
        podium = object;
        podium.scale.set(0.01,0.01,0.01)
        podium.rotation.x = Math.PI/2;
        podium.position.set(0,0,0)
        scene.add( podium );

    } );

    var hm_path = "hm/pod.png";
    var texture = new THREE.TextureLoader().load( hm_path );
    var h = 1.2
    var geometry = new THREE.PlaneGeometry(1, h, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: texture });
    podium_plane = new THREE.Mesh(geometry, material);

    podium_plane.visible = params.isStudHeatmap;
    podium_plane.rotateX(Math.PI / 2);
    podium_plane.rotateY(Math.PI);
    podium_plane.position.y = -2.7;
    podium_plane.position.z = h/2;
    scene.add(podium_plane);


    loader.load( 'models/screen.fbx', function ( object ) {

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        object.visible = true;
        screen1 = object;

        screen1.scale.set(0.01,0.01,0.01)
        screen1.rotation.x = Math.PI/2;
        screen1.rotation.y = 3*Math.PI/2;
        screen1.position.set(-1.75, -2.25 ,5.1) 
        
        scene.add( screen1 );

    } );

    loader.load( 'models/screen.fbx', function ( object ) {

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        object.visible = true;
        screen2 = object;

        screen2.scale.set(0.01,0.01,0.01)
        screen2.rotation.x = Math.PI/2;
        screen2.rotation.y = 3*Math.PI/2;
        screen2.position.set(-1.75, -2.25 ,5.1) 

        scene.add( screen2 );

    } );

    var hm_path = "hm/sc_1.png";
    var texture = new THREE.TextureLoader().load( hm_path );
    var geometry = new THREE.PlaneGeometry(2.3, 1.7, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: texture });
    sc1_plane = new THREE.Mesh(geometry, material);
    sc1_plane.visible = params.isStudHeatmap;
    sc1_plane.rotateX(Math.PI / 2);
    sc1_plane.rotateY(Math.PI );
    scene.add(sc1_plane);


    var hm_path = "hm/sc_2.png";
    var texture = new THREE.TextureLoader().load( hm_path );
    var geometry = new THREE.PlaneGeometry(2.3, 1.7, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 0.8, map: texture });
    sc2_plane = new THREE.Mesh(geometry, material);
    sc2_plane.visible = params.isStudHeatmap;
    sc2_plane.rotateX(Math.PI / 2);
    sc2_plane.rotateY(Math.PI );
    scene.add(sc2_plane);

    
    
    loader.load( 'models/whiteboard.fbx', function ( object ) {

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        object.visible = true;
        whiteboard1 = object;

        whiteboard1.scale.set(0.01,0.01,0.01)
        whiteboard1.rotation.x = Math.PI/2;
        whiteboard1.position.z = -0.75

        scene.add( whiteboard1 );

    } );
    
    loader.load( 'models/whiteboard.fbx', function ( object ) {

        object.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );
        object.visible = true;
        whiteboard2 = object;

        whiteboard2.scale.set(0.01,0.01,0.01)
        whiteboard2.rotation.x = Math.PI/2;
        whiteboard2.position.z = -0.75

        scene.add( whiteboard2 );

    } );

    var hm_path = "hm/wb_1.png";
    var texture = new THREE.TextureLoader().load( hm_path );
    var geometry = new THREE.PlaneGeometry(1.8, 2.2, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 1, map:texture });
    wb1_plane = new THREE.Mesh(geometry, material);
    wb1_plane.visible = params.isStudHeatmap;
    wb1_plane.rotateX(Math.PI / 2);
    wb1_plane.rotateY(Math.PI);
    scene.add(wb1_plane);


    var hm_path = "hm/wb_2.png";
    var texture = new THREE.TextureLoader().load( hm_path );
    var geometry = new THREE.PlaneGeometry(1.8, 2.2, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0xD3D3D3,  side: THREE.DoubleSide, transparent: true, opacity: 1, map: texture });
    wb2_plane = new THREE.Mesh(geometry, material);
    wb2_plane.visible = params.isStudHeatmap;
    wb2_plane.rotateX(Math.PI / 2);
    wb2_plane.rotateY(Math.PI);
    scene.add(wb2_plane);

}

function readFramesJSON(className) {
    
    var instJsonPath = url + "frame_data/" + className + "_instructor.json";
    var studJsonPath = url + "frame_data/" + className + "_students.json";

    $.getJSON(instJsonPath, {
        format: "json"
    }, function () { console.log("Read Instructor Json Complete"); })
        .done(function (data) {
            instructorData = data
            params.isUpdateCharacters = true;
        })
        .fail(function() {
            for (var i = 0; i < maxInsts; i++) {
                instructor[i].setVisible(false);
            }
        });

    $.getJSON(studJsonPath, {
        format: "json"
    }, function () { console.log("Read Student Json Complete"); })
        .done(function (data) {
            studentData = data
            params.isUpdateCharacters = true;
            // console.log(studentData)
        })
        .fail(function() {
            for (var i = 0; i < maxStudents; i++) {
                students[i].setVisible(false);
            }
        });

}

function updateClass(classScenePath){
    $.getJSON(classScenePath, {
        format: "json"
    }, function () { console.log("Read Class Scene Json Complete"); })
    .done(function (data) {
        classData = data
        // console.log(classData)
        setupSceneObjects()
    });
}

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

function createControls(camera, renderer) {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 2.0;
    controls.panSpeed = 0.8;
    controls.enableDamping = false;
    controls.dampingFactor = 0.1;
    controls.autoRotateSpeed = 4;
    controls.autoRotate = false;

    controls.keys = {
        LEFT: 37, //left arrow
        UP: 38, // up arrow
        RIGHT: 39, // right arrow
        BOTTOM: 40 // down arrow
    }
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.ROTATE
    }


}

function updateInstructor(scale) {
    let ret = false;
    let wp = new THREE.Vector3()
    let min_y = 10
    
    var lambda_t = 0.4;
    var lambda_r = 0.2;

    try {
        currFrameInstructorLen = instructorData[currFrameId]["bodies"].length
        // console.log(currFrameInstructorLen)
        // let currFrameInstructorLen = 1
        if (params.isInstructor) {

            for (var i = 0; i < currFrameInstructorLen; i++) {
                if (instructorData[currFrameId]["bodies"][i]["tvec_conf"] * 100 > tvec_conf) {
                    if ("keypoints_3d" in instructorData[currFrameId]["bodies"][i]) {
                        let keypoints_3d = instructorData[currFrameId]["bodies"][i]["keypoints_3d"]
                        let rvec = instructorData[currFrameId]["bodies"][i]["rvec"]
                        instructor[i].update_full_body(keypoints_3d, rvec)
                        instructor[i].setVisible(true);

                    }
                    else{   
                        let tvec = instructorData[currFrameId]["bodies"][i]["tvec"]
                        let rvec = instructorData[currFrameId]["bodies"][i]["rvec"]
                        // let rvec = {r: 0, p:0, y:0};
                        instructor[i].update(rvec, tvec, params, scale)
                        instructor[i].setVisible(false);

                        instructor[i].model.getWorldPosition(wp);
                        
                        if(wp.y < min_y){
                            min_y = wp.y;
                            currFrameInstrIdx = i
                        }

                    }
                }
                else {
                    instructor[i].setVisible(false);

                }
            }

            var curr_tvec = instructorData[currFrameId]["bodies"][currFrameInstrIdx]["tvec"]
            var curr_rvec = instructorData[currFrameId]["bodies"][currFrameInstrIdx]["rvec"]
            
            var filtered_tvec  = {x:0, y:0, z:0};
            var filtered_rvec = {r: 0, p:0, y:0};
            
            // add current tvec. 
            median_array[median_idx] = {tvec: curr_tvec, rvec: curr_rvec}
            median_idx = (median_idx + 1) % median_hist

            var sorted_array = [...median_array]
            
            // for (let i = 0; i < median_array.length; i++) {
            //     sorted_array.push(median_array[i].y)
            // }
            sorted_array.sort((a, b) => {
                return a.tvec.y - b.tvec.y;
            })

            // select the median as current
            curr_tvec = sorted_array[Math.floor(sorted_array.length/2)].tvec;
            curr_rvec = sorted_array[Math.floor(sorted_array.length/2)].rvec;

            if (prev_loc.rvec != undefined && prev_loc.tvec != undefined){
                
                // filtered_tvec.x = ( curr_tvec.x * (lambda_t) ) + ( prev_loc.tvec.x * (1-lambda_t) ) ;
                filtered_tvec.x = 1.4  * ( ( curr_tvec.x * (lambda_t) ) + ( prev_loc.tvec.x * (1-lambda_t) ) );
                filtered_tvec.y = ( curr_tvec.y * (lambda_t) ) + ( prev_loc.tvec.y * (1-lambda_t) ) ;
                filtered_tvec.z = ( curr_tvec.z * (lambda_t) ) + ( prev_loc.tvec.z * (1-lambda_t) ) ;
                
                filtered_rvec.r = ( curr_rvec.r * (lambda_r) ) + ( prev_loc.rvec.r * (1-lambda_r) ) ;
                filtered_rvec.p = ( curr_rvec.p * (lambda_r) ) + ( prev_loc.rvec.p * (1-lambda_r) ) ;
                filtered_rvec.y = ( curr_rvec.y * (lambda_r) ) + ( prev_loc.rvec.y * (1-lambda_r) ) ;
                
                // filtered_rvec = curr_rvec;
                
            }
            else{
                filtered_tvec = curr_tvec;                
                filtered_rvec = curr_rvec;
            }
            // filtered_tvec.z += z_shift;
            instructor[currFrameInstrIdx].update(filtered_rvec, filtered_tvec, params, scale)
            instructor[currFrameInstrIdx].setVisible(true);
            
            prev_loc.rvec = filtered_rvec;
            prev_loc.tvec = filtered_tvec;


            for (var i = currFrameInstructorLen; i < maxInsts; i++) {
                instructor[i].setVisible(false);
            }
            ret = true;
        }
        else {
            for (var i = 0; i < maxInsts; i++) {
                instructor[i].setVisible(false);
            }
            ret = true;
        }
    }
    catch(error){
        console.error(error);
        console.log("No data found at Frame ID: " + currFrameId + " in Instructor data")
        // currFrameId += 1;
        for (var i = 0; i < maxInsts; i++) {
            instructor[i].setVisible(false);
        }
        ret = true;
    }
    return ret;
}

function updateStudent(scale) {
    let ret = false;
    let wp = new THREE.Vector3()
    
    try {
        currFrameStudentsLen = studentData[currFrameId]["bodies"].length
        // console.log(currFrameStudentsLen)
        // let currFrameStudentsLen = 1
        if (params.isStudents) {

            for (var i = 0; i < currFrameStudentsLen; i++) { // currFrameStudentsLen
                if (studentData[currFrameId]["bodies"][i]["tvec_conf"] * 100 > tvec_conf) {
                    if ("keypoints_3d" in studentData[currFrameId]["bodies"][i]) {
                        let keypoints_3d = studentData[currFrameId]["bodies"][i]["keypoints_3d"]
                        let rvec = studentData[currFrameId]["bodies"][i]["rvec"]
                        students[i].update_full_body(keypoints_3d, rvec)
                        students[i].setVisible(true);

                    }
                    else{   
                        let tvec = studentData[currFrameId]["bodies"][i]["tvec"]
                        let rvec = studentData[currFrameId]["bodies"][i]["rvec"]
                        // let rvec = {r: 0, p:0, y:0};
                        students[i].update(rvec, tvec, params, scale)
                        students[i].setVisible(true);
                        
                        students[i].model.getWorldPosition(wp);
                        if(wp.y > 4.8){
                            students[i].setVisible(false);
                        }

                    }
                }
                else {
                    students[i].setVisible(false);
                }
            }

            for (var i = currFrameStudentsLen; i < maxStudents; i++) {
                students[i].setVisible(false);
            }
            ret = true;
        }
        else {
            for (var i = 0; i < maxStudents; i++) {
                students[i].setVisible(false);
            }
            ret = true;
        }
    }
    catch(error){
        console.error(error);
        console.log("No data found at Frame ID: " + currFrameId + " in Student data")
        // currFrameId += 1;
        for (var i = 0; i < maxStudents; i++) {
            students[i].setVisible(false);
        }
        ret = true;
    }
    return ret;
}

function updateCharacters() {
    let ret = false;
    if (updateInstructor() && updateStudent()) {
        params.isUpdateCharacters = false
    }
}

function onWindowResize() {

    var aspect = window.innerWidth / window.innerHeight;

    mainCam.aspect = aspect;
    mainCam.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

// renderer.setAnimationLoop( function () {

// 	renderer.render( scene, camera );

// } );

function animate() {

    renderer.setAnimationLoop( render_ );
    
    // requestAnimationFrame(animate);   

    // render_();

}

// function render(){
    
//     // render_()
// }

function getAllPermutations(string) {
    var results = [];
  
    if (string.length === 1) {
      results.push(string);
      return results;
    }
  
    for (var i = 0; i < string.length; i++) {
      var firstChar = string[i];
      var charsLeft = string.substring(0, i) + string.substring(i + 1);
      var innerPermutations = getAllPermutations(charsLeft);
      for (var j = 0; j < innerPermutations.length; j++) {
        results.push(firstChar + innerPermutations[j]);
      }
    }
    return results;
  }
  
function* get_next_scale() {
    
    for (var a = 1; a < 2; a+=0.3){
        for (var b = 1; b < 2; b+=0.3){
            for (var c = 1.5; c < 3.5; c+=0.2){
                for (var d = 0; d < 2; d++){
                    for (var e = 0; e < 2; e++){
                        for (var f = 0; f < 2; f++){
                            var permutations_rpy = getAllPermutations("rpy")
                            for (var g = 0; g < 6; g++){
                                var perm = permutations_rpy[g]
                                yield {
                                    "x": a, "y": b, "z":c, 
                                    "mr": Math.pow(-1, d), "mp": Math.pow(-1, e), "my": Math.pow(-1, f),
                                    "px": perm[0], "py": perm[1], "pz": perm[2],
                                };
                            }
                        }
                    }
                }   
            }
        }
    }

    // while (1){
        return min_scale
    // }
}

function get_time(frameID){
    fps = 15;
    var date = new Date(null);
    date.setSeconds((frameID * 20)/fps); // specify value for SECONDS here
    var result = date.toISOString().substr(11, 8);
    return result;
}

function setupSceneObjects(){
    
    var point_gt = new THREE.Vector3();
    var point_gt2 = new THREE.Vector3();
    var arucoMap = {};

    tries += 1
    if(tries >= 10){
        params.isNotSceneSetup = false;
        tries = 0
    }
    
    try{

        for (var i = 0; i < classData.length; i++) {    
            arucoMap[classData[i]["id"]] = i;
            arucoMarkers[i].visible = false
        } 
    }
    catch(error){

    }

    try {
        
        // Podium 
        var index = arucoMap[18]
        var transSphere = classData[index]["translation"];
        arucoMarkers[index].position.set(transSphere.x, transSphere.y, transSphere.z);
        arucoMarkers[index].getWorldPosition(point_gt);
        podium.position.set(point_gt.x, point_gt.y, z_shift)

        podium_plane.position.set(point_gt.x, point_gt.y, 0.6)
        podium_plane.position.y += 0.3
        // console.log("Podium", point_gt)
        podium.visible = true;

    } catch (error) {
        if (podium) {
            podium.visible = false;
        }
    }

    try {
        // Whiteboard 1 
        var index = arucoMap[10]
        var transSphere = classData[index]["translation"];
        arucoMarkers[index].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var index2 = arucoMap[11]
        var transSphere = classData[index2]["translation"];
        arucoMarkers[index2].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var wb1 = new THREE.Vector3();
        arucoMarkers[index].getWorldPosition(point_gt);
        // console.log("WB1 1", point_gt)
        arucoMarkers[index2].getWorldPosition(point_gt2);
        // console.log("WB1 2", point_gt2)
        wb1.x = (point_gt.x + point_gt2.x) /2;
        wb1.y = (point_gt.y + point_gt2.y) /2;
        wb1.z = (point_gt.z + point_gt2.z) /2;
        whiteboard1.position.set(wb1.x, wb1.y, wb1.z - 1 + 0.3) 
        var scale_x = (Math.abs(point_gt2.x - point_gt.x) + 0.5 ) / (6 * 100) 
        var scale_y = (Math.abs(point_gt2.z - point_gt.z) + 0.5 ) / (1.5 * 100) 
        whiteboard1.scale.set(scale_x, scale_y, 0.01)
        wb1_plane.position.set(wb1.x, wb1.y, wb1.z)
        wb1_plane.position.y += 0.1

        whiteboard1.visible = true;
        
    } catch (error) {
        if (whiteboard1) {
            whiteboard1.visible = false;
        }
    }
    
    try {
        // Whiteboard 2
        var index = arucoMap[12]
        var transSphere = classData[index]["translation"];
        arucoMarkers[index].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var index2 = arucoMap[13]
        var transSphere = classData[index2]["translation"];
        arucoMarkers[index2].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var wb1 = new THREE.Vector3();
        arucoMarkers[index].getWorldPosition(point_gt);
        // console.log("WB2 1", point_gt)
        arucoMarkers[index2].getWorldPosition(point_gt2);
        // console.log("WB2 2", point_gt2)

        wb1.x = (point_gt.x + point_gt2.x) /2;
        wb1.y = (point_gt.y + point_gt2.y) /2;
        wb1.z = (point_gt.z + point_gt2.z) /2;
        whiteboard2.position.set(wb1.x, wb1.y, wb1.z - 1 + 0.3)

        var scale_x = (Math.abs(point_gt2.x - point_gt.x) + 0.5 ) / (6 * 100) 
        var scale_y = (Math.abs(point_gt2.z - point_gt.z) + 0.5 ) / (1.5 * 100) 
        whiteboard2.scale.set(scale_x, scale_y, 0.01)
        wb2_plane.position.set(wb1.x, wb1.y, wb1.z)
        wb2_plane.position.y += 0.1
        
        whiteboard2.visible = true;
        
    } catch (error) {
        if (whiteboard2) {
            whiteboard2.visible = false;
        }
    }

    try {
        // Screen 1
        var index = arucoMap[14]
        var transSphere = classData[index]["translation"];
        arucoMarkers[index].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var index2 = arucoMap[15]
        var transSphere = classData[index2]["translation"];
        arucoMarkers[index2].position.set(transSphere.x, transSphere.y, transSphere.z);

        var wb1 = new THREE.Vector3();
        arucoMarkers[index].getWorldPosition(point_gt);
        // console.log("SC1 1", point_gt)
        arucoMarkers[index2].getWorldPosition(point_gt2);
        // console.log("SC1 2", point_gt2)
        wb1.x = (point_gt.x + point_gt2.x) /2;
        wb1.y = (point_gt.y + point_gt2.y) /2;
        wb1.z = (point_gt.z + point_gt2.z) /2;
        screen1.position.set(wb1.x -1.75, wb1.y -2.25, wb1.z + 5.1 + 0.2)            
        sc1_plane.position.set(wb1.x, wb1.y, wb1.z)
        sc1_plane.position.y += 0.1
        screen1.visible = true;
        
    } catch (error) {
        if (screen1){
            screen1.visible = false;
        }
    }

    try {
        
        // Screen 2
        var index = arucoMap[16]
        var transSphere = classData[index]["translation"];
        arucoMarkers[index].position.set(transSphere.x, transSphere.y, transSphere.z);
        
        var index2 = arucoMap[17]
        var transSphere = classData[index2]["translation"];
        arucoMarkers[index2].position.set(transSphere.x, transSphere.y, transSphere.z);

        var wb1 = new THREE.Vector3();
        arucoMarkers[index].getWorldPosition(point_gt);
        // console.log("SC2 1", point_gt)
        arucoMarkers[index2].getWorldPosition(point_gt2);
        // console.log("SC2 2", point_gt2)
        wb1.x = (point_gt.x + point_gt2.x) /2;
        wb1.y = (point_gt.y + point_gt2.y) /2;
        wb1.z = (point_gt.z + point_gt2.z) /2;
        screen2.position.set(wb1.x -1.75, wb1.y -2.25, wb1.z + 5.1 + 0.2)
        sc2_plane.position.set(wb1.x, wb1.y, wb1.z)
        sc2_plane.position.y += 0.1

        screen2.visible = true;
        
    } catch (error) {
        if (screen2){
            screen2.visible = false;
        }
    }

}

function render_() {
    renderer.render(scene, mainCam);
    controls.update();
    TWEEN.update();
    // if (params.isUpdateCharacters) {
    //     updateCharacters()
    // }

    // renderer.xr.getCamera(mainCam);
    // xrCamera.getWorldDirection(cameraVector);

    now = Date.now();
    delta = now - then;
    if (delta > interval && currFrameId < maxFrames && params.isAutoPlay) {
        currFrameId += 1
        params.isUpdateCharacters = true
        then = now - (delta % interval);
    }

    stats.update();
    
    if (gui_controls.Classroom != "" && gui_controls.Date != "" && gui_controls.Semester != ""){
        params.isClassSelected = true;
    }

    time_slider.domElement.children[0].firstElementChild.value = get_time(currFrameId);

    // var scale = iterator.next().value
    // if (scale == undefined){
        
    //     console.log(currFrameId)
    //     console.log(min_dist)
    //     console.log(min_scale)
    //     min_dist = 1000
    //     min_scale = undefined
    //     iterator = get_next_scale()
    //     currFrameId ++;
    // }
    // console.log(scale)
    var inst_scale = {
        "x": 1, "y": 2, "z": 1.5, 
        "mr": 1, "mp": -1, "my": 0,
        "px": "r", "py": "p", "pz": "y",
    };
    var stud_scale = {
        "x": 1, "y": 2, "z": 2.2, 
        "mr": 1, "mp": -1, "my": 0,
        "px": "r", "py": "p", "pz": "y",
    };

    if (params.isUpdateCharacters && params.isClassSelected){

        if (updateInstructor(inst_scale) && updateStudent(stud_scale)) {
            params.isUpdateCharacters = false
        }

        // if (currFrameId - 18 > 0){
        //     frame_student_img.src = 'frame_data/students/img_' +  (currFrameId -18) +'.jpg';
        //     frame_instructor_img.src = 'frame_data/instructor/img_' +  (currFrameId-18) +'.jpg';
        // }
        // else{
        //     frame_student_img.src = 'frame_data/students/img_' +  (0) +'.jpg';
        //     frame_instructor_img.src = 'frame_data/instructor/img_' +  (0) +'.jpg';
        // }

    }
    // if (!params.isClassSelected){
    //     frame_student_img.src = 'img/dummy.jpg';
    //     frame_instructor_img.src = 'img/dummy.jpg';
    // }

    // front_wall.wall.position.y = -2.4

    if (params.isNotSceneSetup){    
        setupSceneObjects()
    }

    var distance = 0;
    var roll_error = 0;
    var yaw_error = 0;
    var pitch_error = 0;

    // spriteMap.needsUpdate = true;

    var direction = new THREE.Vector3();
    
    if (params.isClipping && params.isInstructor) {
        
        instructor[currFrameInstrIdx].model.getWorldDirection(ray_dir);
        ray_dir.normalize();
        raycaster.set(instructor[currFrameInstrIdx].arrowHelper.position, ray_dir);
        
        var intersections = raycaster.intersectObject(heatMapInst);
        intersection = (intersections.length) > 0 ? intersections[0] : null;
        
        if (intersection !== null) {
            // intersection.point.z -= 0.7;
            
            inst_sphere.position.copy(intersection.point);
            inst_sphere.scale.set(1, 1, 1);
            inst_sphere.visible = true
        }
        else{
            inst_sphere.position.set(-1,-1,-1)
        }

        
    }
    
    heatMapInst.visible = params.isClipping && params.isInstructor;
    heatMapPlane.visible = params.isClipping && params.isStudents;

    for (var i = 0; i < currFrameStudentsLen; i++) {
        spheres[i].visible = params.isClipping && params.isStudents
    }

    if (params.isClipping && params.isStudents) {
        
        for (var i = 0; i < currFrameStudentsLen; i++) {
            spheresIndex = i
            students[i].model.getWorldDirection(ray_dir);
            ray_dir.normalize();
            raycaster.set(students[i].arrowHelper.position, ray_dir);
            
            var intersections = raycaster.intersectObject(heatMapPlane);
            intersection = (intersections.length) > 0 ? intersections[0] : null;
            
            if (intersection !== null) {
                intersection.point.z -= 0.5;
                
                spheres[spheresIndex].position.copy(intersection.point);
                spheres[spheresIndex].scale.set(1, 1, 1);
                spheres[spheresIndex].visible = true
                // spheresIndex = (spheresIndex + 1) % spheres.length;
                // distance += intersection.point.distanceTo(point_gt)
                
                

                // var target = new THREE.Quaternion();
                // var t_euler = new THREE.Euler();
                
                // instructor[i].model.getWorldDirection(ray_dir);
                // ray_dir.normalize();

                // direction.subVectors( point_gt, instructor[i].arrowHelper.position).normalize()
        
                // var arrowHelper = new THREE.ArrowHelper(direction, instructor[i].arrowHelper.position, 1, 0xffffff);
                // scene.add(arrowHelper)
                // x -> yaw
                // z -> pitch
                
                // yaw_error   += Math.abs((Math.atan2((intersection.point.x - point_gt.x), point_gt.distanceTo(instructor[i].arrowHelper.position)) * 1 ) / 1)
                // pitch_error += Math.abs((Math.atan2((intersection.point.z - point_gt.z), point_gt.distanceTo(instructor[i].arrowHelper.position)) * 1 ) / 1)
                // roll_error  += Math.abs((Math.atan2((intersection.point.y - point_gt.y), point_gt.distanceTo(instructor[i].arrowHelper.position)) * 1 ) / 1)


                // roll_error  += Math.abs(ray_dir.angleTo(new THREE.Vector3(1,0,0)) - direction.angleTo(new THREE.Vector3(1,0,0)))
                // pitch_error += Math.abs(ray_dir.angleTo(new THREE.Vector3(0,1,0)) - direction.angleTo(new THREE.Vector3(0,1,0)))
                // yaw_error   += Math.abs(ray_dir.angleTo(new THREE.Vector3(0,0,1)) - direction.angleTo(new THREE.Vector3(0,0,1)))
                
                // pitch_error += delta_direction.angleTo(new THREE.Vector3(0,1,0))
                // yaw_error += delta_direction.angleTo(new THREE.Vector3(0,0,1))

                // console.log(roll_error)
                // console.log(pitch_error)
            }
            else{
                spheres[spheresIndex].position.set(-1,-1,-1)
                spheres[spheresIndex].visible = false
            }
        } 

    }

    // console.log(distance/currFrameStudentsLen)
    if (0){
        
        if (count > 3){
            var json_data = []
            for (var i = 0; i < currFrameStudentsLen; i++) {
                if(spheres[i].visible){

                    var tmp = new THREE.Vector3();
                    tmp.copy(spheres[i].position)
                    json_data.push(tmp)
                    // console.log( + " "+ spheres[i].position.z)

                }
            }
            // json_data.push(inst_sphere.position)
            console.log(currFrameId)
            // console.log(inst_sphere.position)
            
            count = 0
            // console.log(all_frame_data)
            
            if (currFrameId == maxFrames){
                function download(filename, text) {
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    element.setAttribute('download', filename);
                    
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    
                    element.click();
                    
                    document.body.removeChild(element);
                }
                
                var jsonstr = JSON.stringify(all_frame_data_stud);
                download("data_stud.json", jsonstr);

                var jsonstr = JSON.stringify(all_frame_data_inst);
                download("data_instr.json", jsonstr);


            }
            else if(currFrameId < maxFrames ) {
                
                var tmp = new THREE.Vector3();
                tmp.copy(inst_sphere.position)
                all_frame_data_inst.push(tmp)

                all_frame_data_stud.push(json_data)
                params.isUpdateCharacters = true;
            }
            else{
                // params.isUpdateCharacters = true;
            }
            currFrameId ++;
            
        }

        count ++
    }

    // if (distance < min_dist){
    //     min_dist = distance
    //     min_scale = scale
    //     // console.log(min_dist)
    //     // console.log(min_scale)
        
    // }

    
    if (front_wall){
        front_wall.update();
        frontClipPlane.constant = Math.abs(front_wall.wall.position.y)
    }
    
    if (back_wall){
        back_wall.update();
        backClipPlane.constant = Math.abs(back_wall.wall.position.y)
    }
    
    if (left_wall){
        left_wall.update();
        leftClipPlane.constant = Math.abs(left_wall.wall.position.x)
    }
    
    if (right_wall){
        right_wall.update();
        rightClipPlane.constant = Math.abs(right_wall.wall.position.x)
    }
    
    
    // renderer.clear();
    // renderer.render(scene, mainCam);
    // renderer.clearDepth();
    // renderer.render( sceneOrtho, cameraOrtho );

}
