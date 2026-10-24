const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = function (module, filename) {
  const code = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  module._compile(compiled.outputText, filename);
};

const { generateEcoCertificate } = require(path.join(__dirname, 'ecoCertificate.ts'));

test('generateEcoCertificate handles honest zero state', () => {
  const cert = generateEcoCertificate([], 'Pune Explorer', new Date('2026-10-24T12:00:00Z'));
  assert.equal(cert.recipientName, 'Pune Explorer');
  assert.equal(cert.totalCleanKm, 0);
  assert.equal(cert.totalCo2PreventedKg, 0);
  assert.equal(cert.fuelSavedLiters, 0);
  assert.equal(cert.tier, 'provisional');
  assert.equal(cert.isEligibleForOfficialCert, false);
  assert.match(cert.certificateId, /^PMC-ECO-\d{4}$/);
  assert.match(cert.accessibilityDescription, /Provisional/);
});

test('generateEcoCertificate qualifies for Bronze certificate at 5 kg CO2', () => {
  // 50 km * 0.12 = 6 kg CO2 (qualifies for Bronze)
  const journeys = [
    { id: '1', from: 'pcmc', to: 'civil-court', kilometers: 25 },
    { id: '2', from: 'civil-court', to: 'pcmc', kilometers: 25 },
  ];

  const cert = generateEcoCertificate(journeys, 'Aarav Patil', new Date('2026-10-24T12:00:00Z'));
  assert.equal(cert.totalCleanKm, 50);
  assert.equal(cert.totalCo2PreventedKg, 6);
  assert.equal(cert.fuelSavedLiters, 2.5);
  assert.equal(cert.tier, 'bronze');
  assert.equal(cert.isEligibleForOfficialCert, true);
  assert.equal(cert.tierTitle, 'Bronze Green Steward');
  assert.match(cert.shareableCertificateText, /Bronze Green Steward/);
  assert.match(cert.shareableCertificateText, /Aarav Patil/);
});

test('generateEcoCertificate advances to Diamond Net-Zero Legend at 50 kg CO2', () => {
  // 450 km * 0.12 = 54 kg CO2
  const journeys = [
    { id: '1', from: 'pcmc', to: 'swargate', kilometers: 450 },
  ];

  const cert = generateEcoCertificate(journeys, 'Rohan', new Date('2026-10-24T12:00:00Z'));
  assert.equal(cert.tier, 'diamond');
  assert.equal(cert.tierTitle, 'Diamond Net-Zero Legend');
  assert.equal(cert.progressToNextTierRatio, 1.0);
  assert.ok(cert.isEligibleForOfficialCert);
});
