// Main App Entry Point
let physicsManager;
let vertexDragger;
let currentBlob;

function init() {
    // Initialize Three.js scene
    Scene.init();

    // Initialize physics manager
    physicsManager = new BlobPhysicsManager(Scene.world);
    window.physicsManager = physicsManager;

    // Initialize vertex dragger
    vertexDragger = new VertexDragger(
        Scene.scene,
        Scene.camera,
        Scene.renderer,
        physicsManager
    );
    window.vertexDragger = vertexDragger;

    // Initialize UI
    UI.init();

    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const delta = Scene.clock.getDelta();

    // Update physics
    physicsManager.step(delta);

    // Render scene
    Scene.render();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
