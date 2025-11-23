// Premium Neural Network - Side Angle View with Independent Movement
(function () {
    'use strict';

    const CONFIG = {
        nodes: {
            count: 80,
            sizes: { small: 3, medium: 5, large: 9, xlarge: 14 },
            glowIntensity: 4.5,  // Increased brightness
            pulseSpeed: 0.6,
            colors: { cyan: 0x00d9ff, purple: 0xb537f2, pink: 0xff0080, orange: 0xff6b35, green: 0x00ff88, blue: 0x0066ff }
        },
        connections: { maxDistance: 220, opacity: 0.7, dotCount: 4 },
        particles: { count: 250, size: 1.3, speed: 0.4 },
        grid: { size: 1200, hexSize: 20, color: 0x1a3a52, opacity: 0.3, rotationSpeed: 0.025 },
        camera: { fov: 70, position: { x: 200, y: 150, z: 400 }, lookAt: { x: 0, y: 0, z: -100 } },  // SIDE ANGLE VIEW
        background: { topColor: 0x0a1a2e, middleColor: 0x0d1520, bottomColor: 0x000000 },
        motion: { nodeVelocity: 0.25, nodeRotation: 0.3, platformPulse: 0.8, lightPulse: 0.6 }
    };

    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    scene.fog = new THREE.FogExp2(0x0a1a2e, 0.0015);

    // Background
    const bgMaterial = new THREE.ShaderMaterial({
        uniforms: { topColor: { value: new THREE.Color(CONFIG.background.topColor) }, middleColor: { value: new THREE.Color(CONFIG.background.middleColor) }, bottomColor: { value: new THREE.Color(CONFIG.background.bottomColor) } },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 topColor; uniform vec3 middleColor; uniform vec3 bottomColor; varying vec2 vUv; void main() { vec3 color = vUv.y > 0.5 ? mix(middleColor, topColor, (vUv.y - 0.5) * 2.0) : mix(bottomColor, middleColor, vUv.y * 2.0); gl_FragColor = vec4(color, 1.0); }`,
        side: THREE.DoubleSide
    });
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2500, 2500), bgMaterial);
    bgMesh.position.z = -700;
    scene.add(bgMesh);

    // Hex Grid
    function createHexGrid() {
        const group = new THREE.Group();
        const hexShape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            if (i === 0) hexShape.moveTo(CONFIG.grid.hexSize * Math.cos(angle), CONFIG.grid.hexSize * Math.sin(angle));
            else hexShape.lineTo(CONFIG.grid.hexSize * Math.cos(angle), CONFIG.grid.hexSize * Math.sin(angle));
        }
        hexShape.closePath();
        const hexMat = new THREE.LineBasicMaterial({ color: CONFIG.grid.color, transparent: true, opacity: CONFIG.grid.opacity, blending: THREE.AdditiveBlending });
        const hexWidth = CONFIG.grid.hexSize * Math.sqrt(3), hexHeight = CONFIG.grid.hexSize * 1.5;
        for (let row = -15; row < 15; row++) {
            for (let col = -15; col < 15; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2), z = row * hexHeight;
                if (Math.abs(x) < CONFIG.grid.size / 2 && Math.abs(z) < CONFIG.grid.size / 2) {
                    const line = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(hexShape)), hexMat.clone());
                    line.position.set(x, 0, z);
                    line.rotation.x = -Math.PI / 2;
                    group.add(line);
                }
            }
        }
        group.position.y = -150;
        return group;
    }
    const hexGrid = createHexGrid();
    scene.add(hexGrid);

    // Lights
    scene.add(new THREE.AmbientLight(0x1a2a3e, 0.5));
    const lights = [
        { color: CONFIG.nodes.colors.cyan, pos: [-300, 150, 200], intensity: 2.5 },
        { color: CONFIG.nodes.colors.purple, pos: [300, 150, 200], intensity: 2.5 },
        { color: CONFIG.nodes.colors.green, pos: [0, 200, -100], intensity: 2 },
        { color: CONFIG.nodes.colors.orange, pos: [200, 100, 300], intensity: 1.8 }
    ];
    const lightObjects = lights.map(l => {
        const light = new THREE.PointLight(l.color, l.intensity, 700);
        light.position.set(...l.pos);
        scene.add(light);
        return light;
    });

    // Nodes
    const nodesData = [];
    function createPlatformRing(size, color, yPos) {
        const group = new THREE.Group();
        const outer = new THREE.Mesh(new THREE.RingGeometry(size * 1.2, size * 1.3, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        outer.rotation.x = -Math.PI / 2;
        group.add(outer);
        const inner = new THREE.Mesh(new THREE.CircleGeometry(size * 1.15, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 0.5;
        group.add(inner);
        group.position.y = yPos;
        scene.add(group);
        return { group, outer, inner };
    }

    function createNode(size, color, position) {
        const group = new THREE.Group();
        group.add(new THREE.Mesh(new THREE.SphereGeometry(size * 0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending })));
        const glass = new THREE.Mesh(new THREE.SphereGeometry(size * 0.65, 24, 24), new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: CONFIG.nodes.glowIntensity, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.8, transmission: 0.3, thickness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1 }));
        group.add(glass);
        if (size >= CONFIG.nodes.sizes.large) {
            const ring = new THREE.Mesh(new THREE.RingGeometry(size * 0.85, size * 1.05, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));  // Brighter rings
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }
        const glow = new THREE.Mesh(new THREE.SphereGeometry(size * 1.6, 16, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }));  // Brighter glow
        group.add(glow);
        group.position.copy(position);
        scene.add(group);
        return { group, glass, glow };
    }

    const colorPalette = [CONFIG.nodes.colors.cyan, CONFIG.nodes.colors.purple, CONFIG.nodes.colors.green, CONFIG.nodes.colors.orange, CONFIG.nodes.colors.blue, CONFIG.nodes.colors.pink];
    for (let i = 0; i < CONFIG.nodes.count; i++) {
        const rand = Math.random();
        const size = rand < 0.08 ? CONFIG.nodes.sizes.xlarge : (rand < 0.20 ? CONFIG.nodes.sizes.large : (rand < 0.45 ? CONFIG.nodes.sizes.medium : CONFIG.nodes.sizes.small));
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const position = new THREE.Vector3((Math.random() - 0.5) * 600, (Math.random() - 0.3) * 300 + 50, (Math.random() - 0.5) * 800);
        const node = createNode(size, color, position);
        const platform = createPlatformRing(size * 2, color, -150);
        platform.group.position.x = position.x;
        platform.group.position.z = position.z;
        nodesData.push({
            ...node, size, baseColor: new THREE.Color(color), baseEmissive: CONFIG.nodes.glowIntensity, pulseOffset: Math.random() * Math.PI * 2, platform,
            velocity: { x: (Math.random() - 0.5) * CONFIG.motion.nodeVelocity, y: (Math.random() - 0.5) * CONFIG.motion.nodeVelocity * 0.5, z: (Math.random() - 0.5) * CONFIG.motion.nodeVelocity * 2 }  // INDEPENDENT 3D VELOCITY
        });
    }

    // Connections
    const connectionDots = [];
    for (let i = 0; i < 120; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
        scene.add(dot);
        connectionDots.push(dot);
    }
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = CONFIG.nodes.count * 5;
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxConnections * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(maxConnections * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const linesMesh = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: CONFIG.connections.opacity, blending: THREE.AdditiveBlending }));
    scene.add(linesMesh);

    // Particles
    const particlePositions = new Float32Array(CONFIG.particles.count * 3);
    const particleColors = new Float32Array(CONFIG.particles.count * 3);
    const particleVelocities = [];
    for (let i = 0; i < CONFIG.particles.count * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 900;
        particlePositions[i + 1] = (Math.random() - 0.5) * 600;
        particlePositions[i + 2] = (Math.random() - 0.5) * 500;
        const color = new THREE.Color(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
        particleColors[i] = color.r;
        particleColors[i + 1] = color.g;
        particleColors[i + 2] = color.b;
        particleVelocities.push({ x: (Math.random() - 0.5) * 0.002, y: (Math.random() - 0.5) * 0.002, z: (Math.random() - 0.5) * 0.002 });
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleSystem = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ size: CONFIG.particles.size, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
    scene.add(particleSystem);

    // Mouse
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth) * 2 - 1; mouseY = -(e.clientY / window.innerHeight) * 2 + 1; });

    // Scroll depth - only on homepage when scrolling up
    let scrollDepth = 0;
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const heroSection = document.getElementById('home');
        if (!heroSection) return;

        const heroRect = heroSection.getBoundingClientRect();
        const isHeroVisible = heroRect.top < window.innerHeight && heroRect.bottom > 0;
        const isScrollingUp = window.scrollY < lastScrollY;

        if (isHeroVisible && isScrollingUp) {
            // Calculate depth based on how much of hero is visible
            const visiblePercent = Math.max(0, Math.min(1, (window.innerHeight - heroRect.top) / window.innerHeight));
            scrollDepth = visiblePercent * 200;  // Dive up to 200 units when scrolling up
        } else if (!isHeroVisible) {
            scrollDepth = 0;  // Reset when not on homepage
        }

        lastScrollY = window.scrollY;
    });

    // Animation
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Parallax + Scroll Depth
        targetX += (mouseX * 50 - targetX) * 0.05;
        targetY += (mouseY * 30 - targetY) * 0.05;
        camera.position.x = CONFIG.camera.position.x + targetX;
        camera.position.y = CONFIG.camera.position.y + targetY;
        camera.position.z = CONFIG.camera.position.z - scrollDepth;  // Move forward as you scroll
        camera.lookAt(CONFIG.camera.lookAt.x, CONFIG.camera.lookAt.y, CONFIG.camera.lookAt.z - scrollDepth);

        // Update nodes - INDEPENDENT 3D MOVEMENT
        nodesData.forEach((nodeData) => {
            const node = nodeData.group;
            node.position.x += nodeData.velocity.x;
            node.position.y += nodeData.velocity.y;
            node.position.z += nodeData.velocity.z;  // Each node moves in its own direction

            // Bounce at boundaries
            if (Math.abs(node.position.x) > 400) nodeData.velocity.x *= -1;
            if (node.position.y > 200 || node.position.y < -50) nodeData.velocity.y *= -1;
            if (Math.abs(node.position.z) > 400) nodeData.velocity.z *= -1;

            // Pulsing
            const pulse = Math.sin(time * CONFIG.nodes.pulseSpeed + nodeData.pulseOffset) * 0.5 + 1;
            nodeData.glass.material.emissiveIntensity = nodeData.baseEmissive * pulse;
            nodeData.glow.material.opacity = Math.sin(time * CONFIG.nodes.pulseSpeed + nodeData.pulseOffset) * 0.15 + 0.2;
            nodeData.glow.scale.setScalar(pulse * 0.6 + 0.4);

            // Rotation
            if (nodeData.size >= CONFIG.nodes.sizes.large) node.rotation.y = time * CONFIG.motion.nodeRotation;

            // Platform
            nodeData.platform.group.position.x = node.position.x;
            nodeData.platform.group.position.z = node.position.z;
            const platformPulse = Math.sin(time * CONFIG.motion.platformPulse + nodeData.pulseOffset + Math.PI) * 0.2 + 0.6;
            nodeData.platform.outer.material.opacity = platformPulse;
            nodeData.platform.inner.material.opacity = platformPulse * 0.25;
        });

        // Connections
        let lineIndex = 0, dotIndex = 0;
        const linePositions = linesMesh.geometry.attributes.position.array;
        const lineColors = linesMesh.geometry.attributes.color.array;
        for (let i = 0; i < nodesData.length; i++) {
            for (let j = i + 1; j < nodesData.length; j++) {
                const nodeA = nodesData[i].group, nodeB = nodesData[j].group;
                const distance = nodeA.position.distanceTo(nodeB.position);
                if (distance < CONFIG.connections.maxDistance && lineIndex < maxConnections * 2 * 3) {
                    const colorA = nodesData[i].baseColor, colorB = nodesData[j].baseColor, alpha = 1 - (distance / CONFIG.connections.maxDistance);
                    linePositions[lineIndex] = nodeA.position.x; linePositions[lineIndex + 1] = nodeA.position.y; linePositions[lineIndex + 2] = nodeA.position.z;
                    lineColors[lineIndex] = colorA.r * alpha; lineColors[lineIndex + 1] = colorA.g * alpha; lineColors[lineIndex + 2] = colorA.b * alpha;
                    lineIndex += 3;
                    linePositions[lineIndex] = nodeB.position.x; linePositions[lineIndex + 1] = nodeB.position.y; linePositions[lineIndex + 2] = nodeB.position.z;
                    lineColors[lineIndex] = colorB.r * alpha; lineColors[lineIndex + 1] = colorB.g * alpha; lineColors[lineIndex + 2] = colorB.b * alpha;
                    lineIndex += 3;
                    if (dotIndex < connectionDots.length - CONFIG.connections.dotCount) {
                        for (let d = 0; d < CONFIG.connections.dotCount; d++) {
                            const t = (d + 1) / (CONFIG.connections.dotCount + 1), dot = connectionDots[dotIndex++];
                            dot.position.lerpVectors(nodeA.position, nodeB.position, t);
                            dot.material.color.copy(colorA.clone().lerp(colorB, t));
                            dot.material.opacity = alpha * 0.75;
                            dot.visible = true;
                        }
                    }
                }
            }
        }
        for (let i = dotIndex; i < connectionDots.length; i++) connectionDots[i].visible = false;
        linesMesh.geometry.setDrawRange(0, lineIndex / 3);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;

        // Particles
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < CONFIG.particles.count; i++) {
            const i3 = i * 3;
            positions[i3] += particleVelocities[i].x * CONFIG.particles.speed * 100;
            positions[i3 + 1] += particleVelocities[i].y * CONFIG.particles.speed * 100;
            positions[i3 + 2] += particleVelocities[i].z * CONFIG.particles.speed * 100;
            if (Math.abs(positions[i3]) > 450) positions[i3] *= -1;
            if (Math.abs(positions[i3 + 1]) > 300) positions[i3 + 1] *= -1;
            if (Math.abs(positions[i3 + 2]) > 250) positions[i3 + 2] *= -1;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.y = time * 0.015;

        // Grid & Lights
        hexGrid.rotation.y = time * CONFIG.grid.rotationSpeed;
        lightObjects.forEach((light, i) => { light.intensity = Math.sin(time * CONFIG.motion.lightPulse + i) * 0.8 + lights[i].intensity; });

        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
})();
