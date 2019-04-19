const {securityContextTestDoc} = require('./test-document');
const {NOOP_PROOF_PURPOSE_URI} = require('./noop-purpose');

const mock = {};
module.exports = mock;

mock.securityContextSignedInvalidContextUrl = {
  id: 'https://invalid-context-url',
  ...securityContextTestDoc,
  '@context': [
    {'@version': 1.1},
    'https://do-not-resolve-dsfsdfs.org'
  ],
  proof: {
    type: 'Ed25519Signature2018',
    created: '2018-02-13T21:26:08Z',
    jws:
      'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19' +
      '..' +
      'UNcNI6x6KDA_hHux2RLM8_i9aoZY34GwcZevOjkSh22WoNB4FcP6dNgf2nKzX' +
      'XJIr-IqUnEwMYeD36fc8jv1AA',
    proofPurpose: NOOP_PROOF_PURPOSE_URI
  }
};

