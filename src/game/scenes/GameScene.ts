import {
    ExitLocation,
    SpawnLocation,
    TowerLocation,
    Path,
    Wave,
    Enemy,
    Defender,
} from "../../types/GameTypes";
import {
    GAME_DEFENDER_HEAVY_SOLDER,
    GAME_DEFENDER_SOLDER,
    GAME_DEFENDER_TURRET_LASER,
    GAME_WAVES,
} from "../../utils/settings";

export class GameScene extends Phaser.Scene {
    gridSize: number;
    gridWidth: number;
    gridHeight: number;

    map: Phaser.Tilemaps.Tilemap;
    exitLocations: ExitLocation[];
    spawnLocations: SpawnLocation[];
    towerLocations: TowerLocation[];

    zoomFactor: number;
    minZoom: number;
    maxZoom: number;
    controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    paths: Path[];
    pathsActive: Map<number, any[]>;

    enemies: any[];
    enemyGroup: Phaser.GameObjects.Group;

    waves: Wave[];
    waveCurrent: number;
    waveInProgress: boolean;
    wavePendingStacks: number;
    wavesFinished: number;

    health: number;

    towers: Array<Phaser.GameObjects.Image>;
    towerAvailableLocations: Array<{
        x: number;
        y: number;
        baseSprite?: Phaser.GameObjects.Image;
        portalSprite?: Phaser.GameObjects.Image;
    }>;
    towerHoveredLocation: { x: number; y: number } | null;
    towerSelected: string | null;
    towerPlacing: boolean;
    towerPreview: Phaser.GameObjects.Image;
    defenders: Record<string, Defender>;

    selectedTower: any;
    deleteButton: any;
    deleteConfirmDialog: any;

    credits: number;

    rangeIndicator: any;

    // gameMusic: Phaser.Sound.BaseSound;
    // hasSpriteFrames: any;

    constructor() {
        super("GameScene");
    }

    init() {
        // Initialize game variables
        this.gridSize = window.gameSettings.gridSize;
        this.gridWidth = 0;
        this.gridHeight = 0;

        this.map = this.add.tilemap("map");

        // Camera control properties
        this.zoomFactor = window.gameSettings.camera.zoomFactor;
        this.minZoom = window.gameSettings.camera.minZoom;
        this.maxZoom = window.gameSettings.camera.maxZoom;

        this.pathsActive = new Map();

        this.enemies = [];
        this.enemyGroup = this.add.group();

        this.waves = [];
        this.waveCurrent = window.gameSettings.waveCount;
        this.waveInProgress = false;
        this.wavePendingStacks = 0;
        this.wavesFinished = window.gameSettings.waveCount - 1;

        this.health = window.gameSettings.health;

        this.towers = [];
        this.towerAvailableLocations = [];
        this.towerHoveredLocation = null;
        this.towerSelected = null;
        this.towerPlacing = false;

        this.selectedTower = null;
        this.deleteButton = null;
        this.deleteConfirmDialog = null;

        this.credits =
            GAME_WAVES[window.gameSettings.waveCount - 1].minStartCredits;

        // Define specific tile locations
        this.exitLocations = [
            {
                x: 18,
                y: 2,
                type: "exit",
                id: 1,
            },
            {
                x: 18,
                y: 4,
                type: "exit",
                id: 2,
            },
        ];

        this.spawnLocations = [
            {
                x: 1,
                y: 2,
                type: "spawn",
                id: 1,
            },
            {
                x: 1,
                y: 4,
                type: "spawn",
                id: 2,
            },
        ];

        this.towerLocations = [
            {
                x: 5,
                y: 3,
                type: "base",
                id: 1,
            },
            {
                x: 9,
                y: 1,
                type: "base",
                id: 2,
            },
            {
                x: 8,
                y: 5,
                type: "base",
                id: 3,
            },
            {
                x: 9,
                y: 0,
                type: "base",
                id: 4,
            },
            {
                x: 14,
                y: 5,
                type: "base",
                id: 5,
            },
            {
                x: 16,
                y: 3,
                type: "base",
                id: 6,
            },
            {
                x: 16,
                y: 0,
                type: "base",
                id: 7,
            },
        ];

        this.paths = [
            {
                spawn: 1,
                exit: 1,
                id: 1,
            },
            {
                spawn: 2,
                exit: 2,
                id: 2,
            },
        ];

        this.waves = GAME_WAVES;

        // Define tower types
        this.defenders = {
            solder: GAME_DEFENDER_SOLDER,
            turret_laser: GAME_DEFENDER_TURRET_LASER,
            heavy_solder: GAME_DEFENDER_HEAVY_SOLDER,
        };

        this.rangeIndicator = this.add.circle(0, 0, 100, 0xffffff, 0.2);
        this.rangeIndicator.setVisible(false);

        // // Get animation availability information from the registry
        // this.hasSpriteFrames = this.registry.get("hasSpriteFrames") || {
        //     alien: false,
        //     pirate: false,
        //     monster: false,
        //     explosion: false,
        // };
    }

