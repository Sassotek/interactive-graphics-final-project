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

document.addEventListener("DOMContentLoaded", function() 
{
    Init();
    
    canvas.addEventListener("wheel" , eventHandler);
    canvas.addEventListener("mousedown", eventHandler);
    canvas.addEventListener("mouseup", eventHandler);
    canvas.addEventListener("mousemove", eventHandler);
});

function WindowResize()
{
	UpdateCanvasSize();
    UpdateTransformations();
	DrawScene();
}

window.addEventListener("resize", WindowResize);