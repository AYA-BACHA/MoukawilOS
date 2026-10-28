-- Seed copied from the live Supabase output (rules + obligation definitions).
insert into public.rule_definitions (code, unit) values
 ('IFU_RATE','percent'),('IFU_MIN','dzd'),('CEILING','dzd'),('CEILING_STRIKES','count'),
 ('CASNOS_FLAT','dzd'),('IFU_INSTALLMENT_1_PCT','percent'),('IFU_INSTALLMENT_2_PCT','percent'),
 ('IFU_INSTALLMENT_3_PCT','percent'),('WARN_LEVEL_1','percent'),('WARN_LEVEL_2','percent'),
 ('REMINDER_DAYS','days');

insert into public.rules (rule_definition_id, value, valid_from, source)
select d.id, v.value, v.valid_from::date, v.source
from (values
 ('IFU_RATE', 0.005, '2024-01-01', 'LF 2024, CIDTA art. 282 sexies'),
 ('IFU_MIN', 10000, '2025-01-01', 'CIDTA art. 365 bis (start date to confirm)'),
 ('CEILING', 5000000, '2026-01-01', 'LF 2023 art. 51 (loi 22-24); CIDTA art. 282 ter. Loi 22-23 does not state the amount.'),
 ('CEILING', 5000000, '2023-01-01', 'Law 22-23, LF 2023 art. 51'),
 ('CEILING_STRIKES', 3, '2023-01-01', 'Law 22-23, art. 13'),
 ('CASNOS_FLAT', 24000, '2024-01-01', 'Decree 24-49 of 13 Jan 2024'),
 ('IFU_INSTALLMENT_1_PCT', 0.5, '2024-01-01', 'CIDTA art. 365 (base to confirm)'),
 ('IFU_INSTALLMENT_2_PCT', 0.25, '2024-01-01', 'CIDTA art. 365'),
 ('IFU_INSTALLMENT_3_PCT', 0.25, '2024-01-01', 'CIDTA art. 365'),
 ('WARN_LEVEL_1', 0.8, '2023-01-01', 'Internal choice'),
 ('WARN_LEVEL_2', 0.95, '2023-01-01', 'Internal choice'),
 ('REMINDER_DAYS', 30, '2023-01-01', 'Internal choice')
) as v(code, value, valid_from, source)
join public.rule_definitions d on d.code = v.code;

insert into public.obligation_types (code) values
 ('NIF_DECLARATION'),('CASNOS_PAYMENT'),('G12'),('IFU_INSTALLMENT_1'),('IFU_INSTALLMENT_2'),
 ('IFU_INSTALLMENT_3'),('G12_BIS'),('CASNOS_AFFILIATION'),('IFU_MINIMUM');

insert into public.obligation_definitions
 (obligation_type_id, start_month, start_day, end_month, end_day, year_offset,
  days_after_card_date, amount_rule_definition_id, effective_from, note, verified, anchor_activity_start)
select t.id, v.sm, v.sd, v.em, v.ed, v.yo, v.days,
       (select id from public.rule_definitions where code = v.amount_rule), v.eff::date, v.note, v.verified, v.anchor
from (values
 ('CASNOS_AFFILIATION', null::int, null::int, null::int, null::int, 0, 10, null, '2023-01-01', 'UNVERIFIED. 10 days from the start of activity (loi 83-14 art. 6, secondary sources).', false, true),
 ('CASNOS_PAYMENT', 6, 30, 6, 30, 0, null::int, 'CASNOS_FLAT', '2024-01-01', 'UNVERIFIED. Annual CASNOS contribution, due 30 June. First-year rule unresolved. Secondary sources only.', false, false),
 ('G12', 5, 1, 6, 30, 0, null, null, '2024-01-01', 'UNVERIFIED. Forecast IFU return, due 30 June. Pay in full or by instalments (optional). Secondary sources only.', false, false),
 ('G12_BIS', 1, 20, 1, 20, 1, null, null, '2024-01-01', 'UNVERIFIED. Final IFU return, due 20 January of the next year. Secondary sources only.', false, false),
 ('IFU_INSTALLMENT_1', 5, 1, 6, 30, 0, null, null, '2024-01-01', 'UNVERIFIED. Optional instalment plan: 50% when filing the G12. Secondary sources only.', false, false),
 ('IFU_INSTALLMENT_2', 9, 1, 9, 15, 0, null, null, '2024-01-01', 'UNVERIFIED. Optional instalment plan: 25% from 1 to 15 September. Secondary sources only.', false, false),
 ('IFU_INSTALLMENT_3', 12, 1, 12, 15, 0, null, null, '2024-01-01', 'UNVERIFIED. Optional instalment plan: 25% from 1 to 15 December. Secondary sources only.', false, false),
 ('IFU_MINIMUM', 1, 1, 6, 30, 0, null, null, '2025-01-01', 'UNVERIFIED. IFU minimum: paid in full by 30 June, never in instalments (CIDTA art. 365 bis).', false, false),
 ('NIF_DECLARATION', null, null, null, null, 0, 30, null, '2024-01-01', 'Loi 22-23 art. 11: tax ID within 30 days of receiving the card (law text read).', true, false)
) as v(code, sm, sd, em, ed, yo, days, amount_rule, eff, note, verified, anchor)
join public.obligation_types t on t.code = v.code;