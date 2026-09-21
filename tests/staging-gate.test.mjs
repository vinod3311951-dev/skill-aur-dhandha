import test from"node:test";import assert from"node:assert/strict";import{verifyPreviewPassword}from"../api/factoryx-auth-core.js";import{STAGING_ACCESS}from"../src/config.js";

test("Factory X staging gate uses the locked localStorage key",()=>{
  assert.equal(STAGING_ACCESS.enabled,true);
  assert.equal(STAGING_ACCESS.unlockKey,"factoryx_unlocked");
  assert.equal(STAGING_ACCESS.authEndpoint,"/api/factoryx-auth");
});

test("preview password verifier accepts only an exact password",()=>{
  const expected="Temporary-Local-Test-Only-42!";
  assert.equal(verifyPreviewPassword(expected,expected),true);
  assert.equal(verifyPreviewPassword("wrong",expected),false);
  assert.equal(verifyPreviewPassword("",expected),false);
  assert.equal(verifyPreviewPassword(expected+" ",expected),false);
});
