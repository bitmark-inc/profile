const bitmarkSDK = require('bitmark-sdk');
const fse = require('fs-extra');
const axios = require('axios');
const moment = require('moment');
const {
  responseError, newError,
  verifySignature,
} = require('./../utils');
const { getRecord, setRecord } = require('./../models');
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
  while (results && results.bitmarks && results.bitmarks.length === 100) {
    results = await getBitmarksOfAssetOfIssuer(issuer, assetId);
    returnedBitmarks = returnedBitmarks.concat(results.data.bitmarks || []);
  }
  return returnedBitmarks;
};


module.exports = {
  postThumbnail: async (req, res) => {
    try {
      let signature = req.headers.signature;
      let assetId = req.headers.asset_id;
      let limitedEdition = req.headers.limited_edition;
      let bitmarkAccountNumber = req.headers.requester;
      if (!bitmarkSDK.Account.isValidAccountNumber(bitmarkAccountNumber)) {
        throw newError('Account number is not valid.', 400);
      }
      let message = assetId + (limitedEdition ? ('|' + limitedEdition) : '');
      if (!verifySignature(message, signature, bitmarkAccountNumber)) {
        throw newError('Invalid signature.', 400);
      }

      let assetInfo = await bitmarkSDK.Asset.get(assetId);
      if (!assetInfo.asset || assetInfo.asset.registrant !== bitmarkAccountNumber) {
        throw newError('You are not registrant.', 400);
      }
      if (!req.file) {
        throw newError('No files were uploaded.', 400);
      }

      console.log('limitedEdition :', limitedEdition);
      if (limitedEdition) {
        let key = `Limited_Edition_${assetId}_${bitmarkAccountNumber}`;
        await setRecord(key, { limited: limitedEdition });
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
  postLimitedEdition: async (req, res) => {
    try {
      let signature = req.headers.signature;
      let assetId = req.headers.token;
      let bitmarkAccountNumber = req.headers.requester;

      if (!bitmarkSDK.Account.isValidAccountNumber(bitmarkAccountNumber)) {
        throw newError('Account number is not valid.', 400);
      }
      if (!verifySignature(assetId, signature, bitmarkAccountNumber)) {
        throw newError('Invalid signature.', 400);
      }

      let bitmarkQueryParams = bitmarkSDK.Bitmark.newBitmarkQueryBuilder()
        .issuedBy(bitmarkAccountNumber)
        .referencedAsset(assetId)
        .pending(true)
        .limit(10)
        .build();

      let issuedBitmarks = await bitmarkSDK.Bitmark.list(bitmarkQueryParams);
      if (!issuedBitmarks || issuedBitmarks.length <= 0) {
        throw newError('You are not issuer.', 400);
      }
      let limited = req.body.limited;
      let key = `Limited_Edition_${assetId}_${bitmarkAccountNumber}`;

      await setRecord(key, { limited });
      res.send({ ok: true });
    } catch (error) {
      console.log('error:', error);
      responseError(res, error);
    }
  },
  getLimitedEdition: async (req, res) => {
    try {
      let bitmarkAccountNumber = req.query.issuer;
      let assetId = req.query.asset_id;

      if (!bitmarkSDK.Account.isValidAccountNumber(bitmarkAccountNumber)) {
        throw newError('Account number is not valid.', 400);
      }
      let key = `Limited_Edition_${assetId}_${bitmarkAccountNumber}`;
      let result = await getRecord(key);
      res.send(result ? result.value : {});
    } catch (error) {
      console.log('error:', error);
      responseError(res, error);
    }
  },
  claimAsset: async (req, res) => {
    try {
      let assetId = req.params.assetId;
      let assetInfo = await bitmarkSDK.Asset.get(assetId);
      let asset = assetInfo.asset;
      let key = `Limited_Edition_${assetId}_${asset.registrant}`;
      let result = await getRecord(key);
      console.log('result :', result);
      let limited = result ? result.value.limited : 0;

      let totalBitmark = await getTotalBitmarksOfAssetOfIssuer(asset.registrant, assetId);
      res.render('asset-claim', {
        assetName: asset.name,
        assetId: `${asset.id.substring(0, 4)}...${asset.id.substring(asset.id.length - 4, asset.id.length)}`,
        limited,
        totalBitmark: totalBitmark.length,
        thumbnailUrl: `${config.profile_server}/s/asset/thumbnail?asset_id=${assetId}`,
        registrant: config.map_identities[asset.registrant] || `${asset.registrant.substring(0, 4)}...${asset.registrant.substring(asset.registrant.length - 4, asset.registrant.length)}`,
        registeredAt: moment(asset.created_at).format('YYYY MMM DD'),
        claimOnRegistryUrl: `${config.registry_server}/assets/${assetId}/claim`
      });
    } catch (error) {
      console.log('error:', error);
      responseError(res, error);
    }
  },
};