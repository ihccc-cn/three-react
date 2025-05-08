// https://www.shadertoy.com/view/stf3zs

export default `
#define green vec3(0.0,.3,0.6)

// returns a vec3 color from every pixel requested.
// Generates a BnW Ping on normalized 2d coordinate system
vec3 RadarPing(in vec2 uv, in vec2 center, in float innerTail,
               in float frontierBorder, in float timeResetSeconds,
               in float radarPingSpeed, in float fadeDistance, float t)
{
    vec2 diff = center-uv;
    float r = length(diff);
    float time = mod(t, timeResetSeconds) * radarPingSpeed;

    float circle;
    // r is the distance to the center.
    // circle = BipCenter---//---innerTail---time---frontierBorder
    //illustration
    //https://sketch.io/render/sk-14b54f90080084bad1602f81cadd4d07.jpeg
    circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
	circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance

    return vec3(circle);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //normalize coordinates
    vec2 uv = fragCoord.xy / iResolution.xy; //move coordinates to 0..1
    uv = uv.xy*2.; // translate to the center
    uv += vec2(-1.0, -1.0);
    uv.x *= iResolution.x/iResolution.y; //correct the aspect ratio

	vec3 color;
    // generate some radar pings
    float fadeDistance = 0.8;
    float resetTimeSec = 3.0;
    float radarPingSpeed = 0.2;
    vec2 greenPing = vec2(0.0, 0.0);
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 1.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 2.) * green;
    //return the new color
	fragColor = vec4(color,1.0);
}
`;
