/**
 * Invoice/InvoiceDetail.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { INTEGER, DECIMAL } = require('sequelize');

module.exports = {

  attributes: {

    qty: {
      type: INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'qty cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'qty must be required'
        },
        min: {
          args: [1],
          msg: 'qty must be greater than or equal to 1',
        },
      }
    },

    weight: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'weight cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'weight must be required'
        }
      }
    },

    unitPrice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'unitPrice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'unitPrice must be required'
        },
        min: {
          args: [0],
          msg: 'unitPrice must be greater than or equal to 0',
        },
      }
    },

    totalPrice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalPrice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalPrice must be required'
        },
        min: {
          args: [0],
          msg: 'totalPrice must be greater than or equal to 0',
        },
      }
    },

    laborFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'laborFee cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'laborFee must be required'
        },
        min: {
          args: [0],
          msg: 'laborFee must be greater than or equal to 0',
        },
      }
    },

    generalFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'generalFee cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'generalFee must be required'
        },
        min: {
          args: [0],
          msg: 'generalFee must be greater than or equal to 0',
        },
      }
    },

  },

  associations: function () {

    InvoiceDetail.belongsTo(Invoice, {
      as: 'invoice',
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

    InvoiceDetail.belongsTo(Vendor, {
      as: 'vendor',
      foreignKey: {
        name: 'vendorId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'vendorId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    InvoiceDetail.belongsTo(Item, {
      as: 'item',
      foreignKey: {
        name: 'itemId',
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'itemId must be required'
          },
        }
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'invoice_detail',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

