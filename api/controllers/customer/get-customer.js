const { Op } = require('sequelize');

module.exports = {

  friendlyName: 'Get customer',

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

  fn: async function ({
    page,
    limit,
    search,
    column,
    direction
  }, exits) {
    search = search.trim() || '';
    let orderTerm = [];

    const customerSearch = {
      [Op.or]: [
        {
          fullName: {
            [Op.substring]: search,
          },
        },
        {
          phoneNo: {
            [Op.startsWith]: search,
          },
        },
      ],
    };

    if (column && direction) {
      orderTerm = [[column, direction.toUpperCase()]];
    }

    const customerCount = await Customer.count({
      where: customerSearch,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const customerList = await Customer.findAll({
      where: customerSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      group: ['Customer.id'],
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: customerCount,
      data: customerList,
    });
  },
};
