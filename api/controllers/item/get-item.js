const { Op } = require('sequelize');

module.exports = {

  friendlyName: 'Get item',


  description: '',


  inputs: {

    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1,
    },

    limit: {
      type: 'number',
      defaultsTo: 1000000,
      min: 1,
    },

    search: {
      type: 'string',
      defaultsTo: '',
    },

    column: {
      type: 'string',
      defaultsTo: '',
    },

    direction: {
      type: 'string',
      defaultsTo: '',
    },

  },


  exits: {

    success: {
      statusCode: 200,
    },

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function ({ page, limit, search, column, direction }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const itemSearch = {
      [Op.or]: [
        {
          itemName: {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      orderTerm = [[column, direction.toUpperCase()]];
    }

    const itemCount = await Item.count({
      where: itemSearch,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const itemList = await Item.findAll({
      where: itemSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      group: ['Item.id'],
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: itemCount,
      data: itemList,
    });

  },

};
