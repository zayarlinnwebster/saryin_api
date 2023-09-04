module.exports = {


  friendlyName: 'Create invoice',


  description: '',


  inputs: {

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

    const createdInvoice = await Invoice.create(inputs, {
      transaction
    })
      .catch(async (err) => {
        console.log(err);
        await transaction.rollback();
        return exits.invalidValidation(err);
      });

    if (createdInvoice instanceof Invoice) {
      const stockItemList = [];

      for (let invoiceDetail of inputs.invoiceDetails) {
        const createdInvoiceDetail = await InvoiceDetail.create({
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

        if (invoiceDetail.isStoreItem) {
          stockItemList.push({
            storedDate: invoiceDetail.storedDate,
            qty: invoiceDetail.qty,
            weight: invoiceDetail.weight,
            unitPrice: invoiceDetail.unitPrice,
            itemId: invoiceDetail.itemId,
            customerId: inputs.customerId,
            storeId: invoiceDetail.storeId,
            invoiceDetailId: createdInvoiceDetail.id,
            totalPrice: invoiceDetail.totalPrice
          });
        }
      }

      await StockItem.bulkCreate(stockItemList, { transaction })
        .catch(async (err) => {
          console.log(err);
          await transaction.rollback();
          return exits.invalidValidation(err);
        });

      await transaction.commit();

      return exits.success({
        message: 'Invoice created successfully.',
      });
    }

  }


};
