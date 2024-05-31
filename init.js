var gl;
var canvas;
var camera_rotation = new vec3(0,0,0);
var camera_distance = 5.0;
var test_cube;

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
	
	return perspectiveMatrix;
}

function UpdateCanvasSize()
{
	const pixel_ratio = window.devicePixelRatio || 1;
    canvas.width = pixel_ratio*canvas.clientWidth;
    canvas.height = pixel_ratio*canvas.clientHeight;
    gl.viewport(0,0,window.innerWidth,window.innerHeight);

    gl.clearColor(0.7, 0.2, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
}

function draw()
{
	gl.clearColor(0.7, 0.2, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	const proj_mat = ProjectionMatrix();
	const camera_matrix = trans(1,camera_rotation, new vec3(0,0,camera_distance));

	const v_w =  m_mult(camera_matrix, proj_mat);
	test_cube.draw(v_w);

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

    test_cube = new cube_drawer();

	console.log("fatt");
	UpdateCanvasSize();
	draw();


    return;
}