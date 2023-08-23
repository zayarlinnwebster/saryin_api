const ExcelJS = require('exceljs');
const { literal, Op } = require('sequelize');

module.exports = {


  friendlyName: 'Export store usage',


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
    // eslint-disable-next-line no-unused-vars
    id, search, fromDate, toDate
  }, exits) {

    const stockItemList = await StockItem.findAll({
      attributes: [
        'id',
        'storedDate',
        'unitPrice',
        'qty',
        'weight',
        'itemId',
        'storeId',
        'customerId',
        'totalPrice',
        [literal('(SELECT SUM(`StockItemOut`.`qty`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalQtyOut'],
        [literal('(SELECT SUM(`StockItemOut`.`weight`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalWeightOut']
      ],
      where: {
        storedDate: {
          [Op.between]: [fromDate, toDate]
        },
        storeId: id
      },
      subQuery: false,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName'],
          required: true,
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'commission'],
          required: true,
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'storeName'],
          required: true,
        },
        {
          model: StockItemOut,
          as: 'outItems',
          required: false,
        }
      ],
    }).catch((err) => {
      console.log(err);
      return exits.serverError(err);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = this.req.user.username;
    workbook.modified = new Date();

    // Invoice Details Work Sheet Config
    const customerPaymentsWorksheet = workbook.addWorksheet(`လှောင်ကုန်စာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    customerPaymentsWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'storedDate' },
      { header: 'ကုန်သည်အမည်', key: 'fullName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'စျေးနှုန်း', key: 'unitPrice' },
      { header: 'အလေးချိန်', key: 'qty' },
      { header: 'စုစုပေါင်းစျေးနှုန်း', key: 'totalPrice' },
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

    // Invoice Details Work Sheet Config
    const stockItemOutsWorksheet = workbook.addWorksheet(`လှောင်ကုန်ထုတ်စာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    stockItemOutsWorksheet.columns = [
      { header: 'ရက်စွဲ', key: 'outDate' },
      { header: 'ကုန်သည်အမည်', key: 'fullName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'စျေးနှုန်း', key: 'unitPrice' },
      { header: 'အရေအတွက်', key: 'qty' },
      { header: 'အလေးချိန်', key: 'weight' },
      { header: 'ပွဲခ (ရာခိုင်နှုန်း)', key: 'commission' },
      { header: 'ပွဲခ', key: 'commissionFee' },
      { header: 'စုစုပေါင်းတန်ဖိုး', key: 'totalPrice' },
    ];

    stockItemOutsWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    stockItemOutsWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    stockItemOutsWorksheet.getRow(1).height = 20;
    stockItemOutsWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    for (let stockItem of stockItemList) {
      customerPaymentsWorksheet.addRow({
        storedDate: stockItem.storedDate,
        fullName: stockItem.customer.fullName,
        itemName: stockItem.item.itemName,
        unitPrice: stockItem.unitPrice,
        qty: stockItem.qty,
        weight: stockItem.weight,
        totalPrice: stockItem.totalPrice,
      });

      if (stockItem.outItems.length > 0) {
        for (let outItem of stockItem.outItems) {
          stockItemOutsWorksheet.addRow({
            outDate: outItem.outDate,
            fullName: stockItem.customer.fullName,
            itemName: stockItem.item.itemName,
            qty: outItem.qty,
            unitPrice: outItem.unitPrice,
            weight: outItem.weight,
            commission: outItem.commission,
            commissionFee: outItem.commissionFee,
            totalPrice: outItem.totalPrice,
          });
        }
      }
    }

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();

  }


};
