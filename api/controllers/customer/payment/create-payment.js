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

    customerId: {
      type: 'number',
      required: true,
    },

    commission: {
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
    }

  },


  fn: async function (inputs, exits) {

    const createdCustomerPayment = await CustomerPayment.create(inputs)
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdCustomerPayment instanceof CustomerPayment) {
      return exits.success({
        message: 'CustomerPayment created successfully.',
      });
    }

  }


};
