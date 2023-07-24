const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Update invoice',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    invoiceDate: {
      type: 'ref',
      required: true,
    },

    totalItemAmount: {
      type: 'number',
      required: true,
    },

    laborFee: {
      type: 'number',
      required: true,
    },

    generalFee: {
      type: 'number',
      required: true,
    },

    commission: {
      type: 'number',
      required: true,
    },

    commissionFee: {
      type: 'number',
      required: true,
    },

    totalAmount: {
      type: 'number',
      required: true,
    },

    vendorId: {
      type: 'number',
      required: true,
    },

    invoiceDetails: {
      type: 'ref',
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
    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    const invoiceCount = await Invoice.count({
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.serverError(err);
      });

    if (invoiceCount === 0) {
      await transaction.rollback();

      return exits.invalid({
        message: 'Invoice not found'
      });
    }

    await Invoice.update(inputs, {
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    let newInvoiceDetails = [];
    let updateInvoiceDetailsId = [];

    for (let invoiceDetail of inputs.invoiceDetails) {
      if (invoiceDetail.id) {
        await InvoiceDetail.update(invoiceDetail, {
          where: {
            id: invoiceDetail.id
          },
          transaction
        })
          .catch(async (err) => {
            await transaction.rollback();
            return exits.invalidValidation(err);
          });
        updateInvoiceDetailsId.push(invoiceDetail.id);
      } else {
        newInvoiceDetails.push({
          ...invoiceDetail,
          invoiceId: inputs.id
        });
      }
    }

    await InvoiceDetail.destroy({
      where: {
        id: {
          [Op.notIn]: updateInvoiceDetailsId
        },
        invoiceId: inputs.id
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    if (newInvoiceDetails.length > 0) {
      await InvoiceDetail.bulkCreate(newInvoiceDetails, {
        transaction
      })
        .catch(async (err) => {
          await transaction.rollback();
          return exits.invalidValidation(err);
        });
    }

    await transaction.commit();

    return exits.success({
      message: 'Invoice updated successfully',
    });

  }


};
