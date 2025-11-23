// Three.js 3D Scene Setup
(function () {
    'use strict';

    // Scene setup
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    // Define gradient colors (purple, cyan, pink)
    const colors = [
        new THREE.Color(0xa855f7), // purple
        new THREE.Color(0x06b6d4), // cyan
        new THREE.Color(0xec4899)  // pink
    ];

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position
        posArray[i] = (Math.random() - 0.5) * 10;
        posArray[i + 1] = (Math.random() - 0.5) * 10;
        posArray[i + 2] = (Math.random() - 0.5) * 10;

        // Color - randomly pick from gradient colors
        const color = colors[Math.floor(Math.random() * colors.length)];
        colorsArray[i] = color.r;
        colorsArray[i + 1] = color.g;
        colorsArray[i + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create geometric shapes
    const geometries = [
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.TetrahedronGeometry(0.5, 0),
        new THREE.IcosahedronGeometry(0.5, 0)
    ];

    const shapes = [];
    const shapeCount = 5;

    for (let i = 0; i < shapeCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 5
        );

        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            }
        };

        shapes.push(mesh);
        scene.add(mesh);
    }

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) / windowHalfX;
        mouseY = (event.clientY - windowHalfY) / windowHalfY;
    });

    // Animation loop
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.001;

        // Smooth mouse follow
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Rotate particles
        particlesMesh.rotation.y = time * 0.5;
        particlesMesh.rotation.x = targetY * 0.3;
        particlesMesh.rotation.z = targetX * 0.3;

        // Animate geometric shapes
        shapes.forEach((shape, index) => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;

            // Floating animation
            shape.position.y += Math.sin(time * 2 + index) * 0.001;
        });

        // Camera movement based on mouse
        camera.position.x = targetX * 0.5;
        camera.position.y = -targetY * 0.5;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Optimize performance on scroll
    let isScrolling;
    window.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);

        // Reduce particle count when scrolling for performance
        particlesMaterial.opacity = 0.4;

        isScrolling = setTimeout(() => {
            particlesMaterial.opacity = 0.8;
        }, 150);
    });

})();