    create() {
        console.log("[INFO] GameScene creation started");

        this.mapCreateObjects();

        this.cameraControlsSetup();

        this.mapCreateBases(this.exitLocations, "exit");
        this.mapCreateBases(this.spawnLocations, "spawn");
        this.mapCreateBases(this.towerLocations, "tower");

        this.enemyPathsSetup();

        this.events.emit("waveComplete");

        // Setup mouse wheel for zooming
        this.input.on("wheel", this.handleMouseWheel, this);

        // Add event listener for clicking on towers
        this.input.on("gameobjectdown", this.onGameObjectDown, this);
    }

    onGameObjectDown(pointer, gameObject) {
        // Check if the clicked object is a tower
        if (this.towers.includes(gameObject)) {
            // If this tower is already selected, deselect it
            if (this.selectedTower === gameObject) {
                this.deselectTower();
            } else {
                // Otherwise, select the new tower
                this.selectTower(gameObject);
            }
        } else if (gameObject !== this.deleteButton && this.selectedTower) {
            // If clicking elsewhere and not on delete button, deselect tower
            this.deselectTower();
        }
    }

    selectTower(tower) {
        // Deselect previous tower if any
        this.deselectTower();

        // Set the new selected tower
        this.selectedTower = tower;

        // Highlight the selected tower
        tower.setTint(0x88ff88);

        // Show range indicator for this tower
        const x = tower.x;
        const y = tower.y;
        const range = tower.getData("range");

        this.rangeIndicator.setPosition(x, y);
        this.rangeIndicator.setRadius(range * this.gridSize);
        this.rangeIndicator.setVisible(true);

        this.createDeleteButton(x, y);
    }

    deselectTower() {
        if (this.selectedTower) {
            // Remove tint
            this.selectedTower.clearTint();

            // Hide range indicator
            this.rangeIndicator.setVisible(false);

            // Destroy delete button if it exists
            if (this.deleteButton) {
                this.deleteButton.destroy();
                this.deleteButton = null;
            }

            // Hide confirmation dialog if it exists
            if (this.deleteConfirmDialog) {
                this.deleteConfirmDialog.setVisible(false);
                this.deleteConfirmDialog = null;
            }

            this.selectedTower = null;
        }
    }

    createDeleteButton(x, y) {
        // Create a delete button (red X) above the tower
        this.deleteButton = this.add.image(x + 40, y - 50 * 0.8, "icon_x");

        // Make the button interactive
        this.deleteButton.setInteractive({ useHandCursor: true });
        this.deleteButton.on(
            "pointerdown",
            () => {
                this.deleteTower();
                this.deselectTower();
            },
            this
        );

        // Add some visual feedback
        this.deleteButton.on("pointerover", () => {
            this.deleteButton.setScale(1.2);
        });

        this.deleteButton.on("pointerout", () => {
            this.deleteButton.setScale(1.0);
        });

        // Set appropriate depth
        this.deleteButton.setDepth(90);
    }

