"use client";

import React, { useEffect, useMemo, useState } from "react";

type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

type FocusField = "number" | "holder" | "expire" | "cvv" | null;

type Props = {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  submitLabel?: string;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
};

function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

const CreditCardForm = ({
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  maskMiddle = true,
  ring1,
  ring2,
  showSubmit = true,
  submitLabel,
  onChange,
  onSubmit,
  className = "",
}: Props) => {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<FocusField>(null);

  const flip = focusField === "cvv";
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity: CardValidity = useMemo(() => {
    const numberValid = number.length >= 13;
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const cvvValid = /^\d{3,4}$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid: numberValid && holderValid && monthValid && yearValid && cvvValid,
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv }, validity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, holder, month, year, cvv]);

  const displayDigits = useMemo(() => number.slice(0, 16).split(""), [number]);

  const displayedSlots = useMemo(() => {
    const arr: { textTop: string; filed: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let content = "#";
      if (i < displayDigits.length) {
        const d = displayDigits[i];
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? "*" : d;
      }
      arr.push({ textTop: content, filed: i < displayDigits.length });
    }
    return arr;
  }, [displayDigits, maskMiddle]);

  const highlightClass = (() => {
    switch (focusField) {
      case "number": return "highlight__number";
      case "holder": return "highlight__holder";
      case "expire": return "highlight__expire";
      case "cvv": return "highlight__cvv";
      default: return "hidden";
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ number, holder, month, year, cvv }, validity);
  };

  const r1 = ring1 ?? "hsl(var(--primary))";
  const r2 = ring2 ?? "hsl(var(--accent))";

  return (
    <section className={`ccf-wrap ${className}`} dir="ltr">
      <div className="wrap">
        {/* CARD */}
        <div className={`card ${flip ? "flip" : ""}`}>
          {/* FRONT */}
          <div className="card__front">
            <div className="card__header">
              <span>CreditCard</span>
              <div id="highlight" className={highlightClass} />
            </div>

            <div className="card__number">
              {displayedSlots.map((slot, idx) => (
                <span className="slot" key={idx}>
                  <span className={`digit ${slot.filed ? "filed" : ""}`}>
                    <span className="row">#</span>
                    <span className="row">{slot.textTop}</span>
                  </span>
                </span>
              ))}
            </div>

            <div className="card__footer">
              <div>
                <div className="card__section__title">Card Holder</div>
                <div className="card__holder">{holder || "NAME ON CARD"}</div>
              </div>
              <div>
                <div className="card__section__title">Expires</div>
                <div>
                  {month || "MM"}/{year ? year.slice(-2) : "YY"}
                </div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="card__back">
            <div className="card__hide_line" />
            <div className="card_cvv">
              <span>CVV</span>
              <div className="card_cvv_field">{"*".repeat(cvv.length)}</div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form className="form" onSubmit={handleSubmit}>
          <div>
            <label>Card Number</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={formatNumberSpaces(number)}
              onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
              onFocus={() => setFocusField("number")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.number}
              placeholder="1234 5678 9012 3456"
            />
            {!validity.number && number.length >= 13 && (
              <div className="err">Card number looks invalid</div>
            )}
          </div>

          <div>
            <label>Card Holder</label>
            <input
              type="text"
              autoComplete="cc-name"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocusField("holder")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.holder}
              placeholder="NAME ON CARD"
            />
          </div>

          <div className="filed__group">
            <div>
              <label>Expiration Date</label>
              <div className="filed__date">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.month}
                >
                  <option value="" disabled>Month</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.year}
                >
                  <option value="" disabled>Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label>CVV</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                onFocus={() => setFocusField("cvv")}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.cvv}
                placeholder="123"
              />
            </div>
          </div>

          {showSubmit && (
            <button type="submit" className="submit" disabled={!validity.allValid}>
              {validity.allValid ? (submitLabel ?? "Submit") : "Complete all fields"}
            </button>
          )}
        </form>
      </div>

      <style>{`
        .ccf-wrap { width: 100%; }
        .ccf-wrap .wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 920px) {
          .ccf-wrap .wrap { grid-template-columns: 1fr; }
        }
        .ccf-wrap * { box-sizing: border-box; }

        .ccf-wrap #highlight {
          position: absolute;
          border: 1px solid #fff;
          border-radius: 12px;
          z-index: 1;
          width: 0; height: 0; top: 0; left: 0;
          box-shadow: 0 0 5px #fff;
          transition: 0.3s;
        }
        .ccf-wrap #highlight.highlight__number { width: 346px; height: 40px; top: 92px; left: 18px; }
        .ccf-wrap #highlight.highlight__holder { width: 264px; height: 56px; top: 156px; left: 18px; }
        .ccf-wrap #highlight.highlight__expire { width: 86px; height: 56px; top: 156px; left: 323px; }
        .ccf-wrap #highlight.highlight__cvv { width: 381px; height: 91px; top: 83px; left: 18px; }
        .ccf-wrap #highlight.hidden { display: none; }

        .ccf-wrap .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          transform-style: preserve-3d;
          transition: 0.8s;
          perspective: 1000px;
        }
        .ccf-wrap .card.flip { transform: rotateY(180deg); }

        .ccf-wrap .card__front,
        .ccf-wrap .card__back {
          width: 100%;
          max-width: 420px;
          height: 233px;
          border-radius: 20px;
          padding: 24px 30px 30px;
          background: linear-gradient(to right bottom, #323941, #061018);
          box-shadow: 0 33px 50px -15px rgba(50, 55, 63, 0.66);
          color: #fff;
          overflow: hidden;
          margin: 0 auto;
          backface-visibility: hidden;
          position: relative;
        }
        @media (max-width: 450px) {
          .ccf-wrap .card__front, .ccf-wrap .card__back { padding: 12px 14px 16px; height: 206px; }
          .ccf-wrap #highlight.highlight__number { width: 300px; left: 14px; }
          .ccf-wrap #highlight.highlight__holder { width: 220px; left: 14px; }
          .ccf-wrap #highlight.highlight__expire { left: 280px; }
          .ccf-wrap #highlight.highlight__cvv { width: 330px; left: 14px; }
        }

        .ccf-wrap .card__back {
          position: absolute; top: 0; left: 0;
          transform: rotateY(180deg);
          padding: 24px 0 0;
        }

        .ccf-wrap .card__front::before,
        .ccf-wrap .card__back::before {
          content: "";
          position: absolute;
          border: 16px solid ${r1};
          border-radius: 100%;
          left: -17%; top: -45px;
          height: 300px; width: 300px;
          filter: blur(13px);
        }
        .ccf-wrap .card__front::after,
        .ccf-wrap .card__back::after {
          content: "";
          position: absolute;
          border: 16px solid ${r2};
          border-radius: 100%;
          width: 300px; top: 55%; left: -200px;
          height: 300px;
          filter: blur(13px);
        }

        .ccf-wrap .card__hide_line {
          height: 40px; width: 100%;
          background-color: #6b7280;
          position: relative; z-index: 1;
        }
        .ccf-wrap .card_cvv {
          position: relative; z-index: 1;
          margin-top: 24px; padding: 0 32px;
          display: flex; flex-direction: column; align-items: end;
          font-size: 14px; font-weight: 600; text-transform: uppercase;
        }
        .ccf-wrap .card_cvv_field {
          margin-top: 6px; background-color: #fff; border-radius: 12px;
          height: 44px; width: 100%; color: #000;
          display: flex; align-items: center; justify-content: end;
          padding: 0 12px; font-size: 25px; line-height: 21px;
        }

        .ccf-wrap .card__header {
          display: flex; align-items: center; justify-content: space-between;
          font-weight: 600; margin-bottom: 32px;
          position: relative; z-index: 1;
        }

        .ccf-wrap .card__number {
          font-size: 22px; margin-bottom: 32px;
          position: relative; z-index: 1;
          display: flex; height: 33px; overflow: hidden; color: #fff;
        }
        .ccf-wrap .card__number .slot { display: inline-flex; margin-right: 0; }
        .ccf-wrap .card__number .slot:nth-child(4n) { margin-right: 10px; }
        .ccf-wrap .card__number .digit {
          display: flex; flex-direction: column;
          height: 33px; line-height: 33px;
          transition: transform 0.2s;
        }
        .ccf-wrap .card__number .digit.filed { transform: translateY(-33px); }
        .ccf-wrap .card__number .row { height: 33px; display: block; }

        .ccf-wrap .card__footer {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1;
        }
        .ccf-wrap .card__holder { text-transform: uppercase; }
        .ccf-wrap .card__section__title {
          font-size: 14px; font-weight: 600; text-transform: uppercase;
        }

        .ccf-wrap .form {
          border-radius: 12px;
          background: #fff;
          width: 100%; max-width: 600px; margin: 0 auto;
          padding: 24px;
          border: 1px solid #f1f1f1;
          box-shadow: 0 0 40px rgba(50, 55, 63, 0.16);
          display: grid; gap: 12px;
          color: #0d0c22;
        }
        .ccf-wrap label {
          display: block; margin: 6px 0 4px;
          color: #0d0c22; font-weight: 500;
        }
        .ccf-wrap input, .ccf-wrap select {
          height: 52px; display: block; width: 100%;
          border: 1px solid #6b7280;
          padding: 18px 20px;
          transition: outline 200ms ease, box-shadow 200ms ease;
          border-radius: 12px; outline: none;
          background-color: #fff; color: #0d0c22;
          font-size: 16px;
        }
        .ccf-wrap input:focus, .ccf-wrap select:focus {
          border: 1px solid #000;
          outline: 4px solid rgba(0,0,0,0.1);
        }
        .ccf-wrap select { padding: 0 20px; }
        .ccf-wrap .filed__group {
          display: grid; grid-template-columns: 2fr 1fr; gap: 24px;
        }
        @media (max-width: 560px) {
          .ccf-wrap .filed__group { grid-template-columns: 1fr; }
        }
        .ccf-wrap .filed__date {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .ccf-wrap .err { color: #b42318; font-size: 12px; margin-top: 4px; }
        .ccf-wrap .submit {
          margin-top: 8px; height: 48px;
          border: none; border-radius: 10px;
          background: #0d0c22; color: #fff;
          font-weight: 600; cursor: pointer;
          transition: opacity 0.2s;
        }
        .ccf-wrap .submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </section>
  );
};

export { CreditCardForm };
export type { CardState, CardValidity };
