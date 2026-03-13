// VertexDragger - Raycasting and force-based vertex dragging
class VertexDragger {
    constructor(scene, camera, renderer, physicsManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.physicsManager = physicsManager;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.2;

        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.selectedVertex = null;
        this.selectedBlob = null;
        this.dragPlane = new THREE.Plane();
        this.dragPoint = new THREE.Vector3();
        this.dragForce = 15.0;

        this.enabled = false;

        // Bind event handlers
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        const canvas = this.renderer.domElement;

        // Mouse events
        canvas.addEventListener('mousedown', this.onPointerDown);
        canvas.addEventListener('mousemove', this.onPointerMove);
        canvas.addEventListener('mouseup', this.onPointerUp);

        // Touch events
        canvas.addEventListener('touchstart', this.onPointerDown, { passive: false });
        canvas.addEventListener('touchmove', this.onPointerMove, { passive: false });
        canvas.addEventListener('touchend', this.onPointerUp);
        canvas.addEventListener('touchcancel', this.onPointerUp);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.isDragging = false;
        this.selectedVertex = null;
        this.selectedBlob = null;
    }

    getPointerPosition(event) {
        let clientX, clientY;

        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    }

    onPointerDown(event) {
        if (!this.enabled) return;
        event.preventDefault();

        this.getPointerPosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Find closest vertex from all blobs
        let closestDistance = Infinity;
        let closestVertex = null;
        let closestBlob = null;

        this.physicsManager.blobs.forEach(blob => {
            blob.vertexBodies.forEach((vertexBody, index) => {
                const vertexPos = new THREE.Vector3(
                    vertexBody.position.x,
                    vertexBody.position.y,
                    vertexBody.position.z
                );

                const distance = this.raycaster.ray.distanceToPoint(vertexPos);

                if (distance < closestDistance && distance < 0.5) {
                    closestDistance = distance;
                    closestVertex = { body: vertexBody, index: index };
                    closestBlob = blob;
                }
            });
        });

        if (closestVertex) {
            this.isDragging = true;
            this.selectedVertex = closestVertex;
            this.selectedBlob = closestBlob;

            // Set up drag plane perpendicular to camera
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            this.dragPlane.setFromNormalAndCoplanarPoint(
                cameraDirection,
                new THREE.Vector3(
                    this.selectedVertex.body.position.x,
                    this.selectedVertex.body.position.y,
                    this.selectedVertex.body.position.z
                )
            );
        }
    }

    onPointerMove(event) {
        if (!this.enabled || !this.isDragging || !this.selectedVertex) return;
        event.preventDefault();

        this.getPointerPosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Find intersection with drag plane
        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint)) {
            // Apply force toward drag point
            const force = new CANNON.Vec3(
                (this.dragPoint.x - this.selectedVertex.body.position.x) * this.dragForce,
                (this.dragPoint.y - this.selectedVertex.body.position.y) * this.dragForce,
                (this.dragPoint.z - this.selectedVertex.body.position.z) * this.dragForce
            );

            this.selectedVertex.body.applyForce(force, this.selectedVertex.body.position);

            // Create particle trail
            if (Math.random() < 0.3) {
                this.selectedBlob.createParticleTrail(
                    new THREE.Vector3(
                        this.selectedVertex.body.position.x,
                        this.selectedVertex.body.position.y,
                        this.selectedVertex.body.position.z
                    ),
                    this.selectedBlob.color
                );
            }
        }
    }

    onPointerUp(event) {
        if (!this.enabled) return;

        this.isDragging = false;
        this.selectedVertex = null;
        this.selectedBlob = null;
    }

    destroy() {
        const canvas = this.renderer.domElement;
        canvas.removeEventListener('mousedown', this.onPointerDown);
        canvas.removeEventListener('mousemove', this.onPointerMove);
        canvas.removeEventListener('mouseup', this.onPointerUp);
        canvas.removeEventListener('touchstart', this.onPointerDown);
        canvas.removeEventListener('touchmove', this.onPointerMove);
        canvas.removeEventListener('touchend', this.onPointerUp);
        canvas.removeEventListener('touchcancel', this.onPointerUp);
    }
}
