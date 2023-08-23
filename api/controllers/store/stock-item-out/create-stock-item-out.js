module.exports = {


  friendlyName: 'Create stock item out',


  description: '',


  inputs: {

    outDate: {
      type: 'ref',
      required: true,
    },

    unitPrice: {
      type: 'number',
      required: true,
    },

    qty: {
      type: 'number',
      required: true,
    },

    weight: {
      type: 'number',
      required: true,
    },

    commission: {
      type: 'number',
      required: true,
    },

    commissionFee: {
      type: 'number',
      required: false,
    },

    totalPrice: {
      type: 'number',
      required: true,
    },

    stockItemId: {
      type: 'number',
      required: true,
    },


  },


  exits: {

    success: {
      statusCode: 201,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    },

  },


  fn: async function (inputs, exits) {

    const createdStockItemOut = await StockItemOut.create(inputs).catch((err) => {
      console.log(err);
      return exits.invalidValidation(err);
    });

    if (createdStockItemOut instanceof StockItemOut) {
      return exits.success({
        message: 'StockItemOut created successfully.',
      });
    }

  }

};
