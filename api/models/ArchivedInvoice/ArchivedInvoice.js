// /**
//  * ArchivedInvoice/ArchivedInvoice.js
//  *
//  * @description :: A model definition represents a database table/collection.
//  * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
//  */
// const { DATEONLY, NOW, DECIMAL } = require('sequelize');

// module.exports = {

//   attributes: {

//     archivedInvoiceDate: {
//       type: DATEONLY,
//       defaultValue: NOW
//     },

//     totalAmount: {
//       type: DECIMAL(19, 2).UNSIGNED,
//       allowNull: false,
//       validate: {
//         notEmpty: {
//           args: true,
//           msg: 'totalAmount cannot be empty'
//         },
//         notNull: {
//           args: true,
//           msg: 'totalAmount must be required'
//         },
//         min: {
//           args: [0],
//           msg: 'totalAmount must be greater than or equal to 0',
//         },
//       }
//     },

//   },

//   associations: function () {

//     ArchivedInvoice.belongsTo(Customer, {
//       as: 'customer',
//       foreignKey: {
//         name: 'customerId',
//         allowNull: false,
//         validate: {
//           notNull: {
//             args: true,
//             msg: 'customerId must be required'
//           },
//         }
//       },
//       onDelete: 'RESTRICT',
//       onUpdate: 'CASCADE',
//     });

//     ArchivedInvoice.belongsToMany(Invoice, {
//       through: ArchivedInvoiceInvoiceList,
//       foreignKey: 'archivedInvoiceId',
//     });

//     ArchivedInvoice.belongsToMany(CustomerPayment, {
//       through: ArchivedInvoicePaymentList,
//       foreignKey: 'archivedInvoiceId',
//     });

//   },

//   options: {
//     tableName: 'archived_invoice',
//     charset: 'utf8',
//     collate: 'utf8_general_ci',
//     underscored: true,
//     timestamps: true,
//     classMethods: {},
//     instanceMethods: {},
//     hooks: {},
//     scopes: {},
//   }

// };
