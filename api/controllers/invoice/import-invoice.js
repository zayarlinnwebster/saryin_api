module.exports = {


  friendlyName: 'Import invoice',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      statusCode: 200,
    },

    serverError: {
      responseType: 'serverError',
    },

    invalidValidation: {
      responseType: 'invalidValidation',
    }

  },


  fn: async function (inputs) {
    const studentAdmissionExcelFile = this.req.file('importFile');

    if (studentAdmissionExcelFile._files.length === 1) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.read(studentAdmissionExcelFile._files[0].stream);
      const worksheet = await workbook.getWorksheet(1);

      let invoiceList = [];
      await worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber > 1) {
          invoiceList.push({
            studentId: row.values[1],
            yearId: row.values[3],
            enrollmentDate: row.values[4],
            withdrawalDate: row.values[5],
            createdBy
          });
        }
      });

      if (invoiceList.length > 0) {
        await StudentAdmission.bulkCreate(invoiceList)
          .catch((err) => {
            return exits.invalidValidation(err);
          });
      }

      return exits.success({
        message: 'Student Admission data imported successfully'
      });
    } else {
      studentAdmissionExcelFile.noMoreFiles();
      return exits.invalid({
        message: 'Import File must be required',
      });
    }


  }


};
