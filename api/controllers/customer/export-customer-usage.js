const ExcelJS = require('exceljs');
const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Export customer usage',


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
    id, search, fromDate, toDate
  }, exits) {

    const customerPaymentList = await CustomerPayment.findAll({
      attributes: [
        'id',
        'customerId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        [literal('(SELECT SUM(`CustomerPayment`.`paid_amount`) FROM `customer_payment` AS `CustomerPayment` WHERE `CustomerPayment`.`customer_id` = `customer`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        // eslint-disable-next-line quotes
        [literal("(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`customer_id` = `customer`.`id` AND (DATE(`Invoice`.`invoice_date`) >= '" + fromDate + "' AND DATE(`Invoice`.`invoice_date`) <= '" + toDate + "'))"), 'totalInvoiceAmount'],
      ],
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        },
        customerId: id
      },
      subQuery: false,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalPaidAmount = customerPaymentList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.paidAmount), 0);

    const invoiceDetailList = await InvoiceDetail.findAll({
      where: {
        [Op.and]: [
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            customerId: id
          }
        ],
        [Op.or]: [
          {
            '$invoice.vendor.vendor_name$': {
              [Op.substring]: search,
            },
          },
        ],
      },
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
      { header: 'စုစုပေါင်းလွှဲငွေတန်ဖိုး', key: 'totalPaidAmount' },
      { header: 'စုစုပေါင်းကုန်တန်ဖိုး', key: 'totalInvoiceDetailAmount' },
      { header: 'ကော်မရှင် (ရာခိုင်နှုန်း)', key: 'commission' },
      { header: 'ကော်မရှင်ခ', key: 'totalCommissionAmount' },
      { header: 'စုစုပေါင်းကျန်ငွေ', key: 'totalLeftAmount' },
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

    const customerCommission = invoiceDetailList[0].customer.commission;
    const totalCommissionAmount = (totalInvoiceDetailAmount * customerCommission) / 100;

    totalInvoiceSummaryWorksheet.addRow({
      totalPaidAmount: totalPaidAmount,
      totalInvoiceDetailAmount: totalInvoiceDetailAmount,
      commission: customerCommission + ' %',
      totalCommissionAmount: totalCommissionAmount,
      totalLeftAmount: Number(totalInvoiceDetailAmount) - Number(totalPaidAmount) + Number(totalCommissionAmount),
    });

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();

  }


};
