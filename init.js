var canvas, gl;
var camera_angle = new vec3(45,45,0);
camera_angle.mult(deg2rad);
var cam_z = 5;
var camera_position = new vec3(0,0,-cam_z)
var CV, MVP1, MW_quaoar, MV_quaoar, MW_kamillis, MV_kamillis, MW_pyrona, MV_pyrona, MW_hagaton, MV_hagaton, MW_ophin, MV_ophin, MW_hal, MV_hal, MW_spaceman, MV_spaceman; // view matrices
var cube, skybox, quaoar, kamillis, pyrona, hagaton, ophin, hal, spaceman;

var axys = 4.75;
var quaoar_pos = new vec3(-15,10, 40);
var kamillis_pos = new vec3(-40,-25,-40);
var pyrona_pos = new vec3(30,-axys,0);
var hagaton_pos = new vec3(25,30,-35);
var ophin_pos = new vec3(0,-axys,0);
var hal_pos = new vec3(45,-axys,0);
var spaceman_pos = new vec3(0, 0, 0);


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

	spaceman = new spaceman_drawer()
	quaoar = new planet_drawer();
	kamillis = new planet_drawer();
	pyrona = new planet_drawer();
	hagaton = new planet_drawer();
	ophin = new planet_drawer();
	hal = new planet_drawer();

	image_loader("http://0.0.0.0:8000/quaoar_texture.png", quaoar, 1);
	image_loader("http://0.0.0.0:8000/kamillis_texture.png", kamillis, 2);
	image_loader("http://0.0.0.0:8000/pyrona_texture.png", pyrona, 3);
	image_loader("http://0.0.0.0:8000/hagaton_texture.png", hagaton, 4);
	image_loader("http://0.0.0.0:8000/ophin_texture.png", ophin, 5);
	image_loader("http://0.0.0.0:8000/hal_texture.png", hal, 6);
	image_loader("http://0.0.0.0:8000/spaceman_texture.png", spaceman, 7);
	
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
	light_mvp = m_mult(perspectiveMatrix, trans(1.0, pyrona_pos)); 
	
	/*MVP1 = m_mult(perspectiveMatrix, CV);
	MVP2 = m_mult(perspectiveMatrix, m_mult(CV, [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		2,0,0,1
	]));*/
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

function shadowMap_init()
{
	depth_program = program_init(depth_vs, depth_fs);

	gl.useProgram(depth_program)
	depth_texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, depth_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, depth_texture_size, depth_texture_size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	depth_frame_buffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depth_frame_buffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth_texture, 0);
}

function shadowMap_draw()
{
	//pass ligth_mvp
}

function DrawScene()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.clearColor(0.9,0.9,0.9,1);
	
	var perspectiveMatrix = ProjectionMatrix();
	CV  = trans(1, camera_angle, camera_position);
	MVP1 = m_mult(perspectiveMatrix, CV);

	var spaceman_rot = new vec3(0,deg2rad*90,0);
	MW_spaceman = trans(0.2, spaceman_rot, spaceman_pos);
	MV_spaceman = m_mult(CV, MW_spaceman);

	MW_quaoar =  trans(2 ,new vec3(0,0,0), quaoar_pos);
	MV_quaoar = m_mult(CV, MW_quaoar);
	
	MW_kamillis = trans(2 ,new vec3(0,0,0), kamillis_pos);
	MV_kamillis = m_mult(CV, MW_kamillis);

	MW_pyrona = trans(5 ,new vec3(0,0,0), pyrona_pos);
	MV_pyrona = m_mult(CV, MW_pyrona);

	MW_hagaton = trans(2.5 ,new vec3(0,0,0), hagaton_pos);
	MV_hagaton = m_mult(CV, MW_hagaton);

	MW_ophin = trans(5 ,new vec3(0,0,0), ophin_pos);
	MV_ophin = m_mult(CV, MW_ophin);

	MW_hal = trans(5, new vec3(0,0,0), hal_pos);
	MV_hal = m_mult(CV, MW_hal);
	
	
	quaoar.set_light(calculate_dir(pyrona_pos, quaoar_pos), 500);
	kamillis.set_light(calculate_dir(pyrona_pos, kamillis_pos), 50);
	hagaton.set_light(calculate_dir(pyrona_pos, hagaton_pos), 500);
	ophin.set_light(calculate_dir(pyrona_pos, ophin_pos), 100);
	hal.set_light(calculate_dir(pyrona_pos, hal_pos), 500);
	spaceman.set_light(calculate_dir(pyrona_pos, spaceman_pos), 1000);

	//cube.draw(MVP1);
	skybox.draw(m_mult(perspectiveMatrix, m_mult(CV, trans(100))));
	spaceman.draw(m_mult(perspectiveMatrix, MV_spaceman), MW_spaceman, normal_transformation_matrix(MW_spaceman));
	quaoar.draw(m_mult(perspectiveMatrix, MV_quaoar), MW_quaoar, normal_transformation_matrix(MW_quaoar));
	kamillis.draw(m_mult(perspectiveMatrix, MV_kamillis), MW_kamillis, normal_transformation_matrix(MW_kamillis));
	pyrona.draw(m_mult(perspectiveMatrix, MV_pyrona), MW_pyrona, normal_transformation_matrix(MW_pyrona));
	hagaton.draw(m_mult(perspectiveMatrix, MV_hagaton), MW_hagaton, normal_transformation_matrix(MW_hagaton));
	ophin.draw(m_mult(perspectiveMatrix, MV_ophin), MW_ophin, normal_transformation_matrix(MW_ophin));
	hal.draw(m_mult(perspectiveMatrix, MV_hal), MW_hal, normal_transformation_matrix(MW_hal));
}
