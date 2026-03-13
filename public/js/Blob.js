// MoldableBlob Class - Physics-based 3D blob with spring-constrained vertices
class MoldableBlob {
    constructor(scene, world, color = 0xFFFFFF, emoji = '😊', personType = 'me') {
        this.scene = scene;
        this.world = world;
        this.color = color;
        this.emoji = emoji;
        this.personType = personType;

        // Geometry and Mesh
        this.geometry = new THREE.IcosahedronGeometry(1, 2); // 42 vertices
        this.originalPositions = this.geometry.attributes.position.array.slice();

        this.material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 30,
            flatShading: false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Physics Bodies
        this.centerBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(0.3),
            linearDamping: 0.5,
            angularDamping: 0.9
        });
        this.world.addBody(this.centerBody);

        // Vertex particles
        this.vertexBodies = [];
        this.springs = [];

        this.initializeVertexPhysics();

        // Particle trail system
        this.particles = [];
    }

    initializeVertexPhysics() {
        const positions = this.geometry.attributes.position;
        const vertexCount = positions.count;

        // Create physics body for each vertex
        for (let i = 0; i < vertexCount; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            const vertexBody = new CANNON.Body({
                mass: 0.1,
                shape: new CANNON.Sphere(0.05),
                linearDamping: 0.8,
                position: new CANNON.Vec3(x, y, z)
            });

            this.world.addBody(vertexBody);
            this.vertexBodies.push(vertexBody);

            // Create spring constraint between center and vertex
            const restLength = Math.sqrt(x * x + y * y + z * z);
            const spring = new CANNON.Spring(this.centerBody, vertexBody, {
                restLength: restLength,
                stiffness: 50,
                damping: 5
            });

            this.springs.push(spring);
        }

        // Create springs between neighboring vertices for structural integrity
        this.createVertexSprings();
    }

    createVertexSprings() {
        const positions = this.geometry.attributes.position;
        const vertexCount = positions.count;

        // Connect each vertex to its nearest neighbors
        for (let i = 0; i < vertexCount; i++) {
            const x1 = positions.getX(i);
            const y1 = positions.getY(i);
            const z1 = positions.getZ(i);

            for (let j = i + 1; j < vertexCount; j++) {
                const x2 = positions.getX(j);
                const y2 = positions.getY(j);
                const z2 = positions.getZ(j);

                const distance = Math.sqrt(
                    (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2
                );

                // Only connect close neighbors (edges of original icosahedron)
                if (distance < 1.2) {
                    const spring = new CANNON.Spring(this.vertexBodies[i], this.vertexBodies[j], {
                        restLength: distance,
                        stiffness: 30,
                        damping: 3
                    });
                    this.springs.push(spring);
                }
            }
        }
    }

    update(delta) {
        // Apply spring forces
        this.springs.forEach(spring => {
            spring.applyForce();
        });

        // Update vertex positions from physics
        const positions = this.geometry.attributes.position;

        this.vertexBodies.forEach((body, i) => {
            // Constrain vertex distance from center (prevent extreme deformation)
            const dx = body.position.x - this.centerBody.position.x;
            const dy = body.position.y - this.centerBody.position.y;
            const dz = body.position.z - this.centerBody.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const maxDistance = 2.0;
            if (distance > maxDistance) {
                const scale = maxDistance / distance;
                body.position.x = this.centerBody.position.x + dx * scale;
                body.position.y = this.centerBody.position.y + dy * scale;
                body.position.z = this.centerBody.position.z + dz * scale;
            }

            // Update mesh vertex position
            positions.setXYZ(i, body.position.x, body.position.y, body.position.z);
        });

        positions.needsUpdate = true;
        this.geometry.computeVertexNormals();

        // Update mesh position to follow center body
        this.mesh.position.copy(this.centerBody.position);

        // Update particles
        this.updateParticles(delta);
    }

    setPosition(x, y, z) {
        this.centerBody.position.set(x, y, z);

        // Update all vertex bodies to maintain shape
        const positions = this.geometry.attributes.position;
        this.vertexBodies.forEach((body, i) => {
            const localX = positions.getX(i);
            const localY = positions.getY(i);
            const localZ = positions.getZ(i);
            body.position.set(x + localX, y + localY, z + localZ);
        });
    }

    setColor(color) {
        this.color = color;
        this.material.color.setHex(color);
    }

    applyForce(force, worldPoint) {
        this.centerBody.applyForce(force, worldPoint);
    }

    createParticleTrail(position, color) {
        const particle = {
            mesh: new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 })
            ),
            life: 1.0,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            )
        };

        particle.mesh.position.copy(position);
        this.scene.add(particle.mesh);
        this.particles.push(particle);
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= delta;

            if (particle.life <= 0) {
                this.scene.remove(particle.mesh);
                this.particles.splice(i, 1);
            } else {
                particle.mesh.position.add(particle.velocity.clone().multiplyScalar(delta));
                particle.mesh.material.opacity = particle.life * 0.8;
                particle.mesh.scale.setScalar(particle.life);
            }
        }
    }

    serialize() {
        const vertexPositions = [];
        this.vertexBodies.forEach(body => {
            vertexPositions.push({
                x: body.position.x,
                y: body.position.y,
                z: body.position.z
            });
        });

        return {
            type: this.personType,
            color: '#' + this.color.toString(16).padStart(6, '0'),
            emoji: this.emoji,
            centerPosition: {
                x: this.centerBody.position.x,
                y: this.centerBody.position.y,
                z: this.centerBody.position.z
            },
            vertices: vertexPositions
        };
    }

    deserialize(data) {
        this.personType = data.type;
        this.setColor(parseInt(data.color.replace('#', ''), 16));
        this.emoji = data.emoji;

        this.centerBody.position.set(
            data.centerPosition.x,
            data.centerPosition.y,
            data.centerPosition.z
        );

        data.vertices.forEach((vertex, i) => {
            if (this.vertexBodies[i]) {
                this.vertexBodies[i].position.set(vertex.x, vertex.y, vertex.z);
            }
        });
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.world.removeBody(this.centerBody);
        this.vertexBodies.forEach(body => this.world.removeBody(body));
        this.particles.forEach(p => this.scene.remove(p.mesh));
    }
}
