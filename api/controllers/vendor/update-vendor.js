module.exports = {


  friendlyName: 'Update vendor',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

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

    const vendorCount = await Vendor.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (vendorCount === 0) {
      return exits.invalid({
        message: 'Vendor not found'
      });
    }

    await Vendor.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'Vendor updated successfully',
    });

  }


};
