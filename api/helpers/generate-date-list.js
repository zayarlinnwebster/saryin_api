module.exports = {


  friendlyName: 'Generate date list',


  description: '',


  inputs: {

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
      description: 'All done.',
    },

  },


  fn: async function ({
    fromDate, toDate
  }, exits) {

    const dateList = [];
    const currentDate = moment(fromDate, 'YYYY-MM-DD');
    const lastDate = moment(toDate, 'YYYY-MM-DD');

    while (currentDate.isSameOrBefore(lastDate)) {
      dateList.push(currentDate.format('DD MMM'));
      currentDate.add(1, 'day');
    }

    return exits.success(dateList);
  }


};

