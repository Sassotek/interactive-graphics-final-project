function program_init(vertex_shader_text , fragment_shader_text)
{
    virtualS = gl.createShader(gl.VERTEX_SHADER);
    fragmentS = gl.createShader(gl.FRAGMENT_SHADER);
            
    gl.shaderSource(virtualS, vertex_shader_text);
    gl.shaderSource(fragmentS, fragment_shader_text);
    
    gl.compileShader(virtualS);
    gl.compileShader(fragmentS);
    
    if(!gl.getShaderParameter(virtualS, gl.COMPILE_STATUS)){
        console.error('Error compiling shader', gl.getShaderInfoLog(virtualS));
        }
    if(!gl.getShaderParameter(fragmentS, gl.COMPILE_STATUS)){
        console.error('Error compiling shader', gl.getShaderInfoLog(fragmentS));
        }
            
    prog = gl.createProgram();
    gl.attachShader(prog, virtualS);
    gl.attachShader(prog, fragmentS);
    
    gl.linkProgram(prog);
            
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(this.prog));
        return;
    }
    gl.validateProgram(prog);
    if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(this.prog));
        return;
    }

    return prog;
}

function obj_loader(url)
{
    var result = null;
    var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() 
    {
		if (this.readyState == 4 && this.status == 200) 
            {
                result = xmlhttp.responseText;
            }
    }

    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    return result;
}

function obj_parser(obj_data)
{

    var ver_pos = [];
    var faces = [];
    var tex_pos = [];
    var t_faces = [];
    var norm_pos = [];
    var n_faces = [];

    var lines = obj_data.split('\n');
    for ( var i=0; i<lines.length; ++i ) 
        {
            var line = lines[i].trim();
            var elem = line.split(/\s+/);
            switch ( elem[0][0] ) {
                case 'v':
                    switch ( elem[0].length ) 
                    {
                        case 1:
                            ver_pos.push( [ parseFloat(elem[1]), parseFloat(elem[2]), parseFloat(elem[3]) ] );
                            break;
                        case 2:
                            switch ( elem[0][1] ) 
                            {
                                case 't':
                                    tex_pos.push( [ parseFloat(elem[1]), parseFloat(elem[2]) ] );
                                    break;
                                case 'n':
                                    norm_pos.push( [ parseFloat(elem[1]), parseFloat(elem[2]), parseFloat(elem[3]) ] );
                                    break;
                            }
                            break;
                    }
                break;
                
                case 'f':
                    var f=[], tf=[], nf=[];
                    for ( var j=1; j<elem.length; ++j ) 
                        {
                            var ids = elem[j].split('/');
                            var vid = parseInt(ids[0]);
                            if ( vid < 0 ) vid = ver_pos.length + vid + 1;
                            f.push( vid - 1 );
                            if ( ids.length > 1 && ids[1] !== "" ) 
                                {
                                    var tid = parseInt(ids[1]);
                                    if ( tid < 0 ) tid = tex_pos.length + tid + 1;
                                    tf.push( tid - 1 );
                                }
                            if ( ids.length > 2 && ids[2] !== "" ) 
                                {
                                    var nid = parseInt(ids[2]);
                                    if ( nid < 0 ) nid = norm_pos.length + nid + 1;
                                    nf.push( nid - 1 );
                                }
                        }
                faces.push(f);
                if ( tf.length ) t_faces.push(tf);
                if ( nf.length ) n_faces.push(nf);
                break;
        }
    }

    var vertexBuffer = [];
    var textureBuffer = [];
    var normalBuffer = [];

    for (var i = 0; i < faces.length; ++i) 
        {
            if(faces[i].length < 3) continue;

            var f = faces[i];
            var tf = t_faces[i];
            var nf = n_faces[i];

            vertexBuffer.push(ver_pos[f[0]][0]);
            vertexBuffer.push(ver_pos[f[0]][1]);
            vertexBuffer.push(ver_pos[f[0]][2]);
            vertexBuffer.push(ver_pos[f[1]][0]);
            vertexBuffer.push(ver_pos[f[1]][1]);
            vertexBuffer.push(ver_pos[f[1]][2]);
            vertexBuffer.push(ver_pos[f[2]][0]);
            vertexBuffer.push(ver_pos[f[2]][1]);
            vertexBuffer.push(ver_pos[f[2]][2]);
            
            if(tf)
                {
                    textureBuffer.push(tex_pos[tf[0]][0]);
                    textureBuffer.push(tex_pos[tf[0]][1]);
                    textureBuffer.push(tex_pos[tf[1]][0]);
                    textureBuffer.push(tex_pos[tf[1]][1]);
                    textureBuffer.push(tex_pos[tf[2]][0]);
                    textureBuffer.push(tex_pos[tf[2]][1]);
                }

            if(nf)
                {
                    normalBuffer.push(norm_pos[f[0]][0]);
                    normalBuffer.push(norm_pos[f[0]][1]);
                    normalBuffer.push(norm_pos[f[0]][2]);
                    normalBuffer.push(norm_pos[f[1]][0]);
                    normalBuffer.push(norm_pos[f[1]][1]);
                    normalBuffer.push(norm_pos[f[1]][2]);
                    normalBuffer.push(norm_pos[f[2]][0]);
                    normalBuffer.push(norm_pos[f[2]][1]);
                    normalBuffer.push(norm_pos[f[2]][2]);
                }
            
            for(var j = 3; j<faces[i]; ++j)
                {
                    vertexBuffer.push(ver_pos[f[0]][0]);
                    vertexBuffer.push(ver_pos[f[0]][1]);
                    vertexBuffer.push(ver_pos[f[0]][2]);
                    vertexBuffer.push(ver_pos[f[j-1]][0]);
                    vertexBuffer.push(ver_pos[f[j-1]][1]);
                    vertexBuffer.push(ver_pos[f[j-1]][2]);
                    vertexBuffer.push(ver_pos[f[j]][0]);
                    vertexBuffer.push(ver_pos[f[j]][1]);
                    vertexBuffer.push(ver_pos[f[j]][2]);
                    
                    if(tf)
                        {
                            textureBuffer.push(tex_pos[tf[0]][0]);
                            textureBuffer.push(tex_pos[tf[0]][1]);
                            textureBuffer.push(tex_pos[tf[j-1]][0]);
                            textureBuffer.push(tex_pos[tf[j-1]][1]);
                            textureBuffer.push(tex_pos[tf[j]][0]);
                            textureBuffer.push(tex_pos[tf[j]][1]);
                        }

                    if(nf)
                        {
                            normalBuffer.push(norm_pos[f[0]][0]);
                            normalBuffer.push(norm_pos[f[0]][1]);
                            normalBuffer.push(norm_pos[f[0]][2]);
                            normalBuffer.push(norm_pos[f[j-1]][0]);
                            normalBuffer.push(norm_pos[f[j-1]][1]);
                            normalBuffer.push(norm_pos[f[j-1]][2]);
                            normalBuffer.push(norm_pos[f[j]][0]);
                            normalBuffer.push(norm_pos[f[j]][1]);
                            normalBuffer.push(norm_pos[f[j]][2]);
                        }
                }
        }

    return {vertex_buffer: vertexBuffer, texture_buffer: textureBuffer, normal_buffer: normalBuffer};
}


