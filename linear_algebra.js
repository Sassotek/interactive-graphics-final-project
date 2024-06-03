
class vec3 
{
    constructor(x,y,z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

}


/*function m_mult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[i*4+k] * B[j+k*4];
			}
			C.push(v);
		}
	}
	return C;
}

function trans(scale = 1, dir = vec3(0,0,0), pos = vec3(0,0,0)) //first scale, second rotation, then translation
{
    var t = [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
    
    if(dir.z != 0)
        {
            const Rz = [Math.cos(dir.z), -Math.sin(dir.z) , 0, 0,
                        Math.sin(dir.z), Math.cos(dir.z), 0 ,0,
                        0, 0, 1, 0,
                        0, 0, 0, 1];
            
            t = m_mult(Rz,t);

        }

    if(dir.y != 0)
        {
            const Ry = [Math.cos(dir.y), 0, Math.sin(dir.y), 0,
                        0, 1, 0, 0,
                        -Math.sin(dir.y), 0, Math.cos(dir.y), 0,
                        0, 0, 0, 1];
            
            t = m_mult(Ry,t);
        }

    if(dir.x != 0)
        {
            const Rx = [1, 0, 0, 0,
                        0, Math.cos(dir.x), -Math.sin(dir.x), 0,
                        0, Math.sin(dir.x), Math.cos(dir.x), 0,
                        0, 0, 0, 1];
            
            t = m_mult(Rx,t);
        }

    if(scale !=1)
        {
            const S = [scale,0,0,0,
                      0,scale,0,0,
                      0,0,scale,0,
                      0,0,0,1];
            
            t = m_mult(S,t);
        }
    
    const transf = [1,0,0, pos.x,
                    0,1,0,pos.y,
                    0,0,1,pos.z,
                    0,0,0,1,];
    
    t = m_mult(transf,t);

    return t;
}*/

//////////////////column major version/////////////////

function m_mult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) {
		for ( var j=0; j<4; ++j ) {
			var v = 0;
			for ( var k=0; k<4; ++k ) {
				v += A[j+4*k] * B[k+4*i];
			}
			C.push(v);
		}
	}
	return C;
}

function trans(scale = 1, dir = vec3(0,0,0), pos = vec3(0,0,0))
{
    var r = [1.0, 0.0, 0.0, 0.0,
             0.0, 1.0, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0
    ];

    var transl = [
    	1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		pos.x, pos.y, pos.z, 1.0
	];

    r = m_mult(r,transl);

    var s = [
       scale, 0.0, 0.0, 0.0,
       0.0, scale, 0.0, 0.0,
       0.0, 0.0, scale, 0.0,
       0.0, 0.0, 0.0, 1.0 
    ]

    r = m_mult(r,s);

    if(dir.z != 0)
        {
            
            const Rz = [Math.cos(dir.z), Math.sin(dir.z) , 0.0 ,0.0,
                        -Math.sin(dir.z),Math.cos(dir.z), 0.0, 0.0,
                        0.0, 0.0, 1.0, 0.0,
                        0.0, 0.0, 0.0, 1.0]

            t = m_mult(r,Rz);
        }

    if(dir.y != 0)
        {
	        var Ry = [Math.cos(dir.y), 0.0 , -Math.sin(dir.y), 0.0,
		        	0.0, 1.0, 0.0, 0.0,
			        Math.sin(dir.y), 0.0, Math.cos(dir.y), 0.0,
			        0.0, 0.0, 0.0, 1.0];
        
            r = m_mult(r, Ry);
        }
	
	if(dir.x != 0)
        {
            var Rx = [1.0, 0.0, 0.0, 0.0,
                0.0, Math.cos(dir.x), Math.sin(dir.x), 0.0,
                0.0, -Math.sin(dir.x), Math.cos(dir.x), 0.0,
                0.0, 0.0, 0.0, 1.0];
            
            t = m_mult(r,Rx);
        }

	return r;
}

