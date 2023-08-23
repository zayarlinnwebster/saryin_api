module.exports = {


  friendlyName: 'Create stock item',


  description: '',


  inputs: {

    storedDate: {
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
      type: 'string',
      required: true,
    },

    itemId: {
      type: 'number',
      required: true,
    },

    customerId: {
      type: 'number',
      required: true,
    },

    storeId: {
      type: 'number',
      required: true,
    },

    totalPrice: {
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

    const createdStockItem = await StockItem.create(inputs).catch((err) => {
      console.log(err);
      return exits.invalidValidation(err);
    });

    if (createdStockItem instanceof StockItem) {
      return exits.success({
        message: 'StockItem created successfully.',
      });
    }

  }


};
