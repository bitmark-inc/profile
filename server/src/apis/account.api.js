
const { config } = global.appContext;

module.exports = {
  getIdentities: (req, res) => {
    res.send({
      identities: config.map_identities
    });
  },
  getIdentity: (req, res) => {
    let accountNumber = req.params.accountNumber;
    if (accountNumber && config.map_identities[accountNumber]) {
      let identities = {};
      identities[accountNumber] = config.map_identities[accountNumber];
      return res.send({ identities });
    }
    res.send({ identities: {} });
  },
};