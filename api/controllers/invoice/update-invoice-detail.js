module.exports = {


  friendlyName: 'Update invoice detail',


  description: '',


  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    vendorId: {
      type: 'number',
      required: true,
    },

    itemId: {
      type: 'number',
      required: true,
    },

    qty: {
      type: 'number',
      required: true,
    },

    weight: {
      type: 'number',
      required: true,
    },

    unitPrice: {
      type: 'number',
      required: true,
    },

    totalPrice: {
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

    remark: {
      type: 'string',
      allowNull: true,
    },

    isStoreItem: {
      type: 'boolean',
      required: true,
    },

    marLaKar: {
      type: 'string',
      allowNull: true,
    },

    storeId: {
      type: 'number',
      allowNull: true,
    },

    storedDate: {
      type: 'ref',
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
    const transaction = await SequelizeConnections['mysqlServer'].transaction();

    const invoiceDetailRecord = await InvoiceDetail.findOne({
      where: {
        id: inputs.id,
      },
      attributes: ['invoiceId', 'totalPrice'],
      transaction
    })
    .catch(async (err) => {
      await transaction.rollback();
      return exits.serverError(err);
    });

    if (!invoiceDetailRecord instanceof InvoiceDetail) {
      await transaction.rollback();

      return exits.invalid({
        message: 'Invoice Detail not found'
      });
    }

    const diffAmount = parseInt(inputs.totalPrice) - parseInt(invoiceDetailRecord.totalPrice);

    await InvoiceDetail.update(inputs, {
      where: {
        id: inputs.id,
      },
      transaction
    })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    const invoiceRecord = await Invoice.findOne({
      attributes: ['id'],
      where: {
        id: invoiceDetailRecord.invoiceId,
      },
      transaction
    })
    .catch(async (err) => {
      await transaction.rollback();
      return exits.serverError(err);
    });

    if (!invoiceRecord instanceof Invoice) {
      await transaction.rollback();

      return exits.invalid({
        message: 'Invoice not found'
      });
    }

    if (diffAmount) {
      await Invoice.increment({
        totalAmount: diffAmount
      },
      {
        where: {
          id: invoiceRecord.id
        }
      })
      .catch(async (err) => {
        await transaction.rollback();
        return exits.serverError(err);
      });
    }

    await InvoiceDetail.syncStoreItem(inputs, invoiceRecord.customerId, transaction)
    .catch(async (err) => {
      await transaction.rollback();
      return exits.serverError(err);
    });

    await transaction.commit();

    return exits.success({
      message: 'Invoice Detail updated successfully',
    });
  }


};
