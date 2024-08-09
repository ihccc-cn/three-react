const LOCA_SHADER: Record<string, any> = {};

function _defineProperty(n, r, i) {
  return (
    r in n
      ? Object.defineProperty(n, r, {
          value: i,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (n[r] = i),
    n
  );
}

var lightUniforms =
    '\n#if defined(ACCEPT_LIGHT) && defined(HAS_LIGHTS)\n    #ifdef NUMBER_OF_AMBIENT_LIGHTS\n        struct AmbientLight {\n            float intensity;\n            vec3 lightColor; \n        };\n        uniform AmbientLight ambientLight; \n    #endif\n\n    #ifdef NUMBER_OF_POINT_LIGHTS\n        struct PointLight {\n            float intensity;\n            float dist;\n            vec3 lightColor;\n            vec3 position;\n        };\n        uniform PointLight pointLights[NUMBER_OF_POINT_LIGHTS]; \n    #endif\n\n    #ifdef NUMBER_OF_DIRECTIONAL_LIGHTS\n        struct DirectionalLight {\n            float intensity;\n            vec3 lightColor;\n            vec3 direction;\n        };\n        uniform DirectionalLight directionalLights[NUMBER_OF_DIRECTIONAL_LIGHTS]; \n    #endif\n#endif\n',
  lightFunctions =
    '\n#if defined(ACCEPT_LIGHT) && defined(HAS_LIGHTS)\n    struct DiffHighLight {\n        vec3 diffuse;\n        vec3 highLight;\n    };\n\n    // \u73AF\u5883\u53CD\u5C04\n    vec3 ambient(vec3 ambLightColor, float ambIntensity) {\n        return ambLightColor * ambIntensity;\n    }\n\n    vec3 diffuse(\n        vec3 normal,\n        vec3 lightDir,\n        vec3 lightColor,\n        float lightIntensity,\n        float weaken\n    ) {\n        vec3 nNormal = normalize(normal);\n        //\u8BA1\u7B97\u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u7684\u70B9\u79EF\n        float nDotL = max(dot(normalize(lightDir), nNormal), 0.0);\n        //\u8BA1\u7B97\u6F2B\u53CD\u5C04\u5149\u7684\u989C\u8272\n        return lightColor * nDotL * lightIntensity * weaken;\n    }\n\n    // \u955C\u9762\u53CD\u5C04\n    vec3 reflectLight(\n        vec3 cameraPosition,\n        vec3 lightDir,\n        vec3 position,\n        vec3 normal,\n        vec3 lightColor,\n        float shininess,\n        float lightIntensity,\n        float weaken\n    ) {\n        float specularLightWeighting = 0.0;\n        // vec3 lightDir = normalize(lightPosition - position);\n        vec3 cameraDirection = normalize(cameraPosition - position);\n        vec3 reflectionDirection = reflect(-lightDir, normal);\n        specularLightWeighting = pow(max(dot(reflectionDirection, cameraDirection), 0.0), shininess);\n        return lightColor * specularLightWeighting * lightIntensity * weaken;\n    }\n\n    // \u8BA1\u7B97\u8870\u51CF\u91CF\n    float lightWeaken(vec3 lightPosition, vec3 position, float distanceIntensity) {\n        // \u5149\u6E90\u548C\u5F53\u524D\u7684\u8DDD\u79BB\uFF0C\u8BA1\u7B97\u8870\u51CF\n        float dist = distance(lightPosition, position);\n        float weaken;\n        if(distanceIntensity > 0.0) {\n            weaken = clamp(-dist / distanceIntensity + 1.0, 0.0, 1.0);\n        } else {\n            weaken = 1.0;\n        }\n        return weaken;\n    }\n\n    // \u8BA1\u7B97\u70B9\u5149\u7684\u6F2B\u53CD\u5C04\u548C\u955C\u9762\u53CD\u5C04\n    DiffHighLight pointLightCalc(vec3 pointPosition, vec3 pointLightColor, float pointDistance, float pointIntensity) {\n        vec3 normal = normalize(vNormal);\n        vec3 lightDir = normalize(pointPosition - vPosition);\n        float weaken = lightWeaken(pointPosition, vPosition, pointDistance);\n        vec3 diff = diffuse(normal, lightDir, pointLightColor, pointIntensity, weaken);\n        vec3 highL = reflectLight(cameraPosition, lightDir, vPosition, normal, pointLightColor, shininess, pointIntensity, weaken);\n        DiffHighLight result;\n        result.diffuse = diff;\n        result.highLight = highL;\n        return result;\n    }\n\n    // \u8BA1\u7B97\u5E73\u884C\u5149\u7684\u6F2B\u53CD\u5C04\u548C\u955C\u9762\u53CD\u5C04\n    DiffHighLight dirLightCalc(vec3 dirVec, vec3 dirLightColor, float dirIntensity) {\n        vec3 normal = normalize(vNormal);\n        vec3 diff = diffuse(normal, -dirVec, dirLightColor, dirIntensity, 1.0);\n        // vec3 highL = reflectLight(cameraPosition, normalize(dirVec), vPosition, normal, dirLightColor, shininess, dirIntensity, 1.0);\n        DiffHighLight result;\n        result.diffuse = diff;\n        result.highLight = vec3(0);\n        return result;\n    }\n#endif\n',
  lightMainCompute =
    '\n#if defined(ACCEPT_LIGHT) && defined(HAS_LIGHTS)\n\n    DiffHighLight diffHighLight;\n    vec3 amb = vec3(0.0, 0.0, 0.0);\n    vec3 diffuse = vec3(0.0, 0.0, 0.0);\n    vec3 highLight = vec3(0.0, 0.0, 0.0);  \n\n    #ifdef NUMBER_OF_AMBIENT_LIGHTS\n        amb = ambient(ambientLight.lightColor, ambientLight.intensity) * gl_FragColor.rgb;\n    #endif\n\n    #ifdef NUMBER_OF_POINT_LIGHTS\n        for (int i = 0; i < NUMBER_OF_POINT_LIGHTS; i++) {\n            PointLight l = pointLights[i];\n            diffHighLight = pointLightCalc(l.position, l.lightColor, l.dist, l.intensity);\n            diffuse += diffHighLight.diffuse;\n            highLight += diffHighLight.highLight;\n        }\n    #endif\n\n    #ifdef NUMBER_OF_DIRECTIONAL_LIGHTS\n        for (int i = 0; i < NUMBER_OF_DIRECTIONAL_LIGHTS; i++) {\n            DirectionalLight l = directionalLights[i];\n            diffHighLight = dirLightCalc(l.direction, l.lightColor, l.intensity);\n            diffuse += diffHighLight.diffuse;\n            highLight += diffHighLight.highLight;   \n        }\n\n    #endif\n\n    gl_FragColor.rgb = amb + diffuse * gl_FragColor.rgb + highLight * gl_FragColor.rgb;\n\n#endif\n',
  LightIncludes = {
    lightUniforms: lightUniforms,
    lightFunctions: lightFunctions,
    lightMainCompute: lightMainCompute,
  },
  __defProp$t = Object.defineProperty,
  __getOwnPropSymbols$t = Object.getOwnPropertySymbols,
  __hasOwnProp$t = Object.prototype.hasOwnProperty,
  __propIsEnum$t = Object.prototype.propertyIsEnumerable,
  __defNormalProp$t = function (n, r, i) {
    return r in n
      ? __defProp$t(n, r, { Fr: !0, Lr: !0, writable: !0, value: i })
      : (n[r] = i);
  },
  __spreadValues = function (n, r) {
    for (var i in r || (r = {}))
      __hasOwnProp$t.call(r, i) && __defNormalProp$t(n, i, r[i]);
    var s = !0,
      a = !1,
      o = void 0;
    if (__getOwnPropSymbols$t)
      try {
        for (
          var l = __getOwnPropSymbols$t(r)[Symbol.iterator](), u;
          !(s = (u = l.next()).done);
          s = !0
        ) {
          var i = u.value;
          __propIsEnum$t.call(r, i) && __defNormalProp$t(n, i, r[i]);
        }
      } catch (f) {
        (a = !0), (o = f);
      } finally {
        try {
          !s && l.return != null && l.return();
        } finally {
          if (a) throw o;
        }
      }
    return n;
  };

const ColorGLSL = {
  getColor: function n(r: any) {
    return {
      uniform: { isPick: r.prop('isPick') },
      attribute: { pickColor: r.prop('pickColor') },
    };
  },
  getColorShader: function n() {
    return {
      vertex:
        '\n                uniform bool isPick;\n                attribute vec4 pickColor;\n                varying vec4 vPickColor;\n            ',
      fragment:
        '\n                uniform bool isPick;\n                varying vec4 vPickColor;\n            ',
      mainVert: '\n                vPickColor = pickColor;\n            ',
      mainFrag:
        '\n                if(isPick) {\n                    gl_FragColor = vec4(vPickColor.xyzw / 255.0);\n                }\n            ',
    };
  },
};

const RenderUtil = {
  getMipMap: function n(r, i) {
    var s = {
        mipmap: 'nice',
        min: 'nearest mipmap linear',
        mag: 'linear',
        wrapS: 'repeat',
        wrapT: 'repeat',
      },
      a = Math.log2(r),
      o = Math.log2(i);
    return a === ~~a && o === ~~o ? s : { min: 'linear', mag: 'linear' };
  },
  getBlend: function n() {
    var r =
        arguments.length > 0 && arguments[0] !== void 0
          ? arguments[0]
          : 'normal',
      i = {
        normal: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 'one minus src alpha',
        },
        lighter: { srcRGB: 1, srcAlpha: 1, dstRGB: 1, dstAlpha: 1 },
        darker: {
          srcRGB: 'dst color',
          srcAlpha: 1,
          dstRGB: 'dst color',
          dstAlpha: 1,
        },
        zero: { srcRGB: 0, srcAlpha: 0, dstRGB: 0, dstAlpha: 0 },
      };
    return i[r];
  },
  getBezier: function n() {
    var r =
      '\n            // \u4E8C\u6B21\n            float QuadraticIn (float k) {\n                return pow(k, 2.);\n            }\n            float QuadraticOut (float k) {\n                return k * (2.0 - k);\n            }\n            float QuadraticInOut (float k) {\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * k * k;\n                }\n                return -0.5 * (--k * (k - 2.0) - 1.0);\n            }\n\n            // \u4E09\u6B21\n            float CubicIn (float k) {\n                return pow(k, 3.);\n            }\n            float CubicOut (float k) {\n                return pow(--k, 3.) + 1.0;\n            }\n            float CubicInOut (float k) {\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * pow(k, 3.);\n                }\n                return 0.5 * ((k -= 2.0) * k * k + 2.0);\n            }\n\n            // \u56DB\u6B21\n            float QuarticIn (float k) {\n                return pow(k, 4.);\n            }\n            float QuarticOut (float k) {\n                return 1.0 - (pow(--k, 4.));\n            }\n            float QuarticInOut (float k) {\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * pow(k, 4.);\n                }\n                return 0.5 * ((k -= 2.0) * pow(k, 3.) + 2.0);\n            }\n\n            // \u4E94\u6B21\n            float QuinticIn (float k) {\n                return pow(k, 5.);\n            }\n            float QuinticOut (float k) {\n                return 1.0 - (pow(--k, 5.));\n            }\n            float QuinticInOut (float k) {\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * pow(k, 5.);\n                }\n                return 0.5 * ((k -= 2.0) * pow(k, 4.) + 2.0);\n            }\n\n            // \u516D\u6B21\n            float SinusoidalIn (float k) {\n                float pi = 3.14159265;\n                return 1.0 - cos(k * pi / 2.0);\n            }\n            float SinusoidalOut (float k) {\n                float pi = 3.14159265;\n                return sin(k * pi / 2.0);\n            }\n            float SinusoidalInOut (float k) {\n                float pi = 3.14159265;\n                return 0.5 * (1.0 - cos(pi * k));\n            }\n\n            // \u4E03\u6B21\n            float ExponentialIn (float k) {\n                return k == 0.0 ? 0.0 : pow(1024.0, k - 1.0);\n            }\n            float ExponentialOut (float k) {\n                return k == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * k);\n            }\n            float ExponentialInOut (float k) {\n                // if (k == 0.0) {\n                //     return 0.0;\n                // }\n                // if (k == 1.0) {\n                //     return 1.0;\n                // }\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * pow(1024.0, k - 1.0);\n                }\n                return 0.5 * (-pow(2.0, -10.0 * (k - 1.0)) + 2.0);\n            }\n\n            // \u516B\u6B21\n            float CircularIn (float k) {\n                return 1.0 - sqrt(1.0 - k * k);\n            }\n            float CircularOut (float k) {\n                return sqrt(1.0 - (--k * k));\n            }\n            float CircularInOut (float k) {\n                if ((k *= 2.0) < 1.0) {\n                    return -0.5 * (sqrt(1.0 - k * k) - 1.0);\n                }\n                return 0.5 * (sqrt(1.0 - (k -= 2.0) * k) + 1.0);\n            }\n\n            // \u4E5D\u6B21\n            float ElasticIn (float k) {\n                float pi = 3.14159265;\n                float s;\n                float a = 0.1;\n                float p = 0.4;\n                // if (k == 0.0) {\n                //     return 0.0;\n                // }\n                // if (k == 1.0) {\n                //     return 1.0;\n                // }\n                if (a < 1.0) {\n                    a = 1.0;\n                    s = p / 4.0;\n                } else {\n                    s = p * asin(1.0 / a) / (2.0 * pi);\n                }\n                // return pow(2.0, 10.0 * (k -= 1.0));\n                return -(a * pow(2.0, 10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p));\n            }\n            float ElasticOut (float k) {\n                float pi = 3.14159265;\n                float s;\n                float a = 0.1;\n                float p = 0.4;\n                // if (k == 0.0) {\n                //     return 0.0;\n                // }\n                // if (k == 1.0) {\n                //     return 1.0;\n                // }\n                if (a < 1.0) {\n                    a = 1.0;\n                    s = p / 4.0;\n                } else {\n                    s = p * asin(1.0 / a) / (2.0 * pi);\n                }\n                return (a * pow(2.0, -10.0 * k) * sin((k - s) * (2.0 * pi) / p) + 1.0);\n            }\n            float ElasticInOut (float k) {\n                float pi = 3.14159265;\n                float s;\n                float a = 0.1;\n                float p = 0.4;\n                // if (k == 0.0) {\n                //     return 0.0;\n                // }\n                // if (k == 1.0) {\n                //     return 1.0;\n                // }\n                if (a < 1.0) {\n                    a = 1.0;\n                    s = p / 4.0;\n                } else {\n                    s = p * asin(1.0 / a) / (2.0 * pi);\n                }\n                if ((k *= 2.0) < 1.0) {\n                    return -0.5 * (a * pow(2.0, 10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p));\n                }\n                return a * pow(2.0, -10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p) * 0.5 + 1.0;\n            }\n\n            // \u56DE\u5F39\n            float BackIn (float k) {\n                float s = 1.70158;\n                return pow(k, 2.) * ((s + 1.0) * k - s);\n            }\n            float BackOut (float k) {\n                float s = 1.70158;\n                return pow(--k, 2.) * ((s + 1.0) * k + s) + 1.0;\n            }\n            float BackInOut (float k) {\n                float s = 1.70158 * 1.525;\n                if ((k *= 2.0) < 1.0) {\n                    return 0.5 * (pow(k, 2.) * ((s + 1.0) * k - s));\n                }\n                return 0.5 * ((k -= 2.0) * k * ((s + 1.0) * k + s) + 2.0);\n            }\n\n            // \u53CD\u590D\u6A2A\u8DF3\n            float BounceOut (float k) {\n                if (k < (1.0 / 2.75)) {\n                    return 7.5625 * k * k;\n                } else if (k < (2.0 / 2.75)) {\n                    return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;\n                } else if (k < (2.5 / 2.75)) {\n                    return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;\n                } else {\n                    return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;\n                }\n            }\n            float BounceIn (float k) {\n                return 1.0 - BounceOut(1.0 - k);\n            }\n            float BounceInOut (float k) {\n                if (k < 0.5) {\n                    return BounceIn(k * 2.0) * 0.5;\n                }\n                return BounceOut(k * 2.0 - 1.0) * 0.5 + 0.5;\n            }\n            float getBezier(int type, float delayTime, float transformTime, float timer) {\n                if(type == 0) {\n                    return QuadraticIn(timer);\n                } else if(type == 1) {\n                    return QuadraticOut(timer);\n                } else if(type == 2) {\n                    return QuadraticInOut(timer);\n                } else if(type == 3) {\n                    return CubicIn(timer);\n                } else if(type == 4) {\n                    return CubicOut(timer);\n                } else if(type == 5) {\n                    return CubicInOut(timer);\n                } else if(type == 6) {\n                    return QuarticIn(timer);\n                } else if(type == 7) {\n                    return QuarticOut(timer);\n                } else if(type == 8) {\n                    return QuarticInOut(timer);\n                } else if(type == 9) {\n                    return QuinticIn(timer);\n                } else if(type == 10) {\n                    return QuinticOut(timer);\n                } else if(type == 11) {\n                    return QuinticInOut(timer);\n                } else if(type == 12) {\n                    return SinusoidalIn(timer);\n                } else if(type == 13) {\n                    return SinusoidalOut(timer);\n                } else if(type == 14) {\n                    return SinusoidalInOut(timer);\n                } else if(type == 15) {\n                    return ExponentialIn(timer);\n                } else if(type == 16) {\n                    return ExponentialOut(timer);\n                } else if(type == 17) {\n                    return ExponentialInOut(timer);\n                } else if(type == 18) {\n                    return CircularIn(timer);\n                } else if(type == 19) {\n                    return CircularOut(timer);\n                } else if(type == 20) {\n                    return CircularInOut(timer);\n                } else if(type == 21) {\n                    return ElasticIn(timer);\n                } else if(type == 22) {\n                    return ElasticOut(timer);\n                } else if(type == 23) {\n                    return ElasticInOut(timer);\n                } else if(type == 24) {\n                    return BackIn(timer);\n                } else if(type == 25) {\n                    return BackOut(timer);\n                } else if(type == 26) {\n                    return BackInOut(timer);\n                } else if(type == 27) {\n                    return BounceIn(timer);\n                } else if(type == 28) {\n                    return BounceOut(timer);\n                } else if(type == 29) {\n                    return BounceInOut(timer);\n                } else {\n                    return timer;\n                }\n            }';
    return r.replace(/\/\/.*\n/g, '').replace(/\s\s+/g, '');
  },
  getScaleType: function n(r: any) {
    return '\n            uniform vec4 '
      .concat(
        r,
        'Time; // time/delay/trasform/random\n            uniform vec4 ',
      )
      .concat(
        r,
        'Type; // type/repeat/yoyo/duration\n            uniform vec2 ',
      )
      .concat(r, 'Value; // start/end\n            float ')
      .concat(
        r,
        'ScaleValue(float sule) {\n                bool isYoyoDuration = ',
      )
      .concat(r, 'Type.z == 1.0 && mod(ceil(')
      .concat(r, 'Time.x / ')
      .concat(
        r,
        'Type.w), 2.0) == 0.0;\n                bool isYoyoLast = mod(',
      )
      .concat(r, 'Type.y, 2.0) == 0.0 && ')
      .concat(
        r,
        'Type.z == 1.0;\n                float timer = 0.0;\n                float vs = ',
      )
      .concat(r, 'Value.x;\n                float ve = ')
      .concat(r, 'Value.y;\n                if(')
      .concat(r, 'Time.w == 0.0) {\n                    timer = fract(')
      .concat(r, 'Time.x / ')
      .concat(
        r,
        'Type.w);\n                    // \u6700\u540E\u4E00\u8F6E,\u7ED3\u675F\n                    if(',
      )
      .concat(r, 'Time.x >= ')
      .concat(r, 'Type.y * ')
      .concat(
        r,
        'Type.w) {\n                        if(isYoyoLast) {\n                            return vs;\n                        }\n                        return ve;\n                    }\n                    if(isYoyoDuration) {\n                        timer = 1.0 - timer;\n                    }\n                    float t = getBezier(int(',
      )
      .concat(r, 'Type.x), 0.0, ')
      .concat(
        r,
        'Type.w, timer);\n                    return t * (ve - vs) + vs;\n                }\n\n                float randomDelay = (sin(length(sule)) + 1.0) / 2.0 * ',
      )
      .concat(r, 'Time.y;\n                timer = (')
      .concat(r, 'Time.x - randomDelay) / ')
      .concat(
        r,
        'Time.z;\n                // \u7B2C\u4E00\u8F6E\n                if(timer < 0.0) {\n                    return 0.0;\n                } else if(',
      )
      .concat(r, 'Time.x >= randomDelay + ')
      .concat(r, 'Type.y * ')
      .concat(
        r,
        'Time.z) {\n                    // \u6700\u540E\u4E00\u8F6E,\u7ED3\u675F\n                    if(isYoyoLast) {\n                        return vs;\n                    }\n                    return ve;\n                } else {\n                    if(',
      )
      .concat(
        r,
        'Type.z == 1.0 && mod(ceil(timer), 2.0) == 0.0) {\n                        timer = 1.0 - fract(timer);\n                    } else {\n                        timer = fract(timer);\n                    }\n                    float t = getBezier(int(',
      )
      .concat(r, 'Type.x), ')
      .concat(r, 'Time.y, ')
      .concat(
        r,
        'Time.z, timer);\n                    return t * (ve - vs) + vs;\n                }\n            }\n        ',
      )
      .replace(/\/\/.*\n/g, '')
      .replace(/\s\s+/g, '');
  },
};

LOCA_SHADER.PolygonShader = {
  vertex:
    '\n        precision highp float;\n\n        attribute vec4 position;\n        attribute vec3 normal;\n        attribute vec4 color;\n        attribute vec2 uv;\n        attribute vec2 textureSize;\n        attribute float topOrBottom;\n\n        varying vec3 vNormal;\n        varying vec4 vColor;\n        varying vec3 vPosition;\n        varying vec2 vUv;\n        varying vec2 vTexSize;\n        '
      .concat(ColorGLSL.getColorShader().vertex, '\n        ')
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('height'), '\n        ')
      .concat(
        RenderUtil.getScaleType('altitude'),
        '\n\n        uniform mat4 mvp;\n\n        void main() {\n            vec3 realPos = position.xyz;\n            float altitudeScale = altitudeScaleValue(position.w);\n            float heightScale = heightScaleValue(position.w);\n            if(topOrBottom == 0.0) {\n                realPos = vec3(position.xy, position.z * altitudeScale);\n            }\n            if(topOrBottom == 1.0) {\n                realPos = vec3(position.xy, position.z * heightScale);\n            }\n            vColor = color;\n            vNormal = normal;\n            vPosition = realPos;\n            vUv = vec2(uv.x / textureSize.x, uv.y / textureSize.y);\n            vTexSize = textureSize;\n            gl_Position = mvp * vec4(realPos, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        varying vec4 vColor;\n\n        // \u5982\u679C\u9700\u8981\u5149\u7167\uFF0C\u8FD9\u4E24\u4E2A\u53D8\u91CF\u662F\u5FC5\u987B\u7684\n        varying vec3 vNormal;\n        varying vec3 vPosition;\n        varying vec2 vUv;\n        varying vec2 vTexSize;\n\n        uniform float opacity;\n        uniform sampler2D texture;\n        uniform bool useTexture;\n\n        uniform vec3 cameraPosition;\n        uniform float shininess;\n        #include <lightUniforms,lightFunctions>;\n\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            if(useTexture && vTexSize.x >= 0.0) {\n                gl_FragColor = texture2D(texture, vUv);\n            } else {\n                gl_FragColor = vColor;\n            }\n            #include <lightMainCompute>;\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
  includes: __spreadValues({}, LightIncludes),
};

LOCA_SHADER.LineShader = {
  vertex:
    '\n        precision highp float;\n        #define PI 3.14159265359\n        attribute vec4 position;\n        attribute vec4 color;\n        attribute vec4 borderColor;\n        attribute vec4 dash;\n        attribute vec3 normal;\n        attribute float lineWidth;\n        attribute float borderWidth;\n        attribute vec2 distance;\n        varying vec4 vColor;\n        varying vec4 vBorderColor;\n        varying vec4 vDash;\n        varying vec2 vNormal;\n        varying float vDist;\n        varying float vWidth;\n        varying float vBorderWidth;\n        uniform mat4 mvp;\n        uniform float resolution;\n        uniform float unit; // 0: px; 1: meter;\n        '
      .concat(ColorGLSL.getColorShader().vertex, '\n        ')
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('lineWidth'), '\n        ')
      .concat(
        RenderUtil.getScaleType('altitude'),
        '\n\n        void main() {\n            vColor = color;\n            vBorderColor = borderColor;\n            vDash = dash;\n            vDist = distance.y; // \u8DDD\u79BB\u7EBF\u8D77\u59CB\u70B9\u7684\u8DDD\u79BB\n            float res = unit == 0.0 ? resolution : 1.0;\n            float lineWidthScale = lineWidthScaleValue(position.w);\n            float altitudeScale = altitudeScaleValue(position.w);\n            float realLineWidth = (borderWidth + lineWidth / 2.) * res * lineWidthScale;\n            vWidth = lineWidth * lineWidthScale;\n            vBorderWidth = borderWidth * lineWidthScale;\n            // \u7EBF\u6BB5\u7684\u6CD5\u5411\u91CF\u8FD8\u539F\n            vec2 tmpNormal = normal.xy;\n            float angleLineWidth = realLineWidth;\n\n            // z \u65B9\u5411\u4E0D\u7B49\u4E8E 0\uFF0C\u8BF4\u660E\u662F\u62D0\u89D2\u5411\u91CF\uFF0Cz \u4EE3\u8868\u89D2\u5EA6\uFF0C\u9700\u8981\u5BF9\u7EBF\u5BBD\u8FDB\u884C\u8BA1\u7B97\n            if(normal.z != 0.0) {\n                angleLineWidth /= sin(abs(normal.z / 2.));\n                angleLineWidth = max(realLineWidth, min(distance.x, angleLineWidth));\n\n                // \u62D0\u89D2\u5904\u7684\u6CD5\u5411\u91CF\uFF0C\u9700\u8981\u8FD8\u539F\u6210\u5782\u76F4\u7EBF\u6BB5\u65B9\u5411\u7684\u5411\u91CF\n                // \u8FD9\u6837\u624D\u80FD\u5C06\u63CF\u8FB9\u8BA1\u7B97\u51FA\u6765\n                // \u65CB\u8F6C\u89D2\u5EA6\u8BA1\u7B97\n                float theta = normal.z / abs(normal.z) * ((PI - abs(normal.z)) / 2.);\n                // \u65CB\u8F6C\n                tmpNormal =\n                    mat2(cos(theta), -sin(theta),\n                         sin(theta), cos(theta)) * tmpNormal;\n            }\n            vNormal = normalize(tmpNormal.xy);\n\n            vec3 pos = position.xyz + vec3(normal.xy, 0) * angleLineWidth;\n            gl_Position = mvp * vec4(pos.xy, pos.z * altitudeScale, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        uniform float resolution;\n        uniform float unit; // 0: px; 1: meter;\n        uniform float opacity;\n        varying vec4 vDash;\n        varying vec2 vNormal;\n        varying vec4 vColor;\n        varying float vDist;\n        varying float vWidth;\n        varying float vBorderWidth;\n        varying vec4 vBorderColor;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            float res = unit == 0.0 ? resolution : 1.0;\n            float distPixel = vDist / res;\n            float offset = mod(distPixel, vDash.r + vDash.g + vDash.b + vDash.a);\n            if(offset > vDash.r && offset < vDash.r + vDash.g) {\n                discard;\n            } else if(offset > vDash.r + vDash.g + vDash.b) {\n                discard;\n            }\n\n            gl_FragColor = vColor;\n\n            if(vBorderWidth > 0. && length(vNormal) > 1. - vBorderWidth / (vWidth / 2. + vBorderWidth)) {\n                gl_FragColor = vBorderColor;\n            }\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.HeatMapShader = {
  gray: {
    vertex:
      '\n            precision highp float;\n            attribute vec4 position;\n            attribute float value;\n            attribute float radius;\n\n            varying float vValue;\n            varying vec2 vDir;\n            varying float vRadius;\n\n            uniform vec4 bbox;\n            uniform float resolution;\n            uniform float unit; // 0: px; 1: meter;\n            uniform float maxRadius;\n            // uniform float radiusScale;\n            '
        .concat(RenderUtil.getBezier(), '\n            ')
        .concat(
          RenderUtil.getScaleType('radius'),
          '\n\n            // \u8BA1\u7B97\u65B9\u4F4D, xy \u662F\u4F4D\u7F6E, zw \u662F \u65B9\u5411 \u5750\u6807\n            vec4 getPosByDirection(vec2 pos, float direction, float r) {\n                vec2 targetPos;\n                vec2 dir;\n\n                targetPos = vec2(pos - r);\n                dir = vec2(-1, -1);\n                if (direction == 1.0) {\n                    targetPos = vec2(pos.x - r, pos.y + r);\n                    dir = vec2(-1, 1);\n                } else if (direction == 2.0) {\n                    targetPos = vec2(pos.x + r, pos.y - r);\n                    dir = vec2(1, -1);\n                } else if (direction == 3.0) {\n                    targetPos = vec2(pos + r);\n                    dir = vec2(1, 1);\n                }\n                return vec4(targetPos, normalize(dir));\n            }\n\n            void main() {\n                float radiusScale = radiusScaleValue(position.w);\n                float r = radius * radiusScale;\n                float maxR = maxRadius;\n                if(unit == 0.0) {\n                    r *= resolution;\n                    maxR *= resolution;\n                }\n                vec4 b = vec4(bbox.xy - maxR, bbox.zw + maxR);\n                vec2 center = vec2((b.z + b.x) / 2.0, (b.w + b.y) / 2.0);\n                vec2 bboxSize = vec2((b.z - b.x), (b.w - b.y)) / 2.0;\n                vec4 posDir = getPosByDirection(position.xy - center, position.z, r);\n                gl_Position = vec4(posDir.xy / bboxSize, 0, 1);\n                vValue = value;\n                vDir = posDir.zw * sqrt(r * r * 2.0);\n                vRadius = r;\n            }\n        ',
        ),
    fragment:
      '\n            precision highp float;\n            varying float vValue;\n            varying vec2 vDir;\n            varying float vRadius;\n\n            uniform float max;\n            uniform float min;\n\n            void main() {\n                float len = length(vDir);\n                gl_FragColor = vec4(1, 0, 0, (vRadius - len) / vRadius * (vValue - min) / (max - min));\n            }\n        ',
  },
  grid: {
    vertex:
      '\n            precision highp float;\n            attribute float position;\n\n            varying float vValue;\n            varying vec2 vUv;\n\n            uniform mat4 mvp;\n            uniform float resolution;\n            uniform float height;\n            uniform float unit; // 0: px; 1: meter;\n            uniform vec2 size;\n            uniform vec4 bbox;\n            uniform float maxRadius;\n            uniform vec4 heightBezier;\n            uniform sampler2D texture;\n            '
        .concat(RenderUtil.getBezier(), '\n            ')
        .concat(
          RenderUtil.getScaleType('height'),
          '\n\n            vec2 bezier(float t, vec2 P0, vec2 P1, vec2 P2, vec2 P3) {\n                float t2 = t * t;\n                float one_minus_t = 1.0 - t;\n                float one_minus_t2 = one_minus_t * one_minus_t;\n                return (P0 * one_minus_t2 * one_minus_t + P1 * 3.0 * t * one_minus_t2 + P2 * 3.0 * t2 * one_minus_t + P3 * t2 * t);\n            }\n\n            vec2 toBezier(float t, vec4 p) {\n                return bezier(t, vec2(0.0, 0.0), vec2(p.x, p.y), vec2(p.z, p.w), vec2(1.0, 1.0));\n            }\n\n            // \u8BA1\u7B97\u7EB9\u7406\u5750\u6807\n            vec2 calcUV(float index, vec2 size) {\n                float y = floor(index / size.x);\n                float x = mod(index, size.x);\n                return vec2(x / (size.x - 1.0), y / (size.y - 1.0));\n            }\n\n            // \u8BA1\u7B97\u9876\u70B9\u5750\u6807\n            vec2 calcVertex(float index, vec2 size, vec4 bbox) {\n                // \u6839\u636E\u7D22\u5F15\u83B7\u53D6\u7ECF\u7EAC\u5EA6\n                float col = mod(index, size.x);\n                float row = floor(index / size.x);\n                float widthStep = (bbox.b - bbox.r) / (size.x - 1.0);\n                float heightStep = (bbox.a - bbox.g) / (size.y - 1.0);\n                float x = bbox.x + col * widthStep;\n                float y = bbox.y + row * heightStep;\n                return vec2(x, y);\n            }\n\n            void main() {\n                float heightScale = heightScaleValue(position);\n                vUv = calcUV(position, size);\n                vec4 color = texture2D(texture, vUv);\n                float h = height * toBezier(color.a, heightBezier).y;\n                float maxR = maxRadius;\n                if(unit == 0.0) {\n                    h *= resolution;\n                    maxR *= resolution;\n                }\n                vec4 b = vec4(bbox.xy - maxR, bbox.zw + maxR);\n                gl_Position = mvp * vec4(calcVertex(position, size, b), h * heightScale, 1);\n            }\n        ',
        ),
    fragment:
      '\n            precision highp float;\n            varying vec2 vUv;\n            uniform sampler2D texture;\n            uniform float opacity;\n            uniform vec4 gradient[8];\n            uniform vec2 alpha;\n            uniform bool difference;\n            uniform bool isPick;\n\n            float fade(float low, float high, float value) {\n                if (value < low || value > high) { return 0.0; }\n                return (value-low) / (high-low);\n            }\n\n            // \u6570\u503C\u6620\u5C04\u51FD\u6570\uFF0C\u4E3A\u4E86\u5C06 x:0-1 \u6620\u5C04\u5230\u4EFB\u610F\u4E00\u4E2A [min, max] \u533A\u95F4\u7684\u503C\n            float scaleMap(float min, float max, float x) {\n                if(x == 0.0) {\n                    return x;\n                }\n                if(x < 0.0) {\n                    return min;\n                }\n                if(x > 1.0) {\n                    return max;\n                }\n                float delta = max - min;\n                return min + delta * x;\n            }\n\n            vec4 getColor(float intensity) {\n                vec3 color = vec3(0);\n                float a = 1.0;\n                color = mix(vec3(0, 0, 1), gradient[0].yzw, fade(0.0, gradient[0].x, intensity));\n                for (int gn = 0; gn < 8; gn += 1) {\n                    if (gradient[gn].x >= intensity) {\n                        \n                        // \u5F69\u8679\u6548\u679C\n                        if(difference) {\n                            color = mix(gradient[gn+1].yzw, gradient[gn].yzw, intensity);\n                        } else {\n                            // \u6B63\u5E38\u6548\u679C\n                            color = mix(gradient[gn-1].yzw, gradient[gn].yzw, fade(gradient[gn-1].x, gradient[gn].x, intensity));\n                        }\n                        break;\n                    }\n\n                    // bool isBreak = false;\n                    // if (gradient[gn].x >= intensity) {\n                    //     color = mix(gradient[gn-1].yzw, gradient[gn].yzw, intensity);\n                    //     isBreak = true;\n                    // }\n                    // float delta = gradient[gn].x - intensity;\n                    // if((delta > -0.01 && delta < 0.01) && gn > 0 && intensity <= 1.0) {\n                    //     // \u5F69\u8679\u6548\u679C\n                    //     color = mix(gradient[gn+1].yzw, gradient[gn].yzw, (delta * 100. + 1.) / 2.);\n                    //     // color = vec3(0,1,0);\n                    // }\n                    // if(isBreak) {\n                    //     break;\n                    // }\n                }\n                return vec4(color, scaleMap(alpha.x, alpha.y, intensity));\n            }\n\n            void main() {\n                vec4 gray = texture2D(texture, vUv);\n                gl_FragColor = getColor(gray.a);\n                gl_FragColor.a *= opacity;\n                if (isPick) {\n                    // \u907F\u514D\u900F\u660E\u5EA6\u5F71\u54CD\u62FE\u53D6\u51C6\u786E\u6027\uFF0C\u8FD9\u91CC\u628Aa\u901A\u9053\u7684\u503C\u8F6C\u79FB\u5230b\u901A\u9053\n                    gl_FragColor = vec4(0, 0, gray.a, 1);\n                }\n            }\n        ',
  },
};

LOCA_SHADER.ScatterShader = {
  vertex:
    '\n        precision highp float;\n        #define PI 3.14159265359\n        attribute vec3 position;\n        attribute vec4 color;\n        attribute vec4 borderColor;\n        attribute vec2 size;\n        attribute vec2 uv;\n        attribute float rotation;\n        attribute float borderWidth;\n        attribute float number;\n\n        varying vec4 vColor;\n        varying vec4 vBColor;\n        varying float vBWidth;\n        varying vec2 vUv;\n        varying vec2 vSize;\n        varying vec2 vPos;\n\n        uniform mat4 mvp;\n        uniform float resolution;\n        // 0: px, 1: meter\n        uniform float unit;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        void main() {\n            // \u5BF9\u89D2\u7EBF\u957F\u5EA6\u4E00\u534A\n            float diagonal = length(size + vec2(borderWidth * 2.0)) / 2.0;\n            float x = size.x / 2.0 + borderWidth;\n            float y = size.y / 2.0 + borderWidth;\n\n            // \u8BA1\u7B97\u9876\u70B9\u5411\u91CF\n            // 1 3 -- 0 1\n            // 0 2 -- 2 3\n            float rotNumber = mod(number + 2.0, 4.0);\n            float oneAngle = asin(x / diagonal);\n            float twoAngle = asin(y / diagonal) * 2.0;\n            float theta = rotation / 180. * PI + oneAngle;\n            if(rotNumber == 1.0) {\n                theta += twoAngle;\n            } else if(rotNumber == 2.0) {\n                theta += twoAngle + oneAngle * 2.0;\n            } else if(rotNumber == 3.0) {\n                theta += (twoAngle + oneAngle) * 2.0;\n            }\n\n            vec2 pos =\n                mat2(cos(theta), -sin(theta),\n                     sin(theta), cos(theta)) * vec2(0, 1);\n\n            float res = unit == 0.0 ? resolution : 1.0;\n\n            gl_Position = mvp * vec4(position + vec3(pos, 0) * diagonal * res, 1.0);\n        \n            vColor = color;\n            vSize = size;\n            vBWidth = borderWidth;\n            vBColor = borderColor;\n            vUv = uv;\n            vPos = pos * diagonal;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        uniform float resolution;\n        uniform float opacity;\n        uniform float textureSequence;\n        uniform sampler2D texture;\n        uniform bool useTexture;\n        uniform float animateCounter;\n\n        varying vec2 vSize;\n        varying vec4 vColor;\n        varying vec4 vBColor;\n        varying float vBWidth;\n        varying vec2 vUv;\n        varying vec2 vPos;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            if(useTexture) {\n                // 0.0001 \u89E3\u51B3 mod \u8FD0\u7B97\u7684\u7CBE\u5EA6\u8BEF\u5DEE\u95EE\u9898\u3002\n                float offset = mod(animateCounter + 0.001, textureSequence) / textureSequence;\n                gl_FragColor = texture2D(texture, vec2(vUv.x / textureSequence + offset, vUv.y));\n                // gl_FragColor = vec4(mod(textureSequence + 0.1, textureSequence) / textureSequence, 0, 0, 1);\n            } else {\n                gl_FragColor = vColor;\n\n                // \u6297\u952F\u9F7F\u50CF\u7D20\u4F4D\n                float len = length(vPos);\n                float taaRadius = 2.0;\n                if(len > vSize.x / 2.0 + vBWidth) {\n                    discard;\n                } else if(len > vSize.x / 2.0 + vBWidth - taaRadius) {\n                    gl_FragColor = vBWidth > 0.0 ? vBColor : vColor;\n                    float opa = smoothstep(1.0, 0.0, (len - (vSize.x / 2.0 + vBWidth - taaRadius)) / taaRadius);\n                    gl_FragColor.a *= opa;\n                } else if(vBWidth > 0.0 && len > vSize.x / 2.0 + taaRadius) {\n                    gl_FragColor = vBColor;\n                } else if(vBWidth > 0.0 && len > vSize.x / 2.0) {\n                    float blend = smoothstep(0.0, 1.0, (len - vSize.x / taaRadius) / taaRadius);\n                    gl_FragColor = mix(vColor, vBColor, blend);\n                }\n            }\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.LinkShader = {
  vertex:
    '\n        precision highp float;\n        attribute vec3 position;\n        attribute vec4 color;\n        varying vec4 v_color;\n        uniform mat4 mvp;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        void main() {\n            v_color = color;\n            gl_Position = mvp * vec4(position, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        varying vec4 v_color;\n        uniform float opacity;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            gl_FragColor = v_color;\n            gl_FragColor *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.PulseLineShader = {
  vertex:
    '\n        precision highp float;\n        attribute vec3 position;\n        attribute vec3 normal;\n        attribute float angle;\n        attribute float pointType;\n        attribute float distance;\n        attribute float startDistance;\n        attribute float totalDistance;\n        attribute float lineWidth;\n        attribute vec4 headColor;\n        attribute vec4 trailColor;\n        uniform mat4 mvp;\n        uniform float resolution;\n        varying float vDistance;\n        varying float vTotalDistance;\n        varying vec4 vHeadColor;\n        varying vec4 vTrailColor;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        vec3 normalizeAndMulti(vec3 vec, float multi) {\n            vec3 nNormal = normalize(vec);\n            return vec3(\n                multi * nNormal.x,\n                multi * nNormal.y,\n                multi * nNormal.z\n            );\n        }\n        \n        void main() {\n          float halfLineWidth = lineWidth / 2.0 * resolution;\n          vec3 pointPosition;\n            // \u5224\u65AD\u662F\u5426\u4E3A\u5185\u89D2\u70B9\n            if (angle != 0.0) {\n                // \u5224\u65AD\u662F\u5426\u4E3A\u89D2\u5EA6\u8FC7\u5C0F\u7684\u7279\u6B8A\u60C5\u5F62\n                bool angleIsTooSmall = halfLineWidth / tan(angle) >= distance;\n                if (angleIsTooSmall) {\n                    if (pointType == 0.0) {\n                        pointPosition = position;\n                    } else {\n                        pointPosition = position + normalizeAndMulti(normal, halfLineWidth);\n                    }\n                    vDistance = startDistance;\n                } else {\n                    pointPosition = position + normalizeAndMulti(normal, halfLineWidth / sin(angle));\n                    vDistance = startDistance + pointType * halfLineWidth / tan(angle);\n                }\n            } else {\n                // \u5916\u89D2\u70B9\n                pointPosition = position + normalizeAndMulti(normal, halfLineWidth);\n                vDistance = startDistance;\n            }\n            vTotalDistance = totalDistance;\n            vHeadColor = headColor;\n            vTrailColor = trailColor;\n            gl_Position = mvp * vec4(pointPosition, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        varying float vDistance;\n        varying float vTotalDistance;\n        varying vec4 vHeadColor;\n        varying vec4 vTrailColor;\n        uniform float interval;\n        uniform float duration;\n        uniform float time;\n        uniform float opacity;\n\n        float trailLength;\n        float offset;\n        float distanceMod;\n        float ratio;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            trailLength = vTotalDistance * interval;\n            offset = vTotalDistance * mod(time / duration * 1000.0, 1.0);\n            distanceMod = mod(vDistance + trailLength - offset, trailLength);\n            ratio = distanceMod / trailLength;\n            gl_FragColor = mix(vTrailColor, vHeadColor, ratio);\n            gl_FragColor.a *= opacity;\n\n            ',
      )
      .concat(
        ColorGLSL.getColorShader().mainFrag,
        '\n            // if (vDistance > offset) {\n            //   gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n            // } else {\n            // }\n        }\n    ',
      ),
};

