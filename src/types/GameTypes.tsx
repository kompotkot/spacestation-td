export interface GameSettings {
    gridSize: number;
    credits: number;
    health: number;
    waveCount: number;
    enemyHealth: number;
    enemySpeed: number;
    difficultyModifier: number;
    camera: GameSettingsCamera;
}

export interface GameSettingsCamera {
    zoomFactor: number;
    minZoom: number;
    maxZoom: number;

    panSpeed: number;
    zoomSpeed: number;
}

export interface ExitLocation {
    id: number;

    x: number;
    y: number;

    type: string;
}

export interface SpawnLocation {
    id: number;

    x: number;
    y: number;

    type: string;
}

export interface TowerLocation {
    id: number;

    x: number;
    y: number;

    type: string;
}

export interface Path {
    id: number;

    spawn: number;
    exit: number;
}

// export interface Enemy {
//     id: number;

//     name: string;
//     type: string;
//     health: number;
//     speed: number;
//     reward: number;
//     count: number;
//     delay: number;

//     sprite: string;
// }

export interface Wave {
    reward: number;
    path: number;

    enemies: any[];
}

// export interface Projectile {
//     id: number;

//     speed: number;

//     sprite: string;
// }

// export interface Weapon {
//     id: number;

//     damage: number;
//     range: number;
//     fireRate: number;

//     projectile: number;
// }

// export interface Defender {
//     id: number;

//     name: string;
//     type: string;
//     cost: number;

//     weapon: number;

//     sprite: string;
// }
