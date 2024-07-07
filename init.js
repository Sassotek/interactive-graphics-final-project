var canvas, gl;
var cam_z = 5;
var camera_position = new vec3(0,0,-cam_z);
var camera_angle = new vec3(45,45,0);
camera_angle.mult(deg2rad);

var light_position;
var light_angles = [new vec3(0,90,0), new vec3(0,-90,0),  new vec3(90,0,0), new vec3(-90,0,0), new vec3(0,0,0), new vec3(0,180,0)];

var CV, LV, MVP1, MW_quaoar, MV_quaoar, MW_kamillis, MV_kamillis, MW_pyrona, MV_pyrona, MW_hagaton, MV_hagaton, MW_ophin, MV_ophin, MW_hal, MV_hal, MW_spaceman, MV_spaceman; // view matrices
var LVs;
var cube, skybox, quaoar, kamillis, pyrona, hagaton, ophin, hal, spaceman;

var axys = 4.75;
var quaoar_pos = new vec3(-15,10, 40);
var kamillis_pos = new vec3(-40,-25,-40);
var pyrona_pos = new vec3(30,-axys,0);
var hagaton_pos = new vec3(25,30,-35);
var ophin_pos = new vec3(0,-axys,0);
var hal_pos = new vec3(30,-axys, 15);
var spaceman_pos = new vec3(0, 0, 0);
//var spaceman_pos = new vec3(36, -5, 0);

light_position = pyrona_pos;


function initWebGL()
{
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) 
        {
		    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		    return;
	    }
}

function Init()
{

	// Initialize the WebGL canvas
	canvas = document.getElementById("scene");
	
	initWebGL();
	ShadowMapInit();

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
	UpdateTransformations();
	ShadowMapSet();
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
	CV = trans(1, camera_angle, camera_position);
	LV_positive_x = trans(1, light_angles[0], light_position);
	LV_negative_x = trans(1, light_angles[1], light_position);
	LV_positive_y = trans(1, light_angles[2], light_position);
	LV_negative_y = trans(1, light_angles[3], light_position);
	LV_positive_z = trans(1, light_angles[4], light_position);
	LV_negative_z = trans(1, light_angles[5], light_position);

	LVs = [LV_positive_x, LV_negative_x, LV_positive_y, LV_negative_y, LV_positive_z, LV_negative_z];
}

function UpdateTransformations()
{
	
	var spaceman_rot = new vec3(0, deg2rad*90,0);

	MW_spaceman = trans(0.2, spaceman_rot, spaceman_pos);
	MV_spaceman = m_mult(CV, MW_spaceman);
	

	MW_quaoar =  trans(2 ,new vec3(0,0,0), quaoar_pos);
	MV_quaoar = m_mult(CV, MW_quaoar);
	//MV_quaoar = m_mult(LV, MW_quaoar);
	
	MW_kamillis = trans(2 ,new vec3(0,0,0), kamillis_pos);
	MV_kamillis = m_mult(CV, MW_kamillis);
	//MV_kamillis = m_mult(LV, MW_kamillis);


	MW_pyrona = trans(5 ,new vec3(0,0,0), pyrona_pos);
	MV_pyrona = m_mult(CV, MW_pyrona);
	//MV_pyrona = m_mult(LV, MW_pyrona);

	MW_hagaton = trans(2.5 ,new vec3(0,0,0), hagaton_pos);
	MV_hagaton = m_mult(CV, MW_hagaton);
	//MV_hagaton = m_mult(LV, MW_hagaton);

	MW_ophin = trans(5 ,new vec3(0,0,0), ophin_pos);
	MV_ophin = m_mult(CV, MW_ophin);
	//MV_ophin = m_mult(LV, MW_ophin);

	MW_hal = trans(5, new vec3(0,0,0), hal_pos);
	MV_hal = m_mult(CV, MW_hal);
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
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clearColor(0.9, 0.9, 0.9, 1);
	ShadowMapDraw();
	DrawSkybox();
	ObjectsDraw();
}

function DrawSkybox()
{
	var perspectiveMatrix = ProjectionMatrix();
	skybox.draw(m_mult(perspectiveMatrix, m_mult(CV, trans(100))));
}

function ObjectsDraw()
{
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,1);

	var perspectiveMatrix = ProjectionMatrix();
	
	quaoar.set_light(calculate_dir(pyrona_pos, quaoar_pos), 500);
	kamillis.set_light(calculate_dir(pyrona_pos, kamillis_pos), 50);
	hagaton.set_light(calculate_dir(pyrona_pos, hagaton_pos), 500);
	ophin.set_light(calculate_dir(pyrona_pos, ophin_pos), 100);
	hal.set_light(calculate_dir(pyrona_pos, hal_pos), 500);
	spaceman.set_light(calculate_dir(pyrona_pos, spaceman_pos), 1000);

	spaceman.draw(m_mult(perspectiveMatrix, MV_spaceman), MW_spaceman, normal_transformation_matrix(MW_spaceman));
	quaoar.draw(m_mult(perspectiveMatrix, MV_quaoar), MW_quaoar, normal_transformation_matrix(MW_quaoar));
	kamillis.draw(m_mult(perspectiveMatrix, MV_kamillis), MW_kamillis, normal_transformation_matrix(MW_kamillis));
	pyrona.draw(m_mult(perspectiveMatrix, MV_pyrona), MW_pyrona, normal_transformation_matrix(MW_pyrona));
	hagaton.draw(m_mult(perspectiveMatrix, MV_hagaton), MW_hagaton, normal_transformation_matrix(MW_hagaton));
	ophin.draw(m_mult(perspectiveMatrix, MV_ophin), MW_ophin, normal_transformation_matrix(MW_ophin));
	hal.draw(m_mult(perspectiveMatrix, MV_hal), MW_hal, normal_transformation_matrix(MW_hal));
}