LOCA_SHADER.GridShader = {
  vertex:
    '\n        precision highp float;\n\n        attribute vec4 position;\n        attribute vec3 normal;\n        attribute vec4 color;\n        attribute float topOrBottom;\n\n        varying vec3 vNormal;\n        varying vec4 vColor;\n        varying vec3 vPosition;\n\n        uniform mat4 mvp;\n        '
      .concat(ColorGLSL.getColorShader().vertex, '\n        ')
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('altitude'), '\n        ')
      .concat(
        RenderUtil.getScaleType('height'),
        '\n\n        void main() {\n            float altitudeScale = altitudeScaleValue(position.w);\n            float heightScale = heightScaleValue(position.w);\n            // \u52A8\u753B\n            vec3 realPos = position.xyz;\n            if(topOrBottom == 0.0) {\n                realPos = vec3(position.xy, position.z * altitudeScale);\n            }\n            if(topOrBottom == 1.0) {\n                realPos = vec3(position.xy, position.z * heightScale);\n            }\n            vColor = color;\n            vNormal = normal;\n            vPosition = realPos;\n            gl_Position = mvp * vec4(realPos, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        } \n    '),
  fragment:
    '\n        precision highp float;\n        varying vec4 vColor;\n\n        // \u5982\u679C\u9700\u8981\u5149\u7167\uFF0C\u8FD9\u4E24\u4E2A\u53D8\u91CF\u662F\u5FC5\u987B\u7684\n        varying vec3 vNormal;\n        varying vec3 vPosition;\n\n        uniform float opacity;\n\n        uniform vec3 cameraPosition;\n        uniform float shininess;\n        #include <lightUniforms,lightFunctions>;\n\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            gl_FragColor = vColor;\n            #include <lightMainCompute>;\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
  includes: __spreadValues({}, LightIncludes),
};

