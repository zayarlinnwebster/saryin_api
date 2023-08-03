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

    const customerPaymentSearch = {
      [Op.and]: [
        {
          paymentDate: {
            [Op.between]: [fromDate, toDate]
          },
        },
      ],
      [Op.or]: [
        {
          '$customer.full_name$': {
            [Op.substring]: search,
          },
        },
      ],
    };

    if (column && direction) {
      if (column.indexOf('customer') !== -1) {
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const customerPaymentList = await CustomerPayment.findAll({
      attributes: [
        'id',
        'customerId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `customer`.`id` AND (DATE(`payment_date`) >= '" + fromDate + "' AND DATE(`payment_date`) <= '" + toDate + "'))"), 'totalPaidAmount'],
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`customer_id` = `customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= '" + fromDate + "' AND DATE(`Invoice`.`invoice_date`) <= '" + toDate + "'))"), 'totalInvoiceAmount'],
      ],
      where: customerPaymentSearch,
      subQuery: false,
      order: orderTerm,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalPaidAmount = customerPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // Invoice Details Work Sheet Config
    const customerPaymentsWorksheet = workbook.addWorksheet(`ကုန်သည်လွှဲငွေစာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    customerPaymentsWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'paymentDate' },
      { header: 'ကုန်သည်အမည်', key: 'fullName' },
      { header: 'လွှဲငွေ', key: 'paidAmount' },
      { header: 'ပေးဆောင်ပုံ', key: 'paidBy' },
      { header: 'ငွေလွှဲနံပါတ်', key: 'transactionNo' },
      { header: 'ကျန်ငွေ', key: 'leftAmount' },
    ];

    customerPaymentsWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    customerPaymentsWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    customerPaymentsWorksheet.getRow(1).height = 20;
    customerPaymentsWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    for (let customerPayment of customerPaymentList) {
      customerPaymentsWorksheet.addRow({
        paymentDate: customerPayment.paymentDate,
        fullName: customerPayment.customer.fullName,
        paidAmount: customerPayment.paidAmount,
        paidBy: customerPayment.paidBy,
        transactionNo: customerPayment.transactionNo,
        leftAmount: Number(customerPayment.dataValues.totalInvoiceAmount) - Number(customerPayment.dataValues.totalPaidAmount),
      });
    }

    // pageSetup settings for A4 - landscape
    const totalInvoiceSummaryWorksheet = workbook.addWorksheet(`စုစုပေါင်းစာရင်းအနှစ်ချုပ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    totalInvoiceSummaryWorksheet.columns = [
      { header: 'စုစုပေါင်းလွှဲငွေတန်ဖိုး', key: 'totalPaidAmount' },
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

