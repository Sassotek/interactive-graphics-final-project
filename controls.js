var isMouseDown = false;
var cx;
var cy;
var viewRotX;
var viewRotZ;



canvas_zoom = function( s ) 
{
	camera_position.z *= s/canvas.height + 1;
    //if(camera_position.z < -10) camera_position.z = -10;

	UpdateViewMatrices();
    UpdateTransformations();
	DrawScene();
}

function eventHandler(event)
{
    switch(event.type)
    {
        case "wheel":
            canvas_zoom(0.3*event.deltaY);
            break;
        case "mousedown":
            //console.log("mouse down");
            cx = event.clientX;
            cy = event.clientY;
            isMouseDown = true;
            break;

        case "mouseup":
            //console.log("mouse up");
            isMouseDown = false; 
            break;

        case "mousemove":
            if(isMouseDown)
                {
                    //console.log("mouse move");
                    coord = [(cy - event.clientY)/canvas.height*5, (cx - event.clientX)/canvas.width*5, 0];
                    camera_angle.sum(coord);
                    cx = event.clientX;
                    cy = event.clientY;
                    UpdateViewMatrices();
                    UpdateTransformations();
                    DrawScene();
                }
            break;
    }
}

function WindowResize()
{
	UpdateCanvasSize();
    UpdateTransformations();
	DrawScene();
}


function ShowControls()
{
	var c = document.getElementById('controls_group');
	c.style.display = c.style.display == 'none' ? '' : 'none';
}

function toggle_fp()
{
    if(first_person  == 1) first_person = 0;
    else if(first_person  == 0) first_person = 1;
    
    UpdateViewMatrices();
    UpdateTransformations();
	DrawScene();
}

function use_reset()
{
    initVariables();
    UpdateViewMatrices();
    UpdateTransformations();
	DrawScene();
}

function use_shadowmap()
{
    
    if(checkbox_shadowmap.checked == true)
    {
        toggle_shadowmap(true);
    }

    if(checkbox_shadowmap.checked == false)
    {
        toggle_shadowmap(false);
    }   

    DrawScene();
}

function use_mix()
{
    if(checkbox_mix.checked == true)
        {
            toggle_mix(true);
        }
    
    else if(checkbox_mix.checked == false)
        {
            toggle_mix(false);
        }
    
    DrawScene();
}

document.addEventListener("DOMContentLoaded", function() 
{
    Init();
    
    window.addEventListener("resize", WindowResize);
    canvas.addEventListener("wheel" , eventHandler);
    canvas.addEventListener("mousedown", eventHandler);
    canvas.addEventListener("mouseup", eventHandler);
    canvas.addEventListener("mousemove", eventHandler);
});

