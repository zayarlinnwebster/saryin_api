module.exports = {


  friendlyName: 'Create vendor',


  description: '',


  inputs: {

    vendorName: {
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

    const createdVendor = await Vendor.create(inputs)
      .catch((err) => {
        console.log(err);
        return exits.invalidValidation(err);
      });

    if (createdVendor instanceof Vendor) {
      return exits.success({
        message: 'Vendor created successfully.',
      });
    }

  }


};
