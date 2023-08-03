const ExcelJS = require('exceljs');
const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Export payment',


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

    const vendorPaymentSearch = {
      [Op.and]: [
        {
          paymentDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
      ],
      [Op.or]: [
        {
          '$vendor.vendor_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('vendor') !== -1) {
        orderTerm = [[{ model: Vendor, as: 'vendor' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const vendorPaymentList = await VendorPayment.findAll({
      attributes: [
        'id',
        'vendorId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `vendor`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        [literal('(SELECT SUM(`Invoice`.`total_amount`) FROM `invoice` AS `Invoice` WHERE `Invoice`.`vendor_id` = `vendor`.`id` AND (DATE(`invoice_date`) >= \'' + fromDate + '\' AND DATE(`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
      ],
      where: vendorPaymentSearch,
      subQuery: false,
      order: orderTerm,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalPaidAmount = vendorPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // Invoice Details Work Sheet Config
    const vendorPaymentsWorksheet = workbook.addWorksheet(`ပွဲရုံသွင်းငွေစာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    vendorPaymentsWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'paymentDate' },
      { header: 'ပွဲရုံအမည်', key: 'vendorName' },
      { header: 'သွင်းငွေ', key: 'paidAmount' },
      { header: 'ပေးဆောင်ပုံ', key: 'paidBy' },
      { header: 'ငွေလွှဲနံပါတ်', key: 'transactionNo' },
      { header: 'ကျန်ငွေ', key: 'leftAmount' },
    ];

    vendorPaymentsWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    vendorPaymentsWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    vendorPaymentsWorksheet.getRow(1).height = 20;
    vendorPaymentsWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    for (let vendorPayment of vendorPaymentList) {
      vendorPaymentsWorksheet.addRow({
        paymentDate: vendorPayment.paymentDate,
        vendorName: vendorPayment.vendor.vendorName,
        paidAmount: vendorPayment.paidAmount,
        paidBy: vendorPayment.paidBy,
        transactionNo: vendorPayment.transactionNo,
        leftAmount: Number(vendorPayment.dataValues.totalInvoiceAmount) - Number(vendorPayment.dataValues.totalPaidAmount),
      });
    }

    // pageSetup settings for A4 - landscape
    const totalInvoiceSummaryWorksheet = workbook.addWorksheet(`စုစုပေါင်းစာရင်းအနှစ်ချုပ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    totalInvoiceSummaryWorksheet.columns = [
      { header: 'စုစုပေါင်းသွင်းငွေတန်ဖိုး', key: 'totalPaidAmount' },
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
      totalPaidAmount: totalPaidAmount,
    });

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();

  },

};

