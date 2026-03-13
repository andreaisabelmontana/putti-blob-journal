// Three.js Scene Setup
const Scene = {
    scene: null,
    camera: null,
    renderer: null,
    world: null,
    clock: null,

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFFFFF);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 10);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Lighting - soft and diffuse for putty feel
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xF0F0F0, 0.5);
        this.scene.add(hemisphereLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.4);
        directionalLight.position.set(3, 5, 4);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Add subtle rim light
        const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
        rimLight.position.set(-2, 3, -2);
        this.scene.add(rimLight);

        // Physics World
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0); // No gravity for floating blobs
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;

        // Clock for delta time
        this.clock = new THREE.Clock();

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    },

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
