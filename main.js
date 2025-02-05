var canvas, gl, ext, checkbox_shadowmap, checkbox_mix, slider_velocity, slider_value;
var cam_z = 20;
var camera_position = new vec3(0,0,-cam_z);
var fp_camera_position = new vec3(0,-1,0);
var camera_angle = new vec3(20, 45,0);
camera_angle.mult(deg2rad);

var light_position;
var light_angles = [new vec3(0.0, 90.0, 0.0), new vec3(0.0, -90.0, 0.0),  new vec3(-90.0 ,0.0, 0.0), 
					new vec3(90.0, 0.0,0.0), new vec3(0.0, 0.0, 0.0), new vec3(0.0, 180.0, 0.0) ];
light_angles.forEach(vec =>{
	vec.mult(deg2rad);
});
var	light_position_V;
var CV, LV, MVP1, MW_quaoar, MV_quaoar, MW_kamillis, MV_kamillis, MW_pyrona, MV_pyrona, MW_hagaton, MV_hagaton, MW_ophin, MV_ophin, MW_hal, MV_hal, MW_spaceman, MV_spaceman; // view matrices
var MW_pyrona1, MW_pyrona2, MW_hal1, MW_hal2;
var pyrona_rot1, pyrona_rot2, hal_rot1, hal_rot2;
var LVs;
var cube1, cube2, skybox, quaoar, kamillis, pyrona, hagaton, ophin, hal, spaceman;

var quaoar_pos;
var kamillis_pos;
var pyrona_pos;
var hagaton_pos;
var ophin_pos;
var hal_pos;
var spaceman_pos;

var axys = 10;

var then = 0;
var velocity = 1;
var first_person = 0;
var animation_orizzontal;
var animation_vertical;

function initWebGL()
{
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) 
        {
		    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		    return;
	    }
}

function initVariables()
{
	quaoar_pos = new vec3(-15,10, 50);
	kamillis_pos = new vec3(-60,-25,-40);
	pyrona_pos = new vec3(45.0,-axys,0.0);
	hagaton_pos = new vec3(60,40,-35);
	ophin_pos = new vec3(0,-axys,0);
	hal_pos = new vec3(15, 0, 0);
	spaceman_pos = new vec3(0, -0.27, 0);

	pyrona_rot1 = new vec3(0, 0, 0);
	pyrona_rot2 = new vec3(0, 0, 0);
	hal_rot1 = new vec3(0, 0, 0);
	hal_rot2 = new vec3(0, 0, 0);

	InitWorld();

	light_position = new vec3(-pyrona_pos.x, -pyrona_pos.y, -pyrona_pos.z);
	light_position_V = [pyrona_pos.x, pyrona_pos.y, pyrona_pos.z];

	animation_orizzontal = 0;
	animation_vertical = 0; 
}

