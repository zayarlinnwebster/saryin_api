/**
 * Invoice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, DECIMAL, BOOLEAN } = require('sequelize');

module.exports = {

  attributes: {

    invoiceDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    totalAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalAmount must be required'
        },
        min: {
          args: [0],
          msg: 'totalAmount must be greater than or equal to 0',
        },
      }
    },

    isArchived: {
      type: BOOLEAN,
      defaultValue: false,
    },

  },

  associations: function () {

    Invoice.belongsTo(Customer, {
      as: 'customer',
      foreignKey: {
        name: 'customerId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'customerId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    Invoice.hasMany(InvoiceDetail, {
      as: 'invoiceDetails',
      foreignKey: {
        name: 'invoiceId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'invoiceId must be required'
          },
        }
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Invoice.belongsToMany(ArchivedInvoice, {
    //   through: ArchivedInvoiceInvoiceList,
    //   foreignKey: 'invoiceId',
    // });

  },

  options: {
    tableName: 'invoice',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {},
    instanceMethods: {},
    hooks: {
      beforeFind: async (options) => {
        // options.where = {
        //   isArchived: false,
        // };
      }
    },
    scopes: {},
  }

};

