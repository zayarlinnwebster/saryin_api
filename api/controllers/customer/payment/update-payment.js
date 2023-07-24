module.exports = {


  friendlyName: 'Update payment',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    paymentDate: {
      type: 'ref',
      required: true,
    },

    paidAmount: {
      type: 'number',
      required: true,
    },

    paidBy: {
      type: 'string',
      required: true,
    },

    transactionNo: {
      type: 'string',
      allowNull: true,
    },

    customerId: {
      type: 'number',
      required: true,
    }

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

    const customerPaymentCount = await CustomerPayment.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (customerPaymentCount === 0) {
      return exits.invalid({
        message: 'CustomerPayment not found'
      });
    }

    await CustomerPayment.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'CustomerPayment updated successfully',
    });

  }


};
