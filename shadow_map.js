var shadowmap_program;
var l_pos, ml, mlp, light_p;
var shadow_texture; 
var shadow_framebuffers = [];
var shadow_depthbuffers = [];
var light_MV;

var MWs = [MW_quaoar, MW_kamillis, MW_hagaton, MW_ophin, MW_hal, MW_spaceman];
var objs = [quaoar, kamillis, hagaton, ophin, hal, spaceman];
shadow_vs = `
    precision mediump float;

    attribute vec3 l_pos;

    uniform mat4 mlp;
    uniform mat4 ml;

    varying vec3 frag_light;
    void main()
    {
        gl_Position = mlp*vec4(l_pos, 1.0);
        frag_light = vec3(ml*vec4(l_pos, 1.0));  
    }
`;

shadow_fs = `
    precision mediump float;

    varying vec3 frag_light;
    
    float non_linear_depth;
    float linear_depth;
    float depth;

    void main()
    {
        non_linear_depth = gl_FragCoord.z;
        linear_depth = (2.0*0.1*100.0)/(100.0+0.1 - non_linear_depth*(100.0-0.1));
        depth = (linear_depth - 0.1)/(100.0 - 0.1);
        gl_FragColor = vec4(vec3(depth), 1.0);

        //float color = length(frag_light);
        //gl_FragColor = vec4(1,0,0,1);
    }
`;


function ShadowMapInit()
{
    shadowmap_program = program_init(shadow_vs, shadow_fs);

    l_pos = gl.getAttribLocation(shadowmap_program, 'l_pos');
    mlp = gl.getUniformLocation(shadowmap_program, 'mlp');
    ml = gl.getUniformLocation(shadowmap_program, 'ml');

    shadow_texture = gl.createTexture();
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    for(var i = 0; i<6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        
    shadow_depthbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);

    for(var i = 0; i<6; i++)
        {
            shadow_framebuffers[i] = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffers[i]);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, shadow_texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);
        }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    objs.forEach(object => {
        gl.useProgram(object.prog);
        object.use_shadows = 1;
    });

    console.log("shadowmap_init");
}

function ShadowMapDraw() //draw shadowed objects
{
    gl.useProgram(shadowmap_program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow_texture);
    for(var i = 0; i<6; i++) //for each camera
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_framebuffers[i]);
            gl.bindRenderbuffer(gl.RENDERBUFFER, shadow_depthbuffer);

            gl.viewport(0, 0, 512, 512);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);

    
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, shadow_texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadow_depthbuffer);

            gl.clearColor(0.0, 0.0, 0.0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //draw objects
            var projection = ProjectionMatrix();

            for(var j = 0; j<objs.length; j++)
                {
                    light_MV = m_mult(LVs[i], MWs[j]);
                    gl.uniformMatrix4fv(ml, false, light_MV);
                    gl.uniformMatrix4fv(mlp, false, m_mult(projection, light_MV));
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
            var projection = ProjectionMatrix();
            gl.useProgram(objs[x].prog);
            gl.uniformMatrix4fv(objs[x].lmv, false, light_MV);
        }

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    gl.viewport( 0, 0, canvas.width, canvas.height );
}
