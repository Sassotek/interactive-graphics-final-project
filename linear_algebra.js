function m_mult( A, B )
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
            const Rz = [cos(dir.z), -sin(dir.z) , 0, 0,
                        sin(dir.z), cos(dir.z), 0 ,0,
                        0, 0, 1, 0,
                        0, 0, 0, 1];
            
            t = m_mult(Rz,t);
        }

    if(dir.y != 0)
        {
            const Ry = [cos(dir.y), 0, sin(dir.y), 0,
                        0, 1, 0, 0,
                        -sin(dir.y), 0, cos(dir.y), 0,
                        0, 0, 0, 1];
            
            t = m_mult(Ry,t);
        }

    if(dir.x != 0)
        {
            const Rx = [1, 0, 0, 0,
                        0, cos(dir.x), -sin(dir.x), 0,
                        0, sin(dir.x), cos(dir.x), 0,
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

    return t;
}
class vec3 
{
    constructor(x,y,z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

}