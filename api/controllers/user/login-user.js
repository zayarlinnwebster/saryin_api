const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs').promises;

module.exports = {


  friendlyName: 'Login user',


  description: '',


  inputs: {

    username: {
      type: 'string',
      required: true,
    },

    password: {
      type: 'string',
      required: true,
    }

  },


  exits: {

    success: {
      statusCode: 201,
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    },

    serverError: {
      responseType: 'serverError',
    },

    invalid: {
      responseType: 'badRequest',
    },

    unauthorized: {
      statusCode: 401,
    },

  },


  fn: async function ({
    username,
    password,
  }, exits) {

    const user = await User.scope('withPassword').findOne({
      where: {
        username: username
      },
    }).catch((err) => {
      return exits.invalid(err);
    });

    if (!user) {
      return exits.unauthorized({
        message: 'အသုံးပြုသူအမည် မှားယွင်းနေပါသည်။',
      });
    } else if (!user.isActive) {
      return exits.unauthorized({
        message: 'အသုံးပြုသူအကောင့်ကို ပိတ်ထားသည်။',
      });
    }

    const isValidate = await user.validatePassword(password);

    if (!isValidate) {
      return exits.unauthorized({
        message: 'လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။'
      });
    }

    const PAYLOAD = {
      id: user.id,
      username: user.username,
    };

    const privateKeyPath = path.resolve(__dirname, '../../../cert/private.pem');

    const privateKey = await fs.readFile(privateKeyPath)
      .catch((err) => {
        console.log(err);
        return exits.serverError(err);
      });

    const TOKEN = jwt.sign(PAYLOAD, privateKey, {
      algorithm: 'RS256',
      expiresIn: '24h',
    });

    if (TOKEN) {
      return exits.success({
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          token: TOKEN,
          expiresAt: 24,
        }
      });
    }
  }


};
