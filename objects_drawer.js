var planet_string = obj_loader("http://0.0.0.0:8000/planet.obj");
var spaceman_string = obj_loader("http://0.0.0.0:8000/space_man.obj");


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
        return;
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
    if(!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(this.prog));
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
        buffer.push(1 - v[f[i]][1]); //invert y-axis becouse of blender uv system
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
        //this.prog = program_init(VertexShaderText, FragmentShaderText);
        this.prog = program_init(shadow_vs, shadow_fs);
        gl.useProgram(this.prog);

        /*
        this.pos = gl.getAttribLocation(prog, 'pos');
        this.clr = gl.getAttribLocation(prog, 'clr');
        this.mvp = gl.getUniformLocation(prog, 'mvp');
        */

        this.l_pos = gl.getAttribLocation(this.prog, 'l_pos');
        this.mWorld = gl.getUniformLocation(this.prog, 'mw');
        this.mView = gl.getUniformLocation(this.prog, 'lv');
        this.mProj = gl.getUniformLocation(this.prog, 'pm');
        this.pointLightPosition = gl.getUniformLocation(this.prog, 'LightP');

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        /*this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        */
    }


    draw(mWorld, mView, mProj, plp)
    {
        this.num_triangles = this.vertices.length / 3;
        gl.useProgram(this.prog);
    
        gl.uniformMatrix4fv(this.mWorld, false, mWorld);
        gl.uniformMatrix4fv(this.mView, false, mView);
        gl.uniformMatrix4fv(this.mProj, false, mProj);
        gl.uniform3fv(this.pointLightPosition, plp);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, gl.FALSE , 3* Float32Array.BYTES_PER_ELEMENT , 0);
        gl.enableVertexAttribArray(this.l_pos);
  
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        //gl.vertexAttribPointer(this.clr, 4, gl.FLOAT, gl.FALSE, 4* Float32Array.BYTES_PER_ELEMENT, 0);
        //gl.enableVertexAttribArray(this.clr);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length/3);
       
    }
    
}


class spaceman_drawer
{
    constructor()
    {
        this.vertices = [];
        this.texture_c = [];
        this.normals_data = [];

        this.use_shadows = 0;

        this.VertexShaderText = mainVertexShaderText;
        this.FragmentShaderText = mainFragmentShaderText;
        
        this.prog = program_init(this.VertexShaderText, this.FragmentShaderText);
        gl.useProgram(this.prog);

        
        this.obj_data = obj_parser(spaceman_string);
        this.vertices = this.obj_data.vertex_buffer;
        this.texture_c = this.obj_data.texture_buffer;
        this.normals_data = this.obj_data.normal_buffer;

        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.tex_coord = gl.getAttribLocation(this.prog, 'tex_coord');
        this.normals = gl.getAttribLocation(this.prog, 'normals');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');
        this.mw = gl.getUniformLocation(this.prog, 'mw');
        this.ntm = gl.getUniformLocation(this.prog, 'ntm');

        this.LightP = gl.getUniformLocation(this.prog, 'LightP');
        this.bias = gl.getUniformLocation(this.prog, 'bias');
        this.depth_sampler = gl.getUniformLocation(this.prog, 'depth_sampler');
        this.sampler = gl.getUniformLocation(this.prog, 'sampler');
        this.texture_set = gl.getUniformLocation(this.prog, 'texture_set');
        this.light = gl.getUniformLocation(this.prog, 'light');
        this.alpha = gl.getUniformLocation(this.prog, 'alpha');
        this.light_set = gl.getUniformLocation(this.prog, 'light_set');
        this.shadows_set = gl.getUniformLocation(this.prog, 'shadows_set');
        this.mix_set = gl.getUniformLocation(this.prog, "mix_set");

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

        gl.uniform1i(this.light_set, false);
        gl.uniform1i(this.shadows_set, false);
        
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
        //console.log("texture_set");
    }


    set_light(vec, a)
    {
        gl.useProgram(this.prog);
        gl.uniform3f(this.light, vec.x, vec.y, vec.z);
        gl.uniform1f(this.alpha, a);
        gl.uniform1i(this.light_set, true);
    }

    set_shadowmap_bias(b)
    {
        gl.uniform1f(this.bias, b);
    }

