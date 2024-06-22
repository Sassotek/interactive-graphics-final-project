var canvas, gl;
var camera_angle = new vec3(45,45,0);
camera_angle.mult(deg2rad);
var cam_z = 5;
var camera_position = new vec3(0,0,-cam_z)
var CV, MVP1, MVP_quaoar, MVP_kamillis; // view matrices
var cube, cube_far, skybox, quaoar, kamillis, pyrona;

var quaoar_pos = new vec3(2,2,-2);
var kamillis_pos = new vec3(2,2,2);
var pyrona_pos = new vec3(-3,0,2);

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
	skybox = new skybox_drawer();
	quaoar = new planet_drawer();
	kamillis = new planet_drawer();
	image_loader("http://0.0.0.0:8000/quaoar_texture.png", quaoar, 1);
	image_loader("http://0.0.0.0:8000/kamillis_texture.png", kamillis, 2);
	cube_far = new cube_drawer();
	
	// Set the viewport size
	UpdateCanvasSize();
	DrawScene()
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

function ProjectionMatrix( fov_angle=60 )
{
	var r = canvas.width / canvas.height;
	var n = 0.1;
	var f = 100;
	var fov = deg2rad * fov_angle;
	var tang = Math.tan( fov/2 );
	var s = 1 / tang;
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, -(n+f)/(f-n), -1,
		0, 0, -2*n*f/(f-n), 0
	];
}

function UpdateViewMatrices()
{
	var perspectiveMatrix = ProjectionMatrix();
	CV  = trans(1, camera_angle, camera_position );
	MVP1 = m_mult(perspectiveMatrix, CV);
	MVP2 = m_mult(perspectiveMatrix, m_mult(CV, [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		2,0,0,1
	]));
}

function image_loader(image_id, mesh, texture_unit)
{
	var img = new Image();
	img.src = image_id; 
	img.crossOrigin = "anonymous";

	img.addEventListener('load', function() 
	{
		mesh.set_texture(img, texture_unit);
		DrawScene();
	});  
	 	
}

function DrawScene()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.clearColor(0.9,0.9,0.9,1);
	
	var perspectiveMatrix = ProjectionMatrix();
	CV  = trans(1, camera_angle, camera_position );
	MVP1 = m_mult(perspectiveMatrix, CV);
	MVP_quaoar = m_mult(perspectiveMatrix, m_mult(CV, trans(0.5 ,new vec3(0,0,0), quaoar_pos)));
	MVP_kamillis = m_mult(perspectiveMatrix, m_mult(CV, trans(0.5 ,new vec3(0,0,0), kamillis_pos)));
	
	cube.draw(MVP1);
	skybox.draw(m_mult(perspectiveMatrix, m_mult(CV, trans(20))));
	quaoar.draw(MVP_quaoar);
	kamillis.draw(MVP_kamillis);
}
