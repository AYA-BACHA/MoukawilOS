/**
 * MoukawilOS — Calculation Engine Verification Suite (Plain Node.js, no framework)
 * Required test cases from specification.
 * Run with: node tests/calc.test.js
 */

const assert = require('assert');
const rules = require('../rules.js');
const calc = require('../calc.js');

console.log('====================================================');
console.log('Running MoukawilOS Compliance & Calculation Tests...');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// 1. IFU Calculation Tests
// ---------------------------------------------------------------------------
console.log('--- IFU Calculations (CIDTA Art. 282 sexies & 365 bis) ---');

test('turnover 0 => IFU 10,000 (minimum applied)', () => {
  const res = calc.computeIFU(0);
  assert.strictEqual(res.amount, 10000, 'IFU on 0 turnover must equal 10,000 DZD minimum');
  assert.strictEqual(res.minimumApplied, true, 'Minimum must be marked as applied');
  assert.strictEqual(res.calculated, 0);
});

test('turnover 1,850,000 => IFU 10,000 (0.5% = 9,250 < minimum 10,000)', () => {
  const res = calc.computeIFU(1850000);
  assert.strictEqual(res.calculated, 9250);
  assert.strictEqual(res.amount, 10000, 'IFU on 1,850,000 must equal 10,000 DZD (minimum applied)');
  assert.strictEqual(res.minimumApplied, true, 'Minimum must be marked as applied');
});

test('turnover 3,000,000 => IFU 15,000 (0.5% of 3,000,000 = 15,000)', () => {
  const res = calc.computeIFU(3000000);
  assert.strictEqual(res.calculated, 15000);
  assert.strictEqual(res.amount, 15000, 'IFU on 3,000,000 must equal 15,000 DZD');
  assert.strictEqual(res.minimumApplied, false, 'Minimum should not be applied');
});

test('turnover 5,000,000 => IFU 25,000 (0.5% of 5,000,000 = 25,000)', () => {
  const res = calc.computeIFU(5000000);
  assert.strictEqual(res.calculated, 25000);
  assert.strictEqual(res.amount, 25000, 'IFU on 5,000,000 must equal 25,000 DZD');
  assert.strictEqual(res.minimumApplied, false, 'Minimum should not be applied');
});

// ---------------------------------------------------------------------------
// 2. CASNOS Calculation Tests
// ---------------------------------------------------------------------------
console.log('\n--- CASNOS Calculations (Décret 26-257 & Option Forfaitaire) ---');

test('CASNOS flat option => 24,000 DZD', () => {
  const res = calc.computeCasnos({ option: 'flat' });
  assert.strictEqual(res.amount, 24000, 'Flat auto-entrepreneur contribution must equal 24,000 DZD');
});

test('CASNOS general with assiette below floor (e.g. 100,000 DZD) => 43,200 DZD (floor 1x SNMG)', () => {
  const res = calc.computeCasnos({ option: 'general', assiette: 100000 });
  assert.strictEqual(res.clampedAssiette, 288000, 'Assiette must be clamped to 288,000 DZD');
  assert.strictEqual(res.amount, 43200, 'Contribution must equal 43,200 DZD (15% of 288,000 DZD)');
  assert.strictEqual(res.isClampedFloor, true, 'Floor flag must be true');
});

test('CASNOS general with assiette 5,760,000 DZD => 864,000 DZD (20x SNMG)', () => {
  const res = calc.computeCasnos({ option: 'general', assiette: 5760000 });
  assert.strictEqual(res.clampedAssiette, 5760000);
  assert.strictEqual(res.amount, 864000, 'Contribution on 5,760,000 must equal 864,000 DZD (15%)');
});

test('CASNOS general with assiette above cap (e.g. 8,000,000 DZD) => 864,000 DZD', () => {
  const res = calc.computeCasnos({ option: 'general', assiette: 8000000 });
  assert.strictEqual(res.clampedAssiette, 5760000, 'Assiette must be clamped to 5,760,000 DZD');
  assert.strictEqual(res.amount, 864000, 'Contribution must equal 864,000 DZD (ceiling capped)');
  assert.strictEqual(res.isClampedCeiling, true, 'Ceiling flag must be true');
});

// ---------------------------------------------------------------------------
// 3. Threshold & Ceiling Compliance Tests
// ---------------------------------------------------------------------------
console.log('\n--- Ceiling Thresholds & Consecutive Years (Loi 22-23 Art. 2 & 13-14) ---');

test('threshold percent for 1,850,000 => 37%', () => {
  const res = calc.thresholdStatus(1850000);
  assert.strictEqual(res.percent, 37, '1,850,000 / 5,000,000 must equal 37%');
  assert.strictEqual(res.exceeded, false, 'Must not be marked as exceeded');
  assert.strictEqual(res.consecutiveYearsAbove, 0);
});

test('turnover 5,000,001 => exceeded', () => {
  const res = calc.thresholdStatus(5000001);
  assert.strictEqual(res.exceeded, true, '5,000,001 must be marked as exceeded');
  assert.strictEqual(res.consecutiveYearsAbove, 1);
});

test('consecutive-year counter at 1, 2, 3 years', () => {
  // Case 1: 1 year exceeded
  const year1 = calc.thresholdStatus([4500000, 5200000]);
  assert.strictEqual(year1.consecutiveYearsAbove, 1, 'Should count 1 year above ceiling');
  assert.strictEqual(year1.legalConsequence, false);

  // Case 2: 2 consecutive years exceeded
  const year2 = calc.thresholdStatus([5100000, 5300000]);
  assert.strictEqual(year2.consecutiveYearsAbove, 2, 'Should count 2 consecutive years above ceiling');
  assert.strictEqual(year2.legalConsequence, false);

  // Case 3: 3 consecutive years exceeded => legal consequence triggered
  const year3 = calc.thresholdStatus([5100000, 5200000, 5400000]);
  assert.strictEqual(year3.consecutiveYearsAbove, 3, 'Should count 3 consecutive years above ceiling');
  assert.strictEqual(year3.legalConsequence, true, 'Legal consequence (radiation) must be triggered at 3 years');
});

// ---------------------------------------------------------------------------
// 4. Calendar Obligations Verification
// ---------------------------------------------------------------------------
console.log('\n--- Calendar Obligations Verification ---');

test('buildCalendar returns verified official obligations without quarterly CASNOS', () => {
  const cal = calc.buildCalendar(2026, '2026-09-29');
  assert.ok(Array.isArray(cal) && cal.length >= 5, 'Calendar must have at least 5 obligations');

  const titles = cal.map(o => o.title.toLowerCase());
  const hasQuarterlyCasnos = titles.some(t => t.includes('trimestriel') && t.includes('casnos'));
  assert.strictEqual(hasQuarterlyCasnos, false, 'Calendar MUST NOT contain quarterly CASNOS');

  const g12 = cal.find(o => o.id === 'ob-g12');
  assert.ok(g12, 'G12 obligation must exist');
  assert.strictEqual(g12.displayDeadline, '30 juin 2026');

  const g12bis = cal.find(o => o.id === 'ob-g12bis');
  assert.ok(g12bis, 'G12 bis obligation must exist');
  assert.strictEqual(g12bis.displayDeadline, '20 janvier 2027');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n====================================================');
if (process.exitCode === 1) {
  console.error(`FAILED: ${totalTests - passedTests} test(s) failed out of ${totalTests}.`);
  process.exit(1);
} else {
  console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} tests succeeded.`);
  console.log('====================================================\n');
}
