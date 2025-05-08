// https://www.shadertoy.com/view/ldtBRN

export default `
#define M_PI 3.14159265359

vec4 rectangle(vec4 color, vec4 background, vec4 region, vec2 uv);
vec4 capsule(vec4 color, vec4 background, vec4 region, vec2 uv);
vec2 rotate(vec2 point, vec2 center, float angle);
vec4 bar(vec4 color, vec4 background, vec2 position, vec2 diemensions, vec2 uv);
vec4 rays(vec4 color, vec4 background, vec2 position, float radius, float rays, float ray_length, sampler2D sound, vec2 uv);

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //Prepare UV and background
    float aspect = iResolution.x / iResolution.y;
    vec2 uv = fragCoord/iResolution.xy;
    uv.x *= aspect;
    vec4 color = mix(vec4(0.0, 1.0, 0.8, 1.0), vec4(0.0, 0.3, 0.25, 1.0), distance(vec2(aspect/2.0, 0.5), uv));

    //VISUALIZER PARAMETERS
    const float RAYS = 96.0; //number of rays //Please, decrease this value if shader is working too slow
    float RADIUS = 0.4; //max circle radius
    float RAY_LENGTH = 0.3; //ray's max length //increased by 0.1

    color = rays(vec4(1.0), color, vec2(aspect/2.0, 1.0/2.0), RADIUS, RAYS, RAY_LENGTH, iChannel0, uv);

    fragColor = color;
}

vec4 rays(vec4 color, vec4 background, vec2 position, float radius, float rays, float ray_length, sampler2D sound, vec2 uv)
{
    float inside = (1.0 - ray_length) * radius; //empty part of circle
    float outside = radius - inside; //rest of circle
    float circle = 2.0*M_PI*inside; //circle lenght
    for(int i = 1; float(i) <= rays; i++)
    {
        float len = outside * texture(sound, vec2(float(i)/rays, 0.0)).x; //length of actual ray
        background = bar(color, background, vec2(position.x, position.y+inside), vec2(circle/(rays*2.0), len), rotate(uv, position, 360.0/rays*float(i))); //Added capsules
    }
    return background; //output
}

vec4 bar(vec4 color, vec4 background, vec2 position, vec2 diemensions, vec2 uv)
{
    return capsule(color, background, vec4(position.x, position.y+diemensions.y/2.0, diemensions.x/2.0, diemensions.y/2.0), uv); //Just transform rectangle a little
}

vec4 capsule(vec4 color, vec4 background,  vec4 region, vec2 uv) //capsule
{
    if(uv.x > (region.x-region.z) && uv.x < (region.x+region.z) &&
       uv.y > (region.y-region.w) && uv.y < (region.y+region.w) ||
       distance(uv, region.xy - vec2(0.0, region.w)) < region.z ||
       distance(uv, region.xy + vec2(0.0, region.w)) < region.z)
        return color;
    return background;
}

vec2 rotate(vec2 point, vec2 center, float angle) //rotating point around the center
{
    float s = sin(radians(angle));
    float c = cos(radians(angle));

    point.x -= center.x;
    point.y -= center.y;

    float x = point.x * c - point.y * s;
    float y = point.x * s + point.y * c;

    point.x = x + center.x;
    point.y = y + center.y;

    return point;
}`;