    draw(m_p, m_w, n_w)
    {    
        gl.useProgram(this.prog);
        this.num_triangles = this.vertices.length / 3;

        gl.uniform1i(this.shadows_set, this.use_shadows);
        if(this.use_shadows)
            {
                gl.uniform1i(this.depth_sampler, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
            }
        
        gl.uniformMatrix4fv(this.mvp, false, m_p);
        gl.uniformMatrix4fv(this.mw, false, m_w);
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


class planet_drawer
{

    constructor()
    {
        this.vertices = [];
        this.texture_c = [];
        this.normals_data = [];

        this.use_shadows = 0;

        this.VertexShaderText = mainVertexShaderText;
        this.FragmentShaderText = mainFragmentShaderText;
        
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
        this.mw = gl.getUniformLocation(this.prog, 'mw');
        this.ntm = gl.getUniformLocation(this.prog, 'ntm');
        
        this.LightP = gl.getUniformLocation(this.prog, 'LightP');
        this.bias = gl.getUniformLocation(this.prog, 'bias');
        this.depth_sampler = gl.getUniformLocation(this.prog, 'depth_sampler');
        this.sampler = gl.getUniformLocation(this.prog, 'sampler');
        this.texture_set = gl.getUniformLocation(this.prog, 'texture_set');
        this.light = gl.getUniformLocation(this.prog, 'light');
        this.alpha = gl.getUniformLocation(this.prog, 'alpha');
        this.light_set = gl.getUniformLocation(this.prog, 'light_set');
        this.shadows_set = gl.getUniformLocation(this.prog, 'shadows_set');
        this.mix_set = gl.getUniformLocation(this.prog, "mix_set");

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

        gl.uniform1i(this.light_set, false);
        gl.uniform1i(this.shadows_set, false);
    }

    set_texture(img , texture_unit)
    {
        gl.activeTexture(gl.TEXTURE0 + texture_unit);
        //console.log(gl.getUniform(this.prog, this.sampler));
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
        //console.log("texture_set");
    }


    set_light(vec, a)
    {
        gl.useProgram(this.prog);
        gl.uniform3f(this.light, vec.x, vec.y, vec.z);
        gl.uniform1f(this.alpha, a);
        gl.uniform1i(this.light_set, true);
    }

    set_shadowmap_bias(b)
    {
        gl.uniform1f(this.bias, b);
    }

    draw(m_p, m_w, n_w)
    {    
        gl.useProgram(this.prog);
        this.num_triangles = this.vertices.length / 3;

        gl.uniform1i(this.shadows_set, this.use_shadows);
        if(this.use_shadows)
            {
                gl.uniform1i(this.depth_sampler, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
            }
    
        gl.uniformMatrix4fv(this.mvp, false, m_p);
        gl.uniformMatrix4fv(this.mw, false, m_w);
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




var mainVertexShaderText = `
    precision mediump float;

    uniform mat4 mvp;
    uniform mat4 mw;
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
        frag_positions = vec3(mw*vec4(pos,1.0));
        frag_normals = normalize(ntm*normals);
        v_tex_coord = tex_coord;
    }
`;

var mainFragmentShaderText = `
    precision mediump float;

    uniform sampler2D sampler;
    uniform samplerCube depth_sampler;
    uniform bool texture_set;
    uniform vec3 light;
    uniform float alpha;
    uniform vec3 LightP;
    uniform bool light_set;
    uniform float bias;

    uniform bool shadows_set;
    uniform bool mix_set;

    varying vec2 v_tex_coord;
    varying vec3 frag_normals;
    varying vec3 frag_positions;

    void main()
    {
        float intensity = 1.0;
        float increment = 2.0;
        float K_diffuse;
        float K_specular;

        mat4 b = mat4(1.0, 0.0, 0.0, 0.0,
                    0.0, 1.0, 0.0, 0.0,
                    0.0, 0.0, -1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0); 

        float shadowmap_value;
        float lightFragDist;

        vec3 color;
        
        if(light_set)
        {
            vec3 omega = normalize(light);
            vec3 n = normalize(frag_normals);
            vec3 v = -normalize(frag_positions);
            vec3 h = normalize(omega+v);  
            float specular = max(dot(h,n), 0.0);

            K_diffuse = min(increment*max(dot(omega,n), 0.0), 1.0);
            K_specular = pow(specular, alpha);

            if(shadows_set)
            {    
                intensity = 0.05;
                vec3 ToLight = normalize(frag_positions - LightP);
                ToLight = vec3(b*vec4(ToLight, 1.0));
                shadowmap_value = textureCube(depth_sampler, ToLight).z;
                
                vec3 LightToFrag = (frag_positions - LightP);

                lightFragDist = (length(LightToFrag) - 0.1)/(100.0 - 0.1);
                    
                vec3 l = normalize(-LightToFrag);
                
                if((shadowmap_value+bias)>= lightFragDist)
                {
                    intensity += 0.95;
                }
            }
        }
        
        if(texture_set)
        {
            color = texture2D(sampler, v_tex_coord).rgb;
            if(light_set)
            {   
                //gl_FragColor = vec4(vec3(color), 1.0);
                vec4 tex_color = texture2D(sampler, v_tex_coord);
                color = intensity*(K_diffuse*tex_color.rgb + K_specular*vec3(1.0, 1.0, 1.0)); 
                if(shadows_set)
                {
                    vec4 tex_color = texture2D(sampler, v_tex_coord);
                    color = intensity*(tex_color.rgb);
                    
                    if(mix_set)
                    {
                        float i = 1.0;
                        if(intensity < 1.0) i = 0.0;
                        color = intensity*(K_diffuse*tex_color.rgb + i*K_specular*vec3(1.0, 1.0, 1.0));
                    }
                }
            }
        }

        else
        {
            color = vec3(frag_normals);
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;