LOCA_SHADER.PointShader = {
  point: {
    vertex:
      '\n            precision highp float;\n\n            uniform mat4 mvp;\n            uniform float resolution;\n            // unit: px=0, meter=1\n            uniform float unit;\n            uniform float ratio;\n\n            attribute vec3 position;\n            attribute float radius;\n            attribute vec4 color;\n            attribute float borderWidth;\n            attribute vec4 borderColor;\n            attribute float blurWidth;\n\n            varying float vRadius;\n            varying vec4 vColor;\n            varying float vBorderWidth;\n            varying vec4 vBorderColor;\n            varying float vBlurRadius;\n            '
        .concat(ColorGLSL.getColorShader().vertex, '\n            ')
        .concat(RenderUtil.getBezier(), '\n            ')
        .concat(
          RenderUtil.getScaleType('radius'),
          '\n\n            void main() {\n                float radiusScale = radiusScaleValue(position.z);\n                float res = (unit == 1.0 ? resolution : 1.0) / ratio;\n                gl_Position = mvp * vec4(position.xy, 0, 1);\n                vRadius = radius / res * radiusScale;\n                vColor = color;\n                vBorderWidth = borderWidth / res * radiusScale;\n                vBorderColor = borderColor;\n                vBlurRadius = blurWidth / res * radiusScale;\n                gl_PointSize = (vRadius + vBorderWidth) * 2.0 * radiusScale;\n                ',
        )
        .concat(
          ColorGLSL.getColorShader().mainVert,
          '\n            }\n        ',
        ),
    fragment:
      '\n            precision highp float;\n            uniform float layerOpacity;\n            \n            varying float vRadius;\n            varying vec4 vColor;\n            varying float vBorderWidth;\n            varying vec4 vBorderColor;\n            varying float vBlurRadius;\n            '
        .concat(
          ColorGLSL.getColorShader().fragment,
          '\n\n            void main() {\n                gl_FragColor = vColor;\n                // \u6297\u952F\u9F7F\u50CF\u7D20\u4F4D\n                float realRadius = vRadius + vBorderWidth;\n                float len = distance(gl_PointCoord, vec2(0.5, 0.5)) * 2.0 * realRadius;\n                float taaRadius = 2.0;\n                if(len > realRadius) {\n                    discard;\n                } else if(len > realRadius - taaRadius) {\n                    gl_FragColor = vBorderWidth > 0.0 ? vBorderColor : vColor;\n                    float opa = smoothstep(1.0, 0.0, (len - (realRadius - taaRadius)) / taaRadius);\n                    gl_FragColor.a *= opa;\n                } else if(vBorderWidth > 0.0 && len > vRadius + taaRadius) {\n                    gl_FragColor = vBorderColor;\n                } else if(vBorderWidth > 0.0 && len > vRadius) {\n                    float blend = smoothstep(0.0, 1.0, (len - vRadius / taaRadius) / taaRadius);\n                    gl_FragColor = mix(vColor, vBorderColor, blend);\n                }\n                // float opacity_t = 1. - smoothstep(u_range[1] - 1. / u_radius, u_range[1], offset);\n\n                if(vBlurRadius >= 0.0 && len > (realRadius - vBlurRadius)) {\n                    gl_FragColor.a = smoothstep(1.0, 0.0, (len - (realRadius - vBlurRadius)) / vBlurRadius);\n                }\n                // gl_FragColor.a *= layerOpacity;\n\n                ',
        )
        .concat(
          ColorGLSL.getColorShader().mainFrag,
          '\n            }\n        ',
        ),
  },
  mx: {
    vertex:
      '\n            precision highp float;\n\n            attribute float position;\n            varying vec2 vUv;\n\n            struct UvPos {\n                vec2 uv;\n                vec2 pos;\n            };\n\n            // \u83B7\u53D6\u5750\u6807\n            UvPos getPos(float type) {\n                UvPos result;\n                vec2 uv = vec2(1);\n                vec2 pos = vec2(1);\n                if(type == 0.0) {\n                    uv = vec2(0, 0);\n                    pos = vec2(-1, -1);\n                } else if(type == 1.0) {\n                    uv = vec2(0, 1);\n                    pos = vec2(-1, 1);\n                } else if(type == 2.0) {\n                    uv = vec2(1, 0);\n                    pos = vec2(1, -1);\n                }\n                result.uv = uv;\n                result.pos = pos;\n                return result;\n            }\n\n            void main() {\n                UvPos res = getPos(position);\n                gl_Position = vec4(res.pos, 0, 1);\n                vUv = res.uv;\n            }\n        ',
    fragment:
      '\n            precision highp float;\n\n            varying vec2 vUv;\n\n            uniform float layerOpacity;\n            uniform sampler2D texture;\n\n            void main() {\n                gl_FragColor = texture2D(texture, vUv);\n                gl_FragColor.a *= layerOpacity;\n            }\n        ',
  },
};

