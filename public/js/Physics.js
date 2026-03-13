// BlobPhysicsManager - Handles blob interactions (attraction/repulsion)
class BlobPhysicsManager {
    constructor(world) {
        this.world = world;
        this.blobs = [];
        this.timeStep = 1 / 60;
    }

    addBlob(blob) {
        this.blobs.push(blob);
    }

    removeBlob(blob) {
        const index = this.blobs.indexOf(blob);
        if (index > -1) {
            this.blobs.splice(index, 1);
        }
    }

    clearBlobs() {
        this.blobs.forEach(blob => blob.destroy());
        this.blobs = [];
    }

    updateInteractions() {
        // N² interaction loop
        for (let i = 0; i < this.blobs.length; i++) {
            for (let j = i + 1; j < this.blobs.length; j++) {
                const blobA = this.blobs[i];
                const blobB = this.blobs[j];

                // Calculate distance between blobs
                const dx = blobB.centerBody.position.x - blobA.centerBody.position.x;
                const dy = blobB.centerBody.position.y - blobA.centerBody.position.y;
                const dz = blobB.centerBody.position.z - blobA.centerBody.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // Skip if too far apart (optimization)
                if (distance > 10) continue;

                // Normalize direction
                const nx = dx / distance;
                const ny = dy / distance;
                const nz = dz / distance;

                // Determine force based on color similarity
                let forceMagnitude;
                if (this.colorsMatch(blobA.color, blobB.color)) {
                    // Same color: attract
                    forceMagnitude = 0.1;
                } else {
                    // Different color: repel
                    forceMagnitude = -0.3;
                }

                // Apply inverse square law (weaker at distance)
                const distanceFactor = Math.max(1, distance);
                const force = forceMagnitude / (distanceFactor * distanceFactor);

                // Apply forces
                const forceVec = new CANNON.Vec3(
                    nx * force,
                    ny * force,
                    nz * force
                );

                blobA.centerBody.applyForce(forceVec, blobA.centerBody.position);
                blobB.centerBody.applyForce(
                    new CANNON.Vec3(-forceVec.x, -forceVec.y, -forceVec.z),
                    blobB.centerBody.position
                );
            }
        }
    }

    colorsMatch(color1, color2) {
        // Compare colors (allow small variance for similar colors)
        const c1 = typeof color1 === 'number' ? color1 : parseInt(color1.replace('#', ''), 16);
        const c2 = typeof color2 === 'number' ? color2 : parseInt(color2.replace('#', ''), 16);

        return c1 === c2;
    }

    step(delta) {
        // Fixed timestep for consistent physics
        this.updateInteractions();
        this.world.step(this.timeStep, delta, 3);

        // Update all blobs
        this.blobs.forEach(blob => blob.update(delta));
    }
}
