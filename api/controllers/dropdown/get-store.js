const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get store',


  description: '',


  inputs: {

    search: {
      type: 'string',
      defaultsTo: '',
    },

    limit: {
      type: 'number',
      defaultsTo: 150,
      min: 1,
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
    search,
    limit
  }, exits) {
    search = search.trim() || '';

    const storeList = await Store.findAll({
      attributes: ['id', 'storeName'],
      where: {
        [Op.or]: [
          {
            storeName: {
              [Op.startsWith]: search
            }
          }
        ]
      },
      limit: limit,
      subQuery: false,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      data: storeList,
    });
  }


};
