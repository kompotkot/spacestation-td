// This is a simplified version of the UI scene for Next.js integration

import { GameScene } from "./GameScene";

export class UIScene extends Phaser.Scene {
    // Properties
    credits: number;
    health: number;
    wave: number;
    selectedTower: string | null;
    topPanel: Phaser.GameObjects.Rectangle;
    bottomPanel: Phaser.GameObjects.Rectangle;
    creditsText: Phaser.GameObjects.Text;
    healthText: Phaser.GameObjects.Text;
    waveText: Phaser.GameObjects.Text;
    infoText: Phaser.GameObjects.Text;
    towerButtons: Phaser.GameObjects.Rectangle[];
    towerInfoPanel: Phaser.GameObjects.Container;
    towerTypeText: Phaser.GameObjects.Text;
    towerStatsText: Phaser.GameObjects.Text;

    constructor() {
        super("UIScene");
    }

    init() {
        // UI state
        this.credits = window.gameSettings.credits;
        this.health = window.gameSettings.health;
        this.wave = window.gameSettings.waveCount;
        this.selectedTower = null;
        this.towerButtons = [];
    }

    create() {
        this.createUIPanels();

        this.createStatusDisplays();

        // Create tower selection buttons
        this.createTowerSelectionButtons();

        // Create tower info panel (hidden initially)
        this.createTowerInfoPanel();

        // Listen for events from game scene
        this.listenToEvents();
    }

    // Create UI panel
    createUIPanels() {
        // Create top UI panel
        this.topPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            30,
            this.cameras.main.width,
            60
        );

