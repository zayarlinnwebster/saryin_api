const ExcelJS = require('exceljs');
const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Export vendor usage',


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
    id, fromDate, toDate
  }, exits) {

    const vendorPaymentList = await VendorPayment.findAll({
      attributes: [
        'id',
        'vendorId',
        'paidBy',
        'paidAmount',
        'transactionNo',
        'paymentDate',
        [literal('(SELECT SUM(`VendorPayment`.`paid_amount`) FROM `vendor_payment` AS `VendorPayment` WHERE `VendorPayment`.`vendor_id` = `vendor`.`id` AND (DATE(`payment_date`) >= \'' + fromDate + '\' AND DATE(`payment_date`) <= \'' + toDate + '\'))'), 'totalPaidAmount'],
        [literal('(SELECT SUM(`InvoiceDetail`.`total_price`) FROM `invoice` AS `Invoice` INNER JOIN `invoice_detail` as `InvoiceDetail` ON `Invoice`.`id` = `InvoiceDetail`.`invoice_id` WHERE `InvoiceDetail`.`vendor_id` = `vendor`.`id` AND (DATE(`Invoice`.`invoice_date`) >= \'' + fromDate + '\' AND DATE(`Invoice`.`invoice_date`) <= \'' + toDate + '\'))'), 'totalInvoiceAmount'],
      ],
      where: {
        paymentDate: {
          [Op.between]: [fromDate, toDate]
        },
        vendorId: id
      },
      subQuery: false,
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

    const invoiceDetailList = await InvoiceDetail.findAll({
      where: {
        [Op.and]: [
          {
            '$invoice.invoice_date$': {
              [Op.between]: [fromDate, toDate]
            },
          },
          {
            vendorId: id
          }
        ],
      },
      subQuery: false,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'vendorName'],
          required: true,
        },
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
        {
          model: Invoice,
          as: 'invoice',
          required: true,
          include: [
            {
              model: Customer,
              as: 'customer',
              attributes: ['id', 'fullName', 'commission'],
              required: true,
            },
          ]
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const totalInvoiceDetailAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.totalPrice), 0);

    const totalGeneralAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.generalFee), 0);

    const totalLaborAmount = invoiceDetailList.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.laborFee), 0);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // Invoice Details Work Sheet Config
    const invoiceDetailsWorksheet = workbook.addWorksheet(`နယ်ပို့စာရင်းအသေးစိတ်`, {
      pageSetup: {
        paperSize: 9, orientation: 'landscape'
      }
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

    for (let invoiceDetail of invoiceDetailList) {
      invoiceDetailsWorksheet.addRow({
        invoiceDate: invoiceDetail.invoice.invoiceDate,
        vendorName: invoiceDetail.vendor.vendorName,
        customerName: invoiceDetail.invoice.customer.fullName,
        itemName: invoiceDetail.item.itemName,
        qty: invoiceDetail.qty,
        unitPrice: invoiceDetail.unitPrice,
        weight: invoiceDetail.weight,
        laborFee: invoiceDetail.laborFee,
        generalFee: invoiceDetail.generalFee,
        totalPrice: invoiceDetail.totalPrice,
      });
    }

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
      });
    }

    // pageSetup settings for A4 - landscape
    const totalInvoiceSummaryWorksheet = workbook.addWorksheet(`စုစုပေါင်းစာရင်းအနှစ်ချုပ်`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    totalInvoiceSummaryWorksheet.columns = [
      { header: 'စုစုပေါင်းအလုပ်သမား အခကြေးငွေ', key: 'totalLaborAmount' },
      { header: 'စုစုပေါင်းအထွေထွေ အခကြေးငွေ', key: 'totalGeneralAmount' },
      { header: 'စုစုပေါင်းတန်ဖိုး ', key: 'totalInvoiceDetailAmount' },
      { header: 'စုစုပေါင်းသွင်းငွေတန်ဖိုး', key: 'totalPaidAmount' },
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

    totalInvoiceSummaryWorksheet.addRow({
      totalPaidAmount: totalPaidAmount,
      totalLaborAmount: totalLaborAmount,
      totalGeneralAmount: totalGeneralAmount,
      totalInvoiceDetailAmount: totalInvoiceDetailAmount,
      totalLeftAmount: Number(totalInvoiceDetailAmount) - Number(totalPaidAmount),
    });

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();

  }


};
