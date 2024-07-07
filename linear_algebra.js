var deg2rad = Math.PI/180;

class vec3 
{
    constructor(x,y,z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sum(elem)
    {
        if(elem instanceof vec3)
            {
                //console.log("vertex sum");
                this.x += elem.x;
                this.y += elem.y;
                this.z += elem.z;
            }

        else if(elem === 'number')
            {
                //console.log("scalar sum");
                this.x += elem;
                this.y += elem;
                this.z += elem;
            }    
            
        else if(Array.isArray(elem) && elem.length === 3)
            {
                //console.log("array sum");
                this.x += elem[0];
                this.y += elem[1];
                this.z += elem[2];
            }
               
    }

    mult(scalar)
    {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    m_prod(matrix)
    {
        var temp_x = this.x*matrix[0] + this.y*matrix[1] + this.z*matrix[2];
        var temp_y = this.x*matrix[3] + this.y*matrix[4] + this.z*matrix[5];
        var temp_z = this.x*matrix[6] + this.y*matrix[7] + this.z*matrix[8];

        this.x = temp_x;
        this.y = temp_y;
        this.z = temp_z;
    }

    setX(x){this.x = x;}
    setY(y){this.y = y;}
    setZ(z){this.z = z;}
}



function m_mult( A, B )
{
    var len;

    if(A.length == 16 && B.length == 16) len = 4;
    else if(A.length == 9 && B.length == 9) len = 3;
    else
    { 
        console.log("different or invalid matrix sizes");
        return 0;
    }

	var C = [];
	for ( var i=0; i<len; ++i ) {
		for ( var j=0; j<len; ++j ) {
			var v = 0;
			for ( var k=0; k<len; ++k ) {
				v += A[j+len*k] * B[k+len*i];
			}
			C.push(v);
		}
	}
	return C;
}

function trans(scale = 1, dir = new vec3(0,0,0), pos = new vec3(0,0,0))
{
    //dir.mult(deg2rad);
    var r = [];

    r = [
        1.0, 0.0, 0.0, 0.0,
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

    if(scale != 1)
        {
            var s = [
                scale, 0.0, 0.0, 0.0,
                0.0, scale, 0.0, 0.0,
                0.0, 0.0, scale, 0.0,
                0.0, 0.0, 0.0, 1.0 
            ];
         
             r = m_mult(r,s);
        }

    if(dir.x != 0)
        {
            var Rx = [
                1.0, 0.0, 0.0, 0.0,
                0.0, Math.cos(dir.x), Math.sin(dir.x), 0.0,
                0.0, -Math.sin(dir.x), Math.cos(dir.x), 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
            
            r = m_mult(r,Rx);
            //console.log("multiplied x");
        }

    if(dir.y != 0)
        {
	        var Ry = [
                Math.cos(dir.y), 0.0 , -Math.sin(dir.y), 0.0,
		        0.0, 1.0, 0.0, 0.0,
			    Math.sin(dir.y), 0.0, Math.cos(dir.y), 0.0,
			    0.0, 0.0, 0.0, 1.0
            ];
        
            r = m_mult(r, Ry);
            //console.log("multiplied y");
        }
	
	 if(dir.z != 0)
        {
            
            const Rz = [
                Math.cos(dir.z), Math.sin(dir.z) , 0.0 ,0.0,
                -Math.sin(dir.z),Math.cos(dir.z), 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];

            r = m_mult(r,Rz);
            //console.log("multiplied z");
        }


	return r;
}

function normal_transformation_matrix(trans)
{
    return n_r = [
        trans[0],trans[1],trans[2],
        trans[4],trans[5],trans[6],
        trans[8],trans[9],trans[10]
    ]; 
}

function calculate_dir(from, to, rotation = new vec3(0,0,0))
{
    var result = new vec3(from.x-to.x, from.y-to.y, from.z-to.z);
    
    R = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ];

    if(rotation.x != 0)
        {
            var Rx = [
                1.0,        0.0,            0.0,
                0.0, Math.cos(rotation.x), Math.sin(rotation.x),
                0.0, -Math.sin(rotation.x), Math.cos(rotation.x) 
            ];
            
            R = m_mult(R,Rx);
        }

    if(rotation.y != 0)
        {
	        var Ry = [
                Math.cos(rotation.y), 0.0 , -Math.sin(rotation.y),
		            0.0,         1.0,        0.0,
			    Math.sin(rotation.y), 0.0, Math.cos(rotation.y)
            ];
        
            R = m_mult(R, Ry);
        }
	
	 if(rotation.z != 0)
        {
            
            const Rz = [
                Math.cos(rotation.z), Math.sin(rotation.z) , 0.0,
                -Math.sin(rotation.z),Math.cos(rotation.z), 0.0,
                    0.0,            0.0,          1.0
            ];

            R = m_mult(R, Rz);
        }
    
    result.m_prod(R);
    
    return result;
}

function trans_(scale = 1, dir = new vec3(0,0,0), pos = new vec3(0,0,0))
{
    //dir.mult(deg2rad);
    var r = [];

    r = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    if(scale != 1)
        {
            var s = [
                scale, 0.0, 0.0, 0.0,
                0.0, scale, 0.0, 0.0,
                0.0, 0.0, scale, 0.0,
                0.0, 0.0, 0.0, 1.0 
            ];
         
             r = m_mult(r,s);
        }

    if(dir.x != 0)
        {
            var Rx = [
                1.0, 0.0, 0.0, 0.0,
                0.0, Math.cos(dir.x), Math.sin(dir.x), 0.0,
                0.0, -Math.sin(dir.x), Math.cos(dir.x), 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
            
            r = m_mult(r,Rx);
            //console.log("multiplied x");
        }

    if(dir.y != 0)
        {
	        var Ry = [
                Math.cos(dir.y), 0.0 , -Math.sin(dir.y), 0.0,
		        0.0, 1.0, 0.0, 0.0,
			    Math.sin(dir.y), 0.0, Math.cos(dir.y), 0.0,
			    0.0, 0.0, 0.0, 1.0
            ];
        
            r = m_mult(r, Ry);
            //console.log("multiplied y");
        }
	
	 if(dir.z != 0)
        {
            
            const Rz = [
                Math.cos(dir.z), Math.sin(dir.z) , 0.0 ,0.0,
                -Math.sin(dir.z),Math.cos(dir.z), 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];

            r = m_mult(r,Rz);
            //console.log("multiplied z");
        }

    var transl = [
    	1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		pos.x, pos.y, pos.z, 1.0
	];

    r = m_mult(r,transl);
    
	return r;
}

function normal_transformation_matrix(trans)
{
    return n_r = [
        trans[0],trans[1],trans[2],
        trans[4],trans[5],trans[6],
        trans[8],trans[9],trans[10]
    ]; 
}

function calculate_dir(from, to, rotation = new vec3(0,0,0))
{
    var result = new vec3(from.x-to.x, from.y-to.y, from.z-to.z);
    
    R = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ];

    if(rotation.x != 0)
        {
            var Rx = [
                1.0,        0.0,            0.0,
                0.0, Math.cos(rotation.x), Math.sin(rotation.x),
                0.0, -Math.sin(rotation.x), Math.cos(rotation.x) 
            ];
            
            R = m_mult(R,Rx);
        }

    if(rotation.y != 0)
        {
	        var Ry = [
                Math.cos(rotation.y), 0.0 , -Math.sin(rotation.y),
		            0.0,         1.0,        0.0,
			    Math.sin(rotation.y), 0.0, Math.cos(rotation.y)
            ];
        
            R = m_mult(R, Ry);
        }
	
	 if(rotation.z != 0)
        {
            
            const Rz = [
                Math.cos(rotation.z), Math.sin(rotation.z) , 0.0,
                -Math.sin(rotation.z),Math.cos(rotation.z), 0.0,
                    0.0,            0.0,          1.0
            ];

            R = m_mult(R, Rz);
        }
    
    result.m_prod(R);
    
    return result;
}
