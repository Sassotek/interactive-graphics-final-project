class triangle_drawer
{
    constructor()
    {
        this.vertices = [        
            0.0, 0.5,   
            -0.5, -0.5,  
            0.5, -0.5,   
        ];
        
        this.colors = [
            1.0, 1.0, 0.0, 1,
            0.7, 0.0, 1.0, 1,
            0.1, 1.0, 0.6, 1,
        ];

        this.VertexShaderText = `
        precision mediump float;
        
        attribute vec2 vertPosition;
        attribute vec3 vertColor;
        uniform mat4 mat;
        varying vec3 fragColor;
        
        void main()
        {
        fragColor = vertColor;
        gl_Position = mat*vec4(vertPosition, 0.0, 1.0);
        }
       `

        this.FragmentShaderText = `
        precision mediump float;
        
        varying vec3 fragColor;
        void main()
        {
          gl_FragColor = vec4(fragColor, 1.0);
        }
     `
    this.prog = program_init(this.VertexShaderText,this.FragmentShaderText);
    gl.useProgram(this.prog);

    this.positionAttribLocation = gl.getAttribLocation(prog, 'vertPosition');
	this.colorAttribLocation = gl.getAttribLocation(prog, 'vertColor');
    this.matrix = gl.getUniformLocation(prog , 'mat');
    
    this.triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.colorBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	
    }

    draw(proj)
    {
        gl.useProgram(prog);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexBufferObject);

        gl.vertexAttribPointer(
            this.positionAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferObject);
        gl.vertexAttribPointer(
            this.colorAttribLocation, // Attribute location
            4, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            4 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );
        
        gl.enableVertexAttribArray(this.positionAttribLocation);
        gl.enableVertexAttribArray(this.colorAttribLocation);
    
        gl.drawArrays(gl.TRIANGLES, 0, 3);

    }

}