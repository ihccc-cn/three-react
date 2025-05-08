// https://www.shadertoy.com/view/3dGyRh

export default `
float line(float top, float bottom, float sharpen, vec2 uv) {
    sharpen = 0.05 * smoothstep(0.6, 1., uv.x) + 0.05 * smoothstep(0.3, 0., uv.x);
    return smoothstep(top, top + sharpen, uv.y) - smoothstep(bottom, bottom + sharpen, uv.y);
}

float wave(float time, vec2 uv, float phase) {
    float wave = sin(time + uv.x * phase);
    float blur = 0.01 * smoothstep(.5, 0., abs(uv.x - .5));
    uv.y += phase * blur * wave;
    return line(0.495, 0.505, 0.01, uv);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;

    float audio = 1.; texture(iChannel0, vec2(uv * 0.1)).x;

    float line = wave(iTime * 3., uv, 10. + sin(iTime) * 1.5);
    float line2 = wave(iTime * 4., uv, 13. + sin(iTime + 2.) * 3.);
    float line3 = wave(iTime *  5., uv, 20. + sin(iTime + 3.) * 3.);

    vec3 col1 = vec3(1.0, 0.1, 0.2) * line;
    vec3 col2 = vec3(0.8, 0.4, 0.2) * line2;
    vec3 col3 = vec3(0.3, 0.2, 0.9) * line3;
    vec3 col = 4. * (col1 * audio + col2 * audio + col3 * audio);

    fragColor = vec4(col,1.0);
}`;
