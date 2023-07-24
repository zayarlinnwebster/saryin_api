/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const bcrypt = require('bcrypt');
const { STRING, BOOLEAN } = require('sequelize');

module.exports = {

  attributes: {

    username: {
      type: STRING(20),
      unique: {
        msg: 'username must be unique',
      },
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'username cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'username must be required'
        },
        len: {
          args: [0, 50],
          msg: 'username must be less than 20 characters'
        }
      }
    },

    password: {
      type: STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'password cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'password must be required'
        },
        len: {
          args: [0, 100],
          msg: 'password must be less than 100 characters'
        }
      }
    },

    isActive: {
      type: BOOLEAN,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'is active cannot be empty'
        },
        notNull: {
          args: true,
          msg: 'is active must be required'
        },
      }
    },

  },

  options: {
    tableName: 'user',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    underscored: true,
    timestamps: true,
    classMethods: {},
    instanceMethods: {
      validatePassword: async function (password) {
        return await bcrypt.compare(password, this.password);
      },
    },
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      }
    },
  }

};
