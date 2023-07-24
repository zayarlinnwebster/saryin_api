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

    vendorId: {
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

    const vendorPaymentCount = await VendorPayment.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (vendorPaymentCount === 0) {
      return exits.invalid({
        message: 'VendorPayment not found'
      });
    }

    await VendorPayment.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'VendorPayment updated successfully',
    });

  }


};
