canvas_zoom = function( s ) 
{
	camera_position.z *= s/canvas.height + 1;
	UpdateViewMatrices();
	DrawScene();
}

function eventHandler(event)
{
    var isMouseDown = false;
    var cx = event.clientx;
    var cy = event.clientY;
    switch(event.type)
    {
        case "wheel":
            canvas_zoom(0.3*event.deltaY);
            break;
        case "mousedown":
            console.log("mouse down");
            isMouseDown = true;
            console.log(isMouseDown);
            break;

        case "mouseup":
            console.log("mouse up");
            isMouseDown = false; 
            console.log(isMouseDown);
            break;

        case "mousemove":
            if(isMouseDown)
                {
                    console.log("mouse move");
                    coord = new vec3((cy - event.clientY)/canvas.height*5, (cx - event.clientX)/canvas.width*5, 0);
                    camera_angle.sum(coord);
                    cx = event.clientX;
                    cy = event.clientY;
                    UpdateViewMatrices();
                    DrawScene();
                }
            break;
    }
}

window.onload = function()
{
    InitWebGL();
    
    canvas.addEventListener("wheel" , eventHandler);
    canvas.addEventListener("mousedown", eventHandler);
    canvas.addEventListener("mouseup", eventHandler);
    canvas.addEventListener("mousemove", eventHandler);
}