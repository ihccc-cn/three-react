import * as THREE from 'three/build/three.webgpu';
import * as TSL from 'three/build/three.tsl';
import Transpiler from 'three/examples/jsm/transpiler/Transpiler.js';
import ShaderToyDecoder from 'three/examples/jsm/transpiler/ShaderToyDecoder.js';
import TSLEncoder from 'three/examples/jsm/transpiler/TSLEncoder.js';

class ShaderToyNode extends THREE.Node {
  mainImage: any;
  constructor() {
    super('vec4');

    this.mainImage = null;
  }

  transpile(glsl: string, iife = false) {
    const decoder = new ShaderToyDecoder();

    const encoder = new TSLEncoder();
    encoder.iife = iife;
    encoder.uniqueNames = true;

    const jsCode = new Transpiler(decoder, encoder).parse(glsl);

    return jsCode;
  }

  parse(glsl: string) {
    const jsCode = this.transpile(glsl, true);

    const { mainImage } = eval(jsCode)(TSL);

    this.mainImage = mainImage;
  }

  async parseAsync(glsl: string) {
    const jsCode = this.transpile(glsl);

    const { mainImage } = await import(
      `data:text/javascript,${encodeURIComponent(jsCode)}`
    );

    this.mainImage = mainImage;
  }

  setup() {
    if (this.mainImage === null) {
      throw new Error('ShaderToyNode: .parse() must be called first.');
    }

    return this.mainImage();
  }
}

export default ShaderToyNode;
