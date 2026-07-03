import { Filter, GlProgram, GpuProgram, UniformGroup } from 'pixi.js';

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform float uFlash;
uniform vec2 uBlastCenter;
uniform float uBlastRadius;
uniform sampler2D uTexture;

void main() {
    vec4 color = texture(uTexture, vTextureCoord);

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }

    float dist = distance(vTextureCoord, uBlastCenter);
    float radial = max(0.0, 1.0 - dist / uBlastRadius);
    float flash = uFlash * (0.25 + radial * 0.75);

    vec3 warm = vec3(1.0, 0.82, 0.45);
    color.rgb += warm * flash * 1.6;
    color.rgb = mix(color.rgb, color.rgb * (1.0 + flash * 0.85), flash);
    color.rgb = clamp(color.rgb, 0.0, 1.0);

    color.rgb *= color.a;
    finalColor = color;
}
`;

const wgsl = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct ExplosionUniforms {
  uFlash:f32,
  uBlastCenter:vec2<f32>,
  uBlastRadius:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> explosionUniforms: ExplosionUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32> {
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;
    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition:vec2<f32>) -> vec2<f32> {
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput {
    return VSOutput(filterVertexPosition(aPosition), filterTextureCoord(aPosition));
}

@fragment
fn mainFragment(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    var color = textureSample(uTexture, uSampler, uv);

    if (color.a > 0.0) {
        color = vec4(color.rgb / color.a, color.a);
    }

    let dist = distance(uv, explosionUniforms.uBlastCenter);
    let radial = max(0.0, 1.0 - dist / explosionUniforms.uBlastRadius);
    let flash = explosionUniforms.uFlash * (0.25 + radial * 0.75);
    let warm = vec3(1.0, 0.82, 0.45);

    color = vec4(color.rgb + warm * flash * 1.6, color.a);
    color = vec4(mix(color.rgb, color.rgb * (1.0 + flash * 0.85), flash), color.a);
    color = vec4(clamp(color.rgb, vec3(0.0), vec3(1.0)), color.a);
    color = vec4(color.rgb * color.a, color.a);

    return color;
}
`;

export class ExplosionFlashFilter extends Filter {
    constructor() {
        super({
            glProgram: GlProgram.from({ vertex, fragment, name: 'explosion-flash-filter' }),
            gpuProgram: GpuProgram.from({
                vertex: { source: wgsl, entryPoint: 'mainVertex' },
                fragment: { source: wgsl, entryPoint: 'mainFragment' },
            }),
            resources: {
                explosionUniforms: new UniformGroup({
                    uFlash: { value: 0, type: 'f32' },
                    uBlastCenter: { value: [0.5, 0.5], type: 'vec2<f32>' },
                    uBlastRadius: { value: 0.25, type: 'f32' },
                }),
            },
        });
        this.enabled = false;
    }

    public setFlash(value: number): void {
        this.resources.explosionUniforms.uniforms.uFlash = value;
        this.enabled = value > 0.001;
    }

    public setBlast(centerX: number, centerY: number, radius: number): void {
        this.resources.explosionUniforms.uniforms.uBlastCenter = [centerX, centerY];
        this.resources.explosionUniforms.uniforms.uBlastRadius = radius;
    }
}