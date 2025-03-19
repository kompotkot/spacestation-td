const GAME_ENEMY_ALIEN = {
    id: 1,
    name: "alien",
    reward: 5,
    health: 50,
    speed: 150,
};

const GAME_ENEMY_PIRATE = {
    id: 2,
    name: "pirate",
    reward: 20,
    health: 100,
    speed: 100,
};

const GAME_ENEMY_MONSTER = {
    id: 3,
    name: "monster",
    reward: 100,
    health: 200,
    speed: 50,
};

const GAME_WAVES = [
    {
        id: 1,
        path: 1,
        enemies: [{ id: 1, count: 4, delay: 2000 }],
    },
];
