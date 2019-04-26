/*!
 * Copyright (c) 2014-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
module.exports = async function(options) {
  const {assert, constants, jsigs, mock, suites} = options;
  const {SECURITY_CONTEXT_V2_URL} = jsigs;
  const {
    AssertionProofPurpose, AuthenticationProofPurpose,
    PublicKeyProofPurpose} = jsigs.purposes;
  const {LinkedDataProof} = jsigs.suites;
  const {NoOpProofPurpose} = mock;
  const {CapabilityInvocation} = require('ocapld');
  const documents = require('./mock/documents');
  const {documentLoaders: {node: documentLoader}} = require('jsonld');

  // helper:
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  const suiteName = 'Ed25519Signature2018';
  const {testLoader} = mock;

  describe('should not verify', function() {
    describe('depth two', function() {
      it('strictDocumentLoader',
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
            suite: verifySuite,
            purpose: new NoOpProofPurpose()
          });
          assert.isFalse(
            result.verified,
            'Expected a context with an invalid url to not be verified');
          assert.isNotNull(result.error);
          assert.isUndefined(result.results);
          assert.equal(result.error.name, 'Error');
        });

      it('if the @context url can not be accessed in the child context',
        async () => {
          const Suite = suites[suiteName];
          const signed = clone(mock.suites[suiteName].securityContextSigned);
          signed['@context'].pop();
          // change the context url here to
          // point to a child with an invalid id.
          const invalidChildUrl = 'https://context-not-found';
          signed['@context'].push(invalidChildUrl);
          const verifySuite = new Suite(
            mock.suites[suiteName].parameters.verify);
          const result = await jsigs.verify(signed, {
            documentLoader: testLoader,
            suite: verifySuite,
            purpose: new NoOpProofPurpose()
          });
          assert.isFalse(
            result.verified,
            'Expected a context with an invalid url to not be verified');
          assert.isNotNull(result.error);
          assert.isUndefined(result.results);
          assert.equal(result.error.name, 'jsonld.InvalidUrl');
        });

      it('if the child context has an invalid id',
        async () => {
          const Suite = suites[suiteName];
          const signed = clone(mock.suites[suiteName].securityContextSigned);
          signed['@context'].push(documents.invalidId.url);
          const verifySuite = new Suite(
            mock.suites[suiteName].parameters.verify);
          const result = await jsigs.verify(signed, {
            documentLoader: testLoader,
            suite: verifySuite,
            purpose: new NoOpProofPurpose()
          });
          assert.isFalse(
            result.verified,
            'Expected a context with an invalid id to not be verified');
          assert.isNotNull(result.error);
          assert.isUndefined(result.results);
          assert.equal(result.error.name, 'jsonld.SyntaxError');
        });

      it('if the @context url is invalid and we using node documentLoader',
        async () => {
          const Suite = suites[suiteName];
          const signed = clone(mock.suites[suiteName].securityContextSigned);
          signed['@context'].pop();
          // change the context url here to
          // point to a child with an invalid id.
          const invalidChildUrl = 'http://localhost:3424/';
          signed['@context'].push(invalidChildUrl);
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
          assert.equal(result.error.name, 'jsonld.InvalidUrl');
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
          assert.equal(result.error.name, 'jsonld.InvalidUrl');
        });
      it('if the nonce and id are defined',
        // this test is supposed to cause an error it is not.
        async () => {
          const Suite = suites[suiteName];
          const signSuite = new Suite({
            ...mock.suites[suiteName].parameters.sign,
            date: new Date('01-01-1970')
          });
          const testId = 'urn:uuid:cab83279-c695-4e66-9458-4327de49197a';
          const testDoc = {
            '@context': SECURITY_CONTEXT_V2_URL,
            id: testId,
            nonce: '123',
          };
          const capability = {
            '@context': SECURITY_CONTEXT_V2_URL,
            id: 'https://example.com/alice/caps#1',
            invoker: 'https://example.com/i/alice/keys/1'
          };

          const signed = await jsigs.sign(testDoc, {
            documentLoader: testLoader,
            suite: signSuite,
            purpose: new CapabilityInvocation({
              capability: capability.id,
              capabilityAction: 'WrapKeyOperation'
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
          console.log('result', result);
        });
    });
  });
};
