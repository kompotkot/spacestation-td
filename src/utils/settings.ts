import { Defender, Enemy, Wave } from "../types/GameTypes";

export const GAME_DEFENDER_SOLDER: Defender = {
    id: 1,

    name: "Solder",
    cost: 50,
    damage: 20,
    range: 3,
    fireRate: 1000,
    projectileSpeed: 2000,
    projectileSprite: "bullet",
    projectileSound: "sound_bullet_shot",

    sprite: "solder",
};

export const GAME_DEFENDER_TURRET_LASER: Defender = {
    id: 2,

    name: "Turret Laser",
    cost: 110,
    damage: 5,
    range: 2,
    fireRate: 200,
    projectileSpeed: 500,
    projectileSprite: "laser",
    projectileSound: "sound_laser_shot",

    sprite: "turret_laser",
};

export const GAME_DEFENDER_HEAVY_SOLDER: Defender = {
    id: 3,

    name: "Heavy Solder",
    cost: 150,
    damage: 50,
    range: 5,
    fireRate: 2000,
    projectileSpeed: 200,
    projectileSprite: "missile",
    projectileSound: "sound_missile_shot",

    sprite: "solder_heavy",
};

export const GAME_ENEMY_ALIEN: Enemy = {
    id: 1,

    name: "alien",
    reward: 5,
    health: 50,
    speed: 150,

    sprite: "enemy_alien",
};

export const GAME_ENEMY_PIRATE: Enemy = {
    id: 2,

    name: "pirate",
    reward: 10,
    health: 250,
    speed: 100,

    sprite: "enemy_pirate",
};

export const GAME_ENEMY_MONSTER: Enemy = {
    id: 3,

    name: "monster",
    reward: 20,
    health: 900,
    speed: 50,

    sprite: "enemy_monster",
};

export const GAME_WAVES: Wave[] = [
    // Wave 1
    {
        reward: 20,
        minStartCredits: 50,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 5,
                delay: 2500,
                pathId: 1,
                stackDelay: 0,
            },
        ],
    },
    // Wave 2
    {
        reward: 5,
        minStartCredits: 100,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 5,
                delay: 2500,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 4,
                delay: 2500,
                pathId: 2,
                stackDelay: 2000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 1,
                delay: 1000,
                pathId: 1,
                stackDelay: 22000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 1,
                delay: 1000,
                pathId: 2,
                stackDelay: 22000,
            },
        ],
    },
    // Wave 3
    {
        reward: 10,
        minStartCredits: 120,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 7,
                delay: 2500,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 7,
                delay: 2500,
                pathId: 2,
                stackDelay: 3000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 3,
                delay: 1200,
                pathId: 1,
                stackDelay: 20000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 3,
                delay: 1200,
                pathId: 2,
                stackDelay: 20000,
            },
        ],
    },
    // Wave 4
    {
        reward: 10,
        minStartCredits: 150,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 8,
                delay: 2000,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 6,
                delay: 2000,
                pathId: 2,
                stackDelay: 5000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 2,
                delay: 5000,
                pathId: 1,
                stackDelay: 12000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 1,
                delay: 5000,
                pathId: 2,
                stackDelay: 15000,
            },
        ],
    },
    // Wave 5
    {
        reward: 5,
        minStartCredits: 105,

        stacks: [
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 2,
                delay: 6000,
                pathId: 1,
                stackDelay: 1000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 6,
                delay: 2500,
                pathId: 2,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 4,
                delay: 1000,
                pathId: 1,
                stackDelay: 30000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 4,
                delay: 1000,
                pathId: 2,
                stackDelay: 30000,
            },
        ],
    },
    // Wave 6
    {
        reward: 15,
        minStartCredits: 200,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 10,
                delay: 1800,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 8,
                delay: 1800,
                pathId: 2,
                stackDelay: 4000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 3,
                delay: 5000,
                pathId: 1,
                stackDelay: 8000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 2,
                delay: 5000,
                pathId: 2,
                stackDelay: 12000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 6,
                delay: 1200,
                pathId: 1,
                stackDelay: 25000,
            },
        ],
    },
    // Wave 7
    {
        reward: 10,
        minStartCredits: 250,

        stacks: [
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 3,
                delay: 2000,
                pathId: 2,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 5000,
                pathId: 1,
                stackDelay: 0,
            },
        ],
    },
    // Wave 8
    {
        reward: 15,
        minStartCredits: 350,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 12,
                delay: 1500,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 8,
                delay: 1500,
                pathId: 2,
                stackDelay: 3000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 4,
                delay: 4000,
                pathId: 1,
                stackDelay: 8000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 3,
                delay: 4000,
                pathId: 2,
                stackDelay: 10000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 7000,
                pathId: 1,
                stackDelay: 18000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 7000,
                pathId: 2,
                stackDelay: 18000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 10,
                delay: 800,
                pathId: 1,
                stackDelay: 30000,
            },
        ],
    },
    // Wave 9
    {
        reward: 20,
        minStartCredits: 425,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 15,
                delay: 1200,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 12,
                delay: 1200,
                pathId: 2,
                stackDelay: 2000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 5,
                delay: 3500,
                pathId: 1,
                stackDelay: 10000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 4,
                delay: 3500,
                pathId: 2,
                stackDelay: 12000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 2,
                delay: 6000,
                pathId: 1,
                stackDelay: 22000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 6000,
                pathId: 2,
                stackDelay: 22000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 8,
                delay: 800,
                pathId: 1,
                stackDelay: 38000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 8,
                delay: 800,
                pathId: 2,
                stackDelay: 38000,
            },
        ],
    },
    // Wave 10
    {
        reward: 30,
        minStartCredits: 500,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 18,
                delay: 1000,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 18,
                delay: 1000,
                pathId: 2,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 6,
                delay: 3000,
                pathId: 1,
                stackDelay: 10000,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 6,
                delay: 3000,
                pathId: 2,
                stackDelay: 10000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 2,
                delay: 5000,
                pathId: 1,
                stackDelay: 25000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 2,
                delay: 5000,
                pathId: 2,
                stackDelay: 25000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 0,
                pathId: 1,
                stackDelay: 40000,
            },
            {
                enemy: GAME_ENEMY_MONSTER,
                count: 1,
                delay: 0,
                pathId: 2,
                stackDelay: 40000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 20,
                delay: 500,
                pathId: 1,
                stackDelay: 45000,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 20,
                delay: 500,
                pathId: 2,
                stackDelay: 45000,
            },
        ],
    },
];