    deleteTower() {
        if (!this.selectedTower) return;

        // Get grid position
        const gridX = this.selectedTower.getData("gridX");
        const gridY = this.selectedTower.getData("gridY");

        // Create new base at this location
        const x = gridX * this.gridSize + this.gridSize / 2;
        const y = gridY * this.gridSize + this.gridSize / 2;

        // Create base sprite
        const baseSprite = this.add.image(x, y, "tower_base");
        baseSprite.setDepth(5);

        // Create portal sprite with pulsing effect
        const portalSprite = this.add.image(x, y, "tower_portal");
        portalSprite.setDepth(6);

        // Add pulsing animation
        this.tweens.add({
            targets: portalSprite,
            alpha: { from: 1, to: 0.2 },
            duration: 1000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        // Add location back to available locations
        this.towerAvailableLocations.push({
            x: gridX,
            y: gridY,
            baseSprite,
            portalSprite,
        });

        // Remove tower from the towers array
        const index = this.towers.indexOf(this.selectedTower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }

        // Destroy the tower game object
        this.selectedTower.destroy();

        // Clean up
        this.deselectTower();
    }

    // Create map objects and layers
    mapCreateObjects() {
        // Create a grid-based map for the space station
        const floorTiles = this.map.addTilesetImage(
            "floor-tile-map",
            "floor_tiles"
        );

        // Create layers
        const floorLayer = this.map.createLayer("floor", floorTiles);
        const obstaclesLayer = this.map.createLayer("obstacles", floorTiles);

        // Set the world bounds to match the size of the tilemap
        const mapWidth = this.map.widthInPixels;
        const mapHeight = this.map.heightInPixels;
        // this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Store grid dimensions based on the actual map size
        this.gridWidth = Math.floor(mapWidth / this.gridSize);
        this.gridHeight = Math.floor(mapHeight / this.gridSize);
    }

    mapCreateBases(bases, baseType: string) {
        bases.forEach((base) => {
            // Convert grid coordinates to pixel coordinates
            const x = base.x * this.gridSize + this.gridSize / 2;
            const y = base.y * this.gridSize + this.gridSize / 2;

            // Create the base image
            const baseSprite = this.add.image(x, y, `${baseType}_base`);

            // Create portal on top of the base
            const portalSprite = this.add.image(x, y, `${baseType}_portal`);
            this.tweens.add({
                targets: portalSprite,
                alpha: { from: 1, to: 0.2 },
                duration: 1000,
                ease: "Sine.easeInOut",
                yoyo: true,
                repeat: -1,
            });

            if (baseType === "tower") {
                this.towerAvailableLocations.push({
                    x: base.x,
                    y: base.y,
                    baseSprite: baseSprite,
                    portalSprite: portalSprite,
                });
            }
        });
    }

    // Set up camera controls
    cameraControlsSetup() {
        // // Set camera bounds to the map size
        // camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Enable keyboard controls for camera movement
        this.cursors = this.input.keyboard.createCursorKeys();

        // Use panSpeed from gameSettings for camera movement
        const panSpeed = window.gameSettings.camera.panSpeed / 100;

        // Configure key control settings and create controls
        const controlConfig = {
            camera: this.cameras.main,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            acceleration: panSpeed,
            drag: 0.005,
            maxSpeed: 1.0,
        };
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
            controlConfig
        );

        this.cameraCenter();

        // Set initial zoom
        this.cameras.main.setZoom(window.gameSettings.camera.minZoom);
    }

    handleMouseWheel(
        pointer: Phaser.Input.Pointer,
        gameObjects: any,
        deltaX: number,
        deltaY: number,
        deltaZ: number
    ) {
        if (deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    zoomIn() {
        if (this.zoomFactor < this.maxZoom) {
            this.zoomFactor += window.gameSettings.camera.zoomSpeed;
            this.cameras.main.setZoom(this.zoomFactor);
        }
    }

    zoomOut() {
        if (this.zoomFactor > this.minZoom) {
            this.zoomFactor -= window.gameSettings.camera.zoomSpeed;
            this.cameras.main.setZoom(this.zoomFactor);
        }
    }

    // Center the camera on the map
    cameraCenter() {
        // Get the center coordinates of the map in world space
        const mapCenterX = this.map.widthInPixels / 2;
        const mapCenterY = this.map.heightInPixels / 2;

        this.cameras.main.centerOn(mapCenterX, mapCenterY);
    }

    // Generate path for enemies
    enemyPathsSetup() {
        // Create pathfinding grid - you can adjust this based on your map
        const grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            const row = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // Check if this position is blocked, for now, assume all cells are walkable
                row.push(1); // 1 means walkable
            }
            grid.push(row);
        }

        // Mark obstacles as unwalkable
        // this.map.getLayer('obstacles').data.forEach((row, y) => {
        //     row.forEach((tile, x) => {
        //         if (tile && tile.index !== -1) {
        //             grid[y][x] = 0; // 0 means unwalkable
        //         }
        //     });
        // });

        // Generate paths for each spawn-exit pair
        this.paths.forEach((pathInfo) => {
            // Find spawn and exit points with matching IDs
            const spawn = this.spawnLocations.find(
                (loc) => loc.id === pathInfo.spawn
            );
            const exit = this.exitLocations.find(
                (loc) => loc.id === pathInfo.exit
            );

            const path = this.enemyPathsCreateDirect(spawn, exit);

            // Store the path in the pathsActive map
            this.pathsActive.set(spawn.id, path);

            // // Optionally visualize the path for debugging
            // this.enemyPathsVisualize(path);
        });
    }

    // Create a simple direct path between two points with intermediate points
    enemyPathsCreateDirect(startLoc, endLoc) {
        const path = [];

        // Start with horizontal movement
        let currentX = startLoc.x;
        const endX = endLoc.x;

        while (currentX !== endX) {
            currentX += currentX < endX ? 1 : -1;
            path.push({ x: currentX, y: startLoc.y });
        }

        // Then add vertical movement
        let currentY = startLoc.y;
        const endY = endLoc.y;

        while (currentY !== endY) {
            currentY += currentY < endY ? 1 : -1;
            path.push({ x: endX, y: currentY });
        }

        return path;
    }

    enemyPathsVisualize(path) {
        const graphics = this.add.graphics({
            lineStyle: { width: 2, color: 0xffff00, alpha: 0.5 },
        });

        for (let i = 0; i < path.length; i++) {
            const gridX = path[i].x * this.gridSize + this.gridSize / 2;
            const gridY = path[i].y * this.gridSize + this.gridSize / 2;

            // Draw a circle at each path point
            graphics.strokeCircle(gridX, gridY, 5);

            // Draw a line to the next point
            if (i < path.length - 1) {
                const nextGridX =
                    path[i + 1].x * this.gridSize + this.gridSize / 2;
                const nextGridY =
                    path[i + 1].y * this.gridSize + this.gridSize / 2;

                graphics.beginPath();
                graphics.moveTo(gridX, gridY);
                graphics.lineTo(nextGridX, nextGridY);
                graphics.closePath();
                graphics.strokePath();
            }
        }
    }

    waveStartNext() {
        // Important: No increment here, we use the current value
        if (this.waveCurrent > this.waves.length) {
            console.log("[INFO] All waves completed!");
            this.gameOver();
            return;
        }

        this.waveInProgress = true;
        this.wavePendingStacks = 0; // Track enemy spawns

        // Access waves array with current wave index (zero-based)
        const waveIndex = this.waveCurrent - 1;
        const wave = this.waves[waveIndex];

        wave.stacks
            .filter((stack) => this.pathsActive.has(stack.pathId))
            .forEach((stack) => {
                for (let i = 0; i < stack.count; i++) {
                    const spawnDelay = i * stack.delay + stack.stackDelay;

                    this.wavePendingStacks++; // Track enemy spawn

                    this.time.delayedCall(spawnDelay, () => {
                        this.enemySpawn(stack.enemy, stack.pathId);
                        this.wavePendingStacks--;
                        this.waveCheckComplete();
                    });
                }
            });

        // Update UI with current wave
        this.events.emit("updateUI", { wave: this.waveCurrent });

        console.log("[INFO] Wave", this.waveCurrent, "started");
    }

    waveComplete() {
        console.log("[INFO] Wave", this.waveCurrent, "completed!");
        this.waveInProgress = false;

        // Award credits for completing the wave
        const waveIndex = this.waveCurrent - 1;
        if (waveIndex >= 0 && waveIndex < this.waves.length) {
            const waveReward = this.waves[waveIndex].reward;
            this.credits += waveReward;
        }

        // Increment to next wave
        this.waveCurrent++;
        window.gameSettings.waveCount = this.waveCurrent; // Keep game settings in sync

        // Update UI
        this.events.emit("updateUI", {
            credits: this.credits,
            wave: this.waveCurrent,
        });
        this.events.emit("waveComplete");

        this.wavesFinished++;
    }

    waveCheckComplete() {
        // A wave is complete only when no enemies exist and no more are waiting to be spawned
        if (
            this.waveInProgress &&
            this.enemies.length === 0 &&
            this.wavePendingStacks === 0
        ) {
            this.waveComplete();
        }
    }

    enemySpawn(enemyData: Enemy, spawnId: number) {
        // Find the spawn location
        const spawn = this.spawnLocations.find((loc) => loc.id === spawnId);

        // Get path for this spawn point
        const path = this.pathsActive.get(spawnId);

        // Get spawn position
        const x = spawn.x * this.gridSize + this.gridSize / 2;
        const y = spawn.y * this.gridSize + this.gridSize / 2;

        let health = enemyData.health;
        let speed = enemyData.speed;
        let reward = enemyData.reward;
        let sprite = enemyData.sprite;

        // Create the enemy sprite
        let enemy = this.physics.add.sprite(x, y, sprite);
        enemy.setDepth(10); // Set depth to appear above path and bases

        enemy.play(`${sprite}_walk`);

        // Setup enemy properties
        enemy.setData("name", enemyData.name);
        enemy.setData("health", health);
        enemy.setData("maxHealth", health);
        enemy.setData("speed", speed);
        enemy.setData("reward", reward);
        enemy.setData("pathIndex", 0);
        enemy.setData("spawnId", spawnId);
        enemy.setData("path", path);

        // Add health bar
        const healthBar = this.add.rectangle(x, y + 50, 40, 5, 0x00ff00);
        healthBar.setDepth(11);
        enemy.setData("healthBar", healthBar);

        // Add enemy to groups
        this.enemyGroup.add(enemy);
        this.enemies.push(enemy);

        // Start moving along path
        this.enemyMoveAlongPath(enemy);

        return enemy;
    }

    enemyMoveAlongPath(enemy: Phaser.Physics.Arcade.Sprite) {
        if (!enemy || !enemy.active) return;

        const path = enemy.getData("path");
        const pathIndex = enemy.getData("pathIndex");

        if (pathIndex < path.length) {
            const targetPoint = path[pathIndex];
            const targetX = targetPoint.x * this.gridSize + this.gridSize / 2;
            const targetY = targetPoint.y * this.gridSize + this.gridSize / 2;

            // Calculate distance
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate duration based on speed
            const duration = (distance / enemy.getData("speed")) * 1000;

            // Move enemy to next point
            this.tweens.add({
                targets: enemy,
                x: targetX,
                y: targetY,
                duration: duration,
                onComplete: () => {
                    if (enemy && enemy.active) {
                        enemy.setData("pathIndex", pathIndex + 1);
                        this.enemyMoveAlongPath(enemy);
                    }
                },
            });

            // Also move health bar
            this.tweens.add({
                targets: enemy.getData("healthBar"),
                x: targetX,
                y: targetY + 50,
                duration: duration,
            });
        } else {
            // Enemy reached the exit
            this.enemyReachedExit(enemy);
        }
    }

    enemyReachedExit(enemy: Phaser.Physics.Arcade.Sprite) {
        // Reduce player health
        this.health -= 10;

        // Update UI
        this.events.emit("updateUI", {
            health: this.health,
        });

        // Remove enemy
        this.enemyRemove(enemy);

        this.waveCheckComplete();
    }

    enemyRemove(enemy: Phaser.Physics.Arcade.Sprite) {
        if (!enemy || !enemy.active) return;

        // Remove health bar
        const healthBar = enemy.getData("healthBar");
        if (healthBar) {
            healthBar.destroy();
        }

        // Remove from arrays
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        // Destroy sprite
        enemy.destroy();

        this.waveCheckComplete();
    }

    towerPlacePointerMove(pointer) {
        if (!this.towerPlacing || !this.towerSelected) return;

        // Reset previously hovered location
        if (this.towerHoveredLocation) {
            const prevLocation = this.towerAvailableLocations.find(
                (loc) =>
                    loc.x === this.towerHoveredLocation.x &&
                    loc.y === this.towerHoveredLocation.y
            );

            if (prevLocation) {
                // Show the base sprite again
                if (prevLocation.baseSprite) {
                    prevLocation.baseSprite.setVisible(true);
                }

                // Restore pulsing animation for portal sprite
                if (prevLocation.portalSprite) {
                    this.tweens.add({
                        targets: prevLocation.portalSprite,
                        alpha: { from: 1, to: 0.2 },
                        duration: 1000,
                        ease: "Sine.easeInOut",
                        yoyo: true,
                        repeat: -1,
                    });
                }
            }

            this.towerHoveredLocation = null;
        }

        // Convert screen coordinates to world coordinates
        const worldX = pointer.worldX || pointer.x;
        const worldY = pointer.worldY || pointer.y;

        // Get the grid coordinates
        const gridX = Math.floor(worldX / this.gridSize);
        const gridY = Math.floor(worldY / this.gridSize);

        // Find if there's an available tower location at this exact grid position
        const hoverLocation = this.towerAvailableLocations.find(
            (loc) => loc.x === gridX && loc.y === gridY
        );

        if (hoverLocation) {
            // Set hovered location
            this.towerHoveredLocation = {
                x: hoverLocation.x,
                y: hoverLocation.y,
            };

            // Position tower preview
            const x = hoverLocation.x * this.gridSize + this.gridSize / 2;
            const y = hoverLocation.y * this.gridSize + this.gridSize / 2;
            this.towerPreview.setPosition(x, y);
            this.towerPreview.setVisible(true);

            // Update tower preview texture based on selected tower
            this.towerPreview.setTexture(
                `${this.defenders[this.towerSelected].sprite}_idle`
            );

            // Check if player has enough credits
            const canAfford =
                this.credits >= this.defenders[this.towerSelected].cost;

            // Change tint based on affordability
            this.towerPreview.setTint(canAfford ? 0xffffff : 0xff6666);

            // Hide the base sprite while hovering
            if (hoverLocation.baseSprite) {
                hoverLocation.baseSprite.setVisible(false);
            }

            // Hide the portal sprite while hovering
            if (hoverLocation.portalSprite) {
                // Stop any existing tweens
                this.tweens.killTweensOf(hoverLocation.portalSprite);
                // Hide the portal
                hoverLocation.portalSprite.setAlpha(0);
            }

            // Show and position range indicator
            this.rangeIndicator.setPosition(x, y);
            this.rangeIndicator.setRadius(
                this.defenders[this.towerSelected].range * this.gridSize
            );
            this.rangeIndicator.setVisible(true);
            this.rangeIndicator.setAlpha(0.2);
            this.rangeIndicator.setDepth(100);
        } else {
            // No valid location found, hide preview
            this.towerPreview.setVisible(false);
            this.rangeIndicator.setVisible(false);
        }
    }

    // Handle pointer click for tower placement
    towerPlacePointerDown(pointer) {
        if (
            !this.towerPlacing ||
            !this.towerSelected ||
            !this.towerHoveredLocation
        )
            return;

        // Check if player has enough credits
        const towerCost = this.defenders[this.towerSelected].cost;
        if (this.credits < towerCost) {
            console.log("[INFO] Not enough credits to place tower");
            // Optional: Show notification to player
            this.events.emit("showNotification", "Not enough credits!");
            return;
        }

        // Place tower at the hovered location
        this.towerPlace(
            this.towerHoveredLocation.x,
            this.towerHoveredLocation.y
        );
    }

    towerPlace(gridX, gridY) {
        // Find the tower location in towerAvailableLocations
        const locationIndex = this.towerAvailableLocations.findIndex(
            (loc) => loc.x === gridX && loc.y === gridY
        );

        if (locationIndex === -1) {
            console.error("[ERROR] Invalid tower location");
            return;
        }

        const location = this.towerAvailableLocations[locationIndex];
        const x = gridX * this.gridSize + this.gridSize / 2;
        const y = gridY * this.gridSize + this.gridSize / 2;

        // Permanently hide the base sprite
        if (location.baseSprite) {
            location.baseSprite.destroy();
        }

        // Permanently hide the portal sprite
        if (location.portalSprite) {
            // Stop tweens and destroy
            this.tweens.killTweensOf(location.portalSprite);
            location.portalSprite.destroy();
        }

        // Create tower image
        const tower = this.add.image(
            x,
            y,
            `${this.defenders[this.towerSelected].sprite}_idle`
        );
        tower.setDepth(10); // Make sure it appears above other elements

        // Store tower data
        tower.setData("defender", this.towerSelected);
        tower.setData("damage", this.defenders[this.towerSelected].damage);
        tower.setData("range", this.defenders[this.towerSelected].range);
        tower.setData("fireRate", this.defenders[this.towerSelected].fireRate);
        tower.setData("lastFired", 0);
        tower.setData("gridX", gridX);
        tower.setData("gridY", gridY);

        this.rangeIndicator.setVisible(false);

        // Add to tower group and list
        this.towers.push(tower);

        // Subtract the cost from player's credits
        this.credits -= this.defenders[this.towerSelected].cost;

        // Update UI
        this.events.emit("updateUI", {
            credits: this.credits,
        });

        // Remove this location from available locations
        this.towerAvailableLocations.splice(locationIndex, 1);

        // Clean up preview
        if (this.towerPreview) {
            this.towerPreview.setVisible(false);
        }
        this.towerHoveredLocation = null;

        // Remove the event handlers
        this.input.off("pointermove", this.towerPlacePointerMove, this);
        this.input.off("pointerdown", this.towerPlacePointerDown, this);

        // Exit tower placement mode
        this.towerPlacing = false;
        this.towerSelected = null;

        tower.setInteractive({ useHandCursor: true });

        return tower;
    }

    towerStartPlacement(defender) {
        console.log(`[DEBUG] Game: Tower placement`);
        // Create preview image if it doesn't exist
        if (!this.towerPreview) {
            this.towerPreview = this.add.image(
                0,
                0,
                this.defenders[defender].sprite
            );
            this.towerPreview.setAlpha(0.7);
            this.towerPreview.setVisible(false);
            this.towerPreview.setDepth(20); // Set depth to ensure it appears above other elements
        } else {
            this.towerPreview.setTexture(this.defenders[defender].sprite);
        }

        // Setup input handlers
        this.input.on("pointermove", this.towerPlacePointerMove, this);
        this.input.on("pointerdown", this.towerPlacePointerDown, this);

        this.towerSelected = defender;
        this.towerPlacing = true;

        // Show tower cost notification
        const cost = this.defenders[defender].cost;
        this.events.emit(
            "showNotification",
            `Select location for ${defender} (Cost: ${cost})`
        );
    }

    towerCancelPlacement() {
        this.towerPlacing = false;
        this.towerSelected = null;

        if (this.towerPreview) {
            this.towerPreview.setVisible(false);
        }

        // Remove the event handlers
        this.input.off("pointermove", this.towerPlacePointerMove, this);
        this.input.off("pointerdown", this.towerPlacePointerDown, this);

        // Reset any hovered location
        if (this.towerHoveredLocation) {
            const location = this.towerAvailableLocations.find(
                (loc) =>
                    loc.x === this.towerHoveredLocation.x &&
                    loc.y === this.towerHoveredLocation.y
            );

            if (location) {
                // Show the base sprite again
                if (location.baseSprite) {
                    location.baseSprite.setVisible(true);
                }

                // Restore pulsing animation
                if (location.portalSprite) {
                    this.tweens.add({
                        targets: location.portalSprite,
                        alpha: { from: 1, to: 0.2 },
                        duration: 1000,
                        ease: "Sine.easeInOut",
                        yoyo: true,
                        repeat: -1,
                    });
                }
            }

            this.towerHoveredLocation = null;
        }
    }

    // Handle firing from towers
    towerFire(tower, target, time) {
        // Get the cooldown data
        const lastFired = tower.getData("lastFired") || 0;
        const fireRate = tower.getData("fireRate");

        // Check if tower can fire again based on cooldown
        if (time - lastFired >= fireRate) {
            // Update last fired time
            tower.setData("lastFired", time);

            // Fire projectile
            this.fireProjectile(tower, target);
        }
    }

    // Fire projectile from a tower to a target
    fireProjectile(tower, target) {
        // Get tower type
        const defender = tower.getData("defender");

        this.sound.play(this.defenders[defender].projectileSound, {
            volume: 0.3,
        });

        // Get positions
        const startX = tower.x;
        const startY = tower.y;
        const targetX = target.x;
        const targetY = target.y;

        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            startX,
            startY,
            targetX,
            targetY
        );

        // Rotate tower to face target
        // tower.setRotation(angle);

        // Simple left/right direction check with rotation
        if (targetX < startX) {
            tower.setFlipX(true);
        } else {
            tower.setFlipX(false);
        }

        // Create projectile
        let projectile;
        if (this.defenders[defender].projectileSprite === "laser") {
            // Laser is an instant-hit line
            const line = this.add.line(
                0,
                0,
                startX,
                startY,
                targetX,
                targetY,
                0x00ffff
            );
            line.setLineWidth(2);
            line.setOrigin(0, 0);

            // Flash and remove
            this.time.delayedCall(100, () => line.destroy());

            // Instant damage
            this.fireOnProjectileHit(
                {
                    destroy: () => {},
                    getData: (key) =>
                        key === "damage"
                            ? this.defenders[defender].damage
                            : null,
                    x: targetX,
                    y: targetY,
                },
                target
            );

            return;
        }

        // Create moving projectile
        const projectileTexture = this.defenders[defender].projectileSprite;
        projectile = this.add.image(startX, startY, projectileTexture);
        projectile.setData("damage", this.defenders[defender].damage);
        projectile.setData("target", target); // Store target in projectile
        projectile.setData("speed", this.defenders[defender].projectileSpeed);

        // Rotate towards the initial target position
        projectile.setRotation(angle);

        if (this.defenders[defender].projectileSprite === "missile") {
            // HOMING MISSILE LOGIC
            projectile.setData("isHoming", true);

            // Update function for homing behavior
            this.physics.world.on("worldstep", () => {
                if (!projectile.active) {
                    projectile.destroy();
                    return;
                }

                const targetX = target.x;
                const targetY = target.y;
                const speed = projectile.getData("speed");

                // Calculate direction
                const angle = Phaser.Math.Angle.Between(
                    projectile.x,
                    projectile.y,
                    targetX,
                    targetY
                );
                projectile.setRotation(angle);

                // Move missile slightly toward the target each frame
                projectile.x += Math.cos(angle) * (speed / 60);
                projectile.y += Math.sin(angle) * (speed / 60);

                // Check if missile has reached the target
                if (
                    Phaser.Math.Distance.Between(
                        projectile.x,
                        projectile.y,
                        targetX,
                        targetY
                    ) < 10
                ) {
                    this.fireOnProjectileHit(projectile, target);
                    projectile.destroy();
                }
            });
        } else {
            // Standard bullet behavior (non-homing)
            const speed = this.defenders[defender].projectileSpeed;
            const distance = Phaser.Math.Distance.Between(
                startX,
                startY,
                targetX,
                targetY
            );
            const duration = (distance / speed) * 1000;

            this.tweens.add({
                targets: projectile,
                x: targetX,
                y: targetY,
                duration: duration,
                onComplete: () => {
                    if (target.active) {
                        this.fireOnProjectileHit(projectile, target);
                    }
                    projectile.destroy();
                },
            });
        }
    }

