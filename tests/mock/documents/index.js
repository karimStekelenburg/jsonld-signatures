const invalidContexts = {
  veresOne: {
    url: 'https://w3id.org/veres-one/v1',
    value: require('./veresOnev1.jsonld')
  },
  did: {
    url: 'https://w3id.org/did/v0.11',
    value: require('./didv0.jsonld')
  },
  valid: {
    url: 'https://w3id.org/credentials/v1',
    value: require('./credentials-v1.jsonld')
  },
  invalidId: {
    url: 'https://invalid-id.org',
    value: require('./invalid_id.jsonld')
  },
  invalidSignature: {
    url: 'https://invalidSignature.digitalbazaar.org',
    value: require('./overwritesSignature.jsonld')
  },
  nullVersion: {
    url: 'https://null-version.org',
    value: require('./null_version.jsonld')
  },
  nullId: {
    url: 'https://null-id.org',
    value: require('./null_@id.jsonld')
  },
  nullType: {
    url: 'https://null-type.org',
    value: require('./null_type.jsonld')
  },
  nullDoc: {
    url: 'https://null-doc.org',
    value: null
  }
};
module.exports = invalidContexts;
