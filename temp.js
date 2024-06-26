shadow_vs = `
    uniform ma4 mvp;

    attribute vec3 pos;
    varying vec3 f_pos;

    void main()
    {
        f_pos = mvp*vec4(pos, 1.0);
    }
`;

shadow_fs = `
    
`;