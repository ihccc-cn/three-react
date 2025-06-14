// https://www.shadertoy.com/view/7dtcRj

export default `
// License CC0: Neon Sunset
//  Code is hackish but I thought it looked good enough to share
//  The music from GTA III - RISE FM, the best radio channel in GTA III IMHO
#define LAYERS            5.0
#define PI                3.141592654
#define TAU               (2.0*PI)
#define TIME              iTime
#define TTIME             (TAU*TIME)
#define RESOLUTION        iResolution
#define ROT(a)            mat2(cos(a), sin(a), -sin(a), cos(a))

// License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
float sRGB(float t) { return mix(1.055*pow(t, 1./2.4) - 0.055, 12.92*t, step(t, 0.0031308)); }
// License: Unknown, author: nmz (twitter: @stormoid), found: https://www.shadertoy.com/view/NdfyRM
vec3 sRGB(in vec3 c) { return vec3 (sRGB(c.x), sRGB(c.y), sRGB(c.z)); }

// License: Unknown, author: Matt Taylor (https://github.com/64), found: https://64.github.io/tonemapping/
vec3 aces_approx(vec3 v) {
  v = max(v, 0.0);
  v *= 0.6f;
  float a = 2.51f;
  float b = 0.03f;
  float c = 2.43f;
  float d = 0.59f;
  float e = 0.14f;
  return clamp((v*(a*v+b))/(v*(c*v+d)+e), 0.0f, 1.0f);
}

// License: Unknown, author: Unknown, found: don't remember
float hash(float co) {
  return fract(sin(co*12.9898) * 13758.5453);
}


// License: Unknown, author: Unknown, found: don't remember
vec2 hash2(vec2 p) {
  p = vec2(dot (p, vec2 (127.1, 311.7)), dot (p, vec2 (269.5, 183.3)));
  return fract(sin(p)*43758.5453123);
}

// License: CC BY-NC-SA 3.0, author: Stephane Cuillerdier - Aiekick/2015 (twitter:@aiekick), found: https://www.shadertoy.com/view/Mt3GW2
vec3 blackbody(float Temp) {
  vec3 col = vec3(255.);
  col.x = 56100000. * pow(Temp,(-3. / 2.)) + 148.;
  col.y = 100.04 * log(Temp) - 623.6;
  if (Temp > 6500.) col.y = 35200000. * pow(Temp,(-3. / 2.)) + 184.;
  col.z = 194.18 * log(Temp) - 1448.6;
  col = clamp(col, 0., 255.)/255.;
  if (Temp < 1000.) col *= Temp/1000.;
  return col;
}

// License: WTFPL, author: sam hocevar, found: https://stackoverflow.com/a/17897228/418488
const vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
  return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
}
#define HSV2RGB(c)  (c.z * mix(hsv2rgb_K.xxx, clamp(abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www) - hsv2rgb_K.xxx, 0.0, 1.0), c.y))

// License: Unknown, author: Unknown, found: don't remember
float tanh_approx(float x) {
//  return tanh(x);
  float x2 = x*x;
  return clamp(x*(27.0 + x2)/(27.0+9.0*x2), -1.0, 1.0);
}

float circle(vec2 p, float r) {
  return length(p) - r;
}

// License: MIT, author: Inigo Quilez, found: https://iquilezles.org/articles/smin
float pmin(float a, float b, float k) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

// License: MIT OR CC-BY-NC-4.0, author: mercury, found: https://mercury.sexy/hg_sdf/
float mod1(inout float p, float size) {
  float halfsize = size*0.5;
  float c = floor((p + halfsize)/size);
  p = mod(p + halfsize, size) - halfsize;
  return c;
}

// License: MIT OR CC-BY-NC-4.0, author: mercury, found: https://mercury.sexy/hg_sdf/
vec2 mod2(inout vec2 p, vec2 size) {
  vec2 c = floor((p + size*0.5)/size);
  p = mod(p + size*0.5,size) - size*0.5;
  return c;
}

// License: MIT, author: Inigo Quilez, found: https://iquilezles.org/articles/intersectors
float rayPlane(vec3 ro, vec3 rd, vec4 p) {
  return -(dot(ro,p.xyz)+p.w)/dot(rd,p.xyz);
}

vec3 toSpherical(vec3 p) {
  float r   = length(p);
  float t   = acos(p.z/r);
  float ph  = atan(p.y, p.x);
  return vec3(r, t, ph);
}

float sun(vec2 p) {
  const float ch = 0.0125;
  vec2 sp = p;
  float d0 = circle(sp, 0.5);
  float d = d0;
  return d;
}

float segmentx(vec2 p) {
  float d0 = abs(p.y);
  float d1 = length(p);
  return p.x > 0.0 ? d0 : d1;
}

float segmentx(vec2 p, float l) {
  float hl = 0.5*l;
  p.x = abs(p.x);
  float d0 = abs(p.y);
  float d1 = length(p-vec2(hl, 0.0));
  return p.x > hl ? d1 : d0;
}

float synth(vec2 p, float aa, out float h, out float db) {
  const float z = 75.0;
  p.y -= -70.0;
  const float st = 0.04;
  p.x = abs(p.x);
  p.x -= 20.0-3.5;
  p.x += st*20.0;
  p /= z;
  float n = mod1(p.x, st);
  float dib = 1E6;
  const int around = 0;
  for (int i = -around; i <=around ;++i) {
    float fft = texture(iChannel0, vec2((n+float(i))*st, 0.25)).x;
    fft *= fft;
    if (i == 0) h = fft;
    float dibb = segmentx((p-vec2(st*float(i), 0.0)).yx, fft+0.05)-st*0.4;
    dib = min(dib, dibb);
  }

  float d = dib;
  db = abs(p.y)*z;
  return smoothstep(aa, -aa, d*z);
}

vec3 road(vec3 ro, vec3 rd, vec3 nrd, float glare, vec4 pl, out float pt) {
  const float szoom   = 0.5;
  const float bsz     = 25.0;
  const float sm      = 1.0;
  float off = abs(pl.w);
  float t = rayPlane(ro, rd, pl);
  pt = t;

  vec3 p  = ro+rd*t;
  vec3 np = ro+nrd*t;

  vec2 pp   = p.xz;
  vec2 npp  = np.xz;
  vec2 opp  = pp;

  float aa  = length(npp-pp)*sqrt(0.5);
  pp.y += -60.0*TIME;

  vec3 gcol = vec3(0.0);

  float dr = abs(pp.x)-off;
  vec2 cp = pp;
  mod1(cp.y, 6.0*off);
  vec2 sp = pp;
  sp.x = abs(sp.x);
  mod1(sp.y, off);
  float dcl = segmentx(cp.yx, 1.5*off);
  float dsl = segmentx((sp-vec2(0.95*off, 0.0)).yx, off*0.5);

  vec2 mp = pp;
  mod2(mp, vec2(off*0.5));

  vec2 dp = abs(mp);
  float d = dp.x;
  d = pmin(d, dp.y, sm);
  d = max(d, -dr);
  d = min(d, dcl);
  d = min(d, dsl);
  vec2 s2 = sin(TIME+2.0*p.xz/off);
  float m = mix(0.75, 0.9, tanh_approx(s2.x+s2.y));
  m *= m;
  m *= m;
  m *= m;
  vec3 hsv = vec3(0.4+mix(0.5, 0.0, m), tanh_approx(0.15*mix(30.0, 10.0, m)*d), 1.0);
  float fo = exp(-0.04*max(abs(t)-off*2., 0.0));
  vec3 bcol = hsv2rgb(hsv);
  gcol += 2.0*bcol*exp(-0.1*mix(30.0, 10.0, m)*d)*fo;

  float sh;
  float sdb;
  float sd =synth(opp, aa,sh, sdb)*smoothstep(aa, -aa, -dr);
  sh = tanh_approx(sh);
  sdb *= 0.075;
  sdb *= sdb;
  sdb += 0.05;
  vec3 scol = sd*(sdb)*pow(tanh(vec3(0.1)+bcol), mix(vec3(1.0), vec3(1.5, 0.5, 0.5), smoothstep(0.4, 0.5, sh)));
  gcol += scol;


  gcol = t > 0.0 ? gcol : vec3(0.0);
  return gcol+scol;
}

vec3 stars(vec2 sp, float hh) {
  vec3 col = vec3(0.0);

  const float m = LAYERS;
  hh = tanh_approx(20.0*hh);

  for (float i = 0.0; i < m; ++i) {
    vec2 pp = sp+0.5*i;
    float s = i/(m-1.0);
    vec2 dim  = vec2(mix(0.05, 0.003, s)*PI);
    vec2 np = mod2(pp, dim);
    vec2 h = hash2(np+127.0+i);
    vec2 o = -1.0+2.0*h;
    float y = sin(sp.x);
    pp += o*dim*0.5;
    pp.y *= y;
    float l = length(pp);

    float h1 = fract(h.x*1667.0);
    float h2 = fract(h.x*1887.0);
    float h3 = fract(h.x*2997.0);

    vec3 scol = mix(8.0*h2, 0.25*h2*h2, s)*blackbody(mix(3000.0, 22000.0, h1*h1));

    vec3 ccol = col + exp(-(mix(6000.0, 2000.0, hh)/mix(2.0, 0.25, s))*max(l-0.001, 0.0))*scol;
    ccol *= mix(0.125, 1.0, smoothstep(1.0, 0.99, sin(0.25*TIME+TAU*h.y)));
    col = h3 < y ? ccol : col;
  }

  return col;
}

vec3 meteorite(vec2 sp) {
  const float period = 3.0;
  float mtime = mod(TIME, period);
  float ntime = floor(TIME/period);
  float h0 = hash(ntime+123.4);
  float h1 = fract(1667.0*h0);
  float h2 = fract(9967.0*h0);
  vec2 mp = sp;
  mp.x += -1.0;
  mp.y += -0.5*h1;
  mp.y += PI*0.5;
  mp *= ROT(PI+mix(-PI/4.0, PI/4.0, h0));
  float m = mtime/period;
  mp.x += mix(-1.0, 2.0, m);

  float d0 = length(mp);
  float d1 = segmentx(mp);

  vec3 col = vec3(0.0);

  col += 0.5*exp(-4.0*max(d0, 0.0))*exp(-1000.0*max(d1, 0.0));
  col *= 2.0*HSV2RGB(vec3(0.8, 0.5, 1.0));
  float fl = smoothstep(-0.5, 0.5, sin(12.0*TTIME));
  col += mix(1.0, 0.5, fl)*exp(-mix(100.0, 150.0, fl)*max(d0, 0.0));

  col = h2 > 0.8 ? col: vec3(0.0);
  return col;
}

vec3 skyGrid(vec2 sp) {
  const float m = 1.0;

  const vec2 dim = vec2(1.0/12.0*PI);
  float y = sin(sp.x);
  vec2 pp = sp;
  vec2 np = mod2(pp, dim*vec2(1.0/floor(1.0/y), 1.0));

  vec3 col = vec3(0.0);

  float d = min(abs(pp.x), abs(pp.y*y));

  float aa = 2.0/RESOLUTION.y;

  col += 0.25*vec3(0.5, 0.5, 1.0)*exp(-2000.0*max(d-0.00025, 0.0));

  return col;
}


vec3 sunset(vec2 sp, vec2 nsp) {
  const float szoom   = 0.5;
  float aa = length(nsp-sp)*sqrt(0.5);
  sp -= vec2(vec2(0.5, -0.5)*PI);
  sp /= szoom;
  sp = sp.yx;
  sp.y += 0.22;
  sp.y = -sp.y;
  float ds = sun(sp)*szoom;

  vec3 bscol = hsv2rgb(vec3(fract(0.7-0.25*(sp.y)), 1.0, 1.0));
  vec3 gscol = 0.75*sqrt(bscol)*exp(-50.0*max(ds, 0.0));
  vec3 scol = mix(gscol, bscol, smoothstep(aa, -aa, ds));
  return scol;
}

vec3 glow(vec3 ro, vec3 rd, vec2 sp, vec3 lp) {
  float ld = max(dot(normalize(lp-ro), rd),0.0);
  float y = -0.5+sp.x/PI;
  y = max(abs(y)-0.02, 0.0)+0.1*smoothstep(0.5, PI, abs(sp.y));
  float ci = pow(ld, 10.0)*2.0*exp(-25.0*y);
  float h = 0.65;
  vec3 col = hsv2rgb(vec3(h, 0.75, 0.35*exp(-15.0*y)))+HSV2RGB(vec3(0.8, 0.75, 0.5))*ci;
  return col;
}



vec3 neonSky(vec3 ro, vec3 rd, vec3 nrd, out float gl) {
  const vec3 lp       = 500.0*vec3(0.0, 0.25, -1.0);
  const vec3 skyCol   = HSV2RGB(vec3(0.8, 0.75, 0.05));


  float glare = pow(abs(dot(rd, normalize(lp))), 20.0);

  vec2 sp   = toSpherical(rd.xzy).yz;
  vec2 nsp  = toSpherical(nrd.xzy).yz;
  vec3 grd  = rd;
  grd.xy *= ROT(0.025*TIME);
  vec2 spp = toSpherical(grd).yz;

  float gm = 1.0/abs(rd.y)*mix(0.005, 2.0, glare);
  vec3 col = skyCol*gm;
  float ig = 1.0-glare;
  col += glow(ro, rd, sp, lp);
  if (rd.y > 0.0) {
    col += sunset(sp, nsp);
    col += stars(sp, 0.0)*ig;
    col += skyGrid(spp)*ig;
    col += meteorite(sp)*ig;
  }
  gl = glare;
  return col;
}

vec3 color(vec3 ro, vec3 rd, vec3 nrd) {
  const float off1  = -20.0;
  const vec4 pl1    = vec4(normalize(vec3(0.0, 1.0, 0.15)), -off1);
  float glare;
  vec3 col = neonSky(ro, rd, nrd, glare);
  if (rd.y < 0.0) {
    float t;
    col += road(ro, rd, nrd, glare, pl1, t);
  }
  return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 q = fragCoord/RESOLUTION.xy;
  vec2 p = -1.0 + 2.0*q;
  p.x *= RESOLUTION.x/RESOLUTION.y;
  float aa = 2.0/RESOLUTION.y;
  vec3 ro = vec3(0.0, 0.0, 10.0);
  vec3 la = vec3(0.0, 2.0, 0.0);
  vec3 up = vec3(0.0, 1.0, 0.0);

  vec3 ww = normalize(la - ro);
  vec3 uu = normalize(cross(up, ww ));
  vec3 vv = normalize(cross(ww,uu));
  const float fov = tan(TAU/6.0);
  vec2 np = p + vec2(aa);
  vec3 rd = normalize(-p.x*uu + p.y*vv + fov*ww);
  vec3 nrd = normalize(-np.x*uu + np.y*vv + fov*ww);


  vec3 col = vec3(0.1);
  col = color(ro, rd, nrd);
//  col += synth(p, np);
  col *= smoothstep(0.0, 4.0, TIME);
  col = aces_approx(col);
  col = sRGB(col);


  fragColor = vec4(col, 1.0);
}`;