LOCA_SHADER.IconShader = {
  vertex:
    '\n        precision highp float;\n\n        uniform mat4 mvp;\n        uniform float iconCount;\n        uniform float resolution;\n        // unit: px=0, meter=1\n        uniform float unit;\n        uniform float ratio;\n\n        attribute vec3 position;\n        attribute vec2 iconSize;\n        attribute vec2 offset;\n        attribute float rotation;\n        attribute float opacity;\n        attribute float iconIndex;\n\n        varying vec2 v_size;\n        varying float v_rotation;\n        varying float v_opacity;\n        varying vec2 v_texture_coord;\n        '
      .concat(ColorGLSL.getColorShader().vertex, '\n        ')
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('iconSize'), '\n        ')
      .concat(
        RenderUtil.getScaleType('offset'),
        '\n\n        void main() {\n            float res = unit == 1.0 ? 1.0 : resolution;\n\n            gl_Position = mvp * vec4(position.xy + offset * res * offsetScaleValue(position.z), 0, 1);\n            v_texture_coord = vec2(1.0 / iconCount * iconIndex, 0.0);\n\n            // \u8BA1\u7B97 xy \u7684\u76F8\u5BF9\u503C\n            res = unit == 1.0 ? resolution : 1.0;\n            v_size = iconSize.xy / res * ratio * iconSizeScaleValue(position.z);\n            float dist = sqrt(v_size.x * v_size.x + v_size.y * v_size.y);\n            // v_size.x = v_size.x / dist * v_size.x;\n            // v_size.y = v_size.y / dist * v_size.y;\n\n            v_rotation = rotation;\n            v_opacity = opacity;\n            gl_PointSize = dist;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        uniform sampler2D texture;\n        // uniform float resolution;\n        uniform float layerOpacity;\n        uniform float iconCount;\n\n        varying vec2 v_size;\n        varying float v_rotation;\n        varying float v_opacity;\n        varying vec2 v_texture_coord;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        vec2 rotateUV(vec2 uv, float arc, vec2 mid){\n            mat2 rotn =  mat2(cos(arc), sin(arc),\n                             -sin(arc), cos(arc));\n            return rotn * (uv - mid) + mid;\n        }\n\n        void main() {\n            vec2 txture_partial_size = vec2(1.0 / iconCount, 1);\n            gl_FragColor = vec4(0,0,0,1.0);\n\n            float maxSize = sqrt(v_size.x * v_size.x + v_size.y * v_size.y);\n\n            // \u65CB\u8F6C\uFF1A\u65CB\u8F6C\u5FC5\u987B\u5728\u653E\u7F29\u4E4B\u524D\n            vec2 uv = rotateUV(gl_PointCoord.xy, -v_rotation, vec2(0.5,0.5));\n\n            // \u653E\u7F29\uFF1A\u5750\u6807\u7A7A\u95F4\u653E\u5927\uFF0C\u4F7F\u539F\u672C\u7684[0, 1]\u53D8\u4E3A[0, 1*scale]\n            uv = vec2(\n                uv.x / v_size.x * maxSize,\n                uv.y / v_size.y * maxSize\n            );\n\n            // \u4FEE\u6B63\uFF1A\u4F7F[0, 1*scale]\u53D8\u4E3A[-1*scale/2, 0) [0, 1] (1, 1*scale/2]\u7684\u90E8\u5206\u6765\u753B\u56FE\u5F62\uFF0C\u4E24\u4FA7\u5176\u4F59\u90E8\u5206\u753B\u7A7A\u767D\n            uv = vec2(\n                uv.x - ((maxSize/v_size.x - 1.0) / 2.0),\n                uv.y - ((maxSize/v_size.y - 1.0) / 2.0)\n            );\n\n            float flag1 = step(float(uv.x), 0.0);\n            float flag2 = step(1.0, float(uv.x));\n            float flag3 = step(1.0, float(uv.y));\n            float flag4 = step(float(uv.y), 0.0);\n            float invalid = flag1 + flag2 + flag3 + flag4;\n            vec2 _uv = txture_partial_size * uv;\n            vec2 coord = v_texture_coord + _uv;\n            vec4 t_clr = texture2D(texture, coord);\n            gl_FragColor = (1.0 - invalid) * t_clr;\n            gl_FragColor.a *= v_opacity * layerOpacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.PrismShader = {
  vertex:
    '\n        precision highp float;\n\n        attribute vec4 position;\n        attribute vec4 color;\n        attribute float radius;\n        attribute float rotation;\n        attribute float id;\n        // \u8FB9\u7684\u5E8F\u53F7, \u4EE3\u8868\u5F53\u524D\u7684\u9876\u70B9\u5E8F\u53F7\n        // \u5E8F\u53F7\u4ECE\u6B63\u5317\u65B9\u5411\u5F00\u59CB\uFF0C\u987A\u65F6\u9488\u6570\n        attribute float sideNo;\n\n        varying vec3 vNormal;\n        varying vec4 vColor;\n        varying vec3 vPosition;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        uniform mat4 mvp;\n        // unit: px=0, meter=1\n        uniform float unit;\n        uniform float resolution;\n        // uniform float heightScale;\n        // uniform float altitudeScale;\n        // uniform float rotationScale;\n        // uniform float radiusScale;\n        uniform float sideNumber;\n        ',
      )
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('radius'), '\n        ')
      .concat(RenderUtil.getScaleType('height'), '\n        ')
      .concat(RenderUtil.getScaleType('altitude'), '\n        ')
      .concat(
        RenderUtil.getScaleType('rotation'),
        '\n\n        // z \u8F74\u65CB\u8F6C\n        vec2 rotateZ(vec2 a, float rad) {\n            float s = sin(rad);\n            float c = cos(rad);\n            float x = a.x;\n            float y = a.y;\n\n            // x = x * c - y * s;\n            // y = y * c + x * s;\n            // return vec2(x, y);\n            mat2 rotate = mat2(\n                c, -s,\n                s, c\n            );\n            return a * rotate;\n        }\n        // \u6839\u636E\u5E8F\u53F7\uFF0C\u8BA1\u7B97 normal \u548C\u9876\u70B9\u4F4D\u7F6E\n        struct vecInfo {\n            vec3 position;\n            vec3 normal;\n        };\n        vecInfo getVec(float rotationScale, float radiusScale) {\n            vec2 ori = vec2(0, 1);\n            float PI = 3.14159265;\n            float rot = rotation / 180.0 * PI * rotationScale;\n            float angle = PI * 2.0 / sideNumber;\n            // \u5982\u679C\u662F\u50CF\u7D20\uFF0C\u9700\u8981\u8BA1\u7B97\u4E3A\u7C73\n            float r = unit == 1.0 ? 1.0 : resolution;\n            vec2 pos = rotateZ(ori, -angle * ceil(sideNo) - rot) * radius * radiusScale * r;\n            vec3 normal = vec3(0,0,1);\n\n            // \u9876\u9762 normal \u5C31\u662F (0,0,1)\n            // \u5426\u5219\u5C31\u662F\u4FA7\u9762\uFF0C\u6211\u4EEC\u9700\u8981\u6839\u636E\u9762\u5B9A\u4E49\u4FA7\u9762\u5411\u91CF\n            // w \u5206\u91CF =1.0\uFF0C\u8BF4\u660E\u662F\u9876\u9762\n            // w = 0.5 \u8BF4\u660E\u662F\u4FA7\u9762\u7684\u9876\u70B9\n            // w = 0.0 \u8BF4\u660E\u662F\u4FA7\u9762\u7684\u5E95\u9762\n            if(position.w != 1.0) {\n                normal = vec3(rotateZ(ori, -angle * (floor(sideNo) + 0.5) - rot), 0);\n            }\n            vecInfo result;\n            result.position =vec3(pos + position.xy, position.z);\n            result.normal = normal;\n            return result;\n        }\n\n        void main() {\n            float radiusScale = radiusScaleValue(id);\n            float rotationScale = rotationScaleValue(id);\n            float heightScale = heightScaleValue(id);\n            float altitudeScale = altitudeScaleValue(id);\n            vecInfo info = getVec(rotationScale, radiusScale);\n            float r = unit == 1.0 ? 1.0 : resolution;\n            vec3 realPos = info.position.xyz;\n            // \u5E95\u90E8\n            if(position.w == 0.0) {\n                realPos = vec3(realPos.xy, realPos.z * r * altitudeScale);\n            }\n            // \u9876\u90E8\n            if(position.w > 0.0) {\n                realPos = vec3(realPos.xy, realPos.z * r * heightScale);\n            }\n            vColor = color;\n            vNormal = info.normal;\n            vPosition = realPos;\n            gl_Position = mvp * vec4(realPos, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        varying vec4 vColor;\n\n        // \u5982\u679C\u9700\u8981\u5149\u7167\uFF0C\u8FD9\u4E24\u4E2A\u53D8\u91CF\u662F\u5FC5\u987B\u7684\n        varying vec3 vNormal;\n        varying vec3 vPosition;\n\n        uniform float opacity;\n\n        uniform vec3 cameraPosition;\n        uniform float shininess;\n        #include <lightUniforms,lightFunctions>;\n\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            gl_FragColor = vColor;\n\n            #include <lightMainCompute>;\n\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
  includes: __spreadValues({}, LightIncludes),
};

