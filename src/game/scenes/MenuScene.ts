export class MenuScene extends Phaser.Scene {
    sessionId: number;
    loadingText: Phaser.GameObjects.Text | null = null;
    loadingAnimation: Phaser.Tweens.Tween | null = null;

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
                font: "32px JetBrains Mono",
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
                font: "20px JetBrains Mono",
                color: "#cccccc",
                align: "center",
            }
        );
        subtitle.setOrigin(0.5);

        // Add wallet address display
        const walletAddress = window.gameContract?.address || "Not Connected";
        const walletText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Wallet: ${walletAddress}`,
            {
                font: "18px JetBrains Mono",
                color: "#ffcc00",
                align: "center",
            }
        );
        walletText.setOrigin(0.5);

        // Add session number
        const session = window.gameContract?.playerLatestSession || null;
        const sessionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 30,
            `Player latest session number: ${session}`,
            {
                font: "18px JetBrains Mono",
                color: "#ffcc00",
                align: "center",
            }
        );
        sessionText.setOrigin(0.5);

        // Add start button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            200,
            60,
            0x0066aa
        );
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            "START GAME",
            {
                font: "bold 24px JetBrains Mono",
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
        startButton.on("pointerdown", async () => {
            await this.startGame();
        });

        // Add instructions
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            "Click on the station floor to place defenses.\nProtect your station from waves of enemies.\nDon't let enemies reach the exit!",
            {
                font: "16px JetBrains Mono",
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

    showLoadingMessage(message) {
        // Hide any existing loading message
        this.hideLoadingMessage();

        // Create background for better visibility
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width * 0.8,
            80,
            0x000000,
            0.7
        );

        // Create the loading text
        this.loadingText = this.add
            .text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                message,
                { fontSize: "24px", color: "#ffffff" }
            )
            .setOrigin(0.5);

        // Add a dot animation to show progress
        this.loadingAnimation = this.tweens.add({
            targets: this.loadingText,
            alpha: { from: 1, to: 0.6 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                // Animated dots to show activity
                const dots = ".".repeat(Math.floor((this.time.now / 500) % 4));
                this.loadingText.setText(message + dots);
            },
        });

        return { text: this.loadingText, bg: bg };
    }

    hideLoadingMessage() {
        if (this.loadingText) {
            if (this.loadingAnimation) {
                this.loadingAnimation.stop();
                this.loadingAnimation = null;
            }

            // Get the background if it exists (it's the previous object in the display list)
            const index = this.children.getIndex(this.loadingText);
            if (index > 0) {
                const bg = this.children.getAt(index - 1);
                if (bg) bg.destroy();
            }

            this.loadingText.destroy();
            this.loadingText = null;
        }
    }

    showErrorMessage(message) {
        // Hide any loading message
        this.hideLoadingMessage();

        // Create background for better visibility
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width * 0.8,
            80,
            0x000000,
            0.7
        );

        const errorText = this.add
            .text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                message,
                { fontSize: "24px", color: "#ff0000", align: "center" }
            )
            .setOrigin(0.5);

        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            errorText.destroy();
            bg.destroy();
        });
    }

    async startGame() {
        console.log("[INFO] Starting game process...");
        const gameContract = window.gameContract;

        if (!gameContract || !gameContract.isConnected) {
            console.error("[ERROR] Wallet not connected");
            this.showErrorMessage("Please connect your wallet to play");
            return;
        }

        // Show loading message
        this.showLoadingMessage("Initiating blockchain transaction");

        try {
            console.log("[INFO] Calling startGameSession");
            // Call the contract function to start a game session
            await gameContract.startGameSession();

            console.log("[INFO] Transaction successful, starting game");
            // Hide the loading message
            this.hideLoadingMessage();

            // Stop menu music
            this.sound.stopAll();

            // Reset game settings
            const gameSettings = window.gameSettings;
            gameSettings.credits = 100;
            gameSettings.waveCount = 1;

            // Start game scenes
            this.scene.start("GameScene");
            this.scene.launch("UIScene");
        } catch (error) {
            console.error("[ERROR] Failed to start game session:", error);
            this.hideLoadingMessage();
            this.showErrorMessage("Failed to start game. Please try again.");
        }
    }
}
