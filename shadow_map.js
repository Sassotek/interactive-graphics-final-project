var shadowmap_program;
var l_pos, mw, lv, pm, LightP;
var shadow_texture; 
var shadow_framebuffer;
var shadow_depthbuffer;
var light_MV;

var shadowmap_dim = 2048;

var b = [
    1.0, 0.0, 0.0, 0.0,
    0.0, -1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
];


var objs = [quaoar, kamillis, hagaton, ophin, hal, spaceman];

shadow_vs = `
    precision mediump float;

    uniform mat4 pm;
    uniform mat4 lv;
    uniform mat4 mw;

    attribute vec3 l_pos;

    varying vec3 fPos;

    void main()
    {
        fPos = vec3(mw * vec4(l_pos, 1.0));
        gl_Position = pm*lv*vec4(fPos, 1.0);
    }
`;

shadow_fs = `
    precision mediump float;
    uniform vec3 LightP;

    varying vec3 fPos;

    void main()
    {
        vec3 LightToFrag = (fPos - LightP);

        float lightFragDist = (length(LightToFrag) - 0.1)/(100.0 - 0.1);

        gl_FragColor = vec4(vec3(lightFragDist), 1.0);   
    }
`;


function ShadowMapInit()
{
    shadowmap_program = program_init(shadow_vs, shadow_fs);

    l_pos = gl.getAttribLocation(shadowmap_program, 'l_pos');
    mw = gl.getUniformLocation(shadowmap_program, 'mw');
    lv = gl.getUniformLocation(shadowmap_program, 'lv');
    pm = gl.getUniformLocation(shadowmap_program, 'pm');
    LightP = gl.getUniformLocation(shadowmap_program, 'LightP');

    shadow_texture = gl.createTexture();
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for(var i = 0; i<6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, shadowmap_dim, shadowmap_dim, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

    shadow_framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffer);
    
    for(var i = 0; i<6; i++)
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, shadow_texture, 0);
        }
   

    shadow_depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowmap_dim, shadowmap_dim);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    objs.forEach(object => {
        gl.useProgram(object.prog);
        object.set_shadowmap_bias(0.02);
        gl.uniform1i(object.mix_set, true);
    });

    console.log("shadowmap_init");
}

function ShadowMapDraw() //draw shadowed objects
{
    gl.useProgram(shadowmap_program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);

    gl.uniform3fv(LightP, light_position_V);
    for(var i = 0; i<6; i++) //for each camera
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffer);
            gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);

            gl.viewport(0, 0, shadowmap_dim, shadowmap_dim);
            UpdateViewMatrices();
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);

    
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, shadow_texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);

            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //draw objects
            var projection = ProjectionMatrix(shadowmap_dim, shadowmap_dim);
            projection = m_mult(b, projection);
            gl.uniformMatrix4fv(pm, false, projection);
            gl.uniformMatrix4fv(lv, false, LVs[i]);

            for(var j = 0; j<objs.length; j++)
                {
                    gl.uniformMatrix4fv(mw, false, MWs[j]);
                    var num_triangles = objs[j].vertices.length / 3;
                    gl.bindBuffer(gl.ARRAY_BUFFER, objs[j].vertexBuffer);
                    gl.vertexAttribPointer(l_pos, 3, gl.FLOAT, gl.FALSE, 0, 0);
		            gl.enableVertexAttribArray(l_pos);
                    gl.drawArrays(gl.TRIANGLES, 0, num_triangles);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                }


            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

    for(var x=0; x<objs.length; x++)
        {
            gl.useProgram(objs[x].prog);
            gl.uniform3fv(objs[x].LightP, light_position_V);
        }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    UpdateViewMatrices();
    gl.clearColor(1.0, 1.0, 0.5, 1.0);    
    var debug = new shadowmap_debugger();
    var debug_MVP = trans(5.0, new vec3(0,0,0), new vec3(0,0,0));
    debug_MVP = m_mult(CV, debug_MVP);
    debug_MVP = m_mult(ProjectionMatrix(), debug_MVP);

    //debug.draw(debug_MVP);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

}

function toggle_shadowmap(x)
{
    objs.forEach(object => {
        gl.useProgram(object.prog);
        object.use_shadows = x;
        //gl.uniform1f(object.bias, -0.002);
    });
}

function toggle_mix(x)
{
    objs.forEach(object => {
        gl.useProgram(object.prog);
        gl.uniform1i(object.mix_set, x);

        if(x) object.set_shadowmap_bias(0.02);
        else if(!x) object.set_shadowmap_bias(-0.002);
    });
}

class shadowmap_debugger
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
                    gl_FragColor = vec4(1,1,1,1);
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
        
        
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
        //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
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