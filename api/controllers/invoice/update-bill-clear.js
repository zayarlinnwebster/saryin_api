module.exports = {


  friendlyName: 'Update bill clear',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    isBillCleared: {
      type: 'boolean',
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

    const invoiceDetailCount = await InvoiceDetail.count({
      where: {
        id: inputs.id,
      },
    })
      .catch((err) => {
        return exits.serverError(err);
      });

    if (invoiceDetailCount === 0) {
      return exits.invalid({
        message: 'Invoice Detail not found'
      });
    }

    await InvoiceDetail.update({
      isBillCleared: inputs.isBillCleared,
    }, {
      where: {
        id: inputs.id
      }
    })
      .catch((err) => {
        return exits.invalidValidation(err);
      });

    return exits.success({
      message: 'Invoice Detail updated successfully',
    });

  }


};