        // Create bottom UI panel
        this.bottomPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 45,
            this.cameras.main.width,
            90
        );
    }

    // Create status displays
    createStatusDisplays() {
        // Credits display
        this.add.image(50, 30, "icon_credits").setScale(0.5);
        this.creditsText = this.add
            .text(80, 30, `Credits: ${this.credits}`, {
                font: "18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0, 0.5);

        // Health display
        this.add.image(250, 30, "icon_health").setScale(0.5);
        this.healthText = this.add
            .text(280, 30, `Health: ${this.health}%`, {
                font: "18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0, 0.5);

        // Wave display
        this.add.image(450, 30, "icon_wave").setScale(0.5);
        this.waveText = this.add
            .text(480, 30, `Wave: ${this.wave}`, {
                font: "18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0, 0.5);

        // Tower info text
        this.infoText = this.add
            .text(700, 30, "", {
                font: "16px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0, 0.5);
    }

    createTowerSelectionButtons() {
        // Define tower types from game scene
        const towerTypes = {
            turret: {
                name: "Turret",
                cost: 25,
                damage: 20,
                range: 192,
                fireRate: 500,
            },
            laser: {
                name: "Laser",
                cost: 50,
                damage: 10,
                range: 256,
                fireRate: 200,
            },
            missile: {
                name: "Missile",
                cost: 75,
                damage: 50,
                range: 320,
                fireRate: 2000,
            },
        };

        // Tower selection buttons
        const buttonY = this.cameras.main.height - 45;
        let buttonX = 100;

        // Create a button for each tower type
        Object.keys(towerTypes).forEach((type, index) => {
            const tower = towerTypes[type as keyof typeof towerTypes];

            // Create button background
            const button = this.add.rectangle(buttonX, buttonY, 150, 70);
            button.setStrokeStyle(2, 0xffffff);
            button.setInteractive({ useHandCursor: true });

            // Tower name and cost
            this.add.text(buttonX - 20, buttonY - 15, tower.name, {
                font: "16px JetBrains Mono",
                color: "#ffffff",
            });

            const costText = this.add.text(
                buttonX - 20,
                buttonY + 5,
                `Cost: ${tower.cost}`,
                {
                    font: "14px JetBrains Mono",
                    color: "#ffff00",
                }
            );

            button.setData("costText", costText);
            button.setData("towerType", type);

            // Button hover effect
            button.on("pointerover", () => {
                button.setStrokeStyle(2, 0xff0000);

                // Show hover info
                this.infoText.setText(
                    `${tower.name}: Damage ${tower.damage}, Range ${
                        tower.range / 64
                    } tiles, Rate ${tower.fireRate}ms`
                );
            });

            button.on("pointerout", () => {
                button.setStrokeStyle(2, 0xffffff);

                this.infoText.setText("");
            });

            // Button click handler
            button.on("pointerdown", () => {
                if (this.credits >= tower.cost) {
                    // Tell game scene to start tower placement
                    this.selectTower(type);

                    // Update button appearance
                    this.towerButtons.forEach((b) => {
                        b.setFillStyle(0x666666);
                    });
                    button.setFillStyle(0x00aa00);
                }
            });

            // Store button reference
            this.towerButtons.push(button);

            // Increment x position for next button
            buttonX += 170;
        });

        // Add cancel button - simplified implementation
        const cancelButton = this.add.rectangle(
            buttonX,
            buttonY,
            100,
            70,
            0x990000,
            1
        );
        cancelButton.setInteractive({ useHandCursor: true });

        this.add
            .text(buttonX, buttonY, "Cancel", {
                font: "16px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        // Button click handler
        cancelButton.on("pointerdown", () => {
            this.cancelTowerSelection();
        });
    }

    createTowerInfoPanel() {
        // Tower info panel - simplified implementation
        this.towerInfoPanel = this.add.container(
            this.cameras.main.width - 200,
            400
        );
        this.towerInfoPanel.setVisible(false);

        // Background
        const infoBg = this.add.rectangle(0, 0, 180, 200, 0x333333, 0.8);
        this.towerInfoPanel.add(infoBg);

        // Tower type text
        this.towerTypeText = this.add
            .text(0, -80, "Tower Info", {
                font: "bold 18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0.5);
        this.towerInfoPanel.add(this.towerTypeText);

        // Stats text
        this.towerStatsText = this.add
            .text(0, -20, "", {
                font: "14px JetBrains Mono",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5);
        this.towerInfoPanel.add(this.towerStatsText);
    }

    listenToEvents() {
        // Listen for UI updates from game scene
        this.scene.get("GameScene").events.on("updateUI", (data: any) => {
            if (data.credits !== undefined) {
                this.credits = data.credits;
                this.creditsText.setText(`Credits: ${this.credits}`);

                // Update tower button appearances based on affordability
                this.updateTowerButtons();
            }

            if (data.health !== undefined) {
                this.health = data.health;
                this.healthText.setText(`Health: ${this.health}%`);

                // Change color based on health
                if (this.health < 30) {
                    this.healthText.setColor("#ff0000");
                } else if (this.health < 60) {
                    this.healthText.setColor("#ffff00");
                } else {
                    this.healthText.setColor("#ffffff");
                }
            }

            if (data.wave !== undefined) {
                this.wave = data.wave;
                this.waveText.setText(`Wave: ${this.wave}`);
            }
        });

        // Listen for tower selection events
        this.scene.get("GameScene").events.on("towerSelected", (data: any) => {
            // Show tower info panel
            this.towerInfoPanel.setVisible(true);

            // Update panel content
            this.towerTypeText.setText(
                data.type.charAt(0).toUpperCase() + data.type.slice(1)
            );

            this.towerStatsText.setText(
                `Damage: ${data.damage}\nRange: ${
                    data.range / 64
                } tiles\nFire Rate: ${data.fireRate}ms`
            );
        });

        // Listen for tower deselection
        this.scene.get("GameScene").events.on("towerDeselected", () => {
            this.towerInfoPanel.setVisible(false);
        });
    }

    updateTowerButtons() {
        // Update tower buttons based on affordability
        this.towerButtons.forEach((button) => {
            const towerType = button.getData("towerType");
            const cost =
                towerType === "turret" ? 25 : towerType === "laser" ? 50 : 75;
            const costText = button.getData("costText");

            // Update color based on affordability
            if (this.credits >= cost) {
                button.setStrokeStyle(2, 0xffffff);
                costText.setColor("#ffff00");
            } else {
                button.setStrokeStyle(2, 0x444444);
                costText.setColor("#ff6666");
            }
        });
    }

    selectTower(towerType: string) {
        this.selectedTower = towerType;

        // Tell game scene to start placement
        const gameScene = this.scene.get("GameScene") as GameScene;
        gameScene.towerStartPlacement(towerType);
    }

    cancelTowerSelection() {
        // Reset selected tower
        this.selectedTower = null;

        // Reset button appearances
        this.towerButtons.forEach((button) => {
            button.setStrokeStyle(2, 0xffffff);
        });

        // Tell game scene to cancel placement
        const gameScene = this.scene.get("GameScene") as GameScene;
        gameScene.towerCancelPlacement();
    }
}
