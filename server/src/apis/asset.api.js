const path = require('path');
const bitmarkSDK = require('bitmark-sdk');
const fse = require('fs-extra');
const axios = require('axios');
const moment = require('moment');
const {
  responseError, newError,
  verifySignature,
  validJWT,
} = require('./../utils');
const { uploadFileToS3 } = require('./../services');

const { config } = global.appContext;

const getBitmarksOfAssetOfIssuer = async (accountNumber, assetId, lastOffset) => {
  let urlGetBitmark = `${config.api_server}/v1/bitmarks?issuer=${accountNumber}&asset_id=${assetId}&pending=true&to=later` + (lastOffset ? `&at=${lastOffset}` : '');
  return await axios.get(urlGetBitmark);
};

const getTotalBitmarksOfAssetOfIssuer = async (issuer, assetId) => {
  let returnedBitmarks = [];

  let results = await getBitmarksOfAssetOfIssuer(issuer, assetId);
  returnedBitmarks = returnedBitmarks.concat(results.data.bitmarks || []);
  while (results && results.data && results.data.bitmarks && results.data.bitmarks.length === 100) {
    let lastOffset = results.data.bitmarks[99].offset;
    results = await getBitmarksOfAssetOfIssuer(issuer, assetId, lastOffset);
    returnedBitmarks = returnedBitmarks.concat(results.data.bitmarks || []);
  }
  return returnedBitmarks;
};


module.exports = {
  postThumbnail: async (req, res) => {
    try {
      let signature = req.headers.signature;
      let bitmarkAccountNumber = req.headers.requester;
      let assetId = req.body.asset_id;
      let limitedEdition = req.body.limited_edition;

      let jwt = req.headers.authorization;
      jwt = jwt ? (jwt.replace('Bearer ', '')) : '';

      if (jwt) {
        let decodedData = await validJWT(jwt);
        if (decodedData && decodedData.sub && decodedData.aud === 'write') {
          bitmarkAccountNumber = decodedData.sub;
        } else {
          res.status(400);
          res.send({ error: 'Invalid jwt-token!' });
          return;
        }
      } else {
        console.log('postThumbnail : ', { signature, assetId, limitedEdition, bitmarkAccountNumber });
        if (!bitmarkSDK.Account.isValidAccountNumber(bitmarkAccountNumber)) {
          throw newError('Account number is not valid.', 400);
        }
        let message = assetId + (limitedEdition ? ('|' + limitedEdition) : '');
        if (!verifySignature(message, signature, bitmarkAccountNumber)) {
          throw newError('Invalid signature.', 400);
        }
      }

      let assetInfo = await bitmarkSDK.Asset.get(assetId);
      if (!assetInfo.asset || assetInfo.asset.registrant !== bitmarkAccountNumber) {
        throw newError('You are not registrant.', 400);
      }
      if (!req.file) {
        throw newError('No files were uploaded.', 400);
      }

      await uploadFileToS3(fse.readFileSync(req.file.path), `${assetId}_thumbnail.png`);
      await fse.unlink(req.file.path);
      res.send({ ok: true });
    } catch (error) {
      console.log('error:', error);
      if (req.file.path && fse.existsSync(req.file.path)) {
        await fse.unlink(req.file.path);
      }
      responseError(res, error);
    }
  },
  getThumbnail: async (req, res) => {
    let assetId = req.query.asset_id;
    res.redirect(`${config.thumbnail.server_url}/${assetId}_thumbnail.png`);
  },
  claimAsset: async (req, res) => {
    try {
      let assetId = req.params.assetId;
      let assetInfo = await bitmarkSDK.Asset.get(assetId);
      let asset = assetInfo.asset;
      let issuer = req.query.issuer || asset.registrant;
      let totalIssuedBitmarkOfIssuer = await getTotalBitmarksOfAssetOfIssuer(issuer, assetId);
      let constIdentities = require(path.join(global.appContext.root, config.identities_file_path));
      res.render('asset-claim', {
        assetName: asset.name,
        assetId: `${asset.id.substring(0, 4)}...${asset.id.substring(asset.id.length - 4, asset.id.length)}`,
        limited: totalIssuedBitmarkOfIssuer.length - 1,
        totalEditionLeft: totalIssuedBitmarkOfIssuer.filter(bitmark => bitmark.owner === issuer).length - 1,
        thumbnailUrl: `${config.profile_server}/s/asset/thumbnail?asset_id=${assetId}`,
        registrant: constIdentities[asset.registrant]
          ? constIdentities[asset.registrant].name
          : `${asset.registrant.substring(0, 4)}...${asset.registrant.substring(asset.registrant.length - 4, asset.registrant.length)}`,
        registeredAt: (asset.created_at ? moment(asset.created_at).format('YYYY MMM DD') : 'Pending...').toUpperCase(),
        claimOnRegistryUrl: `${config.registry_server}/assets/${assetId}/claim-request`,
      });
    } catch (error) {
      console.log('error:', error);
      responseError(res, error);
    }
  },
};