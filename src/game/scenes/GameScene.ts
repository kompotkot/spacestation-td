import {
    ExitLocation,
    SpawnLocation,
    TowerLocation,
    Path,
    Wave,
} from "../../types/GameTypes";

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
    towerTypes: any;

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
        this.waveCurrent = 0;
        this.waveInProgress = false;

        this.health = window.gameSettings.health;

        this.towers = [];
        this.towerAvailableLocations = [];
        this.towerHoveredLocation = null;
        this.towerSelected = null;
        this.towerPlacing = false;

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

        this.waves = [
            {
                enemies: [{ type: "alien", count: 8, delay: 2000 }],
                reward: 50,
                path: 1,
            },
            {
                enemies: [
                    { type: "alien", count: 8, delay: 1500 },
                    { type: "pirate", count: 1, delay: 3000 },
                ],
                reward: 75,
                path: 2,
            },
            {
                enemies: [
                    { type: "alien", count: 10, delay: 1000 },
                    { type: "pirate", count: 3, delay: 2000 },
                    { type: "monster", count: 1, delay: 5000 },
                ],
                reward: 100,
                path: 1,
            },
        ];

        // Define tower types
        this.towerTypes = {
            turret: {
                name: "Turret",
                cost: 25,
                damage: 20,
                range: 3 * this.gridSize,
                fireRate: 1000, // ms between shots
                projectileSpeed: 300,
                projectileSprite: "bullet",
                sprite: "solder",
            },
            laser: {
                name: "Laser",
                cost: 50,
                damage: 10,
                range: 4 * this.gridSize,
                fireRate: 200,
                projectileSpeed: 500,
                projectileSprite: "laser",
                sprite: "turret_laser",
            },
            missile: {
                name: "Missile",
                cost: 75,
                damage: 50,
                range: 5 * this.gridSize,
                fireRate: 2000,
                projectileSpeed: 200,
                projectileSprite: "missile",
                sprite: "solder_heavy",
            },
        };

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

        this.waveStartNext();

        // Setup mouse wheel for zooming
        this.input.on("wheel", this.handleMouseWheel, this);
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
        if (this.waveCurrent < this.waves.length) {
            this.waveInProgress = true;
            const wave = this.waves[this.waveCurrent];

            // Process each spawn point
            this.spawnLocations.forEach((spawn) => {
                // Only spawn if this spawn point has a valid path
                if (this.pathsActive.has(spawn.id)) {
                    // Process each enemy type in the wave
                    let typeIndex = 0;

                    const spawnNextType = () => {
                        if (typeIndex < wave.enemies.length) {
                            const enemyType = wave.enemies[typeIndex];
                            let spawned = 0;

                            // Spawn this type of enemy
                            const enemySpawn = () => {
                                if (spawned < enemyType.count) {
                                    this.enemySpawn(enemyType.type, spawn.id);
                                    spawned++;
                                    this.time.delayedCall(
                                        enemyType.delay,
                                        enemySpawn
                                    );
                                } else {
                                    typeIndex++;
                                    this.time.delayedCall(1000, spawnNextType);
                                }
                            };

                            enemySpawn();
                        }
                    };

                    spawnNextType();
                }
            });

            // Check if wave is complete after all enemies should be spawned and moved
            const totalEnemies =
                wave.enemies.reduce(
                    (total, enemyType) => total + enemyType.count,
                    0
                ) * this.spawnLocations.length;
            const estimatedWaveTime = 20000; // Adjust based on your game's pace

            this.time.delayedCall(
                estimatedWaveTime,
                this.waveCheckComplete,
                [],
                this
            );

            // Update UI if needed
            this.events.emit("updateUI", {
                wave: this.waveCurrent + 1,
            });

            this.waveCurrent++;
        } else {
            console.log("[INFO] All waves completed!");
            this.gameOver();
        }
    }

    waveComplete() {
        this.waveInProgress = false;

        // Award credits for completing the wave
        if (
            this.waveCurrent - 1 >= 0 &&
            this.waveCurrent - 1 < this.waves.length
        ) {
            const waveReward = this.waves[this.waveCurrent - 1].reward;
            window.gameSettings.credits += waveReward;
        }

        // Update UI
        this.events.emit("updateUI", {
            credits: window.gameSettings.credits,
        });

        // Show wave complete message
        const completeText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Wave ${window.gameSettings.waveCount} Complete!\nNext wave in 10 seconds`,
            {
                font: "bold 30px JetBrains Mono",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 4,
            }
        );
        completeText.setOrigin(0.5);
        completeText.setDepth(10);

        // Remove text after a while
        this.time.delayedCall(3000, () => {
            completeText.destroy();
        });

        // Prepare next wave
        window.gameSettings.waveCount++;
        window.gameSettings.enemyHealth *=
            window.gameSettings.difficultyModifier;
        window.gameSettings.enemySpeed *=
            window.gameSettings.difficultyModifier;

        // Start next wave after delay
        this.time.delayedCall(10000, this.waveStartNext, [], this);
    }

    waveCheckComplete() {
        // If no enemies left and none spawning, wave is complete
        if (this.enemies.length === 0) {
            this.waveComplete();
        } else {
            // Check again later
            this.time.delayedCall(1000, this.waveCheckComplete, [], this);
        }
    }

    enemySpawn(type: string, spawnId: number) {
        // Find the spawn location
        const spawn = this.spawnLocations.find((loc) => loc.id === spawnId);

        // Get path for this spawn point
        const path = this.pathsActive.get(spawnId);

        // Get spawn position
        const x = spawn.x * this.gridSize + this.gridSize / 2;
        const y = spawn.y * this.gridSize + this.gridSize / 2;

        // Create enemy based on type
        let enemy;
        let health, speed, value;
        let textureKey;

        switch (type) {
            case "alien":
                health = window.gameSettings.enemyHealth;
                speed = window.gameSettings.enemySpeed;
                value = 10;
                textureKey = "enemy_alien";
                break;

            case "pirate":
                health = window.gameSettings.enemyHealth * 1.5;
                speed = window.gameSettings.enemySpeed * 0.8;
                value = 15;
                textureKey = "enemy_pirate";
                break;

            case "monster":
                health = window.gameSettings.enemyHealth * 3;
                speed = window.gameSettings.enemySpeed * 0.6;
                value = 25;
                textureKey = "enemy_monster";
                break;

            default:
                health = window.gameSettings.enemyHealth;
                speed = window.gameSettings.enemySpeed;
                value = 10;
                textureKey = "enemy_alien";
                break;
        }

        // Create the enemy sprite
        enemy = this.physics.add.sprite(x, y, textureKey);
        enemy.setDepth(10); // Set depth to appear above path and bases

        enemy.play(`${textureKey}_walk`);

        // Apply difficulty modifier if needed
        if (
            window.gameSettings.difficultyModifier &&
            window.gameSettings.waveCount
        ) {
            health *= Math.pow(
                window.gameSettings.difficultyModifier,
                window.gameSettings.waveCount - 1
            );
        }

        // Setup enemy properties
        enemy.setData("type", type);
        enemy.setData("health", health);
        enemy.setData("maxHealth", health);
        enemy.setData("speed", speed);
        enemy.setData("value", value);
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

        // Check if wave is complete
        if (this.enemies.length === 0 && !this.waveInProgress) {
            this.waveCheckComplete();
        }
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
                `${this.towerTypes[this.towerSelected].sprite}_idle`
            );

            // Check if player has enough credits
            const canAfford =
                window.gameSettings.credits >=
                this.towerTypes[this.towerSelected].cost;

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
        } else {
            // No valid location found, hide preview
            this.towerPreview.setVisible(false);
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
        const towerCost = this.towerTypes[this.towerSelected].cost;
        if (window.gameSettings.credits < towerCost) {
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
            `${this.towerTypes[this.towerSelected].sprite}_idle`
        );
        tower.setDepth(10); // Make sure it appears above other elements

        // Store tower data
        tower.setData("type", this.towerSelected);
        tower.setData("damage", this.towerTypes[this.towerSelected].damage);
        tower.setData("range", this.towerTypes[this.towerSelected].range);
        tower.setData("fireRate", this.towerTypes[this.towerSelected].fireRate);
        tower.setData("lastFired", 0);
        tower.setData("gridX", gridX);
        tower.setData("gridY", gridY);

        // Add to tower group and list
        this.towers.push(tower);

        // Subtract the cost from player's credits
        window.gameSettings.credits -= this.towerTypes[this.towerSelected].cost;

        // Update UI
        this.events.emit("updateUI", {
            credits: window.gameSettings.credits,
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

        return tower;
    }

    towerStartPlacement(towerType) {
        // Create preview image if it doesn't exist
        if (!this.towerPreview) {
            this.towerPreview = this.add.image(
                0,
                0,
                this.towerTypes[towerType].sprite
            );
            this.towerPreview.setAlpha(0.7);
            this.towerPreview.setVisible(false);
            this.towerPreview.setDepth(20); // Set depth to ensure it appears above other elements
        } else {
            this.towerPreview.setTexture(this.towerTypes[towerType].sprite);
        }

        // Setup input handlers
        this.input.on("pointermove", this.towerPlacePointerMove, this);
        this.input.on("pointerdown", this.towerPlacePointerDown, this);

        this.towerSelected = towerType;
        this.towerPlacing = true;

        // Show tower cost notification
        const cost = this.towerTypes[towerType].cost;
        this.events.emit(
            "showNotification",
            `Select location for ${towerType} (Cost: ${cost})`
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
        const towerType = tower.getData("type");
        const towerData = this.towerTypes[towerType];

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
        if (towerType === "laser") {
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

            // Directly damage enemy (instant hit)
            this.fireOnProjectileHit(
                {
                    destroy: () => {},
                    getData: (key) =>
                        key === "damage"
                            ? this.towerTypes[towerType].damage
                            : null,
                    x: targetX,
                    y: targetY,
                },
                target
            );

            return;
        } else {
            // For other towers, create a moving projectile
            const projectileTexture =
                towerType === "missile" ? "missile" : "bullet";
            projectile = this.add.image(startX, startY, projectileTexture);
            projectile.setData("damage", this.towerTypes[towerType].damage);

            // Set rotation to match direction
            projectile.setRotation(angle);

            // Move projectile to target with tweens
            const speed = this.towerTypes[towerType].projectileSpeed;
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
                    // Check if target is still valid
                    if (target.active) {
                        this.fireOnProjectileHit(projectile, target);
                    } else {
                        projectile.destroy();
                    }
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
        const newHealth = currentHealth - damage;

        // Update enemy health
        enemy.setData("health", newHealth);

        // Update health bar
        const healthBar = enemy.getData("healthBar");
        const healthPercentage = newHealth / enemy.getData("maxHealth");
        const barWidth = 50 * Math.max(0, healthPercentage);
        healthBar.width = barWidth;

        // Change color based on health percentage
        if (healthPercentage < 0.3) {
            healthBar.fillColor = 0xff0000; // Red
        } else if (healthPercentage < 0.6) {
            healthBar.fillColor = 0xffff00; // Yellow
        }

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
            window.gameSettings.credits += enemy.getData("value");

            // Update UI
            this.events.emit("updateUI", {
                credits: window.gameSettings.credits,
            });

            // Remove enemy
            this.enemyRemove(enemy);
        }
    }

    gameOver() {
        console.log("[INFO] Game Over");

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
            this.scene.start("MenuScene");
            this.scene.stop("UIScene");
        });

        // Notify UI
        this.events.emit("gameOver");
    }

    // FIX: Implemented tower shooting in update
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
            const towerType = tower.getData("type");
            // Calculate time since last fired
            const lastFired = tower.getData("lastFired") || 0;
            const fireRate = tower.getData("fireRate");

            // Check if tower can fire
            if (time - lastFired >= fireRate) {
                // Find target in range
                const range = tower.getData("range");
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
                    tower.setTexture(
                        `${this.towerTypes[towerType].sprite}_fire`
                    );
                    this.towerFire(tower, target, time);
                } else {
                    tower.setTexture(
                        `${this.towerTypes[towerType].sprite}_idle`
                    );
                }
            }
        }
    }
}
