export class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            "SPACE STATION DEFENDER",
            {
                font: "bold 32px Nunito",
                color: "#ffffff",
                align: "center",
            }
        );
        title.setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3 + 50,
            "Defend against aliens, monsters and space pirates",
            {
                font: "20px Nunito",
                color: "#cccccc",
                align: "center",
            }
        );
        subtitle.setOrigin(0.5);

        // Add wallet address display
        const walletAddress = window.gameSettings?.address || "Not Connected";
        const walletText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Wallet: ${walletAddress}`,
            {
                font: "18px Nunito",
                color: "#ffcc00",
                align: "center",
            }
        );
        walletText.setOrigin(0.5);

        // Add start button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            200,
            60,
            0x0066aa
        );
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            "START GAME",
            {
                font: "bold 24px Nunito",
                color: "#ffffff",
                align: "center",
            }
        );
        startText.setOrigin(0.5);

        // Hover effect
        startButton.on("pointerover", () => {
            startButton.fillColor = 0x0099ff;
        });

        startButton.on("pointerout", () => {
            startButton.fillColor = 0x0066aa;
        });

        // Start game when clicked
        startButton.on("pointerdown", () => {
            this.startGame();
        });

        // Add instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            "Click on the station floor to place defenses.\nProtect your station from waves of enemies.\nDon't let enemies reach the exit!",
            {
                font: "16px Nunito",
                color: "#cccccc",
                align: "center",
            }
        );
        instructions.setOrigin(0.5);

        // // Play menu music
        // if (!this.sound.get('music_menu')) {
        //     const music = this.sound.add('music_menu', {
        //         volume: 0.5,
        //         loop: true
        //     });
        //     music.play();
        // }
    }

    startGame() {
        // Stop menu music
        this.sound.stopAll();

        // Reset game settings
        const gameSettings = window.gameSettings;
        gameSettings.credits = 100;
        gameSettings.waveCount = 1;

        // Start game scenes
        this.scene.start("GameScene");
        this.scene.launch("UIScene");
    }
}
