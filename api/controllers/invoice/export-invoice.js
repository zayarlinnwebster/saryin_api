const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

module.exports = {


  friendlyName: 'Export invoice',


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
          invoiceDate: {
            [Op.between]: [fromDate, toDate]
          },
        }],
      [Op.or]: [
        {
          '$customer.full_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[
          { model: Vendor, as: 'vendor' },
          column.substr(column.indexOf('.') + 1), direction.toUpperCase()
        ]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const invoiceList = await Invoice.findAll({
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
          model: InvoiceDetail,
          as: 'invoiceDetails',
          include: [
            {
              model: Item,
              as: 'item',
              attributes: ['id', 'itemName']
            },
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['id', 'vendorName'],
            },
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalInvoiceAmount = invoiceList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.totalAmount), 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // pageSetup settings for A4 - landscape
    const invoiceListWorksheet = workbook.addWorksheet(`နယ်ပို့စာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    invoiceListWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'invoiceDate' },
      { header: 'ကုန်သည်အမည်', key: 'customerName' },
      { header: 'သင့်ငွေ', key: 'totalAmount' },
    ];

    invoiceListWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    invoiceListWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    invoiceListWorksheet.getRow(1).height = 20;
    invoiceListWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Invoice Details Work Sheet Config
    const invoiceDetailsWorksheet = workbook.addWorksheet(`နယ်ပို့စာရင်းအသေးစိတ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    invoiceDetailsWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'invoiceDate' },
      { header: 'ပွဲရုံအမည်', key: 'vendorName' },
      { header: 'ကုန်သည်အမည်', key: 'customerName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'အရေအတွက်', key: 'qty' },
      { header: 'အလေးချိန်', key: 'weight' },
      { header: 'စျေးနှုန်း', key: 'unitPrice' },
      { header: 'အလုပ်သမားခ', key: 'laborFee' },
      { header: 'အထွေထွေခ', key: 'generalFee' },
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

    for (let invoice of invoiceList) {
      invoiceListWorksheet.addRow({
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customer.fullName,
        totalAmount: invoice.totalAmount,
      });

      for (let invoiceDetail of invoice.invoiceDetails) {
        invoiceDetailsWorksheet.addRow({
          invoiceDate: invoice.invoiceDate,
          customerName: invoice.customer.fullName,
          vendorName: invoiceDetail.vendor.vendorName,
          itemName: invoiceDetail.item.itemName,
          qty: invoiceDetail.qty,
          unitPrice: invoiceDetail.unitPrice,
          weight: invoiceDetail.weight,
          laborFee: invoiceDetail.laborFee,
          generalFee: invoiceDetail.generalFee,
          totalPrice: invoiceDetail.totalPrice,
        });
      }
    }

    // pageSetup settings for A4 - landscape
    const totalInvoiceSummaryWorksheet = workbook.addWorksheet(`စုစုပေါင်းစာရင်းအနှစ်ချုပ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    totalInvoiceSummaryWorksheet.columns = [
      { header: 'စုစုပေါင်းသင့်ငွေ', key: 'totalInvoiceAmount' },
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
      totalInvoiceAmount: totalInvoiceAmount,
    });

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();
  },

};
