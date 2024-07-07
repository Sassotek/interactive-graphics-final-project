var shadowmap_program;
var l_pos, lmv, lmvp;
var shadow_texture, shadow_framebuffer, shadow_depthbuffer; 
var light_MV;

shadow_vs = `
    precision mediump float;

    uniform mat4 lmv;
    uniform mat4 lmvp;

    attribute vec3 l_pos;
    varying vec3 f_pos;

    void main()
    {
        f_pos = (lmv*vec4(l_pos, 1.0)).xyz;
        gl_Position = lmvp*vec4(l_pos, 1.0); 
    }
`;

shadow_fs = `
    precision mediump float;

    varying vec3 f_pos;

    vec4 encodeFloat (float depth)
        {
        const vec4 bitShift = vec4(
            256 * 256 * 256,
            256 * 256,
            256,
            1.0
        );
        const vec4 bitMask = vec4(
            0,
            1.0 / 256.0,
            1.0 / 256.0,
            1.0 / 256.0
        );
        vec4 comp = fract(depth * bitShift);
        comp -= comp.xxyz * bitMask;
        return comp;
        }


    void main()
    {
        float norm = 30.0;
        //gl_FragColor = vec4(f_pos.z/norm, f_pos.z/norm, f_pos.z/norm, 1.0);
        gl_FragColor = encodeFloat(f_pos.z);
    }
`;


function ShadowMapInit()
{
    shadowmap_program = program_init(shadow_vs, shadow_fs);

    l_pos = gl.getAttribLocation(shadowmap_program, 'l_pos');
    lmv = gl.getUniformLocation(shadowmap_program, 'lmv');
    lmvp = gl.getUniformLocation(shadowmap_program, 'lmvp');

    shadow_texture = gl.createTexture();
    
    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    for(var i = 0; i<6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

    shadow_framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffer);

    shadow_depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);
    
    for(var i = 0; i<6; i++)
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, shadow_texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);
        }
    
    //gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function ShadowMapSet() //set light and shadowmap informations
{

    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture); 

    gl.useProgram(spaceman.prog);
    spaceman.use_shadows = 1;
    gl.uniform1i(spaceman.depth_sampler, 8);

    gl.useProgram(hal.prog);
    hal.use_shadows = 1;
    gl.uniform1i(hal.depth_sampler, 8); 
    
    gl.useProgram(quaoar.prog);
    quaoar.use_shadows = 1;
    gl.uniform1i(quaoar.depth_sampler, 8);

    gl.useProgram(ophin.prog);
    ophin.use_shadows = 1;
    gl.uniform1i(ophin.depth_sampler, 8);

    gl.useProgram(kamillis.prog);
    kamillis.use_shadows = 1;
    gl.uniform1i(kamillis.depth_sampler, 8);

    gl.useProgram(hagaton.prog);
    hagaton.use_shadows = 1;
    gl.uniform1i(hagaton.depth_sampler, 8);
}


function ShadowMapDraw() //draw shadowed objects
{
    gl.useProgram(shadowmap_program);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);

    gl.viewport(0, 0, 512, 512);
    gl.enable(gl.DEPTH_TEST);

    for(var i = 0; i<6; i++)
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, shadow_texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);

            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //draw objects
            var projection = ProjectionMatrix();

            light_MV = m_mult(LVs[i], MW_spaceman);
            spaceman.draw_shadow(m_mult(projection, light_MV), light_MV);
            light_MV = m_mult(LVs[i], MW_quaoar);
            quaoar.draw_shadow(m_mult(projection, light_MV), light_MV);
            light_MV = m_mult(LVs[i], MW_kamillis);
            kamillis.draw_shadow(m_mult(projection, light_MV), light_MV);
            light_MV = m_mult(LVs[i], MW_pyrona);
            hagaton.draw_shadow(m_mult(projection, light_MV), light_MV);
            light_MV = m_mult(LVs[i], MW_ophin);
            ophin.draw_shadow(m_mult(projection, light_MV), light_MV);
            light_MV = m_mult(LVs[i], MW_hal);
            hal.draw_shadow(m_mult(projection, light_MV), light_MV);
        }

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    gl.viewport( 0, 0, canvas.width, canvas.height );
}
