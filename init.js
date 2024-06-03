var gl;
var canvas;
var camera_rotation = new vec3(0.0, 0.0, 0.0);
var camera_distance = 5.0;
var cube;


function PerspectiveMatrixMaker(fov, back)
{

	var n = -camera_distance;
	var f = -(camera_distance+back);
	
}

function UpdateCanvasSize()
{
	canvas.style.width  = "100%";
	canvas.style.height = "100%";
	const pixel_ratio = window.devicePixelRatio || 1;
    canvas.width = pixel_ratio*canvas.clientWidth;
    canvas.height = pixel_ratio*canvas.clientHeight;
	const width  = (canvas.width  / pixel_ratio);
	const height = (canvas.height / pixel_ratio);
	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	gl.viewport(0,0,canvas.width,canvas.height);

    gl.clearColor(0.7, 0.2, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
}

function draw()
{
	
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor((200/255), (162/255), (200/255), 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
/*	
	const proj_mat = perspectiveMatrix;
	const camera_matrix = trans(1.0 ,camera_rotation, new vec3(-0.2,-0.2, 0.0));

	const v_w =  m_mult(camera_matrix, proj_mat);

	console.log(camera_matrix);
	console.log(perspectiveMatrix);
	console.log(v_w);

	//object draw//
	cube.draw(proj_mat);
	//////////////
	*/
}

function InitWebGL()
{
    
    canvas = document.getElementById('scene');
	gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

    //objects//
	cube = new cube_drawer();
	//////////

	console.log("fatt");
	UpdateCanvasSize();
	draw();


    return;
}