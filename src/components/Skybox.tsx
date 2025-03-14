import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const Skybox: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 0.1; // Place camera at center

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const sideSize = 1024;

        // Create a skybox geometry - we'll use a box that we'll see from inside
        const skyboxGeometry = new THREE.BoxGeometry(
            sideSize,
            sideSize,
            sideSize
        );

        // Load the skybox textures - one for each side of the cube
        // - Right face (+X direction)
        // - Left face (-X direction)
        // - Top face (+Y direction)
        // - Bottom face (-Y direction)
        // - Front face (+Z direction)
        // - Back face (-Z direction)
        const textureLoader = new THREE.TextureLoader();
        const materialArray = [
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/right.png`),
                side: THREE.BackSide,
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/left.png`),
                side: THREE.BackSide,
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/top.png`),
                side: THREE.BackSide,
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/bottom.png`),
                side: THREE.BackSide,
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/front.png`),
                side: THREE.BackSide,
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load(`/skybox/${sideSize}/back.png`),
                side: THREE.BackSide,
            }),
        ];

        // Create skybox mesh and add to scene
        const skybox = new THREE.Mesh(skyboxGeometry, materialArray);
        scene.add(skybox);

        // Handle window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        // Animation loop with visible rotation
        const animate = () => {
            requestAnimationFrame(animate);

            skybox.rotation.y += 0.00001; // Slow rotation speed

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            window.removeEventListener("resize", handleResize);

            if (containerRef.current) {
                const element = renderer.domElement;
                if (containerRef.current.contains(element)) {
                    containerRef.current.removeChild(element);
                }
            }

            // Dispose of resources
            skyboxGeometry.dispose();
            materialArray.forEach((material) => material.dispose());
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                margin: 0,
                padding: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                overflow: "hidden",
            }}
        />
    );
};

export default Skybox;
