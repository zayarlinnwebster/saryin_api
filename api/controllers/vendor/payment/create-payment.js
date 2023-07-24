module.exports = {


  friendlyName: 'Create payment',


  description: '',


  inputs: {

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
      statusCode: 201,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    }

  },


  fn: async function (inputs, exits) {

    const createdVendorPayment = await VendorPayment.create(inputs)
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdVendorPayment instanceof VendorPayment) {
      return exits.success({
        message: 'VendorPayment created successfully.',
      });
    }

  }


};
