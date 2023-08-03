const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Export invoice detail',


  description: '',


  inputs: {

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

    column: {
      type: 'string',
      defaultsTo: '',
    },

    direction: {
      type: 'string',
      defaultsTo: '',
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
    search, fromDate, toDate, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    const invoiceSearch = {
      [Op.and]: [
        {
          '$invoice.invoice_date$': {
            [Op.between]: [fromDate, toDate]
          },
        }],
      [Op.or]: [
        {
          '$invoice.vendor.vendor_name$': {
            [Op.substring]: search,
          },
        },
        {
          '$customer.full_name$': {
            [Op.substring]: search,
          },
        },
        {
          '$item.item_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[{ model: Invoice, as: 'invoice' }, { model: Vendor, as: 'vendor' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else if (column.indexOf('item') !== -1) {
        orderTerm = [[{ model: Item, as: 'item' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else if (column.indexOf('customer') !== -1) {
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const invoiceDetailList = await InvoiceDetail.findAll({
      where: invoiceSearch,
      order: orderTerm,
      subQuery: false,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: Invoice,
          as: 'invoice',
          required: true,
          attributes: ['invoiceNo', 'invoiceDate'],
          include: [
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'vendorName'],
              required: true,
            },
          ]
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName']
        }
      ]
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalInvoiceDetailAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.totalPrice), 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // Invoice Details Work Sheet Config
    const invoiceDetailsWorksheet = workbook.addWorksheet(`နယ်ပို့စာရင်းအသေးစိတ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    invoiceDetailsWorksheet.columns = [
      { header: 'နယ်ပို့နံပါတ်', key: 'invoiceNo' },
      { header: 'ရက်စွဲ', key: 'invoiceDate' },
      { header: 'ပွဲရုံအမည်', key: 'vendorName' },
      { header: 'ကုန်သည်အမည်', key: 'customerName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'အရေအတွက်', key: 'qty' },
      { header: 'စျေးနှုန်း', key: 'unitPrice' },
      { header: 'အလေးချိန်', key: 'weight' },
      { header: 'စုစုပေါင်းတန်ဖိုး', key: 'totalPrice' },
    ];

    invoiceDetailsWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    invoiceDetailsWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    invoiceDetailsWorksheet.getRow(1).height = 20;
    invoiceDetailsWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    for (let invoiceDetail of invoiceDetailList) {
      invoiceDetailsWorksheet.addRow({
        invoiceNo: invoiceDetail.invoice.invoiceNo,
        invoiceDate: invoiceDetail.invoice.invoiceDate,
        vendorName: invoiceDetail.invoice.vendor.vendorName,
        customerName: invoiceDetail.customer.fullName,
        itemName: invoiceDetail.item.itemName,
        qty: invoiceDetail.qty,
        unitPrice: invoiceDetail.unitPrice,
        weight: invoiceDetail.weight,
        totalPrice: invoiceDetail.totalPrice,
      });
    }

    // pageSetup settings for A4 - landscape
    const totalInvoiceSummaryWorksheet = workbook.addWorksheet(`စုစုပေါင်းစာရင်းအနှစ်ချုပ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    totalInvoiceSummaryWorksheet.columns = [
      { header: 'စုစုပေါင်းတန်ဖိုး', key: 'totalInvoiceDetailAmount' },
    ];

    totalInvoiceSummaryWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    totalInvoiceSummaryWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    totalInvoiceSummaryWorksheet.getRow(1).height = 20;
    totalInvoiceSummaryWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    totalInvoiceSummaryWorksheet.addRow({
      totalInvoiceDetailAmount: totalInvoiceDetailAmount,
    });

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();
  },

};