    // Handle projectile hit on enemy
    fireOnProjectileHit(projectile, enemy) {
        if (!enemy || !enemy.active) {
            if (projectile) projectile.destroy();
            return;
        }

        // Deal damage
        const damage = projectile.getData("damage");
        const currentHealth = enemy.getData("health");
        const newHealth = Math.max(0, currentHealth - damage); // Ensure health never goes below 0

        // Update enemy health
        enemy.setData("health", newHealth);

        // Update health bar
        const healthBar = enemy.getData("healthBar");
        const maxHealth = enemy.getData("maxHealth");
        const healthPercentage = newHealth / maxHealth;
        const barWidth = 50 * Math.max(0, healthPercentage);

        // Force update width and color
        healthBar.setSize(barWidth, healthBar.height);
        healthBar.setFillStyle(
            healthPercentage < 0.3
                ? 0xff0000
                : healthPercentage < 0.6
                ? 0xdc6803
                : 0x00ff00
        );

        // Explicitly refresh the health bar position (if needed)
        healthBar.x = enemy.x - 25 + barWidth / 2; // Adjust position if needed

        // Create impact effect
        const impact = this.add.circle(
            projectile.x,
            projectile.y,
            10,
            0xffff00,
            0.7
        );
        this.time.delayedCall(100, () => impact.destroy());

        // Remove projectile
        projectile.destroy();

        // Check if enemy defeated
        if (newHealth <= 0) {
            // Award credits
            this.credits += enemy.getData("reward");

            // Update UI
            this.events.emit("updateUI", {
                credits: this.credits,
            });

            // Remove enemy
            this.enemyRemove(enemy);
        }
    }

