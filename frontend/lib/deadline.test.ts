import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeNextDeadline } from "./deadline.ts";

describe("Statutory Deadline Calculator (CIDTA art. 282 quater)", () => {
  it("correctly computes candidate when date is before 30 June (e.g. 2026-04-15)", () => {
    // April 15, 2026
    const testDate = new Date("2026-04-15T12:00:00Z");
    const deadline = computeNextDeadline(testDate);

    assert.equal(deadline.dueDate, "2026-06-30");
    assert.equal(deadline.formCode, "G12");
    assert.equal(deadline.label, "G12 Provisional Declaration");
    assert.equal(deadline.daysRemaining, 76);
  });

  it("correctly computes candidate when date is between 30 June and 20 January (e.g. 2026-10-22)", () => {
    // October 22, 2026 (Today's evaluation date)
    const testDate = new Date("2026-10-22T10:00:00Z");
    const deadline = computeNextDeadline(testDate);

    assert.equal(deadline.dueDate, "2027-01-20");
    assert.equal(deadline.formCode, "G12 bis");
    assert.equal(deadline.label, "Annual G12 bis Regularisation");
    assert.equal(deadline.daysRemaining, 90);
  });

  it("correctly computes candidate when date is after 20 January (e.g. 2027-02-01)", () => {
    // February 1, 2027
    const testDate = new Date("2027-02-01T12:00:00Z");
    const deadline = computeNextDeadline(testDate);

    assert.equal(deadline.dueDate, "2027-06-30");
    assert.equal(deadline.formCode, "G12");
    assert.equal(deadline.label, "G12 Provisional Declaration");
    assert.equal(deadline.daysRemaining, 149);
  });

  it("correctly computes candidate when date is early January before 20 January (e.g. 2027-01-10)", () => {
    // January 10, 2027
    const testDate = new Date("2027-01-10T12:00:00Z");
    const deadline = computeNextDeadline(testDate);

    assert.equal(deadline.dueDate, "2027-01-20");
    assert.equal(deadline.formCode, "G12 bis");
    assert.equal(deadline.label, "Annual G12 bis Regularisation");
    assert.equal(deadline.daysRemaining, 10);
  });

  it("correctly handles exact deadline date boundaries", () => {
    // On June 30, 2026
    const june30 = new Date("2026-06-30T10:00:00Z");
    const dlJune = computeNextDeadline(june30);
    assert.equal(dlJune.dueDate, "2026-06-30");
    assert.equal(dlJune.daysRemaining, 0);

    // On July 1, 2026 (day after June 30) -> next is Jan 20 of next year
    const july1 = new Date("2026-07-01T10:00:00Z");
    const dlJuly = computeNextDeadline(july1);
    assert.equal(dlJuly.dueDate, "2027-01-20");
    assert.equal(dlJuly.formCode, "G12 bis");

    // On January 20, 2027
    const jan20 = new Date("2027-01-20T10:00:00Z");
    const dlJan20 = computeNextDeadline(jan20);
    assert.equal(dlJan20.dueDate, "2027-01-20");
    assert.equal(dlJan20.daysRemaining, 0);

    // On January 21, 2027 (day after Jan 20) -> next is June 30 of current year
    const jan21 = new Date("2027-01-21T10:00:00Z");
    const dlJan21 = computeNextDeadline(jan21);
    assert.equal(dlJan21.dueDate, "2027-06-30");
    assert.equal(dlJan21.formCode, "G12");
  });
});
