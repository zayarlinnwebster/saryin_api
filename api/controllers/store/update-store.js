module.exports = {


  friendlyName: 'Update store',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    storeName: {
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

    const storeCount = await Store.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (storeCount === 0) {
      return exits.invalid({
        message: 'Store not found'
      });
    }

    await Store.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'Store updated successfully',
    });

  }


};
