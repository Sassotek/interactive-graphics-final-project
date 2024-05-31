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




class cube_drawer
{
    constructor()
    {   
        //cube shape
        this.vertex = [     
                // Top
                -1.0, 1.0, -1.0,   
                -1.0, 1.0, 1.0,  
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,
        
                // Left
                -1.0, 1.0, 1.0,
                -1.0, -1.0, 1.0,
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0, 
        
                // Right
                1.0, 1.0, 1.0,    
                1.0, -1.0, 1.0,   
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0, 

                // Front
                1.0, 1.0, 1.0,    
                1.0, -1.0, 1.0, 
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0, 
        
                // Back
                1.0, 1.0, -1.0,   
                1.0, -1.0, -1.0,  
                -1.0, -1.0, -1.0, 
                -1.0, 1.0, -1.0,  
        
                // Bottom
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0, 
                1.0, -1.0, 1.0,  
                1.0, -1.0, -1.0, 
            ];
        
        this.colors = [
			0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,
            0.5, 0.5, 0.5, 1,
            0.75, 0.25, 0.5, 1,
            0.75, 0.25, 0.5, 1,
            0.75, 0.25, 0.5, 1,
            0.75, 0.25, 0.5, 1,
            0.25, 0.25, 0.75, 1,
            0.25, 0.25, 0.75, 1,
            0.25, 0.25, 0.75, 1,
            0.25, 0.25, 0.75, 1,
            1.0, 0.0, 0.15, 1,
            1.0, 0.0, 0.15, 1,
            1.0, 0.0, 0.15, 1,
            1.0, 0.0, 0.15, 1,
            0.0, 1.0, 0.15, 1,
            0.0, 1.0, 0.15, 1,
            0.0, 1.0, 0.15, 1,
            0.0, 1.0, 0.15, 1,
            0.5, 0.5, 1.0, 1,
            0.5, 0.5, 1.0, 1,
            0.5, 0.5, 1.0, 1,
            0.5, 0.5, 1.0, 1
        ];

        this.indices =[
		    // Top
		    0, 1, 2,
		    0, 2, 3,
		    // Left
	    	5, 4, 6,
		    6, 4, 7,
		    // Right
		    8, 9, 10,
		    8, 10, 11,
		    // Front
		    13, 12, 14,
		    15, 14, 12,
		    // Back
		    16, 17, 18,
		    16, 18, 19,
		    // Bottom
		    21, 20, 22,
		    22, 20, 23
	        ];

        
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

        this.clr = gl.getAttribLocation(this.prog, 'clr');
        this.pos = gl.getAttribLocation(this.prog, 'pos');
        this.mvp = gl.getUniformLocation(this.prog, 'mvp');

        this.triangle_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertex), gl.STATIC_DRAW);
       
        this.color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

        this.index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    }


    draw(v_w)
    {
        this.num_triangles = this.vertex.length / 3;

        gl.useProgram(this.prog);
        var v_m = m_mult(this.w_m, v_w);
        gl.uniformMatrix4fv(this.mvp, false, v_m); 

        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_buffer);
        gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 3*Float32Array.BYTES_PER_ELEMENT,0);
        gl.enableVertexAttribArray(this.pos);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_buffer);
        gl.vertexAttribPointer(this.clr, 4, gl.FLOAT, false, 4*Float32Array.BYTES_PER_ELEMENT,0);
        gl.enableVertexAttribArray(this.clr);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);        
        gl.drawElements(gl.TRIANGLES, this.num_triangles, gl.UNSIGNED_SHORT, 0);
    }
    
}