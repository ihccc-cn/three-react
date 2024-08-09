const shader = {
  vertex: `
  precision highp float;
  #define PI 3.14159265359
  attribute vec4 position;
  attribute vec4 color;
  attribute vec4 borderColor;
  attribute vec4 dash;
  attribute vec3 normal;
  attribute float lineWidth;
  attribute float borderWidth;
  attribute vec2 distance;
  varying vec4 vColor;
  varying vec4 vBorderColor;
  varying vec4 vDash;
  varying vec2 vNormal;
  varying float vDist;
  varying float vWidth;
  varying float vBorderWidth;
  uniform mat4 mvp;
  uniform float resolution;
  uniform float unit; // 0: px; 1: meter;

  // getColorShader().vertex
  uniform bool isPick;
  attribute vec4 pickColor;
  varying vec4 vPickColor;
  // getColorShader().vertex

  // getBezier()
  float QuadraticIn (float k) {
    return pow(k, 2.);
  }
  float QuadraticOut (float k) {
    return k * (2.0 - k);
  }
  float QuadraticInOut (float k) {
    if ((k *= 2.0) < 1.0) {
      return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2.0) - 1.0);
  }

  // \u4E09\u6B21
  float CubicIn (float k) {
    return pow(k, 3.);
  }
  float CubicOut (float k) {
    return pow(--k, 3.) + 1.0;
  }
  float CubicInOut (float k) {
    if ((k *= 2.0) < 1.0) {
      return 0.5 * pow(k, 3.);
    }
    return 0.5 * ((k -= 2.0) * k * k + 2.0);
  }

  // \u56DB\u6B21
  float QuarticIn (float k) {
    return pow(k, 4.);
  }
  float QuarticOut (float k) {
    return 1.0 - (pow(--k, 4.));
  }
  float QuarticInOut (float k) {
    if ((k *= 2.0) < 1.0) {
      return 0.5 * pow(k, 4.);
    }
    return 0.5 * ((k -= 2.0) * pow(k, 3.) + 2.0);
  }

  // \u4E94\u6B21
  float QuinticIn (float k) {
    return pow(k, 5.);
  }
  float QuinticOut (float k) {
    return 1.0 - (pow(--k, 5.));
  }
  float QuinticInOut (float k) {
    if ((k *= 2.0) < 1.0) {
      return 0.5 * pow(k, 5.);
    }
    return 0.5 * ((k -= 2.0) * pow(k, 4.) + 2.0);
  }

  // \u516D\u6B21
  float SinusoidalIn (float k) {
    float pi = 3.14159265;
    return 1.0 - cos(k * pi / 2.0);
  }
  float SinusoidalOut (float k) {
    float pi = 3.14159265;
    return sin(k * pi / 2.0);
  }
  float SinusoidalInOut (float k) {
    float pi = 3.14159265;
    return 0.5 * (1.0 - cos(pi * k));
  }

  // \u4E03\u6B21
  float ExponentialIn (float k) {
    return k == 0.0 ? 0.0 : pow(1024.0, k - 1.0);
  }
  float ExponentialOut (float k) {
    return k == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * k);
  }
  float ExponentialInOut (float k) {
    // if (k == 0.0) {
    //     return 0.0;
    // }
    // if (k == 1.0) {
      //     return 1.0;
      // }
      if ((k *= 2.0) < 1.0) {
        return 0.5 * pow(1024.0, k - 1.0);
      }
      return 0.5 * (-pow(2.0, -10.0 * (k - 1.0)) + 2.0);
    }

    // \u516B\u6B21
    float CircularIn (float k) {
      return 1.0 - sqrt(1.0 - k * k);
    }
    float CircularOut (float k) {
      return sqrt(1.0 - (--k * k));
    }
    float CircularInOut (float k) {
      if ((k *= 2.0) < 1.0) {
        return -0.5 * (sqrt(1.0 - k * k) - 1.0);
      }
      return 0.5 * (sqrt(1.0 - (k -= 2.0) * k) + 1.0);
    }

    // \u4E5D\u6B21
    float ElasticIn (float k) {
      float pi = 3.14159265;
      float s;
      float a = 0.1;
      float p = 0.4;
      // if (k == 0.0) {
      //     return 0.0;
      // }
      // if (k == 1.0) {
      //     return 1.0;
      // }
      if (a < 1.0) {
        a = 1.0;
        s = p / 4.0;
      } else {
        s = p * asin(1.0 / a) / (2.0 * pi);
      }
      // return pow(2.0, 10.0 * (k -= 1.0));
      return -(a * pow(2.0, 10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p));
    }
    float ElasticOut (float k) {
      float pi = 3.14159265;
      float s;
      float a = 0.1;
      float p = 0.4;
      // if (k == 0.0) {
      //     return 0.0;
      // }
      // if (k == 1.0) {
      //     return 1.0;
      // }
      if (a < 1.0) {
        a = 1.0;
        s = p / 4.0;
      } else {
        s = p * asin(1.0 / a) / (2.0 * pi);
      }
      return (a * pow(2.0, -10.0 * k) * sin((k - s) * (2.0 * pi) / p) + 1.0);
    }
    float ElasticInOut (float k) {
      float pi = 3.14159265;
      float s;
      float a = 0.1;
      float p = 0.4;
      // if (k == 0.0) {
      //     return 0.0;
      // }
      // if (k == 1.0) {
      //     return 1.0;
      // }
      if (a < 1.0) {
        a = 1.0;
        s = p / 4.0;
      } else {
        s = p * asin(1.0 / a) / (2.0 * pi);
      }
      if ((k *= 2.0) < 1.0) {
        return -0.5 * (a * pow(2.0, 10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p));
      }
      return a * pow(2.0, -10.0 * (k -= 1.0)) * sin((k - s) * (2.0 * pi) / p) * 0.5 + 1.0;
    }

    // \u56DE\u5F39
    float BackIn (float k) {
      float s = 1.70158;
      return pow(k, 2.) * ((s + 1.0) * k - s);
    }
    float BackOut (float k) {
      float s = 1.70158;
      return pow(--k, 2.) * ((s + 1.0) * k + s) + 1.0;
    }
    float BackInOut (float k) {
      float s = 1.70158 * 1.525;
      if ((k *= 2.0) < 1.0) {
        return 0.5 * (pow(k, 2.) * ((s + 1.0) * k - s));
      }
      return 0.5 * ((k -= 2.0) * k * ((s + 1.0) * k + s) + 2.0);
    }

    // \u53CD\u590D\u6A2A\u8DF3
    float BounceOut (float k) {
      if (k < (1.0 / 2.75)) {
        return 7.5625 * k * k;
      } else if (k < (2.0 / 2.75)) {
        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
      } else if (k < (2.5 / 2.75)) {
        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
      } else {
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
      }
    }
    float BounceIn (float k) {
      return 1.0 - BounceOut(1.0 - k);
    }
    float BounceInOut (float k) {
      if (k < 0.5) {
        return BounceIn(k * 2.0) * 0.5;
      }
      return BounceOut(k * 2.0 - 1.0) * 0.5 + 0.5;
    }
    float getBezier(int type, float delayTime, float transformTime, float timer) {
      if (type == 0) {
          return QuadraticIn(timer);
      } else if (type == 1) {
          return QuadraticOut(timer);
      } else if (type == 2) {
          return QuadraticInOut(timer);
      } else if (type == 3) {
          return CubicIn(timer);
      } else if (type == 4) {
          return CubicOut(timer);
      } else if (type == 5) {
          return CubicInOut(timer);
      } else if (type == 6) {
          return QuarticIn(timer);
      } else if (type == 7) {
          return QuarticOut(timer);
      } else if (type == 8) {
          return QuarticInOut(timer);
      } else if (type == 9) {
          return QuinticIn(timer);
      } else if (type == 10) {
          return QuinticOut(timer);
      } else if (type == 11) {
          return QuinticInOut(timer);
      } else if (type == 12) {
          return SinusoidalIn(timer);
      } else if (type == 13) {
          return SinusoidalOut(timer);
      } else if (type == 14) {
          return SinusoidalInOut(timer);
      } else if (type == 15) {
          return ExponentialIn(timer);
      } else if (type == 16) {
          return ExponentialOut(timer);
      } else if (type == 17) {
          return ExponentialInOut(timer);
      } else if (type == 18) {
          return CircularIn(timer);
      } else if (type == 19) {
          return CircularOut(timer);
      } else if (type == 20) {
          return CircularInOut(timer);
      } else if (type == 21) {
          return ElasticIn(timer);
      } else if (type == 22) {
          return ElasticOut(timer);
      } else if (type == 23) {
          return ElasticInOut(timer);
      } else if (type == 24) {
          return BackIn(timer);
      } else if (type == 25) {
          return BackOut(timer);
      } else if (type == 26) {
          return BackInOut(timer);
      } else if (type == 27) {
          return BounceIn(timer);
      } else if (type == 28) {
          return BounceOut(timer);
      } else if (type == 29) {
          return BounceInOut(timer);
      } else {
          return timer;
      }
    }
    // getBezier()
        '
      .concat(RenderUtil.getScaleType('lineWidth'), '\n        ')
      .concat(
        RenderUtil.getScaleType('altitude'),
        '\n\n        void main() {\n            vColor = color;\n            vBorderColor = borderColor;\n            vDash = dash;\n            vDist = distance.y; // \u8DDD\u79BB\u7EBF\u8D77\u59CB\u70B9\u7684\u8DDD\u79BB\n            float res = unit == 0.0 ? resolution : 1.0;\n            float lineWidthScale = lineWidthScaleValue(position.w);\n            float altitudeScale = altitudeScaleValue(position.w);\n            float realLineWidth = (borderWidth + lineWidth / 2.) * res * lineWidthScale;\n            vWidth = lineWidth * lineWidthScale;\n            vBorderWidth = borderWidth * lineWidthScale;\n            // \u7EBF\u6BB5\u7684\u6CD5\u5411\u91CF\u8FD8\u539F\n            vec2 tmpNormal = normal.xy;\n            float angleLineWidth = realLineWidth;\n\n            // z \u65B9\u5411\u4E0D\u7B49\u4E8E 0\uFF0C\u8BF4\u660E\u662F\u62D0\u89D2\u5411\u91CF\uFF0Cz \u4EE3\u8868\u89D2\u5EA6\uFF0C\u9700\u8981\u5BF9\u7EBF\u5BBD\u8FDB\u884C\u8BA1\u7B97\n            if(normal.z != 0.0) {\n                angleLineWidth /= sin(abs(normal.z / 2.));\n                angleLineWidth = max(realLineWidth, min(distance.x, angleLineWidth));\n\n                // \u62D0\u89D2\u5904\u7684\u6CD5\u5411\u91CF\uFF0C\u9700\u8981\u8FD8\u539F\u6210\u5782\u76F4\u7EBF\u6BB5\u65B9\u5411\u7684\u5411\u91CF\n                // \u8FD9\u6837\u624D\u80FD\u5C06\u63CF\u8FB9\u8BA1\u7B97\u51FA\u6765\n                // \u65CB\u8F6C\u89D2\u5EA6\u8BA1\u7B97\n                float theta = normal.z / abs(normal.z) * ((PI - abs(normal.z)) / 2.);\n                // \u65CB\u8F6C\n                tmpNormal =\n                    mat2(cos(theta), -sin(theta),\n                         sin(theta), cos(theta)) * tmpNormal;\n            }\n            vNormal = normalize(tmpNormal.xy);\n\n            vec3 pos = position.xyz + vec3(normal.xy, 0) * angleLineWidth;\n            gl_Position = mvp * vec4(pos.xy, pos.z * altitudeScale, 1.0);\n            ',
      )
      .concat(ColorGLSL.getColorShader().mainVert, '\n        }\n    ')
  `,
  fragment: `
  '\n        precision highp float;\n        uniform float resolution;\n        uniform float unit; // 0: px; 1: meter;\n        uniform float opacity;\n        varying vec4 vDash;\n        varying vec2 vNormal;\n        varying vec4 vColor;\n        varying float vDist;\n        varying float vWidth;\n        varying float vBorderWidth;\n        varying vec4 vBorderColor;\n        '
  .concat(
    ColorGLSL.getColorShader().fragment,
    '\n\n        void main() {\n            float res = unit == 0.0 ? resolution : 1.0;\n            float distPixel = vDist / res;\n            float offset = mod(distPixel, vDash.r + vDash.g + vDash.b + vDash.a);\n            if(offset > vDash.r && offset < vDash.r + vDash.g) {\n                discard;\n            } else if(offset > vDash.r + vDash.g + vDash.b) {\n                discard;\n            }\n\n            gl_FragColor = vColor;\n\n            if(vBorderWidth > 0. && length(vNormal) > 1. - vBorderWidth / (vWidth / 2. + vBorderWidth)) {\n                gl_FragColor = vBorderColor;\n            }\n            gl_FragColor.a *= opacity;\n            ',
  )
  .concat(ColorGLSL.getColorShader().mainFrag, '\n        }\n    ')
  `,
};
