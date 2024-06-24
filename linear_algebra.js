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

    setX(x){this.x = x;}
    setY(y){this.y = y;}
    setZ(z){this.z = z;}
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
        trans[3],trans[5],trans[6],
        trans[7],trans[8],trans[9]
    ]; 
}

function calculate_dir(from, to)
{
    return new vec3(from.x-to.x, from.y-to.y, from.z-to.z);
}

