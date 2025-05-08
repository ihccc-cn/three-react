// https://www.shadertoy.com/view/ls3yWl

export default `
float spec(float x)
{
    return texture(iChannel1, vec2(x, 0.0)).x;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 px = 1.0/iResolution.xy;
   	vec2 sc = fragCoord.xy / iResolution.xy;

    vec2 storage = vec2(0.0);

    if(sc.x < px.x) {
        float m = spec(0.0);
        for (float i = 0.0; i < 10.0; i++)
            m = max(m, spec((i+1.0)*0.1));
        //storage.x = (spec(0.7) + spec(0.52));
        //float m = spec(5.0/34.0);
        storage.x = m*1.2;
        storage.y = iTime;
    }
    else {
	   storage = texture(iChannel0, sc - vec2(px.x, 0.0)).xy;
       storage.x *= 0.995;
    }

    fragColor = vec4(storage, 0.0, 0.0);
}`;
