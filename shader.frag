#ifdef GL_ES
precision mediump float;
#endif

//inputs from vert shader
varying vec2 vTexCoord;

//inputs form main
uniform vec2 iResolution;
uniform float iTime;
uniform float iAmp;
uniform float iDuration;

// Octahedron Primitive
float sdOctahedron( vec3 p, float s )
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
}

//Rotation
mat2 rot2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

// Scene Mapping (the elements in the scene)
float map(vec3 p, float t) {
    vec3 q = p; // input position copy (to apply ray transformations to some objects only)

    q.xy *= rot2D(t*sin(iTime*0.2)*0.3); //rotate z axis with distance travelled, oscilate rotation with time

    q.y += sin(t * 2. - iTime * 3.) * (iAmp * .5); //vary curves with amp

    q.z += iTime * .6; // move camera in the z axis

    //Space repetition (closer on Z axis) (always subtract half of the second input in mod at the end)
    q.xy = mod(q.xy, 1.) - .5;
    q.z = (mod(q.z, .25) - .125);

    float pulseWave = sin(t * 2.0 - iTime * 3.0) * (iAmp * 1.5);
    float scaleModulation = 1.0 + pulseWave * 0.5;

    float octahedron = sdOctahedron(q, 0.2 * scaleModulation);
    
    return octahedron;
}

// Color Palette for the Scene
vec3 palette(float t, float hueShift) {
    //https://dev.thi.ng/gradients/ go here to find other values
    vec3 a = vec3(-0.452, 0.500, 0.500);
    vec3 b = vec3(1.508, 0.500, 0.500);
    vec3 c = vec3(-0.492, 0.500, 0.333);
    vec3 d = vec3(1.368, 0.500, 0.667);

    vec3 shiftD = d + vec3(hueShift, hueShift,hueShift);

    return a + b*cos( 6.283185*(c*t+shiftD) );
}

void main() {
    vec2 fragCoord = vTexCoord * iResolution;

    //Placing origin at the middle of the screen
    vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
    
    //Initialization
    vec3 ro = vec3(0,0,-3); //ray origin coords
    vec3 rd = normalize(vec3(uv, 1)); //ray direction
    vec3 col = vec3(0);
    
    float t = 0.; //total distance travelled from origin
    
    //Raymarching
    int j = 0;
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t; //position along the ray
        
        float d = map(p, t); //map current distance to the scene
        
        t += d; //marching ray to next step
        
        j = i;

        if (d < .001 || t > 100.) break; //early stop if close enough to object or too far away
    }
    
    //Coloring
    col = palette(t*.03 + float(j)*.005, iDuration);

    // Output to screen
    gl_FragColor = vec4(col,1.0);
}