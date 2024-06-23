var planet_string = obj_loader("http://0.0.0.0:8000/planet.obj");

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

function obj_parser(objdata) 
{
    var vpos = [];
    var tpos = [];
    var norm = [];
    var face = [];
    var tfac = [];
    var nfac = [];

    var lines = objdata.split('\n');

    lines.forEach(function(line) {
        var trimmedLine = line.trim();
        if (trimmedLine.startsWith('v ')) {
            var elements = trimmedLine.split(/\s+/);
            vpos.push([parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3])]);
        } else if (trimmedLine.startsWith('vt ')) {
            var elements = trimmedLine.split(/\s+/);
            tpos.push([parseFloat(elements[1]), parseFloat(elements[2])]);
        } else if (trimmedLine.startsWith('vn ')) {
            var elements = trimmedLine.split(/\s+/);
            norm.push([parseFloat(elements[1]), parseFloat(elements[2]), parseFloat(elements[3])]);
        } else if (trimmedLine.startsWith('f ')) {
            var elements = trimmedLine.split(/\s+/);
            var f = [];
            var tf = [];
            var nf = [];
            for (var i = 1; i < elements.length; ++i) {
                var ids = elements[i].split('/');
                var vid = parseInt(ids[0]);
                if (vid < 0) vid = vpos.length + vid + 1;
                f.push(vid - 1);
                if (ids.length > 1 && ids[1] !== "") {
                    var tid = parseInt(ids[1]);
                    if (tid < 0) tid = tpos.length + tid + 1;
                    tf.push(tid - 1);
                }
                if (ids.length > 2 && ids[2] !== "") {
                    var nid = parseInt(ids[2]);
                    if (nid < 0) nid = norm.length + nid + 1;
                    nf.push(nid - 1);
                }
            }
            face.push(f);
            if (tf.length) tfac.push(tf);
            if (nf.length) nfac.push(nf);
        }
    });

    function addTriangleToBuffers(vBuffer, tBuffer, nBuffer, fi, i, j, k) {
        var f = face[fi];
        var tf = tfac[fi];
        var nf = nfac[fi];
        addTriangleToBuffer(vBuffer, vpos, f, i, j, k, addVertToBuffer3);
        if (tf) {
            addTriangleToBuffer(tBuffer, tpos, tf, i, j, k, addVertToBuffer2);
        }
        if (nf) {
            addTriangleToBuffer(nBuffer, norm, nf, i, j, k, addVertToBuffer3);
        }
    }

    function addTriangleToBuffer(buffer, v, f, i, j, k, addVert) {
        addVert(buffer, v, f, i);
        addVert(buffer, v, f, j);
        addVert(buffer, v, f, k);
    }

    function addVertToBuffer3(buffer, v, f, i) {
        buffer.push(v[f[i]][0]);
        buffer.push(v[f[i]][1]);
        buffer.push(v[f[i]][2]);
    }

    function addVertToBuffer2(buffer, v, f, i) {
        buffer.push(v[f[i]][0]);
        buffer.push(v[f[i]][1]);
    }

    var vBuffer = [];
    var tBuffer = [];
    var nBuffer = [];

    for (var i = 0; i < face.length; ++i) {
        if (face[i].length < 3) continue;
        addTriangleToBuffers(vBuffer, tBuffer, nBuffer, i, 0, 1, 2);
        for (var j = 3; j < face[i].length; ++j) {
            addTriangleToBuffers(vBuffer, tBuffer, nBuffer, i, 0, j - 1, j);
        }
    }

    return {
        vertex_buffer: vBuffer,
        texture_buffer: tBuffer,
        normal_buffer: nBuffer
    };
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

    constructor()
    {
        this.vertices = [];
        this.texture_c = [];
        this.normals_data = [];

        this.VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;
                uniform mat4 mv;
                uniform mat3 ntm;

                attribute vec3 pos;
                attribute vec2 tex_coord;
                attribute vec3 normals;

                varying vec2 v_tex_coord;
                varying vec3 frag_normals;
                varying vec3 frag_positions;

                void main()
                {
                    gl_Position = mvp*vec4(pos,1);
                    frag_positions = vec3(mv*vec4(pos,1));
                    frag_normals = normalize(ntm*normals);
                    v_tex_coord = tex_coord;
                }
            `;

        this.FragmentShaderText = `
                precision mediump float;

                uniform sampler2D sampler;
                uniform bool texture_set;

                varying vec2 v_tex_coord;
                varying vec3 frag_normals;
                varying vec3 frag_positions;

                void main()
                {
                    vec3 amb_light_intesity = vec3(0.4, 0.4, 0.2);
                    vec3 main_light_intensity = vec3(0.9 , 0.9, 0.9);
                    vec3 light_direction = normalize(vec3(1.0, 4.0, 0.0));
                    
                    if(texture_set)
                    {
                        vec3 light_intensity = amb_light_intesity + main_light_intensity*max(dot(frag_normals, light_direction), 0.0);
                        //gl_FragColor = vec4(frag_normals, 1.0);
                        gl_FragColor = texture2D(sampler, v_tex_coord)* vec4(light_intensity,1);
                    }

                    else
                    {
                        gl_FragColor = vec4(frag_normals, 1.0);
                        //gl_FragColor = intensity*(lamb*vec4(1,0.1,0.5,1)+pow(specular, alpha)*vec4(1,1,1,1));
                    }
                }
            `;
        
        this.prog = program_init(this.VertexShaderText, this.FragmentShaderText);
        gl.useProgram(this.prog);

        
        this.obj_data = obj_parser(planet_string);
        this.vertices = this.obj_data.vertex_buffer;
        this.texture_c = this.obj_data.texture_buffer;
        this.normals_data = this.obj_data.normal_buffer;

        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.tex_coord = gl.getAttribLocation(this.prog, 'tex_coord');
        this.normals = gl.getAttribLocation(this.prog, 'normals');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.mv = gl.getUniformLocation(this.prog, 'mv');
        this.ntm = gl.getUniformLocation(this.prog, 'ntm');

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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals_data), gl.STATIC_DRAW);
    }

    set_texture(img , texture_unit)
    {
        gl.activeTexture(gl.TEXTURE0 + texture_unit);
        gl.useProgram(this.prog);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        
        gl.uniform1i(this.sampler, texture_unit);
        gl.uniform1i(this.texture_set, true);
        console.log("texture_set");
    }

    draw(m_p, m_w, n_w)
    {    
        gl.useProgram(this.prog);
        this.num_triangles = this.vertices.length / 3;
    
        gl.uniformMatrix4fv(this.mvp, false, m_p);
        gl.uniformMatrix4fv(this.mv, false, m_w);
        gl.uniformMatrix3fv(this.ntm, false, n_w);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, gl.FALSE, 0 ,0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
		gl.vertexAttribPointer(this.tex_coord, 2, gl.FLOAT, gl.FALSE, 0 ,0);
		gl.enableVertexAttribArray(this.tex_coord);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.vertexAttribPointer(this.normals, 3 ,gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(this.normals);

        gl.drawArrays(gl.TRIANGLES, 0, this.num_triangles);

    }
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
                    gl_Position = mvp*vec4(pos,1);
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
                    gl_FragColor = vec4(0,0,0,1);
                    }
                }
            `;

        this.prog = program_init(this.VertexShaderText, this.FragmentShaderText);
        gl.useProgram(this.prog);

        this.vertices =   [
            -0.5, -0.5,  -0.5,
            -0.5,  0.5,  -0.5,
             0.5, -0.5,  -0.5,
            -0.5,  0.5,  -0.5,
             0.5,  0.5,  -0.5,
             0.5, -0.5,  -0.5,
        
            -0.5, -0.5,   0.5,
             0.5, -0.5,   0.5,
            -0.5,  0.5,   0.5,
            -0.5,  0.5,   0.5,
             0.5, -0.5,   0.5,
             0.5,  0.5,   0.5,
        
            -0.5,   0.5, -0.5,
            -0.5,   0.5,  0.5,
             0.5,   0.5, -0.5,
            -0.5,   0.5,  0.5,
             0.5,   0.5,  0.5,
             0.5,   0.5, -0.5,
        
            -0.5,  -0.5, -0.5,
             0.5,  -0.5, -0.5,
            -0.5,  -0.5,  0.5,
            -0.5,  -0.5,  0.5,
             0.5,  -0.5, -0.5,
             0.5,  -0.5,  0.5,
        
            -0.5,  -0.5, -0.5,
            -0.5,  -0.5,  0.5,
            -0.5,   0.5, -0.5,
            -0.5,  -0.5,  0.5,
            -0.5,   0.5,  0.5,
            -0.5,   0.5, -0.5,
        
             0.5,  -0.5, -0.5,
             0.5,   0.5, -0.5,
             0.5,  -0.5,  0.5,
             0.5,  -0.5,  0.5,
             0.5,   0.5, -0.5,
             0.5,   0.5,  0.5,
        
            ];

  
        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');

        this.sampler = gl.getUniformLocation(this.prog, 'sampler');
        this.texture_set = gl.getUniformLocation(this.prog, 'texture_set');

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        this.texture = gl.createTexture();
        gl.uniform1i(this.texture_set, false);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    
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
            image.addEventListener('load', () => 
                {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
                gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                });
            });
    
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
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
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0 ,0);
        gl.enableVertexAttribArray(this.pos);

        gl.drawArrays(gl.TRIANGLES, 0, this.num_triangles);
    
    }

}

