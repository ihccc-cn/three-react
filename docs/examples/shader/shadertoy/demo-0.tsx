import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../utils/create-three';
import createShadertoy from '../../../utils/create-shadertoy';

const shadertoy = `
  float squared(float value) { return value * value; }

  void main()
  {
    vec2 uvTrue = gl_FragCoord.xy / iResolution.xy;
    vec2 uv = -1.0 + 2.0 * uvTrue;

    float lineIntensity;
    float glowWidth;
    vec3 color = vec3(0.0);

    for(float i = 0.0; i < 2.0; i++) {

      uv.y += (0.2 * sin(uv.x + i/7.0 - iTime * 0.6));
          float Y = uv.y;
          lineIntensity = 0.4 + squared(1.6 * abs(mod(uvTrue.x + i / 1.3 + iTime,2.0) - 1.0));
      glowWidth = abs(lineIntensity / (1000.0 * Y));
      color += vec3(glowWidth * (2.0 + sin(iTime * 0.13)),
                        glowWidth * (2.0 - sin(iTime * 0.23)),
                        glowWidth * (2.0 - cos(iTime * 0.19)));
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// https://www.shadertoy.com/view/3XSXWV
// const shadertoy = `
// // Fork of "3D Fire [340]" by Xor. https://shadertoy.com/view/3XXSWS
// // 2025-05-06 22:13:32

// void mainImage(out vec4 fragColor, vec2 fragCoord)
// {
//     // Time for animation
//     float t = iTime;

//     // Raymarch loop iterator
//     float i = 0.0;

//     // Raymarched depth (rayDepth)
//     float rayDepth = 0.0;

//     // Raymarch step size and "Turbulence" frequency (stepSize)
//     float stepSize = 0.0;

//     // Normalize screen coordinates
//     vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
//     vec3 col = vec3(0.0);

//     // Camera setup
//     vec3 rayOrigin = vec3(0.0, 0.0, 0.0);
//     vec3 camPos = vec3(0.0, 0.0, 1.0);
//     vec3 dir0 = normalize(-camPos);
//     vec3 up = vec3(0.0, 1.0, 0.0);
//     vec3 right = normalize(cross(dir0, up));
//     up = cross(right, dir0); // Recalculate up to ensure orthogonality

//     // Calculate ray direction based on screen UV
//     vec3 rd = normalize(
//         dir0
//         + up * (uv.y + 1.0 / iResolution.y)
//         + right * (uv.x + 1.0 / iResolution.x)
//     );

//     // Raymarching loop with 50 iterations
//     for (i = 0.0; i < 50.0; i++) {
//         // Compute raymarch sample point
//         vec3 hitPoint = rayOrigin + rayDepth * rd;

//         // Animation: Flame moves backward with slight wobble
//         hitPoint.z += 5.0 + cos(t);

//         // Distortion: Rotate x/z plane based on y-coordinate
//         float rotationAngle = hitPoint.y * 0.5;
//         mat2 rotationMatrix = mat2(
//             cos(rotationAngle), -sin(rotationAngle),
//             sin(rotationAngle),  cos(rotationAngle)
//         );
//         hitPoint.xz *= rotationMatrix;

//         // Flame shape: Expanding upward cone
//         hitPoint.xz /= max(hitPoint.y * 0.1 + 1.0, 0.1);

//         // Turbulence effect using fractal noise (fBm)
//         float turbulenceFrequency = 2.0;
//         for (int turbulenceIter = 0; turbulenceIter < 5; turbulenceIter++) {
//             vec3 turbulenceOffset = cos(
//                 (hitPoint.yzx - vec3(t / 0.1, t, turbulenceFrequency))
//                 * turbulenceFrequency
//             );
//             hitPoint += turbulenceOffset / turbulenceFrequency;
//             turbulenceFrequency /= 0.6;
//         }

//         // Calculate distance to flame surface (hollow cone)
//         float coneRadius = length(hitPoint.xz);
//         float coneDistance = abs(coneRadius + hitPoint.y * 0.3 - 0.5);

//         // Compute step size for raymarching
//         stepSize = 0.01 + coneDistance / 7.0;

//         // Update ray depth
//         rayDepth += stepSize;

//         // Add color and glow effect based on depth
//         vec3 gCol = sin(rayDepth / 3.0 + vec3(7.0, 2.0, 3.0)) + 1.1;
//         col += gCol / stepSize;
//     }

//     // Tanh tonemapping

//     col = tanh(col / 2000.0);

//     fragColor = vec4(col, 1.0);
// }

//   `;

// https://www.shadertoy.com/view/XsX3zS
// const shadertoy = `
// #define WAVES 8.0

// void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
// 	vec2 uv = -1.0 + 2.0 * fragCoord.xy / iResolution.xy;

// 	float time = iTime * 1.0;

// 	vec3 color = vec3(0.0);

// 	for (float i=0.0; i<WAVES + 1.0; i++) {
// 		float freq = 1.0;

// 		vec2 p = vec2(uv);

// 		p.x += i * 0.04 + freq * 0.03;
// 		p.y += sin(p.x * 10.0 + time) * cos(p.x * 2.0) * freq * 0.2 * ((i + 1.0) / WAVES);
// 		float intensity = abs(0.01 / p.y) * clamp(freq, 0.35, 2.0);
// 		color += vec3(1.0 * intensity * (i / 5.0), 0.5 * intensity, 1.75 * intensity) * (3.0 / WAVES);
// 	}

// 	fragColor = vec4(color, 1.0);
// }
// `;

// const shadertoy = `
// /*
// 2D LED Spectrum - Visualiser
// Based on Led Spectrum Analyser by: simesgreen - 27th February, 2013 https://www.shadertoy.com/view/Msl3zr
// 2D LED Spectrum by: uNiversal - 27th May, 2015
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// */

// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
//     // create pixel coordinates
//     vec2 uv = fragCoord.xy / iResolution.xy;

//     // quantize coordinates
//     const float bands = 30.0;
//     const float segs = 40.0;
//     vec2 p;
//     p.x = floor(uv.x*bands)/bands;
//     p.y = floor(uv.y*segs)/segs;

//     // read frequency data from first row of texture
//     float fft  = 0.2;

//     // led color
//     vec3 color = mix(vec3(0.0, 2.0, 0.0), vec3(2.0, 0.0, 0.0), sqrt(uv.y));

//     // mask for bar graph
//     float mask = (p.y < fft) ? 1.0 : 0.1;

//     // led shape
//     vec2 d = fract((uv - p) *vec2(bands, segs)) - 0.5;
//     float led = smoothstep(0.5, 0.35, abs(d.x)) *
//                 smoothstep(0.5, 0.35, abs(d.y));
//     vec3 ledColor = led*color*mask;

//     // output final color
//     fragColor = vec4(ledColor, 1.0);
// }

// `;

function demo(opts?: Record<string, any>) {
  const engine = CreateThree.init({ ...opts });
  engine.addPerspectiveCamera();
  // engine.addAmbientLight();
  return createShadertoy(engine, shadertoy);
}

const App = () => <ThreeViewer render={demo} />;

export default App;
