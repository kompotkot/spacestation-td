export class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Create loading graphics
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            "Loading...",
            {
                font: "20px JetBrains Mono",
                color: "#ffffff",
            }
        );
        loadingText.setOrigin(0.5);

        // Create a loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            this.cameras.main.width / 2 - 160,
            this.cameras.main.height / 2,
            320,
            50
        );

        // Register loading events
        this.load.on("progress", (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x0099ff, 1);
            progressBar.fillRect(
                this.cameras.main.width / 2 - 150,
                this.cameras.main.height / 2 + 10,
                300 * value,
                30
            );
        });

        this.load.on("complete", () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.scene.start("PreloadScene");
    }
}
