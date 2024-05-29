var gl;
var canvas;
var camera_rotation = new vec3(0,0,0);
var camera_distance = 5;

function ProjectionMatrix()
{

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

    
	UpdateCanvasSize();
    return;
}