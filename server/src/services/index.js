let AWS = require('aws-sdk');
let path = require("path");
let { config } = global.appContext;

const uploadFileToS3 = (fileData, filename) => {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3();
    let params = {
      Bucket: config.thumbnail.s3_bucket,
      Key: filename,
      Body: fileData
    };
    if (path.extname(filename) === '.html') {
      params = Object.assign(params, { ContentType: "text/html" });
    }

    s3.upload(params, (err, data) => {
      if (err) {
        console.log('Error when uploading to S3:', err);
        reject(err);
      } else {
        console.log('Successfully uploaded data:', data);
        resolve(data);
      }
    });
  });
};

module.exports = {
  uploadFileToS3
};
