var shadow_map_program;
var l_pos, lmv, projection;
var shadow_texture, shadow_framebuffer, shadow_depthbuffer; 

shadow_vs = `
    precision mediump float;

    uniform mat4 lmv;
    uniform mat4 projection;

    attribute vec3 l_pos;
    varying vec3 f_pos;

    void main()
    {
        f_pos = (lmv*vec4(l_pos, 1.0)).xyz;
        gl_Position = projection*lmv*vec4(l_pos, 1.0); 
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
    shadow_map_program = program_init(shadow_vs, shadow_fs);

    l_pos = gl.getAttribLocation(this.prog, 'pos');

    lmv = gl.getUniformLocation(this.shadow_map_program, 'lmv');
    projection = gl.getUniformLocation(this.shadow_map_program, 'projection');

    shadow_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    shadow_framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffer);

    shadow_depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function ShadowMapDraw()
{

}