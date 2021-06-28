import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { BufferGeometryUtils } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/utils/BufferGeometryUtils.js'
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
import { CSG } from "https://raw.githubusercontent.com/forerunrun/test/main/CSG.js";


let scene, camera, renderer, manager, loader, controls;

var container = document.getElementById( 'container');
var widdi = container.offsetWidth;
var hiddi = container.offsetHeight;

var one;
var two;
var tree;
var four;

var firstobject;

var objs = [];
var objsMerge;
var objsFinal;

var unionMesh;

var button = document.getElementById('but');
var button1 = document.getElementById('but1');

const ogmeshcheck = document.getElementById('original');
const boolmeshcheck = document.getElementById('boolean');
const booler = document.getElementById('booler');

const csg = new CSG();

const mat = new THREE.MeshStandardMaterial({ transparent:true, opacity: 0.5 });
const mat1 = new THREE.MeshStandardMaterial({ wireframe: true });

var csgMesh;

init(); 


function init() {
  
      loader = new GLTFLoader();
    loader.setPath( 'https://forerunrun.github.io/test/' );
    loader.load( 'component1a.glb', function ( obj1 ) { 
      console.log(obj1)
        obj1.scene.traverse( function ( child ) {
            if ( child.isMesh ) {   
                objs.push(child.geometry)
                child.material.wireframe = true
                child.updateMatrix();
                if (child.name === 'pCube1PIV'){
                    one = child;
                }
                if (child.name === 'pCube2PIV'){
                    two = child;
                }
                if (child.name === 'pCube3PIV'){
                    tree = child;
                }
                if (child.name === 'pCylinder1PIV'){
                    four = child;
                }
                //console.log(child);
                //child.geometry.toNonIndexed(); 
                //child.material = new THREE.MeshStandardMaterial()   
            }               
        } );
        firstobject = obj1.scene;
        objsMerge = BufferGeometryUtils.mergeBufferGeometries(objs);
    } );

    // Initial Scene //

    scene = new THREE.Scene();
    //scene.add(firstobject)
    objsFinal = new THREE.Mesh( objsMerge , mat1 );
    console.log(objsFinal);
    scene.add(objsFinal)

    renderer = new THREE.WebGLRenderer( { antialias: true, gammaOutput: true, alpha: true } );
    camera = new THREE.PerspectiveCamera( 60, widdi / hiddi, 0.1, 900 );
    camera.position.set(0,0,100)
    camera.aspect = widdi / hiddi;
   
    renderer.setSize( widdi , hiddi );
    renderer.setClearColor( 0x000000, 1); 
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add( ambientLight );
    ambientLight.position.set( 0, 0, -20)

    const directionalLight = new THREE.DirectionalLight( "#f00505", 0.5 );
    scene.add( directionalLight );
    directionalLight.position.set( 40, 40, 40 )


    //const pointLight = new THREE.SpotLight( "#0d3ade", 1.8, 0 );
    //scene.add( pointLight );
    //pointLight.position.set( -4.404, -0.207, -2.382 )


        animate();

    // end init //
};

button.addEventListener('click', function(){
    //scene.remove(objsFinal);

    //scene.remove(objsFinal);

    csg.union([one, two, tree, four]);
    csgMesh = csg.toGeometry();
    
    unionMesh = new THREE.Mesh( csgMesh , mat1 );
    console.log(unionMesh);

    scene.add(unionMesh)

    button1.style.display = 'block';
    button.style.display = 'none';
    booler.style.display = 'block';
})

button1.addEventListener('click', function(){

var raycaster = new THREE.Raycaster();
var intersects = [];

var pos = unionMesh.geometry.attributes.position; 
var ori = new THREE.Vector3();
var dir = new THREE.Vector3();
var a = new THREE.Vector3(),
b = new THREE.Vector3(),
c = new THREE.Vector3(),
tri = new THREE.Triangle();

var index = unionMesh.geometry.index;    
var faces = index.count / 3;
scene.updateMatrixWorld()
for (let i = 0; i < faces; i++) {
a.fromBufferAttribute(pos, index.array[i * 3 + 0]);
b.fromBufferAttribute(pos, index.array[i * 3 + 1]);
c.fromBufferAttribute(pos, index.array[i * 3 + 2]);
a.set(a.x + unionMesh.position.x, a.y + unionMesh.position.y, a.z + unionMesh.position.z);
b.set(b.x + unionMesh.position.x, b.y + unionMesh.position.y, b.z + unionMesh.position.z);
c.set(c.x + unionMesh.position.x, c.y + unionMesh.position.y, c.z + unionMesh.position.z);
tri.set(a, b, c);
tri.getMidpoint(ori);
tri.getNormal(dir);

raycaster.set(ori, dir);    

intersects = raycaster.intersectObject(unionMesh, true);

//scene.add(new THREE.ArrowHelper(dir, ori, 500, 0xff0000));
if (intersects.length > 0) {
    console.log( intersects[0].object);
    var intFace = Math.floor(intersects[0].faceIndex / 2);
    if (intersects[0].distance > 0 && intersects[0].distance < 0.2) {
        console.log( intersects[0].object.userData);
        //intersects[0].object.userData.sides[intFace] = true;
    }
} // this works but with all sides. I need to check if ray don`t intersect specific side more


}


})


ogmeshcheck.addEventListener('change', function(){
    if (ogmeshcheck.checked === true){
        objsFinal.visible = true;
    }
    else{
        objsFinal.visible = false;
    }
})
boolmeshcheck.addEventListener('change', function(){
    if (boolmeshcheck.checked === true){
        unionMesh.visible = true;
    }
    else{
        unionMesh.visible = false;
    }
})



function render(){
    renderer.render(scene, camera)
    controls.update();
};



function animate(){
    requestAnimationFrame( animate );

        render();
};
