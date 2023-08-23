module.exports = {


  friendlyName: 'Update stock item',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    unitPrice: {
      type: 'number',
      required: true,
    },

    storedDate: {
      type: 'ref',
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

    totalPrice: {
      type: 'number',
      required: true,
    },

  },


  exits: {

    success: {
      statusCode: 200,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    }

  },


  fn: async function (inputs, exits) {

    const stockItemCount = await StockItem.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (stockItemCount === 0) {
      return exits.invalid({
        message: 'StockItem not found'
      });
    }

    await StockItem.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'StockItem updated successfully',
    });

  }


};
