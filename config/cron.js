const local = require('./local');
const fs = require('fs');
const spawn = require('child_process').spawn;

module.exports.cron = {
  backupDB: {
    schedule: '*/15 * * * *',
    onTick: function () {
      let wstream = fs.createWriteStream('../backup/saryin_backup.sql');
      console.log(' cron: ', 'Running Database Backup Midnight');
      let mysqldump = spawn('mysqldump', [
        '-u',
        local.MYSQL_USERNAME,
        `-p${local.MYSQL_PASSWORD}`,
        local.MYSQL_DBNAME,
        `--no-create-info`
      ]);
      mysqldump
        .stdout
        .pipe(wstream)
        .on('finish', () => {
          console.log(' cron: ', 'Database Backup Completed');
        })
        .on('error', (err) => {
          console.error(err);
        });
    },
    runOnInit: true
  },

};
