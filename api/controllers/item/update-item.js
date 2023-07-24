module.exports = {


  friendlyName: 'Update item',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    itemName: {
      type: 'string',
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

    const itemCount = await Item.count({
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (itemCount === 0) {
      return exits.invalid({
        message: 'Item not found'
      });
    }

    await Item.update(inputs, {
      where: {
        id: inputs.id,
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'Item updated successfully',
    });

  }


};
