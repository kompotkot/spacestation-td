import { Defender, Enemy, Wave } from "../types/GameTypes";

export const GAME_DEFENDER_SOLDER = {
    id: 1,

    name: "Solder",
    cost: 25,
    damage: 20,
    range: 3,
    fireRate: 1000,
    projectileSpeed: 2000,
    projectileSprite: "bullet",

    sprite: "solder",
};

export const GAME_DEFENDER_TURRET_LASER = {
    id: 2,

    name: "Turret Laser",
    cost: 50,
    damage: 5,
    range: 2,
    fireRate: 200,
    projectileSpeed: 500,
    projectileSprite: "laser",

    sprite: "turret_laser",
};

export const GAME_DEFENDER_HEAVY_SOLDER = {
    id: 3,

    name: "Heavy Solder",
    cost: 75,
    damage: 50,
    range: 5,
    fireRate: 2000,
    projectileSpeed: 200,
    projectileSprite: "missile",

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
    health: 100,
    speed: 100,

    sprite: "enemy_pirate",
};

export const GAME_ENEMY_MONSTER: Enemy = {
    id: 3,

    name: "monster",
    reward: 20,
    health: 200,
    speed: 50,

    sprite: "enemy_monster",
};

export const GAME_WAVES: Wave[] = [
    // Wave 1
    {
        reward: 5,
        minStartCredits: 25,

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
        reward: 10,
        minStartCredits: 55,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 4,
                delay: 2500,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 4,
                delay: 2500,
                pathId: 2,
                stackDelay: 6000,
            },
        ],
    },
    // Wave 3
    {
        reward: 25,
        minStartCredits: 25,

        stacks: [
            {
                enemy: GAME_ENEMY_ALIEN,
                count: 6,
                delay: 2500,
                pathId: 1,
                stackDelay: 0,
            },
            {
                enemy: GAME_ENEMY_PIRATE,
                count: 2,
                delay: 6000,
                pathId: 2,
                stackDelay: 1000,
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
    // Wave 4
    {
        reward: 100,
        minStartCredits: 25,

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
];