    gameStop() {
        // Stop gameplay
        // Pause the physics - this should stop physics bodies
        this.physics.pause();

        // If you have any tweens running, stop them
        this.tweens.pauseAll();

        // If you have any timers or events, remove them
        this.time.removeAllEvents();

        // Find all game objects and stop their movement that might not be using the physics system
        const gameObjects = this.children.list;
        gameObjects.forEach((obj) => {
            // If the object has velocity properties, set them to zero
            if (obj.body) {
                obj.body.velocity.x = 0;
                obj.body.velocity.y = 0;
            }
        });

        this.input.off("pointerdown");
    }

    gameComplete() {
        console.log("[INFO] Game complete");

        this.gameStop();

        // Show game complete message
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "GAME COMPLETE",
            {
                font: "bold 60px JetBrains Mono",
                color: "#027a48",
                stroke: "#000000",
                strokeThickness: 6,
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(10);

        // Return to menu button
        const menuButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            "Return to Menu",
            {
                font: "bold 30px JetBrains Mono",
                color: "#ffffff",
                backgroundColor: "#027a48",
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10,
                },
            }
        );
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        menuButton.on("pointerdown", () => {
            const onGameOver = this.game.registry.get("onGameOver");

            // Check if the callback exists and call it
            if (typeof onGameOver === "function") {
                onGameOver(this.wavesFinished);
            }

            this.scene.stop("UIScene");
            this.scene.stop(); // Stop the current scene
        });
    }

    gameOver() {
        console.log("[INFO] Game Over");

        this.gameStop();

        // Show game over message
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "GAME OVER",
            {
                font: "bold 60px JetBrains Mono",
                color: "#ff0000",
                stroke: "#000000",
                strokeThickness: 6,
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(10);

        // Return to menu button
        const menuButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            "Return to Menu",
            {
                font: "bold 30px JetBrains Mono",
                color: "#ffffff",
                backgroundColor: "#660000",
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10,
                },
            }
        );
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        menuButton.on("pointerdown", () => {
            const onGameOver = this.game.registry.get("onGameOver");

            // Check if the callback exists and call it
            if (typeof onGameOver === "function") {
                onGameOver(this.wavesFinished);
            }

            this.scene.stop("UIScene");
            this.scene.stop(); // Stop the current scene
        });
    }

    update(time, delta) {
        // Handle keyboard control movements
        if (this.controls) {
            this.controls.update(delta);
        }

        // Skip if game is paused or there are no enemies
        if (!this.enemies || this.enemies.length === 0) return;

        if (this.health <= 0) {
            this.gameOver();
        }

        // Update each tower
        for (const tower of this.towers) {
            const defender = tower.getData("defender");
            // Calculate time since last fired
            const lastFired = tower.getData("lastFired") || 0;
            const fireRate = tower.getData("fireRate");

            // Check if tower can fire
            if (time - lastFired >= fireRate) {
                // Find target in range
                const range = tower.getData("range") * this.gridSize;
                const towerX = tower.x;
                const towerY = tower.y;

                let target = null;
                let closestDistance = Infinity;

                // Find the closest enemy in range
                for (const enemy of this.enemies) {
                    const distance = Phaser.Math.Distance.Between(
                        towerX,
                        towerY,
                        enemy.x,
                        enemy.y
                    );

                    if (distance <= range && distance < closestDistance) {
                        closestDistance = distance;
                        target = enemy;
                    }
                }

                // If target found, fire at it
                if (target) {
                    tower.setTexture(`${this.defenders[defender].sprite}_fire`);
                    this.towerFire(tower, target, time);
                } else {
                    tower.setTexture(`${this.defenders[defender].sprite}_idle`);
                }
            }
        }
    }
}
