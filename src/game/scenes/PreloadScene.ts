export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        // Set up error handling for missing assets
        this.load.on("loaderror", (fileObj: any) => {
            console.warn("Error loading asset:", fileObj.key);
        });

        // Load tiles and map assets
        this.load.image("tile_floor", "/assets/tiles/floor.png");
        this.load.image("tile_wall", "/assets/tiles/wall.png");
        this.load.image("tile_path", "/assets/tiles/path.png");
        this.load.image("tile_spawn", "/assets/tiles/spawn.png");
        this.load.image("tile_exit", "/assets/tiles/exit.png");

        // Load tower assets
        this.load.image("tower_base", "/assets/towers/base.png");
        this.load.image("tower_turret", "/assets/towers/turret.png");
        this.load.image("tower_laser", "/assets/towers/tlaser.png");
        this.load.image("tower_missile", "/assets/towers/tmissile.png");

        // Load enemies assets
        this.load.image("enemy_alien_static", "/assets/enemies/alien.png");
        this.load.image("enemy_pirate_static", "/assets/enemies/pirate.png");
        this.load.image("enemy_monster_static", "/assets/enemies/monster.png");

        // Load projectiles
        this.load.image("bullet", "/assets/projectiles/bullet.png");
        this.load.image("laser_beam", "/assets/projectiles/laser.png");
        this.load.image("missile", "/assets/projectiles/missile.png");

        // Load effects
        this.load.image("explosion_static", "/assets/effects/explosion.png");

        try {
            this.load.spritesheet(
                "explosion",
                "/assets/effects/explosion.png",
                {
                    frameWidth: 64,
                    frameHeight: 64,
                }
            );
        } catch (e) {
            console.warn("Error loading explosion spritesheet");
        }

        // Load UI elements
        this.load.image("button", "/assets/ui/button.png"); // ???
        this.load.image("panel", "/assets/ui/panel.png");   // ???

        this.load.image("icon_credits", "/assets/ui/credits.png");
        this.load.image("icon_health", "/assets/ui/health.png");
        this.load.image("icon_wave", "/assets/ui/wave.png");
    }

    create() {
        // Set a flag to track if we have valid animations
        const textureManager = this.textures;
        const hasSpriteFrames = {
            alien: this.checkFrames("enemy_alien", 4),
            pirate: this.checkFrames("enemy_pirate", 4),
            monster: this.checkFrames("enemy_monster", 4),
            explosion: this.checkFrames("explosion", 8),
        };

        // Store this information to be accessed by other scenes
        this.registry.set("hasSpriteFrames", hasSpriteFrames);

        // Only create animations if we have the frames
        if (hasSpriteFrames.alien) {
            this.anims.create({
                key: "alien_walk",
                frames: this.anims.generateFrameNumbers("enemy_alien", {
                    start: 0,
                    end: 3,
                }),
                frameRate: 8,
                repeat: -1,
            });
        }

        if (hasSpriteFrames.pirate) {
            this.anims.create({
                key: "pirate_walk",
                frames: this.anims.generateFrameNumbers("enemy_pirate", {
                    start: 0,
                    end: 3,
                }),
                frameRate: 8,
                repeat: -1,
            });
        }

        if (hasSpriteFrames.monster) {
            this.anims.create({
                key: "monster_walk",
                frames: this.anims.generateFrameNumbers("enemy_monster", {
                    start: 0,
                    end: 3,
                }),
                frameRate: 8,
                repeat: -1,
            });
        }

        if (hasSpriteFrames.explosion) {
            this.anims.create({
                key: "explode",
                frames: this.anims.generateFrameNumbers("explosion", {
                    start: 0,
                    end: 7,
                }),
                frameRate: 15,
                repeat: 0,
            });
        }

        // Proceed to menu
        this.scene.start("MenuScene");
    }

    // Helper method to check if a spritesheet has enough frames
    private checkFrames(key: string, requiredFrames: number): boolean {
        try {
            const texture = this.textures.get(key);
            return texture.frameTotal >= requiredFrames;
        } catch (e) {
            return false;
        }
    }
}
