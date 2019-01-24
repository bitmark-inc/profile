const path = require('path');
const { config } = global.appContext;

module.exports = {
  getIdentities: (req, res) => {
    res.send({ identities: require(path.join(global.appContext.root, config.identities_file_path)) });
  },
  getIdentity: (req, res) => {
    let accountNumber = req.params.accountNumber;
    let constIdentities = require(path.join(global.appContext.root, config.identities_file_path));
    if (accountNumber && constIdentities[accountNumber]) {
      let identities = {};
      identities[accountNumber] = constIdentities[accountNumber];
      return res.send({ identities });
    }
    res.send({ identities: {} });
  },
};