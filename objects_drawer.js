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


function load_url(filePath)
{
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
      console.log(result);
    }
    return result;
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




class quaoar_drawer
{

    constructor()
    {
        this.obj_file = load_url("http://0.0.0.0:8000/Quaoar.obj");
        this.tex_img = load_url("http://0.0.0.0:8000/quaoar_texture.png");
        
        var VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;

                attribute vec3 pos;
                attribute vec2 tex_coord;

                varying vec2 v_tex_coord;

                void main()
                {
                    gl_Position = mvp*vec4(pos,1);
                    tex_coord = v_tex_coord;
                }
            `;

        var FragmentShaderText = `
                precision mediump float;

                uniform sampler2D sampler;

                varying vec2 v_tex_coord;

                void main()
                {
                    gl_FragColor(sampler, v_tex_coord);
                }
            `;
    }

    draw(m_v)
    {

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