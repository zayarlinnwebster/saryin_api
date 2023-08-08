const ExcelJS = require('exceljs');
const { Op, literal } = require('sequelize');

module.exports = {


  friendlyName: 'Export stock item',


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

    storeId: {
      type: 'number',
      allowNull: true,
    }

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
    search, storeId, fromDate, toDate, column, direction
  }, exits) {

    search = search.trim() || '';
    let orderTerm = [];

    if (column && direction) {
      console.log(column.indexOf('storedDate'));
      if (column.indexOf('item') !== -1) {
        orderTerm = [[{ model: Item, as: 'item' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else if (column.indexOf('customer') !== -1) {
        orderTerm = [[{ model: Customer, as: 'customer' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else if (column.indexOf('store') !== -1 && column.indexOf('storedDate') === -1) {
        orderTerm = [[{ model: Store, as: 'store' }, column.substr(column.indexOf('.') + 1), direction.toUpperCase()]];
      } else {
        orderTerm = [[column, direction.toUpperCase()]];
      }
    }

    const stockItemList = await StockItem.findAll({
      attributes: [
        'id',
        'storedDate',
        'qty',
        'weight',
        'itemId',
        'storeId',
        'customerId',
        [literal('(SELECT SUM(`StockItemOut`.`qty`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalQtyOut'],
        [literal('(SELECT SUM(`StockItemOut`.`weight`) FROM `stock_item_out` as `StockItemOut` WHERE `StockItemOut`.`stock_item_id` = `StockItem`.`id`)'), 'totalWeightOut'],
      ],
      where: {
        [Op.and]: [
          {
            storedDate: {
              [Op.between]: [fromDate, toDate]
            },
          },
          storeId && { storeId }
        ],
        [Op.or]: [
          {
            '$item.item_name$': {
              [Op.substring]: search,
            },
          },
          {
            '$customer.full_name$': {
              [Op.substring]: search,
            },
          },
        ],
      },
      subQuery: false,
      order: orderTerm,
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

    // pageSetup settings for A4 - landscape
    const stockItemListWorksheet = workbook.addWorksheet(`လှောင်ကုန်စာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    stockItemListWorksheet.columns = [
      { header: 'ရက်စွဲ (သွင်း)', key: 'storedDate' },
      { header: 'ကုန်သည်အမည်', key: 'fullName' },
      { header: 'သိုလှောင်ရုံအမည်', key: 'storeName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'အရေအတွက်', key: 'qty' },
      { header: 'အလေးချိန်', key: 'weight' },
    ];

    stockItemListWorksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
      column.font = {
        name: 'Arial',
        size: 11,
      };
    });

    stockItemListWorksheet.getRow(1).font = {
      name: 'Arial',
      bold: true,
      size: 11
    };
    stockItemListWorksheet.getRow(1).height = 20;
    stockItemListWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Invoice Details Work Sheet Config
    const stockItemOutsWorksheet = workbook.addWorksheet(`လှောင်ကုန်ထုတ်စာရင်းများ`, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    stockItemOutsWorksheet.columns = [
      { header: 'ရက်စွဲ (ထုတ်)', key: 'outDate' },
      { header: 'ကုန်သည်အမည်', key: 'fullName' },
      { header: 'သိုလှောင်ရုံအမည်', key: 'storeName' },
      { header: 'ငါးအမည်', key: 'itemName' },
      { header: 'အရေအတွက်', key: 'qty' },
      { header: 'အလေးချိန်', key: 'weight' },
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
      stockItemListWorksheet.addRow({
        storedDate: stockItem.storedDate,
        fullName: stockItem.customer.fullName,
        storeName: stockItem.store.storeName,
        itemName: stockItem.item.itemName,
        qty: stockItem.qty,
        weight: stockItem.weight,
      });

      for (let outItem of stockItem.outItems) {
        stockItemOutsWorksheet.addRow({
          outDate: outItem.outDate,
          fullName: stockItem.customer.fullName,
          storeName: stockItem.store.storeName,
          itemName: stockItem.item.itemName,
          qty: outItem.qty,
          weight: outItem.weight,
        });
      }
    }

    const fileName = `SarYin(${new Date(fromDate).toDateString()} To ${new Date(toDate).toDateString()}).xlsx`;

    this.res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    this.res.set('Content-Disposition', 'attachment; filename=' + fileName);

    await workbook.xlsx.write(this.res);

    this.res.end();

  },

};
