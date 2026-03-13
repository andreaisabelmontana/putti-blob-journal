// BlobCreator - Custom mood monster creation tool
class BlobCreator {
    constructor() {
        this.currentBlob = null;
        this.colorPalette = [];
        this.brushSize = 0.3;
        this.selectedColor = '#FF6B6B';
        this.initializeColorPalette();
    }

    initializeColorPalette() {
        // Expanded color palette for creative expression
        this.colorPalette = [
            // Warm colors
            '#FF6B6B', '#FF8E53', '#FFA500', '#FFD700', '#FFFF00',
            // Cool colors
            '#87CEEB', '#4169E1', '#0000FF', '#8A2BE2', '#9370DB',
            // Earth tones
            '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
            // Greens
            '#90EE90', '#00FF00', '#228B22', '#006400', '#2E8B57',
            // Pinks/Purples
            '#FFB6D9', '#FF69B4', '#FF1493', '#C71585', '#DA70D6',
            // Neutrals
            '#FFFFFF', '#D3D3D3', '#808080', '#000000', '#696969'
        ];
    }

    createColorPicker() {
        const container = document.getElementById('color-picker-container');
        container.innerHTML = '<h3>Paint Your Mood Monster</h3>';

        const grid = document.createElement('div');
        grid.className = 'color-palette-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            max-width: 400px;
            margin: 20px auto;
        `;

        this.colorPalette.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-swatch';
            colorBtn.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${color};
                border: 3px solid ${color === this.selectedColor ? '#333' : '#E0E0E0'};
                cursor: pointer;
                transition: transform 0.2s;
            `;

            colorBtn.onclick = () => {
                this.selectedColor = color;
                document.querySelectorAll('.color-swatch').forEach(btn => {
                    btn.style.border = '3px solid #E0E0E0';
                });
                colorBtn.style.border = '3px solid #333';
            };

            colorBtn.onmouseenter = () => {
                colorBtn.style.transform = 'scale(1.1)';
            };

            colorBtn.onmouseleave = () => {
                colorBtn.style.transform = 'scale(1)';
            };

            grid.appendChild(colorBtn);
        });

        container.appendChild(grid);

        // Add brush size slider
        const brushControls = document.createElement('div');
        brushControls.style.cssText = 'margin: 20px auto; max-width: 400px;';
        brushControls.innerHTML = `
            <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                Brush Size: <span id="brush-size-value">${this.brushSize.toFixed(1)}</span>
            </label>
            <input type="range" id="brush-size-slider" min="0.1" max="1.0" step="0.1" value="${this.brushSize}"
                   style="width: 100%; height: 40px; cursor: pointer;">
        `;
        container.appendChild(brushControls);

        document.getElementById('brush-size-slider').addEventListener('input', (e) => {
            this.brushSize = parseFloat(e.target.value);
            document.getElementById('brush-size-value').textContent = this.brushSize.toFixed(1);
        });
    }

    paintVertex(blob, vertexIndex) {
        if (!blob || !blob.geometry) return;

        const colors = blob.geometry.attributes.color;
        if (!colors) {
            // Initialize color attribute if it doesn't exist
            const colorArray = new Float32Array(blob.geometry.attributes.position.count * 3);
            // Set default white
            for (let i = 0; i < colorArray.length; i += 3) {
                colorArray[i] = 1.0;     // R
                colorArray[i + 1] = 1.0; // G
                colorArray[i + 2] = 1.0; // B
            }
            blob.geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            blob.material.vertexColors = true;
        }

        // Convert hex to RGB
        const color = new THREE.Color(this.selectedColor);

        // Paint the selected vertex and nearby vertices (based on brush size)
        const positions = blob.geometry.attributes.position;
        const vertexColors = blob.geometry.attributes.color;

        const vx = positions.getX(vertexIndex);
        const vy = positions.getY(vertexIndex);
        const vz = positions.getZ(vertexIndex);

        for (let i = 0; i < positions.count; i++) {
            const px = positions.getX(i);
            const py = positions.getY(i);
            const pz = positions.getZ(i);

            const distance = Math.sqrt(
                (px - vx) ** 2 + (py - vy) ** 2 + (pz - vz) ** 2
            );

            if (distance < this.brushSize) {
                const strength = 1 - (distance / this.brushSize);
                const currentR = vertexColors.getX(i);
                const currentG = vertexColors.getY(i);
                const currentB = vertexColors.getZ(i);

                // Blend colors
                vertexColors.setXYZ(
                    i,
                    currentR + (color.r - currentR) * strength,
                    currentG + (color.g - currentG) * strength,
                    currentB + (color.b - currentB) * strength
                );
            }
        }

        vertexColors.needsUpdate = true;
    }

    getMoodMonsterData(blob) {
        // Extract color data for AI analysis
        const colorData = [];
        const colors = blob.geometry.attributes.color;

        if (colors) {
            for (let i = 0; i < colors.count; i++) {
                colorData.push({
                    r: colors.getX(i),
                    g: colors.getY(i),
                    b: colors.getZ(i)
                });
            }
        }

        // Analyze shape complexity
        const positions = blob.geometry.attributes.position;
        let shapeComplexity = 0;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const distance = Math.sqrt(x * x + y * y + z * z);
            shapeComplexity += Math.abs(distance - 1.0); // Deviation from sphere
        }

        // Calculate dominant colors
        const colorHistogram = this.analyzeColors(colorData);

        return {
            colorData: colorData,
            dominantColors: colorHistogram,
            shapeComplexity: shapeComplexity,
            vertexCount: positions.count
        };
    }

    analyzeColors(colorData) {
        // Group similar colors and find dominant ones
        const histogram = {};

        colorData.forEach(color => {
            const hex = this.rgbToHex(color.r, color.g, color.b);
            histogram[hex] = (histogram[hex] || 0) + 1;
        });

        // Sort by frequency
        const sorted = Object.entries(histogram)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5 colors

        return sorted.map(([color, count]) => ({
            color: color,
            percentage: (count / colorData.length * 100).toFixed(1)
        }));
    }

    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(n * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    reset() {
        this.selectedColor = '#FF6B6B';
        this.brushSize = 0.3;
    }
}
