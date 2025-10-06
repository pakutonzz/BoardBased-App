// services/boardGame.service.js
const BoardGame = require('../models/BoardGame');

async function create(data) {
    return BoardGame.create(data);
}

async function findAndCount(where, order, limit, offset) {
    return BoardGame.findAndCountAll({ where, order, limit, offset });
}

async function findAll(where, order, limit, offset) {
    return BoardGame.findAll({ where, order, limit, offset });
}

async function findRandom(where, limit = 20) {
    const order = BoardGame.sequelize.random(); // RANDOM()/RAND()
    return BoardGame.findAll({ where, order, limit });
}

async function count(where) {
    return BoardGame.count({ where });
}

async function findById(id) {
    return BoardGame.findByPk(id);
}

module.exports = {
    create,
    findAndCount,
    findAll,
    findRandom,
    count,
    findById,
};