LOCA_SHADER.PulseLinkShader = {
  vertex:
    '\n        precision highp float;\n        attribute vec3 position;\n        attribute vec4 color;\n        // attribute vec3 normal;\n        attribute vec3 lineDir;\n        attribute vec3 vertexNext;\n        attribute float lineWidth;\n        attribute vec2 distance;\n        attribute vec4 dash;\n        attribute float speed;\n        varying vec4 vColor;\n        varying vec4 vDash;\n        varying vec2 vDistance;\n        varying float vSpeed;\n        uniform mat4 mvp;\n        uniform vec3 cameraPosition;\n        uniform float unit; // 0: px; 1: meter;\n        uniform float resolution;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        void main() {\n            float res = unit == 0.0 ? resolution : 1.0;\n            // \u8BA1\u7B97\u5F53\u524D\u9876\u70B9\u5230\u76F8\u673A\u7684\u5411\u91CF\n            vec3 cameraDir = vec3(cameraPosition - position);\n            vec3 cameraNor = cross(cameraDir, lineDir);\n\n            vColor = color;\n            vDash = dash;\n            vSpeed = speed;\n            vDistance = distance;\n            vec3 pos = position + normalize(cameraNor) * (lineWidth / 2.0) * res;\n            gl_Position = mvp * vec4(pos, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        varying vec4 vColor;\n        varying vec4 vDash;\n        varying vec2 vDistance;\n        varying float vSpeed;\n        uniform float opacity;\n        uniform float animateCounter;\n        uniform float resolution;\n        uniform float flowLength;\n        uniform vec4 headColor;\n        uniform vec4 trailColor;\n        uniform float unit;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            float res = unit == 0.0 ? resolution : 1.0;\n            float curDist = vDistance.x;\n            float distPixel = vDistance.x / res;\n            float offset = mod(distPixel, vDash.r + vDash.g + vDash.b + vDash.a);\n            if(offset > vDash.r && offset < vDash.r + vDash.g) {\n                discard;\n            } else if(offset > vDash.r + vDash.g + vDash.b) {\n                discard;\n            }\n            float op = offset / (vDash.r + vDash.g + vDash.b + vDash.a);\n            gl_FragColor = vColor;\n\n            // \u8109\u51B2\u7C92\u5B50\n            float ligLen = flowLength * res;\n            float curTop = animateCounter * vSpeed * res / 1000.0 * 60.0;\n            float realCurTop = mod(curTop, vDistance.y);\n            float realCurBottom = mod(curTop - ligLen, vDistance.y);\n            float delta = 1.0 - (curDist - realCurBottom) / ligLen;\n            vec4 resultColor = vColor;\n\n            // \u8BF4\u660E\u662F\u5728\u672B\u7AEF\uFF0C\u5934\u90E8\u5DF2\u7ECF\u51FA\u4E86\u7AEF\u70B9\n            if(realCurTop < realCurBottom) {\n                // \u672B\u7AEF\n                if(curDist > realCurBottom) {\n                    resultColor = mix(headColor, trailColor, delta);\n                }\n                // \u59CB\u7AEF\n                if(curDist < realCurTop) {\n                    float delta = 1.0 - (vDistance.y - realCurBottom + curDist) / ligLen;\n                    resultColor = mix(headColor, trailColor, delta);\n                }\n                gl_FragColor = mix(vColor, resultColor, resultColor.a);\n            } else {\n                if(curDist < realCurTop && curDist > realCurBottom) {\n                    resultColor = mix(headColor, trailColor, delta);\n                }\n                gl_FragColor = mix(vColor, resultColor, resultColor.a);\n            }\n            gl_FragColor.a *= opacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.ZMarkerShader = {
  vertex:
    '\n        precision highp float;\n\n        uniform mat4 mvp;\n        uniform float resolution;\n        // unit: px=0, meter=1\n        uniform float unit;\n        uniform bool alwaysFront;\n        uniform float rot;\n\n        attribute vec3 rect;\n        attribute vec4 position;\n        attribute vec2 size;\n        attribute vec4 uv;\n        attribute float rotation;\n\n        varying vec2 vSize;\n        varying float vRotation;\n        varying vec2 vTextureCoord;\n        '
      .concat(ColorGLSL.getColorShader().vertex, '\n        ')
      .concat(RenderUtil.getBezier(), '\n        ')
      .concat(RenderUtil.getScaleType('altitude'), '\n        ')
      .concat(
        RenderUtil.getScaleType('rotation'),
        '\n\n        // z \u8F74\u65CB\u8F6C\n        mat4 rotateZ(mat4 a, float rad) {\n            float s = sin(rad);\n            float c = cos(rad);\n\n            // \u7B2C\u4E8C\u79CD\n            mat4 rotate = mat4(\n                c, -s, 0, 0,\n                s, c, 0, 0,\n                0, 0, 1, 0,\n                0, 0, 0, 1\n            );\n            return a * rotate;\n        }\n\n        // \u901A\u8FC7\u9876\u70B9\u8BA1\u7B97\u51FA uv\n        vec2 getUV() {\n            vec2 result = vec2(0);\n            if(rect == vec3(0, 0, 1)) {\n                // \u5DE6\u4E0B\n                result = vec2(uv);\n            } else if(rect == vec3(0, 0, 0)) {\n                // \u5DE6\u4E0A\n                result = vec2(uv.x, uv.w);\n            } else if(rect == vec3(1, 0, 1)) {\n                // \u53F3\u4E0B\n                result = vec2(uv.z, uv.y);\n            } else if(rect == vec3(1, 0, 0)) {\n                // \u53F3\u4E0A\n                result = vec2(uv.z, uv.w);\n            }\n            return result;\n        }\n\n        // \u6839\u636E rect \u83B7\u53D6\u771F\u5B9E\u7684\u5750\u6807\n        vec4 getPos(float rotationScale, float altitudeScale) {\n            float res = unit == 1.0 ? 1.0 : resolution;\n            vec4 result = vec4(position.xyz, 1);\n            result.z *= altitudeScale;\n            if(rect == vec3(0, 0, 1)) {\n                // \u5DE6\u4E0A\n                result.x = result.x - size.x * res / 2.0;\n                result.z = result.z + size.y * res;\n            } else if(rect == vec3(0, 0, 0)) {\n                // \u5DE6\u4E0B\n                result.x = result.x - size.x * res / 2.0;\n            } else if(rect == vec3(1, 0, 1)) {\n                // \u53F3\u4E0A\n                result.x = result.x + size.x * res / 2.0;\n                result.z = result.z + size.y * res;\n            } else if(rect == vec3(1, 0, 0)) {\n                // \u53F3\u4E0B\n                result.x = result.x + size.x * res / 2.0;\n            }\n\n            // \u65CB\u8F6C\n            mat4 matrix = mat4(0);\n            matrix[0].x = 1.0;\n            matrix[1].y = 1.0;\n            matrix[2].z = 1.0;\n            matrix[3].w = 1.0;\n            float r = alwaysFront ? rot : rotation * rotationScale;\n            result.xy -= position.xy;\n            result = rotateZ(matrix, r) * result;\n            result.xy += position.xy;\n            return result;\n        }\n\n        void main() {\n            float rotationScale = rotationScaleValue(position.w);\n            float altitudeScale = altitudeScaleValue(position.w);\n            gl_Position = mvp * getPos(rotationScale, altitudeScale);\n            vTextureCoord = getUV();\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision highp float;\n        uniform sampler2D texture;\n        uniform float layerOpacity;\n\n        varying vec2 vTextureCoord;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main() {\n            gl_FragColor = texture2D(texture, vTextureCoord);\n            gl_FragColor.a *= layerOpacity;\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};

LOCA_SHADER.GLTFShader = {
  vertex:
    '\n        precision mediump float;\n        attribute vec3 model_pos;\n        \n        #ifdef HAS_BASE_TEXTURE\n            attribute vec2 uvs;\n            varying vec2 vUv;\n        #endif\n\n        attribute vec3 normal_pos;\n        // attribute mat4 model_matrix;\n        uniform mat4 model_matrix;\n\n\n        varying vec3 vNormal;\n        varying vec3 vPosition;\n\n\n        uniform mat4 mvp;\n        uniform mat4 rotateMatrix;\n        // uniform vec3 point_pos;\n        attribute vec3 point_pos;\n\n        void main () {\n\n            #ifdef HAS_BASE_TEXTURE\n                vUv = uvs;\n            #endif\n\n            vNormal = normalize(normal_pos.xzy);\n            vec4 tmpPos = rotateMatrix * model_matrix * vec4(model_pos.xyz,1.);\n            \n            // vPosition \u5C40\u90E8\u58A8\u5361\u6258\u5750\u6807\n            vPosition = vec3(tmpPos.xy + point_pos.xy, tmpPos.z + point_pos.z);\n\n            vec4 pos =  mvp * vec4(tmpPos.xy + point_pos.xy, tmpPos.z + point_pos.z,1);\n            gl_Position = pos;\n\n        }\n    ',
  fragment:
    '\n            precision mediump float;\n            // precision highp float;\n\n            uniform vec4 model_texture_color;\n            uniform sampler2D texture; \n\n            uniform sampler2D MRtexture; \n\n            uniform sampler2D emissiveTexture; \n\n            uniform float roughnessFactor;\n            uniform float metallicFactor;\n\n            // uniform float ambIntensity;\n\n                \n            uniform vec3 lightDir;\n            #ifdef HAS_BASE_TEXTURE\n                varying vec2 vUv;\n            #endif\n\n            varying vec3 vNormal;\n            varying vec3 vPosition;\n\n            // uniform float shininess;\n\n            const float c_MinRoughness = 0.04;\n\n            struct PBRInfo\n            {\n                float NdotL;                  // cos angle between normal and light direction\n                float NdotV;                  // cos angle between normal and view direction\n                float NdotH;                  // cos angle between normal and half vector\n                float LdotH;                  // cos angle between light direction and half vector\n                float VdotH;                  // cos angle between view direction and half vector\n                float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)\n                float metalness;              // metallic value at the surface\n                vec3 reflectance0;            // full reflectance color (normal incidence angle)\n                vec3 reflectance90;           // reflectance color at grazing angle\n                float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])\n                vec3 diffuseColor;            // color contribution from diffuse lighting\n                vec3 specularColor;           // color contribution from specular lighting\n            };\n\n            uniform vec3 cameraPosition;\n            uniform float shininess;\n            #include <lightUniforms>;\n\n            // vec3 lightDir = normalize(lightPosition - position);\n            // vec3 cameraDirection = normalize(cameraPosition - position);\n\n\n            const float PI = 3.14159265359;\n            const float M_PI = 3.141592653589793;\n\n\n\n            // http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html\n            vec3 linearTosRGB(vec3 color)\n            {\n                const float GAMMA = 2.2;\n                const float INV_GAMMA = 1.0 / GAMMA;    \n                return pow(color, vec3(INV_GAMMA));\n            }\n\n            float DistributionGGX(vec3 N, vec3 H, float roughness)\n            {\n                float a = roughness * roughness;\n                float a2 = a * a;\n                float NdotH = max(dot(N, H), 0.0);\n                float NdotH2 = NdotH * NdotH;\n\n                float nom = a2;\n                float denom = (NdotH2 * (a2 - 1.0) + 1.0);\n                denom = PI * denom * denom;\n\n                return nom / max(denom, 0.001);\n            }\n            float GeometrySchlickGGX(float NdotV, float roughness)\n            {\n                float r = (roughness + 1.0);\n                float k = (r*r) / 8.0;\n\n                float nom   = NdotV;\n                float denom = NdotV * (1.0 - k) + k;\n\n                return nom / denom;\n            }\n            float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)\n            {\n                float NdotV = max(dot(N, V), 0.0);\n                float NdotL = max(dot(N, L), 0.0);\n                float ggx2 = GeometrySchlickGGX(NdotV, roughness);\n                float ggx1 = GeometrySchlickGGX(NdotL, roughness);\n\n                return ggx1 * ggx2;\n            }\n            vec3 fresnelSchlick(float cosTheta, vec3 F0)\n            {\n                return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);\n            }\n\n            vec3 specularReflection(PBRInfo pbrInputs)\n            {\n                return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);\n            }\n\n            float visibilityOcclusion(PBRInfo pbrInputs)\n            {\n                float NdotL = pbrInputs.NdotL;\n                float NdotV = pbrInputs.NdotV;\n                float alphaRoughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;\n\n                float GGXV = NdotL * sqrt(NdotV * NdotV * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);\n                float GGXL = NdotV * sqrt(NdotL * NdotL * (1.0 - alphaRoughnessSq) + alphaRoughnessSq);\n                return 0.5 / (GGXV + GGXL);\n            }\n\n            float microfacetDistribution(PBRInfo pbrInputs)\n            {\n                float roughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;\n                float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;\n                return roughnessSq / (M_PI * f * f);\n            }\n            vec3 diffuse(PBRInfo pbrInputs)\n            {\n                return pbrInputs.diffuseColor / M_PI;\n            }\n\n            vec3 gammaCorrection(vec3 color) {\n                return pow(color, vec3(1.0 / 2.2));\n            }\n\n\n           \n\n\n            void main () {\n                // \u57FA\u8272\n                vec4 baseColor = model_texture_color;\n\n                #ifdef HAS_BASE_TEXTURE\n                    baseColor = texture2D(texture, vUv);\n                #endif\n\n                // \u8BA1\u7B97 \u7C97\u7CD9\u5EA6 \u548C \u91D1\u5C5E\u5EA6\n           \n                float perceptualRoughness = roughnessFactor;\n                float metallic = metallicFactor;\n\n                #ifdef HAS_MR_TEXTURE\n                    vec4 MRtextureColor = texture2D(MRtexture, vUv);\n                    perceptualRoughness = MRtextureColor.g;\n                    metallic = MRtextureColor.b;\n                #endif\n \n                // c_MinRoughness = 0.04 \u7ECF\u9A8C\u503C\n                perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);\n                metallic = clamp(metallic, 0.0, 1.0);\n                float alphaRoughness = perceptualRoughness * perceptualRoughness;\n                \n\n                vec3 f0 = vec3(0.04);\n                vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);\n                diffuseColor *= 1.0 - metallic;\n                vec3 specularColor = mix(f0, baseColor.rgb, metallic);\n\n                // \u8BA1\u7B97\u53CD\u5C04\u7387 reflectance.\n                float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);\n                float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);\n                vec3 specularEnvironmentR0 = specularColor.rgb;\n                vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;\n\n                vec3 n = normalize(vNormal);\n                vec3 v = normalize(cameraPosition - vPosition);  \n                // vec3 l = normalize(u_LightDirection);             \n                // Vector from surface point to light\n\n                // \u70B9\u3001\u5E73\u884C\u5149\u3001\u73AF\u5883\u5149\n                // vec3 color = baseColor.rgb;\n                vec3 color = vec3(0.0);\n\n\n                vec3 diffuseContrib = vec3(0.0);\n                vec3 specContrib = vec3(0.0);\n\n                for (int i = 0; i < NUMBER_OF_POINT_LIGHTS; i++) {\n                    PointLight pointLight = pointLights[i];\n                    // vec3 lightPosition = vec3(1.,1.,100.);\n                    vec3 l = normalize(pointLight.position - vPosition);\n\n                    // \u8BA1\u7B97\u534A\u89D2\u5411\u91CF h \n                    vec3 h = normalize(l + v);                         \n                    vec3 reflection = -normalize(reflect(v, n));\n\n                    float NdotL = clamp(dot(n, l), 0.001, 1.0);\n                    float NdotV = clamp(abs(dot(n, v)), 0.001, 1.0);\n                    float NdotH = clamp(dot(n, h), 0.0, 1.0);\n                    float LdotH = clamp(dot(l, h), 0.0, 1.0);\n                    float VdotH = clamp(dot(v, h), 0.0, 1.0);\n\n                    PBRInfo pbrInputs = PBRInfo(\n                        NdotL,\n                        NdotV,\n                        NdotH,\n                        LdotH,\n                        VdotH,\n                        perceptualRoughness,\n                        metallic,\n                        specularEnvironmentR0,\n                        specularEnvironmentR90,\n                        alphaRoughness,\n                        diffuseColor,\n                        specularColor\n                    );\n\n                    vec3 F = specularReflection(pbrInputs);\n                    float Vis = visibilityOcclusion(pbrInputs);\n                    float D = microfacetDistribution(pbrInputs);\n\n                    // Calculation of analytical lighting contribution\n                    diffuseContrib = (1.0 - F) * diffuse(pbrInputs);\n                    specContrib = F * Vis * D;\n\n\n                    // vec3 lightColor = vec3(1.,0.,1.);\n\n\n                    color =  NdotL * pointLight.lightColor * (diffuseContrib + specContrib);\n\n                }\n\n\n                // color = mix(color, baseColor.rgb, 1.);\n\n                // \u574F\u5883\u5149\n                // vec4 ambLightColor = vec4(1.,1.,1.,1.);\n\n                // float ambintensityFactor = 0.6;\n                // if(ambIntensity) {\n                //     ambintensityFactor = ambIntensity;\n                // }\n\n\n                vec4 amb = vec4(ambientLight.lightColor, 1.) * baseColor * ambientLight.intensity;\n\n                gl_FragColor = amb + vec4(gammaCorrection(color), baseColor.a);\n                // gl_FragColor = baseColor;\n\n\n                return;\n\n              \n            }\n        ',
  includes: __spreadValues({}, LightIncludes),
};

LOCA_SHADER.LaserShader = {
  vertex:
    '\n        precision highp float;\n        attribute vec3 position;\n        attribute float dir;\n        attribute vec4 color;\n        attribute float height;\n        attribute float duration;\n        attribute float interval;\n        attribute float delay;\n        uniform float lineWidth;\n        uniform float angle;\n        uniform mat4 mvp;\n        uniform float unit;\n        uniform float resolution;\n        uniform vec3 cameraPosition;\n        varying float vRad;\n        varying vec4 vColor;\n        varying float vDistance;\n        varying float vTotalDistance;\n        varying float vDuration;\n        varying float vInterval;\n        varying float vDelay;\n        '
      .concat(
        ColorGLSL.getColorShader().vertex,
        '\n\n        void main() {\n          vRad = radians(angle);\n          float res = unit == 0.0 ? resolution : 1.0;\n          float halfWidth = (lineWidth / 2.0) * res;\n          vec3 pos = vec3(position.xy, position.z * res);\n          vec3 cameraNor = normalize(cross(cameraPosition - pos, vec3(0, 0, -1)));\n          // \u503E\u659C\n          if (pos.z > 0.0) {\n            pos += cameraNor * pos.z * tan(vRad);\n          }\n          // \u7EBF\u5BBD\n          pos += cameraNor * dir * halfWidth * cos(vRad) + vec3(0, 0, -dir * halfWidth * sin(vRad));\n          gl_Position = mvp * vec4(pos, 1.0);\n          vDistance = position.z / abs(cos(vRad));\n          vTotalDistance = height / abs(cos(vRad));\n          vColor = color;\n          vDuration = duration;\n          vInterval = interval;\n          vDelay = delay;\n          ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    '),
  fragment:
    '\n        precision mediump float;\n        uniform float opacity;\n        uniform float time;\n        uniform float trailLength;\n        uniform float repeat;\n        uniform float fadeOpacity;\n        varying float vRad;\n        varying vec4 vColor;\n        varying float vDistance;\n        varying float vTotalDistance;\n        varying float vDuration;\n        varying float vInterval;\n        varying float vDelay;\n        float ratio;\n        float distance;\n        '
      .concat(
        ColorGLSL.getColorShader().fragment,
        '\n\n        void main(){\n          float now = time * 1000.0 - vDelay;\n          if(now < 0.0) {\n            discard;\n          }\n          float count = ceil(now / (vDuration + vInterval));\n          float timeOffset = mod(now, vDuration + vInterval);\n          float fade;\n          if (count > repeat) {\n            distance = vTotalDistance;\n          } else if (count == repeat) {\n            distance = vTotalDistance * min(timeOffset / vDuration, 1.0);\n          } else {\n            distance = (vTotalDistance + trailLength) * timeOffset / vDuration;\n          }\n          if (cos(vRad) < 0.0) { // \u5411\u4E0B\n            float remain = vTotalDistance - distance;\n            if(vDistance < remain || vDistance > remain + trailLength) {\n              discard;\n            }\n            ratio = (vDistance - remain) / trailLength;\n            // \u4ECE\u8D77\u70B9\u9732\u51FA\u65F6\u989C\u8272\u8870\u51CF\n            fade = min(distance / trailLength + fadeOpacity, 1.0);\n          } else {\n            if(vDistance > distance || vDistance < distance - trailLength) {\n              discard;\n            }\n            ratio = (distance - vDistance) / trailLength;\n            // \u63A5\u8FD1\u7EC8\u70B9\u6D88\u5931\u524D\u989C\u8272\u8870\u51CF\n            fade = count >= repeat ? 1.0 : min(max((vTotalDistance - distance) / trailLength, 0.0) + fadeOpacity, 1.0);\n          }\n          gl_FragColor = vColor;\n          gl_FragColor.a *= opacity * fade * (1.0 - ratio);\n          ',
      )
      .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    '),
};