class cube_drawer
{
    constructor()
    {   
        //cube shape
        this.vertices = [                    
        // Front face
          0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        // Back face
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,

        // Top face
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,

        // Bottom face
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,

        // Right face
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,

        // Left face
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,


        ];

        this.colors = [
            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1,

            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1,
            
            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1,
            
            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1,

            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1,

            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
            0.3, 0.3, 0.3, 1

        ];

        var VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;

                attribute vec3 pos;
                attribute vec4 clr;

                varying vec4 f_clr;

                void main()
                {
                    gl_Position= mvp*vec4(pos,1.0);
                    f_clr = clr;
                }
            ` 
        var FragmentShaderText = `
                precision mediump float;

                varying vec4 f_clr;

                void main()
                {
                    gl_FragColor = f_clr;
                }      
            ` 
        this.prog = program_init(VertexShaderText, FragmentShaderText);
        gl.useProgram(this.prog);

        this.pos = gl.getAttribLocation(prog, 'pos');
        this.clr = gl.getAttribLocation(prog, 'clr');
        this.mvp = gl.getUniformLocation(prog, 'mvp');

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

    }


    draw(v_w)
    {
        this.num_triangles = this.vertices.length / 3;
        gl.useProgram(this.prog);
    
        gl.uniformMatrix4fv(this.mvp, false, v_w);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, gl.FALSE , 3* Float32Array.BYTES_PER_ELEMENT , 0);
        gl.enableVertexAttribArray(this.pos);
  
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.clr, 4, gl.FLOAT, gl.FALSE, 4* Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.clr);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length/3);
       
    }
    
}



class planet_drawer
{

    constructor(obj_url)
    {
        this.vertices = [];
        this.texture_c = [];
        this.normals = [];

        this.VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;

                attribute vec3 pos;
                attribute vec2 tex_coord;

                varying vec2 v_tex_coord;

                void main()
                {
                    gl_Position = mvp*vec4(pos,1);
                    v_tex_coord = tex_coord;
                }
            `;

        this.FragmentShaderText = `
                precision mediump float;

                uniform sampler2D sampler;
                uniform bool texture_set;

                varying vec2 v_tex_coord;

                void main()
                {
                    gl_FragColor = texture2D(sampler, v_tex_coord);
                }
            `;
        
        this.prog = program_init(this.VertexShaderText, this.FragmentShaderText);
        gl.useProgram(this.prog);

        this.obj_string = obj_loader(obj_url);
        this.obj_data = obj_parser(this.obj_string);
        this.vertices = this.obj_data.vertex_buffer;
        this.texture_c = this.obj_data.texture_buffer;
        this.normals = this.obj_data.normal_buffer;

        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.tex_coord = gl.getAttribLocation(this.prog, 'tex_coord');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');

        this.sampler = gl.getUniformLocation(this.prog, 'sampler');
        this.texture_set = gl.getUniformLocation(this.prog, 'texture_set');

          
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_c), gl.STATIC_DRAW);
        
        this.texture = gl.createTexture();
        gl.uniform1i(this.texture_set, false);

        this.normalsBuffer = gl.createBuffer(); 
    }

    set_texture(img)
    {
        gl.useProgram(this.prog);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        
        gl.uniform1i(this.sampler, 0);
        gl.uniform1i(this.texture_set, true);
    }

    draw(m_v)
    {    
        gl.useProgram(this.prog);
        this.num_triangles = this.vertices.length / 3;
    
        gl.uniformMatrix4fv(this.mvp, false, m_v);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0 ,0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
		gl.vertexAttribPointer(this.tex_coord, 2, gl.FLOAT, false, 0 ,0);
		gl.enableVertexAttribArray(this.tex_coord);

        gl.drawArrays(gl.TRIANGLES, 0, this.num_triangles);

    }
}


class skybox_drawer
{
    constructor()
    {
        var VertexShaderText = `
                precision mediump float;

               
            `;
        var FragmentShaderText = `
                precision mediump float;

                varying vec4 f_clr;

            `;
    }
}