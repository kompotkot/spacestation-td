export class GameScene extends Phaser.Scene {
    // Properties
    gridSize: number;
    map: any[];
    path: any[];
    towers: any[];
    enemies: any[];
    waves: any[];
    currentWave: number;
    waveInProgress: boolean;
    health: number;
    selectedTower: string | null;
    placingTower: boolean;
    gridWidth: number;
    gridHeight: number;
    towerTypes: any;
    towerGroup: Phaser.GameObjects.Group;
    enemyGroup: Phaser.GameObjects.Group;
    projectileGroup: Phaser.GameObjects.Group;
    effectsGroup: Phaser.GameObjects.Group;
    spawnPoint: { x: number; y: number };
    exitPoint: { x: number; y: number };
    towerPreview: Phaser.GameObjects.Image;
    gameMusic: Phaser.Sound.BaseSound;
    selectedTowerObject: any;
    hasSpriteFrames: any;
    lastUpdate: number;

    constructor() {
        super("GameScene");
    }

    init() {
        // Initialize game variables
        this.gridSize = window.gameSettings.gridSize;
        this.map = []; // Grid-based map
        this.path = []; // Enemy path
        this.towers = []; // Tower array
        this.enemies = []; // Enemy array
        this.waves = []; // Wave data
        this.currentWave = 0;
        this.waveInProgress = false;
        this.health = 100; // Station health
        this.selectedTower = null;
        this.placingTower = false;
        this.lastUpdate = 0;

        // FIX: Adjust grid width calculation to properly fit the screen
        // Leave a small margin to ensure towers at the edge are fully visible
        const cameraWidth = this.cameras.main.width;
        const cameraHeight = this.cameras.main.height;

        this.gridWidth = Math.floor(cameraWidth / this.gridSize);
        this.gridHeight = Math.floor(cameraHeight / this.gridSize);

        // Get animation availability information from the registry
        this.hasSpriteFrames = this.registry.get("hasSpriteFrames") || {
            alien: false,
            pirate: false,
            monster: false,
            explosion: false,
        };

        // Define tower types
        this.towerTypes = {
            turret: {
                name: "Turret",
                cost: 25,
                damage: 20,
                range: 3 * this.gridSize,
                fireRate: 1000, // ms between shots
                projectileSpeed: 300,
                sprite: "tower_turret",
            },
            laser: {
                name: "Laser",
                cost: 50,
                damage: 10,
                range: 4 * this.gridSize,
                fireRate: 200, // ms between shots
                projectileSpeed: 500,
                sprite: "tower_laser",
            },
            missile: {
                name: "Missile",
                cost: 75,
                damage: 50,
                range: 5 * this.gridSize,
                fireRate: 2000, // ms between shots
                projectileSpeed: 200,
                projectileSprite: "missile",
                sprite: "tower_missile",
            },
        };

        // Create groups
        this.towerGroup = this.add.group();
        this.enemyGroup = this.add.group();
        this.projectileGroup = this.add.group();
        this.effectsGroup = this.add.group();
    }

    create() {
        // FIX: Adjust camera to properly show the entire scene
        this.cameras.main.setViewport(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height
        );

        // Create background
        this.createMap();

        // Place spawn and exit points
        this.createSpawnAndExit();

        // Generate path for enemies
        this.createPath();

        // FIX: Place random tower bases at the start of the game
        this.placeRandomTowers();

        // Setup towers, enemies and paths
        this.setupTowerPlacement();
        this.setupEnemyMovement();

        // Create wave data
        this.createWaves();

        // Setup click handling
        this.input.on("pointerdown", this.handleClick, this);

        // Start the game
        this.time.delayedCall(3000, this.startNextWave, [], this);

        // Update UI
        this.events.emit("updateUI", {
            credits: window.gameSettings.credits,
            health: this.health,
            wave: window.gameSettings.waveCount,
        });
    }

    // NEW: Place random towers at the start of the game
    placeRandomTowers() {
        // Place some random towers at the start
        const numInitialTowers = 3;
        const towerKeys = Object.keys(this.towerTypes);

        // Attempt to place a set number of random towers
        let placedTowers = 0;
        let attempts = 0;
        const maxAttempts = 50; // Avoid infinite loop

        while (placedTowers < numInitialTowers && attempts < maxAttempts) {
            attempts++;

            // Get random position
            const gridX = Phaser.Math.Between(1, this.gridWidth - 2);
            const gridY = Phaser.Math.Between(1, this.gridHeight - 2);

            // Check if tile is buildable and not on the path
            if (
                this.map[gridY] &&
                this.map[gridY][gridX] &&
                this.map[gridY][gridX].buildable &&
                this.map[gridY][gridX].type === "floor"
            ) {
                // Get random tower type
                const towerType =
                    towerKeys[Phaser.Math.Between(0, towerKeys.length - 1)];

                // Place tower
                this.createTower(gridX, gridY, towerType);
                placedTowers++;
            }
        }
    }

    // NEW: Helper method to create a tower at a specific location
    createTower(gridX: number, gridY: number, towerType: string) {
        const x = gridX * this.gridSize + this.gridSize / 2;
        const y = gridY * this.gridSize + this.gridSize / 2;

        // Create tower base
        const base = this.add.image(x, y, "tower_base");

        // Create tower turret/gun/etc on top
        const turret = this.add.image(x, y, this.towerTypes[towerType].sprite);

        // Associate turret with base
        base.setData("turret", turret);
        base.setData("type", towerType);
        base.setData("damage", this.towerTypes[towerType].damage);
        base.setData("range", this.towerTypes[towerType].range);
        base.setData("fireRate", this.towerTypes[towerType].fireRate);
        base.setData("lastFired", 0);
        base.setData("gridX", gridX);
        base.setData("gridY", gridY);
        base.setData(
            "projectileSpeed",
            this.towerTypes[towerType].projectileSpeed
        );

        // Draw range indicator (optional - for visualizing range)
        const rangeCircle = this.add.circle(
            x,
            y,
            this.towerTypes[towerType].range,
            0xffffff,
            0.1
        );
        rangeCircle.setVisible(false);
        base.setData("rangeIndicator", rangeCircle);

        // Add to group (add both base and turret)
        this.towerGroup.add(base);
        this.towerGroup.add(turret);
        this.towers.push(base);

        // Mark grid as not buildable
        this.map[gridY][gridX].buildable = false;

        return base;
    }

    createMap() {
        // Create a grid-based map for the space station
        for (let y = 0; y < this.gridHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // By default, all cells are floor (buildable)
                let cell = {
                    type: "floor",
                    x,
                    y,
                    buildable: true,
                    tile: null,
                    tower: null,
                };

                // Create the tile
                const tile = this.add.image(
                    x * this.gridSize + this.gridSize / 2,
                    y * this.gridSize + this.gridSize / 2,
                    "tile_floor"
                );

                // Store the tile in the cell
                cell.tile = tile;
                this.map[y][x] = cell;
            }
        }
    }

    createSpawnAndExit() {
        // Place the spawn and exit points
        const spawnY = Math.floor(this.gridHeight / 2);
        this.spawnPoint = { x: 0, y: spawnY };
        this.map[spawnY][0].type = "spawn";
        this.map[spawnY][0].buildable = false;
        this.map[spawnY][0].tile.setTexture("tile_spawn");

        const exitY = Math.floor(this.gridHeight / 2);
        this.exitPoint = { x: this.gridWidth - 1, y: exitY };
        this.map[exitY][this.gridWidth - 1].type = "exit";
        this.map[exitY][this.gridWidth - 1].buildable = false;
        this.map[exitY][this.gridWidth - 1].tile.setTexture("tile_exit");
    }

    createPath() {
        // Generate a path from spawn to exit
        this.path = [];
        let currentX = this.spawnPoint.x;
        const targetX = this.exitPoint.x;
        let currentY = this.spawnPoint.y;

        this.path.push({ x: currentX, y: currentY });

        while (currentX < targetX) {
            currentX++;

            // Mark path cell as unbuildable
            if (this.map[currentY] && this.map[currentY][currentX]) {
                this.map[currentY][currentX].type = "path";
                this.map[currentY][currentX].buildable = false;
                this.map[currentY][currentX].tile.setTexture("tile_path");
            }

            this.path.push({ x: currentX, y: currentY });
        }
    }

    setupTowerPlacement() {
        // Setup tower placement preview
        this.towerPreview = this.add.image(0, 0, "tower_base");
        this.towerPreview.setAlpha(0.6);
        this.towerPreview.setVisible(false);

        // Add tower turret preview on top
        const turretPreview = this.add.image(0, 0, "tower_turret");
        turretPreview.setAlpha(0.6);
        turretPreview.setVisible(false);

        // Store reference to turret preview
        this.towerPreview.setData("turretPreview", turretPreview);

        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.placingTower && this.selectedTower) {
                const gridX = Math.floor(pointer.x / this.gridSize);
                const gridY = Math.floor(pointer.y / this.gridSize);

                if (
                    gridX >= 0 &&
                    gridX < this.gridWidth &&
                    gridY >= 0 &&
                    gridY < this.gridHeight
                ) {
                    const x = gridX * this.gridSize + this.gridSize / 2;
                    const y = gridY * this.gridSize + this.gridSize / 2;

                    // Update base position
                    this.towerPreview.setPosition(x, y);

                    // Update turret position
                    const turretPreview =
                        this.towerPreview.getData("turretPreview");
                    turretPreview.setPosition(x, y);

                    // Update texture based on selected tower
                    const towerSprite =
                        this.towerTypes[this.selectedTower].sprite;
                    turretPreview.setTexture(towerSprite);
                    turretPreview.setVisible(true);

                    // Update tint based on buildable status and tower presence
                    // FIX: Also check if there's already a tower here
                    const canBuild =
                        this.map[gridY][gridX].buildable &&
                        !this.isTowerAt(gridX, gridY);

                    if (canBuild) {
                        this.towerPreview.setTint(0x00ff00);
                        turretPreview.setTint(0x00ff00);
                    } else {
                        this.towerPreview.setTint(0xff0000);
                        turretPreview.setTint(0xff0000);
                    }
                }
            }
        });
    }

    // NEW: Helper method to check if a tower exists at a specific location
    isTowerAt(gridX: number, gridY: number): boolean {
        return this.towers.some(
            (tower) =>
                tower.getData("gridX") === gridX &&
                tower.getData("gridY") === gridY
        );
    }

    setupEnemyMovement() {
        // Setup physics for enemies
        this.physics.world.setBounds(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height
        );
    }

    createWaves() {
        // Define waves of enemies
        this.waves = [
            {
                enemies: [{ type: "alien", count: 5, delay: 2000 }],
                reward: 50,
            },
            {
                enemies: [
                    { type: "alien", count: 8, delay: 1500 },
                    { type: "pirate", count: 1, delay: 3000 },
                ],
                reward: 75,
            },
            {
                enemies: [
                    { type: "alien", count: 10, delay: 1000 },
                    { type: "pirate", count: 3, delay: 2000 },
                    { type: "monster", count: 1, delay: 5000 },
                ],
                reward: 100,
            },
        ];
    }

    startNextWave() {
        // Start the next wave of enemies
        if (this.currentWave < this.waves.length) {
            this.waveInProgress = true;
            const wave = this.waves[this.currentWave];

            // Spawn enemies in the wave
            let enemyIndex = 0;
            let typeIndex = 0;

            // Process each enemy type in the wave
            const spawnNextType = () => {
                if (typeIndex < wave.enemies.length) {
                    const enemyType = wave.enemies[typeIndex];
                    let spawned = 0;

                    // Spawn this type of enemy
                    const spawnEnemy = () => {
                        if (spawned < enemyType.count) {
                            this.spawnEnemy(enemyType.type);
                            spawned++;
                            this.time.delayedCall(enemyType.delay, spawnEnemy);
                        } else {
                            typeIndex++;
                            this.time.delayedCall(1000, spawnNextType);
                        }
                    };

                    spawnEnemy();
                } else {
                    // All enemies spawned
                    this.time.delayedCall(
                        5000,
                        this.checkWaveComplete,
                        [],
                        this
                    );
                }
            };

            spawnNextType();

            this.events.emit("updateUI", {
                wave: window.gameSettings.waveCount,
            });

            this.currentWave++;
        }
    }

    spawnEnemy(type: string) {
        // Get spawn position
        const x = this.spawnPoint.x * this.gridSize + this.gridSize / 2;
        const y = this.spawnPoint.y * this.gridSize + this.gridSize / 2;

        // Create enemy based on type
        let enemy;
        let health, speed, value;
        let textureKey;

        switch (type) {
            case "alien":
                health = window.gameSettings.enemyHealth;
                speed = window.gameSettings.enemySpeed;
                value = 10;
                // Use either spritesheet or static image based on availability
                textureKey = this.hasSpriteFrames.alien
                    ? "enemy_alien"
                    : "enemy_alien_static";
                enemy = this.physics.add.sprite(x, y, textureKey);

                // Only play animation if available
                if (
                    this.hasSpriteFrames.alien &&
                    this.anims.exists("alien_walk")
                ) {
                    enemy.play("alien_walk");
                }
                break;

            case "pirate":
                health = window.gameSettings.enemyHealth * 1.5;
                speed = window.gameSettings.enemySpeed * 0.8;
                value = 15;
                textureKey = this.hasSpriteFrames.pirate
                    ? "enemy_pirate"
                    : "enemy_pirate_static";
                enemy = this.physics.add.sprite(x, y, textureKey);

                // Only play animation if available
                if (
                    this.hasSpriteFrames.pirate &&
                    this.anims.exists("pirate_walk")
                ) {
                    enemy.play("pirate_walk");
                }
                break;

            case "monster":
                health = window.gameSettings.enemyHealth * 3;
                speed = window.gameSettings.enemySpeed * 0.6;
                value = 25;
                textureKey = this.hasSpriteFrames.monster
                    ? "enemy_monster"
                    : "enemy_monster_static";
                enemy = this.physics.add.sprite(x, y, textureKey);

                // Only play animation if available
                if (
                    this.hasSpriteFrames.monster &&
                    this.anims.exists("monster_walk")
                ) {
                    enemy.play("monster_walk");
                }
                break;

            default:
                // Fallback to alien if type not recognized
                health = window.gameSettings.enemyHealth;
                speed = window.gameSettings.enemySpeed;
                value = 10;
                enemy = this.physics.add.sprite(x, y, "enemy_alien_static");
                break;
        }

        // Apply current wave difficulty modifier
        health *= Math.pow(
            window.gameSettings.difficultyModifier,
            window.gameSettings.waveCount - 1
        );

        // Setup enemy properties
        enemy.setData("type", type);
        enemy.setData("health", health);
        enemy.setData("maxHealth", health);
        enemy.setData("speed", speed);
        enemy.setData("value", value);
        enemy.setData("pathIndex", 0);

        // Add health bar
        const healthBar = this.add.rectangle(x, y - 30, 50, 5, 0x00ff00);
        enemy.setData("healthBar", healthBar);

        // Add to groups
        this.enemyGroup.add(enemy);
        this.enemies.push(enemy);

        // Start moving along path
        this.moveEnemyAlongPath(enemy);
    }

    moveEnemyAlongPath(enemy: Phaser.Physics.Arcade.Sprite) {
        const pathIndex = enemy.getData("pathIndex");

        if (pathIndex < this.path.length) {
            const targetPoint = this.path[pathIndex];
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
                    enemy.setData("pathIndex", pathIndex + 1);
                    this.moveEnemyAlongPath(enemy);
                },
            });

            // Also move health bar
            this.tweens.add({
                targets: enemy.getData("healthBar"),
                x: targetX,
                y: targetY - 30,
                duration: duration,
            });
        } else {
            // Enemy reached the exit
            this.enemyReachedExit(enemy);
        }
    }

    enemyReachedExit(enemy: Phaser.Physics.Arcade.Sprite) {
        // Reduce station health
        this.health -= 10;

        // Update UI
        this.events.emit("updateUI", {
            health: this.health,
        });

        // Check if game over
        if (this.health <= 0) {
            this.gameOver();
        }

        // Remove enemy
        this.removeEnemy(enemy);
    }

    // NEW: Handle projectile hit on enemy
    onProjectileHit(
        projectile: Phaser.GameObjects.Image,
        enemy: Phaser.Physics.Arcade.Sprite
    ) {
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
            this.removeEnemy(enemy);
        }
    }

    removeEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
        // Remove health bar
        const healthBar = enemy.getData("healthBar");
        if (healthBar) {
            healthBar.destroy();
        }

        // Remove from array
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }

        // Destroy sprite
        enemy.destroy();
    }

    checkWaveComplete() {
        // If no enemies left and none spawning, wave is complete
        if (this.enemies.length === 0) {
            this.waveComplete();
        } else {
            // Check again later
            this.time.delayedCall(1000, this.checkWaveComplete, [], this);
        }
    }

    waveComplete() {
        this.waveInProgress = false;

        // Award credits for completing the wave
        if (
            this.currentWave - 1 >= 0 &&
            this.currentWave - 1 < this.waves.length
        ) {
            const waveReward = this.waves[this.currentWave - 1].reward;
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
                font: "bold 30px Arial",
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
        this.time.delayedCall(10000, this.startNextWave, [], this);
    }

    gameOver() {
        // Stop gameplay
        this.physics.pause();
        this.input.off("pointerdown");

        // Show game over message
        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "GAME OVER",
            {
                font: "bold 60px Arial",
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
                font: "bold 30px Arial",
                color: "#ffffff",
                // backgroundColor: "#660000",
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

    handleClick(pointer: Phaser.Input.Pointer) {
        // Handle mouse click for tower placement
        const gridX = Math.floor(pointer.x / this.gridSize);
        const gridY = Math.floor(pointer.y / this.gridSize);

        if (
            gridX >= 0 &&
            gridX < this.gridWidth &&
            gridY >= 0 &&
            gridY < this.gridHeight
        ) {
            if (this.placingTower) {
                this.placeTower(gridX, gridY);
            } else {
                this.selectGrid(gridX, gridY);
            }
        }
    }

    // FIX: Updated to check for existing towers
    placeTower(gridX: number, gridY: number) {
        // Place a tower at the specified grid position
        if (!this.map[gridY] || !this.map[gridY][gridX]) return;

        // Check if tile is buildable and no tower is already there
        const isBuildable = this.map[gridY][gridX].buildable;
        const noTowerExists = !this.isTowerAt(gridX, gridY);

        if (isBuildable && noTowerExists && this.selectedTower) {
            const towerType = this.towerTypes[this.selectedTower];

            if (window.gameSettings.credits >= towerType.cost) {
                // Create tower using helper method
                this.createTower(gridX, gridY, this.selectedTower);

                // Subtract credits
                window.gameSettings.credits -= towerType.cost;

                // Update UI
                this.events.emit("updateUI", {
                    credits: window.gameSettings.credits,
                });

                // Reset placement mode
                this.placingTower = false;
                this.towerPreview.setVisible(false);
                this.towerPreview.getData("turretPreview").setVisible(false);
            }
        }
    }

    selectGrid(gridX: number, gridY: number) {
        // Select a tower or grid cell

        // Find if there's a tower at this location
        const tower = this.towers.find(
            (t) => t.getData("gridX") === gridX && t.getData("gridY") === gridY
        );

        if (tower) {
            // Show tower's range indicator
            const rangeIndicator = tower.getData("rangeIndicator");
            if (rangeIndicator) {
                rangeIndicator.setVisible(true);
            }

            // After 2 seconds, hide the range indicator
            this.time.delayedCall(2000, () => {
                if (rangeIndicator) {
                    rangeIndicator.setVisible(false);
                }
            });
        }
    }

    // NEW: Fire projectile from a tower to a target
    fireProjectile(
        tower: Phaser.GameObjects.Image,
        target: Phaser.Physics.Arcade.Sprite
    ) {
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

        // Rotate tower turret to face target
        const turret = tower.getData("turret");
        if (turret) {
            turret.setRotation(angle);
        }

        // Create projectile
        let projectile;
        if (towerType === "laser") {
            // Lasers are instant hit, so create a line
            const distance = Phaser.Math.Distance.Between(
                startX,
                startY,
                targetX,
                targetY
            );
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
            this.onProjectileHit(
                {
                    destroy: () => {},
                    getData: (key: string) =>
                        key === "damage" ? tower.getData("damage") : null,
                    x: targetX,
                    y: targetY,
                } as any,
                target
            );

            return;
        } else {
            // For other towers, create a moving projectile
            const projectileTexture =
                towerType === "missile" ? "missile" : "bullet";
            projectile = this.add.image(startX, startY, projectileTexture);
            projectile.setData("damage", tower.getData("damage"));

            // Set rotation to match direction
            projectile.setRotation(angle);

            // Move projectile to target with tweens
            const speed = tower.getData("projectileSpeed");
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
                        this.onProjectileHit(projectile, target);
                    } else {
                        projectile.destroy();
                    }
                },
            });
        }
    }

    // FIX: Implemented tower shooting in update
    update(time: number, delta: number) {
        // Only process tower targeting every 100ms to improve performance
        if (time - this.lastUpdate < 100) return;
        this.lastUpdate = time;

        // Process each tower for targeting
        this.towers.forEach((tower) => {
            // Check if tower can attack (cooldown)
            const lastFired = tower.getData("lastFired") || 0;
            const fireRate = tower.getData("fireRate");

            if (time - lastFired >= fireRate) {
                // Find nearest enemy in range
                const range = tower.getData("range");
                let closestEnemy = null;
                let closestDistance = range;

                this.enemies.forEach((enemy) => {
                    const distance = Phaser.Math.Distance.Between(
                        tower.x,
                        tower.y,
                        enemy.x,
                        enemy.y
                    );

                    if (distance < closestDistance) {
                        closestEnemy = enemy;
                        closestDistance = distance;
                    }
                });

                // If an enemy is in range, fire at it
                if (closestEnemy) {
                    this.fireProjectile(tower, closestEnemy);
                    tower.setData("lastFired", time);
                }
            }
        });
    }

    // Methods called from UI scene
    startTowerPlacement(towerType: string) {
        this.selectedTower = towerType;
        this.placingTower = true;

        // Update preview
        this.towerPreview.setTexture("tower_base");
        this.towerPreview.setVisible(true);

        // Update turret preview
        const turretPreview = this.towerPreview.getData("turretPreview");
        turretPreview.setTexture(this.towerTypes[towerType].sprite);
        turretPreview.setVisible(true);
    }

    cancelTowerPlacement() {
        this.placingTower = false;
        this.towerPreview.setVisible(false);

        // Also hide turret preview
        const turretPreview = this.towerPreview.getData("turretPreview");
        if (turretPreview) {
            turretPreview.setVisible(false);
        }
    }
}
