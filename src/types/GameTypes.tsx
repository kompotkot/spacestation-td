export interface GameSettings {
    gridSize: number;
    credits: number;
    health: number;
    waveCount: number;
    enemyHealth: number;
    enemySpeed: number;
    difficultyModifier: number;
    address: string;
    camera: GameSettingsCamera;
}

export interface GameSettingsCamera {
    zoomFactor: number;
    minZoom: number;
    maxZoom: number;
    panSpeed: number;
    zoomSpeed: number;
}
