class triangle_drawer
{
    constructor()
    {
        this.vertices = [        
            0.0, 0.5,   
            -0.5, -0.5,  
            0.5, -0.5,   
        ];
        
        this.colors = [
            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
        ];

        this.VertexShaderText = `
        precision mediump float;
        
        attribute vec2 vertPosition;
        attribute vec3 vertColor;
        uniform mat4 mat;
        varying vec3 fragColor;
        
        void main()
        {
        fragColor = vertColor;
        gl_Position = mat*vec4(vertPosition, 0.0, 1.0);
        }
       `

        this.FragmentShaderText = `
        precision mediump float;
        
        varying vec3 fragColor;
        void main()
        {
          gl_FragColor = vec4(fragColor, 1.0);
        }
     `
    this.prog = program_init(this.VertexShaderText,this.FragmentShaderText);
    gl.useProgram(this.prog);

    this.positionAttribLocation = gl.getAttribLocation(prog, 'vertPosition');
	this.colorAttribLocation = gl.getAttribLocation(prog, 'vertColor');
    this.matrix = gl.getUniformLocation(prog , 'mat');
    
    this.triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.colorBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	
    }

    draw(proj)
    {
        gl.useProgram(prog);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexBufferObject);

        gl.vertexAttribPointer(
            this.positionAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferObject);
        gl.vertexAttribPointer(
            this.colorAttribLocation, // Attribute location
            4, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            4 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );
        
        gl.enableVertexAttribArray(this.positionAttribLocation);
        gl.enableVertexAttribArray(this.colorAttribLocation);
    
        gl.drawArrays(gl.TRIANGLES, 0, 3);

    }

}

function load_url(filePath, type)
{
    return new Promise((resolve,reject)=>
        {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", filePath, true);
            
            if(type == "img") xmlhttp.responseType = 'blob';
            else if(type == "txt")  xmlhttp.responseType = 'text';

            xmlhttp.onload = function () 
            {
                if (xmlhttp.status === 200) 
                    {
                        //console.log(xmlhttp.response);
                        resolve(xmlhttp.response);
                    } 
                else 
                    {
                        reject(new Error('Image didn\'t load successfully; error code:' + xmlhttp.statusText));
                    }
            };
            
            xmlhttp.onerror = function()
            {
                reject(new Error("Network error."));
            };
        
            xmlhttp.send();
        });
}

function resource_searcher(obj_url,img_url)
{
    obj_string;
    tex_img = new Image();

    obj_file = load_url(obj_url, "txt").then(text =>{
        obj_string = text;
        }).catch(error => {console.log("Error loading obj:", error)});

    //this.tex_file = load_url("http://0.0.0.0:8000/quaoar_texture.png", "img").then(blob =>{
    tex_file = load_url(img_url, "img").then(blob =>{
        var imageURL = URL.createObjectURL(blob);
        tex_img.src = imageURL;
        }).catch(error => {console.log("Error loading texture:", error)});
    
    Promise.all([obj_file, tex_file]).then(() => {
        tex_img.onload = () =>
        {
            /*obj_data = obj_loader(obj_string);
            vertices = obj_data.vertex_buffer;
            texture_c = obj_data.texture_buffer;
            normals = obj_data.normal_buffer;*/
            return obj_string, tex_img;
        };
    }).catch(error => {
        console.error("Error initializing WebGL:", error);
    });
}