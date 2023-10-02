const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Separate invoice',


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

    totalAmount: {
      type: 'number',
      required: true,
    },

    customerId: {
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

    const createdInvoice = await Invoice.create({
      ...inputs,
      id: null,
    }, {
      transaction
    })
      .catch(async (err) => {
        console.log(err);
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    if (createdInvoice instanceof Invoice) {
      const separateInvoiceDetailIdList = [];
      for (let invoiceDetail of inputs.invoiceDetails) {
        await InvoiceDetail.create({
          qty: invoiceDetail.qty,
          weight: invoiceDetail.weight,
          unitPrice: invoiceDetail.unitPrice,
          totalPrice: invoiceDetail.totalPrice,
          laborFee: invoiceDetail.laborFee,
          generalFee: invoiceDetail.generalFee,
          remark: invoiceDetail.remark,
          itemId: invoiceDetail.itemId,
          vendorId: invoiceDetail.vendorId,
          isBillCleared: invoiceDetail.isBillCleared,
          isStoreItem: invoiceDetail.isStoreItem,
          invoiceId: createdInvoice.id,
        }, { transaction })
          .catch(async (err) => {
            console.log(err);
            await transaction.rollback();
            return exits.invalidValidation(err);
          });

        separateInvoiceDetailIdList.push(invoiceDetail.id);
      }

      await InvoiceDetail.destroy({
        where: {
          id: {
            [Op.in]: separateInvoiceDetailIdList
          },
          invoiceId: inputs.id
        },
        transaction
      })
        .catch(async (err) => {
          await transaction.rollback();
          return exits.invalidValidation(err);
        });

      await transaction.commit();

      return exits.success({
        message: 'Invoice updated successfully',
      });
    }

  }


};
