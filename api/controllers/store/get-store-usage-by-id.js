const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Get store usage by id',


  description: '',


  inputs: {


    id: {
      type: 'number',
      required: true,
    },

    search: {
      type: 'string',
      defaultsTo: '',
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
    id, search, fromDate, toDate
  }, exits) {
    search = search.trim() || '';

    const { totalQtyOut,
      totalQtyIn,
      totalWeightIn,
      totalWeightOut,
      totalPriceIn,
      totalPriceOut,
      totalCommissionFee,
      totalItemCount,
    } = await Store.getStoreUsage(id, search, fromDate, toDate)
        .catch((err) => {
          console.log(err);
          return exits.serverError(err);
        });

    return exits.success({
      totalQtyOut,
      totalQtyIn,
      totalWeightIn,
      totalWeightOut,
      totalPriceIn,
      totalPriceOut,
      totalCommissionFee,
      totalItemCount
    });


  }


};
