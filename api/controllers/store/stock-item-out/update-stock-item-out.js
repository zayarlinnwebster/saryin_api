module.exports = {


  friendlyName: 'Update stock item out',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

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

    const stockItemOutCount = await StockItemOut.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (stockItemOutCount === 0) {
      return exits.invalid({
        message: 'StockItemOut not found'
      });
    }

    await StockItemOut.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'StockItemOut updated successfully',
    });

  }


};
