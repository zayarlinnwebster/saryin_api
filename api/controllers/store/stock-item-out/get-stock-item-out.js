const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get stock item out',


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

    fromDate: {
      type: 'ref',
      required: true,
    },

    toDate: {
      type: 'ref',
      required: true,
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
    page, limit, fromDate, toDate
  }, exits) {

    const stockItemSearch = {
      [Op.and]: [
        {
          outDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
      ],
    };

    const stockItemOutCount = await StockItemOut.count({
      where: stockItemSearch,
      offset: limit * (page - 1),
      limit: limit,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const stockItemList = await StockItemOut.findAll({
      where: stockItemSearch,
      offset: limit * (page - 1),
      limit: limit,
      subQuery: false,
      order: orderTerm,
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    return exits.success({
      totalCounts: stockItemOutCount,
      data: stockItemList,
    });

  },

};
