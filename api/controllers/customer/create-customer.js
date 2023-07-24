module.exports = {


  friendlyName: 'Create customer',


  description: '',


  inputs: {

    fullName: {
      type: 'string',
      required: true,
    },

    phoneNo: {
      type: 'string',
      allowNull: true,
    },

    address: {
      type: 'string',
      allowNull: true,
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

    const createdCustomer = await Customer.create(inputs)
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdCustomer instanceof Customer) {
      return exits.success({
        message: 'Customer created successfully.',
      });
    }

  }


};
