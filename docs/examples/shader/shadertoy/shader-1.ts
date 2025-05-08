// https://www.shadertoy.com/view/3XSXWV

export default `
// Fork of "3D Fire [340]" by Xor. https://shadertoy.com/view/3XXSWS
// 2025-05-06 22:13:32


void mainImage(out vec4 fragColor, vec2 fragCoord)
{
    // Time for animation
    float t = iTime;

    // Raymarch loop iterator
    float i = 0.0;

    // Raymarched depth (rayDepth)
    float rayDepth = 0.0;

    // Raymarch step size and "Turbulence" frequency (stepSize)
    float stepSize = 0.0;

    // Normalize screen coordinates
    vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.0);

    // Camera setup
    vec3 rayOrigin = vec3(0.0, 0.0, 0.0);
    vec3 camPos = vec3(0.0, 0.0, 1.0);
    vec3 dir0 = normalize(-camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(dir0, up));
    up = cross(right, dir0); // Recalculate up to ensure orthogonality

    // Calculate ray direction based on screen UV
    vec3 rayDirection = normalize(
        dir0
        + up * (uv.y + 1.0 / iResolution.y)
        + right * (uv.x + 1.0 / iResolution.x)
    );

    // Raymarching loop with 50 iterations
    for (i = 0.0; i < 50.0; i++) {
        // Compute raymarch sample point
        vec3 hitPoint = rayOrigin + rayDepth * rayDirection;

        // Animation: Flame moves backward with slight wobble
        hitPoint.z += 5.0 + cos(t);

        // Distortion: Rotate x/z plane based on y-coordinate
        float rotationAngle = hitPoint.y * 0.5;
        mat2 rotationMatrix = mat2(
            cos(rotationAngle), -sin(rotationAngle),
            sin(rotationAngle),  cos(rotationAngle)
        );
        hitPoint.xz *= rotationMatrix;

        // Flame shape: Expanding upward cone
        hitPoint.xz /= max(hitPoint.y * 0.1 + 1.0, 0.1);

        // Turbulence effect using fractal noise (fBm)
        float turbulenceFrequency = 2.0;
        for (int turbulenceIter = 0; turbulenceIter < 5; turbulenceIter++) {
            vec3 turbulenceOffset = cos(
                (hitPoint.yzx - vec3(t / 0.1, t, turbulenceFrequency))
                * turbulenceFrequency
            );
            hitPoint += turbulenceOffset / turbulenceFrequency;
            turbulenceFrequency /= 0.6;
        }

        // Calculate distance to flame surface (hollow cone)
        float coneRadius = length(hitPoint.xz);
        float coneDistance = abs(coneRadius + hitPoint.y * 0.3 - 0.5);

        // Compute step size for raymarching
        stepSize = 0.01 + coneDistance / 7.0;

        // Update ray depth
        rayDepth += stepSize;

        // Add color and glow effect based on depth
        vec3 gCol = sin(rayDepth / 3.0 + vec3(7.0, 2.0, 3.0)) + 1.1;
        col += gCol / stepSize;
    }

    // Tanh tonemapping

    col = tanh(col / 2000.0);


    fragColor = vec4(col, 1.0);
}
`;
