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

class skybox_drawer
{
    constructor()
    {
        this.VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;

                attribute vec3 pos;

                varying vec3 v_tex_coord;

                void main()
                {
                    gl_Position = mvp * vec4(pos, 1.0);
                    v_tex_coord = pos;
                }
            `;

        this.FragmentShaderText = `
                precision mediump float;

                uniform samplerCube sampler;
                uniform bool texture_set;

                varying vec3 v_tex_coord;

                void main()
                {
                    if(texture_set)
                    {
                        gl_FragColor = textureCube(sampler, v_tex_coord);
                    }
                    else
                    {
                        gl_FragColor = vec4(0, 0, 0, 1);
                    }
                }
            `;

        this.prog = program_init(this.VertexShaderText, this.FragmentShaderText);
        gl.useProgram(this.prog);

        this.vertices = [
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,

            -1.0, -1.0,  1.0,
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0,

             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,

            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0
        ];

        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.sampler = gl.getUniformLocation(this.prog, 'sampler');
        this.texture_set = gl.getUniformLocation(this.prog, 'texture_set');

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        gl.uniform1i(this.texture_set, false);

        gl.activeTexture(gl.TEXTURE0);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

        const faceInfos = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'http://0.0.0.0:8000/sky_texture.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'http://0.0.0.0:8000/sky_texture.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'http://0.0.0.0:8000/sky_texture.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'http://0.0.0.0:8000/sky_texture.png' },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'http://0.0.0.0:8000/sky_texture.png' },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'http://0.0.0.0:8000/sky_texture.png' },
        ];

        faceInfos.forEach((faceInfo) => {
            const { target, url } = faceInfo;
            gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            const image = new Image();
            image.src = url;
            image.crossOrigin = "anonymous";
            image.addEventListener('load', () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.uniform1i(this.sampler, 0);
        gl.uniform1i(this.texture_set, true);
    }

    draw(m_v)
    {
        gl.useProgram(this.prog);
        this.num_triangles = this.vertices.length / 3;

        gl.uniformMatrix4fv(this.mvp, false, m_v);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.pos);

        gl.drawArrays(gl.TRIANGLES, 0, this.num_triangles);
    }
}

function InitEnvironmentMap()
{
	const environment_texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, environment_texture);

	const env_url = 'http://0.0.0.0:8000/sky_texture.png';

	const faceInfos = [
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
		  url: 'http://0.0.0.0:8000/sky_texture.png',
		},
	];
	
	faceInfos.forEach((faceInfo) => 
		{
		const {target, url} = faceInfo;
		gl.texImage2D( target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		

		var image = new Image();
    	image.src = url;
		image.crossOrigin = "anonymous";
    	image.addEventListener('load', function() 
			{
			console.log(image.width);
			console.log(image.height);
		
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, environment_texture);
			gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			});
    	});

	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

/*function m_mult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[i*4+k] * B[j+k*4];
			}
			C.push(v);
		}
	}
	return C;
}

function trans(scale = 1, dir = vec3(0,0,0), pos = vec3(0,0,0)) //first scale, second rotation, then translation
{
    var t = [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
    
    if(dir.z != 0)
        {
            const Rz = [Math.cos(dir.z), -Math.sin(dir.z) , 0, 0,
                        Math.sin(dir.z), Math.cos(dir.z), 0 ,0,
                        0, 0, 1, 0,
                        0, 0, 0, 1];
            
            t = m_mult(Rz,t);

        }

    if(dir.y != 0)
        {
            const Ry = [Math.cos(dir.y), 0, Math.sin(dir.y), 0,
                        0, 1, 0, 0,
                        -Math.sin(dir.y), 0, Math.cos(dir.y), 0,
                        0, 0, 0, 1];
            
            t = m_mult(Ry,t);
        }

    if(dir.x != 0)
        {
            const Rx = [1, 0, 0, 0,
                        0, Math.cos(dir.x), -Math.sin(dir.x), 0,
                        0, Math.sin(dir.x), Math.cos(dir.x), 0,
                        0, 0, 0, 1];
            
            t = m_mult(Rx,t);
        }

    if(scale !=1)
        {
            const S = [scale,0,0,0,
                      0,scale,0,0,
                      0,0,scale,0,
                      0,0,0,1];
            
            t = m_mult(S,t);
        }
    
    const transf = [1,0,0, pos.x,
                    0,1,0,pos.y,
                    0,0,1,pos.z,
                    0,0,0,1,];
    
    t = m_mult(transf,t);

    return t;
}*/

//////////////////column major version/////////////////

/*MVP1 = m_mult(perspectiveMatrix, CV);
	MVP2 = m_mult(perspectiveMatrix, m_mult(CV, [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		2,0,0,1
	]));*/


    if(shadows_set)
        {
            for (int x = -1; x <= 1; x++) 
            {
                for (int y = -1; y <= 1; y++) 
                {
                    //float texelDepth = decodeFloat(texture2D(depth_sampler,frag_depth.xy + vec2(x, y)));
                    float texelDepth = decodeFloat(textureCube(depth_sampler,frag_depth.xy + vec2(x, y)));
                    if(frag_depth.z < texelDepth) 
                    {
                        intensity = 1.0;
                    }
                    else
                    {
                        intensity = 0.1;
                    }
                }
            }
        }




        if(shadows_set)
            {
                float bias = 0.007;
                vec3 ToLight = normalize(frag_positions - LightP);
                ToLight = vec3(b*vec4(ToLight, 1.0));
                shadowmap_value = textureCube(depth_sampler, ToLight).r;
                
                vec3 LightToFrag = (frag_positions - LightP);
    
                float lightFragDist = (length(LightToFrag) -0.1)/(100.0 - 0.1);
    
                if((shadowmap_value+bias)<= lightFragDist)
                {
                    intensity = 0.2;
                }
            }