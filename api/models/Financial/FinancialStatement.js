/**
 * Financial/FinancialStatement.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { DATEONLY, TEXT, DECIMAL, INTEGER, VIRTUAL } = require('sequelize');

module.exports = {

  attributes: {

    financialStartDate: {
      type: DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'financialStartDate cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'financialStartDate must be required'
        },
      }
    },

    financialEndDate: {
      type: DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'financialStartDate cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'financialStartDate must be required'
        },
      }
    },

    remark: {
      type: TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 65535],
          msg: 'remark must be less than 65,535 characters'
        }
      },
    },

    totalStockInvoice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalStockInvoice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalStockInvoice must be required'
        },
        min: {
          args: [0],
          msg: 'totalStockInvoice must be greater than or equal to 0',
        },
      }
    },

    totalCustomerInvoice: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalCustomerInvoice cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalCustomerInvoice must be required'
        },
        min: {
          args: [0],
          msg: 'totalCustomerInvoice must be greater than or equal to 0',
        },
      }
    },

    totalBillClearedAmount: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalBillClearedAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalBillClearedAmount must be required'
        },
        min: {
          args: [0],
          msg: 'totalBillClearedAmount must be greater than or equal to 0',
        },
      }
    },

    totalCustomerPayment: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalCustomerPayment cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalCustomerPayment must be required'
        },
        min: {
          args: [0],
          msg: 'totalCustomerPayment must be greater than or equal to 0',
        },
      }
    },

    totalLeftAmount: {
      type: DECIMAL(19, 2),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalLeftAmount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalLeftAmount must be required'
        },
      }
    },

    totalCommission: {
      type: DECIMAL(19, 2).UNSIGNED,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalCommission cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalCommission must be required'
        },
        min: {
          args: [0],
          msg: 'totalCommission must be greater than or equal to 0',
        },
      }
    },

    totalItemCount: {
      type: INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'totalItemCount cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'totalItemCount must be required'
        },
        min: {
          args: [0],
          msg: 'totalItemCount must be greater than or equal to 0',
        },
      }
    },

  },

  associations: function () {

    FinancialStatement.belongsTo(Customer, {
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

    FinancialStatement.hasMany(CustomerPayment, {
      as: 'customerPayments',
      foreignKey: {
        name: 'financialStatementId',
        allowNull: true,
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    FinancialStatement.hasMany(Invoice, {
      as: 'invoices',
      foreignKey: {
        name: 'financialStatementId',
        allowNull: true,
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

  },


  options: {
    tableName: 'financial_statement',
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

