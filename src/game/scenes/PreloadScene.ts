export class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        // Set up error handling for missing assets
        this.load.on("loaderror", (fileObj: Phaser.Loader.File) => {
            console.warn("Error loading asset:", fileObj.key);
        });

        // Load map assets
        this.load.image("floor_tiles", "assets/floor/floor-tile-map.png");
        this.load.tilemapTiledJSON("map", "assets/maps/map-1.tmj");

        this.load.image("exit_base", "assets/base/base-1.png");
        this.load.image("exit_portal", "assets/base/base-6.png");

        this.load.image("spawn_base", "assets/base/base-2.png");
        this.load.image("spawn_portal", "assets/base/base-5.png");

        this.load.image("tower_base", "assets/base/base-4.png");
        this.load.image("tower_portal", "assets/base/base-7.png");

        // Load tower assets
        this.load.image("solder_fire", "assets/defenders/solder-fire.png");
        this.load.image("solder_idle", "assets/defenders/solder-idle.png");
        this.load.image(
            "turret_laser_fire",
            "assets/defenders/turret-laser-fire.png"
        );
        this.load.image(
            "turret_laser_idle",
            "assets/defenders/turret-laser-idle.png"
        );
        this.load.image(
            "solder_heavy_fire",
            "assets/defenders/solder-heavy-fire.png"
        );
        this.load.image(
            "solder_heavy_idle",
            "assets/defenders/solder-heavy-idle.png"
        );

        // Load enemies assets
        this.load.spritesheet(
            "enemy_alien",
            "assets/enemies/alien-tile-map.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "enemy_pirate",
            "assets/enemies/pirate-tile-map.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "enemy_monster",
            "assets/enemies/monster-tile-map.png",
            { frameWidth: 128, frameHeight: 128 }
        );

        // Load projectiles
        this.load.image("bullet", "assets/projectiles/bullet.png");
        this.load.image("laser", "assets/projectiles/laser.png");
        this.load.image("missile", "assets/projectiles/missile.png");

        // Load effects
        this.load.image("explosion_static", "assets/effects/explosion.png");

        try {
            this.load.spritesheet("explosion", "assets/effects/explosion.png", {
                frameWidth: 64,
                frameHeight: 64,
            });
        } catch (e) {
            console.warn("Error loading explosion spritesheet");
        }

        // Load UI elements
        this.load.image("button", "assets/ui/button.png"); // ???
        this.load.image("panel", "assets/ui/panel.png"); // ???

        this.load.image("icon_credits", "assets/ui/credits.png");
        this.load.image("icon_health", "assets/ui/health.png");
        this.load.image("icon_wave", "assets/ui/wave.png");
    }

    create() {
        const hasSpriteFrames = {
            alien: this.checkFrames("enemy_alien", 4),
            pirate: this.checkFrames("enemy_pirate", 4),
            monster: this.checkFrames("enemy_monster", 4),
            explosion: this.checkFrames("explosion", 8),
        };

        // Store this information in the registry for other scenes to use
        this.registry.set("hasSpriteFrames", hasSpriteFrames);

        // Only create animations if we have the frames
        if (hasSpriteFrames.alien) {
            this.anims.create({
                key: "enemy_alien_walk",
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
                key: "enemy_pirate_walk",
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
                key: "enemy_monster_walk",
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
