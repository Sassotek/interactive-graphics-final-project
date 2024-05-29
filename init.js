var gl;
var canvas;
var camera_rotation = new vec3(45,45,0);
var camera_distance = 5;
var test_box;

function ProjectionMatrix()
{
	var r = canvas.width / canvas.height;
	var n = (camera_distance - 1.74);
	const min_n = 0.001;
	if ( n < min_n ) n = min_n;
	var f = (camera_distance + 1.74);;
	var fov = 3.145 * 60 / 180;
	var s = 1 / Math.tan( fov/2 );
	perspectiveMatrix = [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}

function UpdateCanvasSize()
{
    canvas.width = window.innerWidth;
    canvas.heighh = window.innerHeight;
    gl.viewport(0,0,window.innerWidth,window.innerHeight);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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

    test_box = new bow_drawer();

	console.log("fatt");
	UpdateCanvasSize();


    return;
}