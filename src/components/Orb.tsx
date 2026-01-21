import { Renderer, Camera, Transform, Program, Mesh, Sphere, Color } from 'ogl';
import React, { useEffect, useRef } from 'react';

interface OrbProps {
    volume: number; // 0 to 1
    active: boolean;
}

const vertexShader = `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float uTime;
    uniform float uFrequency;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vNoise;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        
        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vUv = uv;
        vNormal = normal;
        
        // Simplex noise for displacement
        float noise = snoise(position * 2.0 + uTime * 0.5);
        
        // Combine low freq and high freq noise
        float distortion = uFrequency * 1.0; // Reduced from 2.0
        
        // Apply displacement along normal
        vec3 newPos = position + normal * noise * distortion;
        
        vNoise = noise; // Pass noise to fragment for coloring
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vNoise;
    
    uniform float uTime;
    
    void main() {
        // Siri colors: Cyan, Blue, Purple/Pink - Adjusted to be more saturated/less white
        
        vec3 colorA = vec3(0.0, 0.8, 1.0); // Cyan
        vec3 colorB = vec3(0.6, 0.0, 1.0); // Purple
        vec3 colorC = vec3(0.0, 0.2, 0.8); // Deep Blue
        
        // Mix based on noise and normal
        float mixFactor = smoothstep(-0.4, 0.4, vNoise);
        
        vec3 finalColor = mix(colorA, colorB, mixFactor);
        finalColor = mix(finalColor, colorC, vNormal.y * 0.5 + 0.5);
        
        // Add fresnel rim light effect - Toned down
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
        finalColor += vec3(0.8, 0.9, 1.0) * fresnel * 0.3; // Less dominant white
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const Orb: React.FC<OrbProps> = ({ volume, active }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<any>(null);
    const programRef = useRef<any>(null);
    const latestConfig = useRef({ volume: 0, active: false });

    // Keep ref updated
    useEffect(() => {
        latestConfig.current = { volume, active };
    }, [volume, active]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Cleanup any existing canvas to prevent double-rendering
        containerRef.current.innerHTML = '';

        // Init OGL
        const renderer = new Renderer({ alpha: true, width: 200, height: 200, dpr: 2 });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 35 });
        camera.position.set(0, 0, 4);

        const scene = new Transform();

        const geometry = new Sphere(gl, { radius: 1, widthSegments: 64, heightSegments: 64 });

        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uFrequency: { value: 0 },
            },
            transparent: true,
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        rendererRef.current = renderer;
        programRef.current = program;

        let startTime = performance.now();
        let animationId: number;

        function getRandomArbitrary(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const update = () => {
            const time = (performance.now() - startTime) * 0.001;
            program.uniforms.uTime.value = time;

            const { volume, active } = latestConfig.current;
            // Reduced frequency target for less extreme distortion
            const targetFreq = active ? Math.max(0.07, volume * getRandomArbitrary(0.1, 0.3)) : 0.05;

            // Lerp for smooth transition
            program.uniforms.uFrequency.value += (targetFreq - program.uniforms.uFrequency.value) * 0.1;

            // Gentle rotation
            mesh.rotation.y -= 0.005;
            mesh.rotation.z += 0.002;

            renderer.render({ scene, camera });
            animationId = requestAnimationFrame(update);
        };

        animationId = requestAnimationFrame(update);

        // Resize observer setup
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                renderer.setSize(width, height);
                camera.perspective({ aspect: width / height });
            }
        });
        ro.observe(containerRef.current);

        return () => {
            cancelAnimationFrame(animationId);
            ro.disconnect();
            gl.getExtension('WEBGL_lose_context')?.loseContext();

            // Safe removal check
            if (containerRef.current && gl.canvas && containerRef.current.contains(gl.canvas)) {
                containerRef.current.removeChild(gl.canvas);
            }
        };

    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default Orb;
