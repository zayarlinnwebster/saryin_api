// /**
//  * ArchivedInvoice/ArchivedInvoiceInvoiceList.js
//  *
//  * @description :: A model definition represents a database table/collection.
//  * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
//  */

// module.exports = {

//   attributes: {

//     archivedInvoiceId: {
//       type: 'INTEGER',
//       references: {
//         model: 'archived_invoice',
//         key: 'id'
//       },
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE'
//     },

//     invoiceId: {
//       type: 'INTEGER',
//       references: {
//         model: 'invoice',
//         key: 'id'
//       },
//       onDelete: 'CASCADE',
//       onUpdate: 'CASCADE'
//     },

//   },

//   associations: function () {

//   },

//   options: {
//     tableName: 'archived_invoice_invoice_list',
//     charset: 'utf8',
//     collate: 'utf8_general_ci',
//     underscored: true,
//     timestamps: false,
//     classMethods: {},
//     instanceMethods: {},
//     hooks: {},
//     scopes: {},
//   }

// };

