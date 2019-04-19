/*!
 * Copyright (c) 2014-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
module.exports = async function(options) {
  const {assert, constants, jsigs, mock, suites} = options;
  const {
    AssertionProofPurpose, AuthenticationProofPurpose,
    PublicKeyProofPurpose} = jsigs.purposes;
  const {LinkedDataProof} = jsigs.suites;
  const {NoOpProofPurpose} = mock;
  const {documentLoaders: {node: documentLoader}} = require('jsonld');

  // helper:
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  const suiteName = 'Ed25519Signature2018';
  const {testLoader} = mock;

  describe('should not verify', function() {
    describe('depth two', function() {
      it('if the @context url can not be accessed in the child context',
        async () => {
          const Suite = suites[suiteName];
          const signed = clone(mock.suites[suiteName].securityContextSigned);
          signed['@context'].pop();
          // change the context url here to
          // point to a child with an invalid id.
          const invalidChildUrl = 'https://invalid-context-url';
          signed['@context'].push(invalidChildUrl);
          const verifySuite = new Suite(
            mock.suites[suiteName].parameters.verify);
          const result = await jsigs.verify(signed, {
            documentLoader: testLoader,
            suite: verifySuite,
            purpose: new NoOpProofPurpose()
          });
          console.log('depth 2 result', result);
          assert.isFalse(
            result.verified,
            'Expected a context with an invalid url to not be verified');
          assert.isNotNull(result.error);
          assert.isUndefined(result.results);
          assert.isNotNull(result.error['jsonld.InvalidUrl']);
        });
    });
    describe('depth one', function() {
      it('if the @context url can not be accessed in the initial context',
        async () => {
          const Suite = suites[suiteName];
          const signed = clone(mock.suites[suiteName].securityContextSigned);
          signed['@context'].pop();
          // misspell the context url here.
          signed['@context'].push('https://e3id.org/sacurity/v1');
          const verifySuite = new Suite(
            mock.suites[suiteName].parameters.verify);
          const result = await jsigs.verify(signed, {
            documentLoader,
            suite: verifySuite,
            purpose: new NoOpProofPurpose()
          });
          assert.isFalse(
            result.verified,
            'Expected a context with an invalid url to not be verified');
          assert.isNotNull(result.error);
          assert.isUndefined(result.results);
          assert.isNotNull(result.error['jsonld.InvalidUrl']);
        });
      it.skip('if the nonce and id are defined',
        // this test is supposed to cause an error it is not.
        async () => {
          const Suite = suites[suiteName];
          const signSuite = new Suite({
            ...mock.suites[suiteName].parameters.sign,
            date: new Date('01-01-1970')
          });
          const testId = 'urn:uuid:cab83279-c695-4e66-9458-4327de49197a';
          const testDoc = clone(mock.securityContextTestDoc);
          testDoc.nonce = '123';
          testDoc.id = testId;
          const signed = await jsigs.sign(testDoc, {
            documentLoader: testLoader,
            suite: signSuite,
            purpose: new AuthenticationProofPurpose({
              challenge: 'abc',
              domain: 'example.com'
            })
          });
          const verifySuite = new Suite(
            mock.suites[suiteName].parameters.verify);
          const result = await jsigs.verify(signed, {
            documentLoader: testLoader,
            suite: verifySuite,
            purpose: new AuthenticationProofPurpose({
              challenge: 'abc',
              domain: 'example.com',
              date: new Date('01-01-1970'),
              maxTimestampDelta: 0,
              controller: mock.suites[suiteName].parameters
                .authenticationController
            })
          });
          console.log(result);
        });
    });
  });
};