function Init()
{

	// Initialize the WebGL canvas
	canvas = document.getElementById("scene");
	checkbox_shadowmap = document.getElementById("shadowmap");
	checkbox_shadowmap.checked = true;

	checkbox_mix = document.getElementById("mix");
	checkbox_mix.checked = true;

	slider_velocity = document.getElementById("slider_velocity");

	slider_value = document.getElementById("slider_value");
	
	initVariables();
	initWebGL();
	
	// Initialize settings
	gl.clearColor(0.9, 0.9, 0.9, 1);
	gl.enable(gl.DEPTH_TEST);
	
	// Initialize the programs and buffers for drawing
	cube1 = new cube_drawer();
	cube2 = new cube_drawer();
	//skybox = new skybox_drawer();

	spaceman = new spaceman_drawer()
	quaoar = new planet_drawer();
	kamillis = new planet_drawer();
	pyrona = new planet_drawer();
	hagaton = new planet_drawer();
	ophin = new planet_drawer();
	hal = new planet_drawer();

	objs = [quaoar, kamillis, hagaton, ophin, hal, spaceman];
	toggle_shadowmap(1);

	image_loader("http://0.0.0.0:8000/quaoar_texture.png", quaoar, 1);
	image_loader("http://0.0.0.0:8000/kamillis_texture.png", kamillis, 2);
	image_loader("http://0.0.0.0:8000/pyrona_texture.png", pyrona, 3);
	image_loader("http://0.0.0.0:8000/hagaton_texture.png", hagaton, 4);
	image_loader("http://0.0.0.0:8000/ophin_texture.png", ophin, 5);
	image_loader("http://0.0.0.0:8000/hal_texture.png", hal, 6);
	image_loader("http://0.0.0.0:8000/spaceman_texture.png", spaceman, 7);
	
	UpdateCanvasSize();
	UpdateTransformations();
	ShadowMapInit();
	requestAnimationFrame(animate);
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

function ProjectionMatrix(cw = canvas.width, ch = canvas.height, fov_angle=90 )
{
	var r = cw / ch;
	var n = 0.1;
	var f = 100;
	var fov = deg2rad * fov_angle;
	var tang = Math.tan( fov/2 );
	var s = 1 / tang;
	return [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(n-f), -1,
		0, 0, 2*n*f/(n-f), 0
	];
}

function UpdateViewMatrices()
{
	light_position = new vec3(-pyrona_pos.x, -pyrona_pos.y, -pyrona_pos.z);
	light_position_V = [pyrona_pos.x, pyrona_pos.y, pyrona_pos.z];

	if(first_person == 0)
		{
			CV = trans(1, camera_angle, camera_position);
		}
	
	else if(first_person == 1)
		{
			CV = trans_(1, camera_angle, fp_camera_position);
		}
	
	var LV_positive_x = trans_(1.0, light_angles[0], light_position);
	var LV_negative_x = trans_(1.0, light_angles[1], light_position);
	var LV_positive_y = trans_(1.0, light_angles[2], light_position);
	var LV_negative_y = trans_(1.0, light_angles[3], light_position);
	var LV_positive_z = trans_(1.0, light_angles[4], light_position);
	var LV_negative_z = trans_(1.0, light_angles[5], light_position);

	LVs = [LV_positive_x, LV_negative_x, LV_positive_y, LV_negative_y, LV_positive_z, LV_negative_z];
}

function InitWorld()
{
	var spaceman_rot = new vec3(0,90*deg2rad,0);
	MW_spaceman = trans(0.5, spaceman_rot, spaceman_pos);
	MW_quaoar =  trans(2 ,new vec3(0,0,0), quaoar_pos);
	MW_kamillis = trans(2 ,new vec3(0,0,0), kamillis_pos);
	MW_hagaton = trans(2.5 ,new vec3(0,0,0), hagaton_pos);
	MW_ophin = trans(10 ,new vec3(0,0,0), ophin_pos);
	
	MWs = [MW_quaoar, MW_kamillis, MW_hagaton, MW_ophin, MW_hal, MW_spaceman];

	UpdateWorld();
}

function UpdateTransformations()
{
	MV_spaceman = m_mult(CV, MW_spaceman);
	MV_quaoar = m_mult(CV, MW_quaoar);
	MV_kamillis = m_mult(CV, MW_kamillis);
	MV_pyrona = m_mult(CV, MW_pyrona);	
	MV_hagaton = m_mult(CV, MW_hagaton);
	MV_ophin = m_mult(CV, MW_ophin);
	MV_hal = m_mult(CV, MW_hal);
}

function UpdateWorld()
{
	var temp = trans(7);
	MW_pyrona1 = m_mult(trans(1, pyrona_rot1, new vec3(0, 0, 0)), temp);
	MW_pyrona2 = trans_(1 ,pyrona_rot2, pyrona_pos);
	MW_pyrona = m_mult(MW_pyrona2, MW_pyrona1);

	var temp = trans(5);
	MW_hal1 = m_mult(trans(1, hal_rot1, hal_pos), temp);
	MW_hal2 = trans_(1, hal_rot2, pyrona_pos);
	MW_hal = m_mult(MW_hal2, MW_hal1);


	MWs[4] = MW_hal;
}

function UpdateTransformationsSpecial()
{
	MV_pyrona = m_mult(CV, MW_pyrona);	
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
	//DrawSkybox();
	//DrawTestCube();
	ShadowMapDraw();
	ObjectsDraw();
}

function DrawSkybox()
{
	var perspectiveMatrix = ProjectionMatrix();
	skybox.draw(m_mult(perspectiveMatrix, m_mult(CV, trans(100))));
}

function DrawTestCube()
{
	gl.clearColor(0, 0, 0, 1);
	var cube_pos1 = new vec3(-35,-axys,-0);
	var cube_pos2 = new vec3(25,-axys, 4);
	var pers = ProjectionMatrix();

	var cube1_MW = trans(10, new vec3(0,0,0), cube_pos1);
	var cube2_MW = trans(1, new vec3(0,0,0), cube_pos2);

	var L = LVs[1];
	//var L = CV;


	cube1.draw(cube1_MW, L, pers, light_position_V); 
	cube2.draw(cube2_MW, L, pers, light_position_V);
}

function ObjectsDraw()
{
	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(0.0, 0.0, 0.05, 1);

	var perspectiveMatrix = ProjectionMatrix(canvas.width, canvas.height, 60);
	
	quaoar.set_light(calculate_dir(pyrona_pos, quaoar_pos), 500);
	kamillis.set_light(calculate_dir(pyrona_pos, kamillis_pos), 50);
	hagaton.set_light(calculate_dir(pyrona_pos, hagaton_pos), 500);
	ophin.set_light(calculate_dir(pyrona_pos, ophin_pos), 100);
	var length = new vec3(MW_hal[12], MW_hal[13], MW_hal[14]);
	hal.set_light(calculate_dir(pyrona_pos, length), 500);
	spaceman.set_light(calculate_dir(pyrona_pos, spaceman_pos), 1000);

	quaoar.draw(m_mult(perspectiveMatrix, MV_quaoar), MW_quaoar, normal_transformation_matrix(MW_quaoar));
	kamillis.draw(m_mult(perspectiveMatrix, MV_kamillis), MW_kamillis, normal_transformation_matrix(MW_kamillis));
	pyrona.draw(m_mult(perspectiveMatrix, MV_pyrona), MW_pyrona, normal_transformation_matrix(MW_pyrona));
	hagaton.draw(m_mult(perspectiveMatrix, MV_hagaton), MW_hagaton, normal_transformation_matrix(MW_hagaton));
	ophin.draw(m_mult(perspectiveMatrix, MV_ophin), MW_ophin, normal_transformation_matrix(MW_ophin));
	hal.draw(m_mult(perspectiveMatrix, MV_hal), MW_hal, normal_transformation_matrix(MW_hal));
	if(!first_person)
		{
			spaceman.draw(m_mult(perspectiveMatrix, MV_spaceman), MWs[5], normal_transformation_matrix(MW_spaceman));
		}
}

function animate(now)
{
	if(animation_orizzontal || animation_vertical)
		{
			requestAnimationFrame(animate);
		}

	now*= 0.001;
	var dt = now-then;
	
	if(animation_orizzontal)
		{
			var angle = velocity*dt*deg2rad;
			var pyrona_rotation_matrix = normal_transformation_matrix(trans(1, new vec3(0, angle,0), new vec3(0, 0, 0)));
			pyrona_pos.m_prod(pyrona_rotation_matrix);
			pyrona_rot1.y -= angle;
			var hal_rotation_matrix = normal_transformation_matrix(trans(1, new vec3(0, -angle,0), new vec3(0, 0, 0)));
			hal_pos.m_prod(hal_rotation_matrix);
			hal_rot1.y += -angle;
			//console.log("orizzontal");
			UpdateViewMatrices();
    		UpdateWorld();
			UpdateTransformationsSpecial();
		}
	
	if(animation_vertical)
		{
			var angle = velocity*dt*deg2rad;
			var rotation_matrix = normal_transformation_matrix(trans(1, new vec3(0, 0, angle), new vec3(0, 0, 0)));
			pyrona_pos.m_prod(rotation_matrix);
			var hal_rotation_matrix = normal_transformation_matrix(trans(1, new vec3(0, 0, -angle), new vec3(0, 0, 0)));
			hal_pos.m_prod(hal_rotation_matrix);
			//console.log("vertical");
			UpdateViewMatrices();
    		UpdateWorld();
			UpdateTransformationsSpecial();
		}
	
	then = now;
	DrawScene();

}