// This is a simplified version of the UI scene for Next.js integration

import { Defender } from "../../types/GameTypes";
import {
    GAME_DEFENDER_HEAVY_SOLDER,
    GAME_DEFENDER_SOLDER,
    GAME_DEFENDER_TURRET_LASER,
} from "../../utils/settings";
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
    defenderText: Phaser.GameObjects.Text;
    towerStatsText: Phaser.GameObjects.Text;

    waveStartButton: any;
    waveStartButtonText: any;

    defenders: Record<string, Defender>;

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

        this.waveStartButton = null;
        this.waveStartButtonText = null;

        // TODO: Remove from here
        this.defenders = {
            solder: GAME_DEFENDER_SOLDER,
            turret_laser: GAME_DEFENDER_TURRET_LASER,
            heavy_solder: GAME_DEFENDER_HEAVY_SOLDER,
        };
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

        this.createWaveStartButton();
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
        const buttonY = this.cameras.main.height - 30;
        let buttonX = 100;

        this.towerButtons = [];

        Object.entries(this.defenders).forEach(([key, defender]) => {
            // Determine initial stroke color based on affordability
            const isAffordable = this.credits >= defender.cost;
            const defaultStroke = isAffordable ? 0x00aa00 : 0x666666; // Green if affordable, Grey if not

            // Create button outline (no background)
            const button = this.add
                .rectangle(buttonX, buttonY, 150, 55)
                .setStrokeStyle(2, defaultStroke)
                .setInteractive({ useHandCursor: isAffordable });

            // Display defender name and cost
            this.add.text(buttonX - 60, buttonY - 15, defender.name, {
                font: "16px JetBrains Mono",
                color: "#ffffff",
            });

            const costText = this.add.text(
                buttonX - 60,
                buttonY + 5,
                `Cost: ${defender.cost}`,
                {
                    font: "14px JetBrains Mono",
                    color: isAffordable ? "#ffff00" : "#ff6666",
                }
            );

            // Store button data
            button.setData({ costText, defender: key });

            // Button hover effects
            button.on("pointerover", () => {
                if (this.credits >= defender.cost) {
                    button.setStrokeStyle(2, 0x66ff66); // Light green when hovered
                }
                this.infoText.setText(
                    `${defender.name}: Damage ${defender.damage}, Range ${
                        defender.range / 64
                    } tiles, Rate ${defender.fireRate}ms`
                );
            });

            button.on("pointerout", () => {
                button.setStrokeStyle(2, isAffordable ? 0x00aa00 : 0x666666); // Reset stroke
                this.infoText.setText("");
            });

            // Button click
            button.on("pointerdown", () => {
                if (isAffordable) {
                    this.selectTower(key);
                    this.towerButtons.forEach((b) =>
                        b.setStrokeStyle(2, 0x666666)
                    ); // Reset other buttons
                    button.setStrokeStyle(2, 0x00aa00); // Selected button
                }
            });

            this.towerButtons.push(button);
            buttonX += 170;
        });

        const cancelButton = this.add
            .rectangle(buttonX, buttonY, 100, 55)
            .setStrokeStyle(2, 0x990000)
            .setInteractive({ useHandCursor: true });

        this.add
            .text(buttonX, buttonY, "Cancel", {
                font: "16px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        cancelButton.on("pointerdown", () => {
            this.cancelTowerSelection();
            this.towerButtons.forEach((b) => b.setStrokeStyle(2, 0x00aa00));
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

        // Defenders text
        this.defenderText = this.add
            .text(0, -80, "Tower Info", {
                font: "bold 18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0.5);
        this.towerInfoPanel.add(this.defenderText);

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

    createWaveStartButton() {
        // Button position
        const buttonX = this.cameras.main.width - 150;
        const buttonY = this.cameras.main.height - 45;

        // Create button background
        const startWaveButton = this.add.rectangle(
            buttonX,
            buttonY,
            150,
            50,
            0x008800
        );
        startWaveButton.setStrokeStyle(2, 0xffffff);
        startWaveButton.setInteractive({ useHandCursor: true });

        // Button text
        const buttonText = this.add
            .text(buttonX, buttonY, "Start Wave", {
                font: "18px JetBrains Mono",
                color: "#ffffff",
            })
            .setOrigin(0.5);

        // Handle button click
        startWaveButton.on("pointerdown", () => {
            const gameScene = this.scene.get("GameScene") as GameScene;

            if (!gameScene.waveInProgress) {
                gameScene.waveStartNext(); // Start the next wave
                this.toggleWaveButton(false); // Disable button while wave is active
            }
        });

        // Store references for enabling/disabling later
        this.waveStartButton = startWaveButton;
        this.waveStartButtonText = buttonText;
    }

    // Enable/Disable the wave start button
    toggleWaveButton(enabled: boolean) {
        if (this.waveStartButton) {
            this.waveStartButton.setFillStyle(enabled ? 0x008800 : 0x444444);
            this.waveStartButtonText.setColor(enabled ? "#ffffff" : "#aaaaaa");
            this.waveStartButton.setInteractive({ useHandCursor: enabled });
        }
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

        this.scene.get("GameScene").events.on("waveComplete", () => {
            // Show wave complete message
            const completeText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                `Wave Complete!`,
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

            this.toggleWaveButton(true);
        });

        // Listen for tower selection events
        this.scene.get("GameScene").events.on("towerSelected", (data: any) => {
            // Show tower info panel
            this.towerInfoPanel.setVisible(true);

            // Update panel content
            this.defenderText.setText(
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
        this.towerButtons.forEach((button) => {
            const defenderKey = button.getData("defender");
            const defender = this.defenders[defenderKey];
            const costText = button.getData("costText");

            if (!defender) return; // Safety check

            // Update color based on affordability
            if (this.credits >= defender.cost) {
                button.setStrokeStyle(2, 0x00aa00); // Green (affordable)
                costText.setColor("#ffff00");
                button.setInteractive({ useHandCursor: true });
            } else {
                button.setStrokeStyle(2, 0x666666); // Grey (not enough credits)
                costText.setColor("#ff6666");
                button.disableInteractive();
            }
        });
    }

    selectTower(defender: string) {
        this.selectedTower = defender;

        // Tell game scene to start placement
        const gameScene = this.scene.get("GameScene") as GameScene;
        gameScene.towerStartPlacement(defender);
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
