var deg2rad = Math.PI/180;
var canvas, gl;
var camera_angle = new vec3(-45,45,0);
camera_angle.mult(deg2rad);
var cam_z = 5;
var camera_position = new vec3(0,0,cam_z)
var CV, MVP1, MVP2; // view matrices
var cube, cube_far;

// Called once to initialize
function InitWebGL()
{
	// Initialize the WebGL canvas
	canvas = document.getElementById("scene");
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	
	// Initialize settings
	gl.clearColor(0.9,0.9,0.9,1);
	gl.enable(gl.DEPTH_TEST);
	
	// Initialize the programs and buffers for drawing
	cube = new cube_drawer();
	cube_far = new cube_drawer();
	
	// Set the viewport size
	UpdateCanvasSize();
	DrawScene();
}

// Called every time the window size is changed.
function UpdateCanvasSize()
{
	canvas.style.width  = "100%";
	canvas.style.height = "100%";
	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width  = pixelRatio * canvas.clientWidth;
	canvas.height = pixelRatio * canvas.clientHeight;
	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);
	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';
	gl.viewport( 0, 0, canvas.width, canvas.height );
	UpdateViewMatrices();
}

function ProjectionMatrix( c, fov_angle=60 )
{
	var r = c.width / c.height;
	var n = 0.1;
	var f = 10.0;
	var fov = 3.145 * fov_angle / 180;
	var s = 1 / Math.tan( fov/2 );
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}

function UpdateViewMatrices()
{
	var perspectiveMatrix = ProjectionMatrix(canvas);
	CV  = trans(1, camera_angle, camera_position );
	MVP1 = m_mult(perspectiveMatrix, CV);
	MVP2 = m_mult(perspectiveMatrix, m_mult(CV, [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		2,0,0,1
	]));
}

function DrawScene()
{
	
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.clearColor(0.9,0.9,0.9,1);
	
	var perspectiveMatrix = ProjectionMatrix(canvas);
	CV  = trans(1, camera_angle, camera_position );
	MVP1 = m_mult(perspectiveMatrix, CV);
	MVP2 = m_mult(perspectiveMatrix, m_mult(CV, [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		2,0,0,1
	]));

	cube.draw(MVP1);
	cube_far.draw(MVP2);
}
