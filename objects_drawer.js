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




class bow_drawer
{
    constructor()
    {   
        //box shape
        this.vertex = [
			-1, -1, -1,
			-1, -1,  1,
			-1,  1, -1,
			-1,  1,  1,
			 1, -1, -1,
			 1, -1,  1,
			 1,  1, -1,
			 1,  1,  1 ];
        
        this.colors = [
			0.5, 0.5, 0.5, 1,
			0.5, 0.5, 0.5, 1, 
			0.5, 0.5, 0.5, 1,
			0.6, 0.6, 0.6, 1,
			0.6, 0.6, 0.6, 1,
			0.45, 0.45, 0.45, 1,
            0.45, 0.45, 0.45, 1,
			0.45, 0.45, 0.45, 1];     
        
        //world-model matrix, specifies world position
        this.w_m = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
             
        var VertexShaderText = `
                precision mediump float;

                uniform mat4 mvp;

                attribute vec3 pos;
                attribute vec4 clr;

                varying vec4 f_clr;

                void main()
                {
                    gl_Position = mvp*vec4(pos,1.0);
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

        this.clr = gl.getAttribLocation(prog, 'clr');
        this.pos = gl.getAttribLocation(prog, 'pos');

        this.triangle_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);
       
        this.color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.this.colors), gl.STATIC_DRAW);
    }


    draw(w_v)
    {
        var m_v = m_mult(v_w, this.w_m); 

        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 3*Float32Array.BYTES_PER_ELEMENT,0);
        gl.vertexAttribPointer(this.pos, 4, gl.FLOAT, false, 4*Float32Array.BYTES_PER_ELEMENT,0);
    }
    
}