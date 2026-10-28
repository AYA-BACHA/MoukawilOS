"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { simulateTaxAndSocial } from "@/lib/api";
import type { BackendSimulationResult } from "@/types/models";
import { formatWhole } from "@/lib/format";

const formatDzd = (num: number) => `${formatWhole(num)} DZD`;

export function TaxSimulatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [turnoverInput, setTurnoverInput] = useState<string>("2000000");
  const [casnosRegime, setCasnosRegime] = useState<"forfait" | "general">("forfait");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BackendSimulationResult | null>(null);

  if (!isOpen) return null;

  async function handleSimulate(amountStr?: string) {
    const val = parseFloat(amountStr || turnoverInput);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    try {
      const res = await simulateTaxAndSocial(val, casnosRegime);
      if (res) {
        setResult(res);
      } else {
        // Fallback local calculation matching statutory rules
        const rawIfu = Math.round(val * 0.005 * 100) / 100;
        const finalIfu = Math.max(rawIfu, 10000);
        const casnos = casnosRegime === "forfait" ? 24000 : Math.round(val * 0.15 * 100) / 100;
        setResult({
          annual_turnover: val,
          ifu: {
            rate: 0.005,
            raw_amount: rawIfu,
            statutory_floor: 10000,
            final_tax: finalIfu,
            schedule: {
              installment_1_june_30: Math.round(finalIfu * 0.5 * 100) / 100,
              installment_2_sept_15: Math.round(finalIfu * 0.25 * 100) / 100,
              installment_3_dec_15: Math.round(finalIfu * 0.25 * 100) / 100,
            },
          },
          casnos: {
            regime: casnosRegime,
            annual_contribution: casnos,
            deadline: "2026-06-30",
          },
          total_statutory_charges: finalIfu + casnos,
          net_income_after_charges: val - (finalIfu + casnos),
          effective_charge_rate_pct: val > 0 ? Math.round(((finalIfu + casnos) / val) * 10000) / 100 : 0,
          ceiling_status: {
            limit: 5000000,
            percentage: Math.round((val / 5000000) * 1000) / 10,
            is_exceeded: val > 5000000,
            warning: val >= 4000000 ? "Approaching or exceeded statutory ceiling" : null,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Statutory Tax & Social Security Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Loi 22-23 · CIDTA Art. 282 quater · Décret 26-257
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Turnover Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Hypothetical Annual Turnover (DZD)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50000"
                value={turnoverInput}
                onChange={(e) => setTurnoverInput(e.target.value)}
                placeholder="2000000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                DZD
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[800000, 2000000, 3500000, 4800000, 5200000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTurnoverInput(preset.toString());
                    handleSimulate(preset.toString());
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {formatDzd(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* CASNOS Regime Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              CASNOS Social Security Regime
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCasnosRegime("forfait")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  casnosRegime === "forfait"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-bold">ANAE Flat Base (Forfait)</div>
                <div className="text-xs text-slate-500 mt-0.5">24,000 DZD/year (Art. 3 Décret 26-257)</div>
              </button>

              <button
                type="button"
                onClick={() => setCasnosRegime("general")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  casnosRegime === "general"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs font-bold">Standard 15% Assessment</div>
                <div className="text-xs text-slate-500 mt-0.5">15% on declared annual revenue</div>
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            type="button"
            onClick={() => handleSimulate()}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            {loading ? "Calculating..." : "Compute Statutory Charges"}
          </button>

          {/* Simulation Results Display */}
          {result && (
            <div className="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-4">
              {/* Ceiling Alert */}
              {result.ceiling_status.is_exceeded ? (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    Turnover exceeds the 5,000,000 DZD statutory ceiling ({result.ceiling_status.percentage}%). Requires transition to Commercial Register (RC) after 3 years.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>In Compliance with 5,000,000 DZD Ceiling</span>
                  </div>
                  <span className="font-bold">{result.ceiling_status.percentage}% used</span>
                </div>
              )}

              {/* Statutory Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">0.5% IFU Tax</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatDzd(result.ifu.final_tax)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Floor: 10,000 DZD applied
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">CASNOS Social</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatDzd(result.casnos.annual_contribution)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Due: 30 June
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Effective Rate</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    {result.effective_charge_rate_pct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Net: {formatDzd(result.net_income_after_charges)}
                  </div>
                </div>
              </div>

              {/* Installments Schedule */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>DGI Statutory Installment Schedule (50/25/25)</span>
                  <span className="text-[10px] font-normal text-slate-500">Art. 365 bis CIDTA</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">1st Installment (50%)</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {formatDzd(result.ifu.schedule.installment_1_june_30)}
                    </div>
                    <div className="text-[9px] text-emerald-700 mt-0.5">By June 30</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">2nd Installment (25%)</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {formatDzd(result.ifu.schedule.installment_2_sept_15)}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">By Sept 15</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">3rd Installment (25%)</div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {formatDzd(result.ifu.schedule.installment_3_dec_15)}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">By Dec 15</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Deterministic fiscal engine (isolated from LLMs)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
