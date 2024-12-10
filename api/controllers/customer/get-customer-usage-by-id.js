const { Op } = require('sequelize');

module.exports = {

  friendlyName: 'Get customer usage by id',

  description: '',

  inputs: {

    id: {
      type: 'number',
      required: true,
    },

    search: {
      type: 'string',
      defaultsTo: '',
    },

    fromDate: {
      type: 'ref',
      required: true,
    },

    toDate: {
      type: 'ref',
      required: true,
    },

    isArchived: {
      type: 'number',
      defaultsTo: 0, // Default to 0 (not archived)
    },

  },

  exits: {

    success: {
      statusCode: 200,
    },

    serverError: {
      responseType: 'serverError',
    },

  },

  fn: async function ({
    id, search, fromDate, toDate, isArchived
  }, exits) {
    search = search.trim() || '';

    // Retrieve the customer data to get the commission value
    const customer = await Customer.findOne({
      where: { id }
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    if (!customer) {
      return exits.serverError('Customer not found');
    }

    // Retrieve the total customer payment
    const totalCustomerPayment = await CustomerPayment.sum('paidAmount', {
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        },
        customerId: id,
        isArchived: isArchived, // Use the input value here
      }
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Retrieve the total customer invoice
    const totalCustomerInvoice = await InvoiceDetail.sum('totalPrice', {
      where: {
        [Op.or]: [
          {
            '$vendor.vendor_name$': {
              [Op.substring]: search,
            },
          },
        ],
        [Op.and]: [
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            '$invoice.customer_id$': id
          },
          {
            '$invoice.is_archived$': isArchived, // Use input value for isArchived
          },
          {
            isStoreItem: false,
          }
        ],
      },
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: [],
          required: true,
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: [],
          required: true,
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Retrieve the total stock invoice
    const totalStockInvoice = await StockItem.sum('StockItem.total_price', {
      where: {
        [Op.or]: [
          {
            '$invoiceDetail.vendor.vendor_name$': {
              [Op.substring]: search,
            },
            '$invoiceDetail.invoice.is_archived$': isArchived // Use input value here
          },
        ],
        [Op.and]: [
          {
            storedDate: {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            customerId: id
          }
        ],
      },
      include: [
        {
          model: InvoiceDetail,
          as: 'invoiceDetail',
          attributes: [],
          required: true,
          include: [
            {
              model: Vendor,
              as: 'vendor',
              attributes: [],
              required: true,
            },
            {
              model: Invoice,
              as: 'invoice',
              attributes: [],
              required: true,
            },
          ]
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Retrieve the total item count
    const totalItemCount = await InvoiceDetail.sum('qty', {
      where: {
        [Op.or]: [
          {
            '$vendor.vendor_name$': {
              [Op.substring]: search,
            },
          },
        ],
        [Op.and]: [
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            '$invoice.customer_id$': id
          },
          {
            '$invoice.is_archived$': isArchived, // Use input value here
          },
        ],
      },
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: [],
          required: true,
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: [],
          required: true,
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Retrieve the total cleared bill amount
    const totalBillClearedAmount = await InvoiceDetail.sum('totalPrice', {
      where: {
        [Op.and]: [
          {
            '$invoice.customer_id$': id,
          },
          {
            isBillCleared: true,
          },
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            '$invoice.is_archived$': isArchived, // Use input value here
          },
        ],
      },
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: [],
          required: true,
        },
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    // Calculate the total commission using the formula
    const totalCommission = Math.round(((totalCustomerInvoice + totalStockInvoice) * customer.commission) / 100);

    // Calculate the total left amount using the provided formula
    const totalLeftAmount = Math.round((totalCustomerInvoice + totalStockInvoice + totalCommission) - totalCustomerPayment);

    // Return the data, including totalBillClearedAmount, totalCommission, and totalLeftAmount
    return exits.success({
      totalCustomerInvoice,
      totalStockInvoice,
      totalCustomerPayment,
      totalItemCount,
      totalBillClearedAmount,
      totalCommission,
      totalLeftAmount,
    });
  }
};
