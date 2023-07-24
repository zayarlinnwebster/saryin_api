/**
 * Invoice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { DATEONLY, NOW, DECIMAL } = require('sequelize');

module.exports = {

  attributes: {

    invoiceDate: {
      type: DATEONLY,
      defaultValue: NOW
    },

    totalItemAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalItemAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalItemAmount must be required'
        },
        min: {
          args: [0],
          msg: 'totalItemAmount must be greater than or equal to 0',
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

    commission: {
      type: DECIMAL(5, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'commission cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'commission must be required'
        },
        min: {
          args: [0],
          msg: 'commission must be greater than or equal to 0',
        },
        max: {
          args: [100],
          msg: 'commission must be less than or equal to 100',
        },
      }
    },

    commissionFee: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'commissionFee cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'commissionFee must be required'
        },
        min: {
          args: [0],
          msg: 'commissionFee must be greater than or equal to 0',
        },
      }
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

  },

  associations: function () {

    Invoice.belongsTo(Vendor, {
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
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

  },

  options: {
    tableName: 'invoice',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {},
  }

};

