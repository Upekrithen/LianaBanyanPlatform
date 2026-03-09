/**
 * THE ANVIL — Liana Banyan Currency Symbol System
 * ==================================================
 * Named after the tool where raw materials are shaped into something useful.
 * Like the Thorn (Þ) was to Old English, the Anvil (Ↄ‖) is our unique glyph.
 *
 * The Anvil glyph: A backwards C (ↄ) crossed by two vertical bars.
 *   - Backwards C = "opposite of cents" — inverting the currency paradigm
 *   - Double bars = the two pillars (original $ sign theory) + "II" for 2nd Second
 *   - Not taken by any existing or historical currency
 *   - Trademarkable as a design mark
 *
 * Three-Currency Visual System — Hexagonal Containers:
 *   Credit  = Hexagon + Circle inside  + Anvil  (solid outline)
 *   Mark    = Hexagon + Square inside  + Anvil  (solid outline)
 *   Joule   = Hexagon + Triangle inside + Anvil (solid outline)
 *
 * Special states:
 *   Burned Mark   = Hexagon + Filled Square  (dashed outline)
 *   Locked Joule  = Hexagon + Filled Triangle (double outline)
 *   Pending Credit = Hexagon + Empty Circle   (dotted outline)
 *
 * The hexagon = the pouch (wallet container). Six sides = HexIsle's six-sided die.
 * Inner shapes are instantly recognizable at ANY size.
 * Outline styles communicate state without color dependency (accessibility).
 *
 * Fallback text: Ↄ‖ (U+2183 + double bar)
 */

import React from "react";

// ============================================================================
// TYPES
// ============================================================================

export type CurrencyType = 'credit' | 'mark' | 'joule';
export type CurrencyState = 'normal' | 'burned' | 'locked' | 'pending';

interface BaseSymbolProps {
  /** Size in pixels (width = height) */
  size?: number;
  /** Color — defaults to currentColor for text-color inheritance */
  color?: string;
  /** Optional className for Tailwind styling */
  className?: string;
  /** Stroke width for the glyph */
  strokeWidth?: number;
}

// ============================================================================
// THE ANVIL — Core Glyph (Backwards C + Double Bars)
// ============================================================================

interface AnvilProps extends BaseSymbolProps {
  /** Show just the Anvil glyph without hexagonal container */
  bare?: boolean;
}

/**
 * The Anvil — Core currency glyph
 * Backwards C with double vertical bars
 *
 * Usage:
 *   <Anvil size={16} />             — inline with text
 *   <Anvil size={48} color="gold" /> — hero display
 */
export function Anvil({
  size = 16,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
}: AnvilProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block align-text-bottom ${className}`}
      role="img"
      aria-label="Anvil — Liana Banyan currency"
    >
      {/* Backwards C (opening faces LEFT) */}
      <path
        d="M16 5.5C14.5 4 12.5 3 10.2 3C5.7 3 2 6.7 2 12s3.7 9 8.2 9c2.3 0 4.3-1 5.8-2.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* First vertical bar */}
      <line
        x1="11" y1="1" x2="11" y2="23"
        stroke={color}
        strokeWidth={strokeWidth * 0.75}
        strokeLinecap="round"
      />
      {/* Second vertical bar */}
      <line
        x1="14" y1="1" x2="14" y2="23"
        stroke={color}
        strokeWidth={strokeWidth * 0.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Legacy alias
export const CreditSymbol = Anvil;

// ============================================================================
// CURRENCY GLYPH — Hexagonal Container + Inner Shape + Anvil
// ============================================================================

/** Hexagon path for a given center and radius */
function hexagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

interface CurrencyGlyphProps extends BaseSymbolProps {
  /** Which currency: credit (circle), mark (square), joule (triangle) */
  currency: CurrencyType;
  /** State affects outline style and inner shape fill */
  state?: CurrencyState;
  /** Show the Anvil inside the inner shape */
  showAnvil?: boolean;
}

/**
 * CurrencyGlyph — Full hexagonal currency symbol
 *
 * Usage:
 *   <CurrencyGlyph currency="credit" size={32} />  — Credit: hex + circle
 *   <CurrencyGlyph currency="mark" size={32} />    — Mark: hex + square
 *   <CurrencyGlyph currency="joule" size={32} />   — Joule: hex + triangle
 *   <CurrencyGlyph currency="mark" state="burned" /> — Burned Mark
 */
export function CurrencyGlyph({
  currency,
  state = 'normal',
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 1.5,
  showAnvil = false,
}: CurrencyGlyphProps) {
  const cx = 12;
  const cy = 12;
  const hexR = 11; // Outer hexagon radius
  const innerR = 5.5; // Inner shape radius

  // Outline style based on state
  const outlineStyle: Record<CurrencyState, string> = {
    normal: '',
    burned: '4,2',
    locked: '',
    pending: '2,2',
  };

  // Inner shape fill based on state
  const isFilled = state === 'burned' || state === 'locked';

  // Currency-specific colors (when not overridden)
  const currencyColors: Record<CurrencyType, string> = {
    credit: '#f59e0b',   // amber-500
    mark: '#ef4444',     // red-500
    joule: '#3b82f6',    // blue-500
  };

  const displayColor = color === 'currentColor' ? currencyColors[currency] : color;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block align-text-bottom ${className}`}
      role="img"
      aria-label={`${currency} ${state !== 'normal' ? `(${state})` : ''}`}
    >
      {/* Hexagonal container (the "pouch") */}
      <polygon
        points={hexagonPoints(cx, cy, hexR)}
        stroke={displayColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeDasharray={outlineStyle[state]}
        fill="none"
      />

      {/* Double outline for locked state */}
      {state === 'locked' && (
        <polygon
          points={hexagonPoints(cx, cy, hexR - 1.5)}
          stroke={displayColor}
          strokeWidth={strokeWidth * 0.5}
          strokeLinejoin="round"
          fill="none"
          opacity={0.5}
        />
      )}

      {/* Inner shape: Circle (Credit), Square (Mark), or Triangle (Joule) */}
      {currency === 'credit' && (
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          stroke={displayColor}
          strokeWidth={strokeWidth}
          fill={isFilled ? displayColor : 'none'}
          opacity={isFilled ? 0.3 : 1}
        />
      )}

      {currency === 'mark' && (
        <rect
          x={cx - innerR}
          y={cy - innerR}
          width={innerR * 2}
          height={innerR * 2}
          stroke={displayColor}
          strokeWidth={strokeWidth}
          fill={isFilled ? displayColor : 'none'}
          opacity={isFilled ? 0.3 : 1}
        />
      )}

      {currency === 'joule' && (
        <polygon
          points={`${cx},${cy - innerR - 0.5} ${cx - innerR},${cy + innerR * 0.6} ${cx + innerR},${cy + innerR * 0.6}`}
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          fill={isFilled ? displayColor : 'none'}
          opacity={isFilled ? 0.3 : 1}
        />
      )}

      {/* Anvil inside (optional, for hero displays) */}
      {showAnvil && (
        <g transform={`translate(${cx - 4}, ${cy - 3.5}) scale(0.35)`}>
          <path
            d="M16 5.5C14.5 4 12.5 3 10.2 3C5.7 3 2 6.7 2 12s3.7 9 8.2 9c2.3 0 4.3-1 5.8-2.5"
            stroke={displayColor}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <line x1="11" y1="1" x2="11" y2="23" stroke={displayColor} strokeWidth={2} strokeLinecap="round" />
          <line x1="14" y1="1" x2="14" y2="23" stroke={displayColor} strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// ============================================================================
// CURRENCY AMOUNT — Formatted display with glyph
// ============================================================================

interface CurrencyAmountProps {
  amount: number;
  currency?: CurrencyType;
  state?: CurrencyState;
  size?: number;
  className?: string;
  showDecimals?: boolean;
  /** Use simple Anvil (true) or full hexagonal glyph (false) */
  simple?: boolean;
}

/**
 * CurrencyAmount — Display a currency amount with the appropriate glyph
 *
 * Usage:
 *   <CurrencyAmount amount={100} />                           — "Ↄ‖100" (simple Credit)
 *   <CurrencyAmount amount={50} currency="mark" simple={false} /> — hex+square 50
 *   <CurrencyAmount amount={25} currency="joule" />           — "Ↄ‖25" (simple Joule)
 */
export function CurrencyAmount({
  amount,
  currency = 'credit',
  state = 'normal',
  size = 14,
  className = "",
  showDecimals = false,
  simple = true,
}: CurrencyAmountProps) {
  const display = showDecimals ? amount.toFixed(2) : Math.floor(amount).toString();

  const currencyLabels: Record<CurrencyType, string> = {
    credit: 'Cr',
    mark: 'Mk',
    joule: 'J',
  };

  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${className}`}>
      {simple ? (
        <Anvil size={size} />
      ) : (
        <CurrencyGlyph currency={currency} state={state} size={size + 4} />
      )}
      {display}
      {!simple && (
        <span className="text-xs text-muted-foreground ml-0.5">{currencyLabels[currency]}</span>
      )}
    </span>
  );
}

// Legacy alias
export function CreditAmount(props: Omit<CurrencyAmountProps, 'currency'>) {
  return <CurrencyAmount {...props} currency="credit" />;
}

// ============================================================================
// CURRENCY LEGEND — Shows all three with labels
// ============================================================================

/**
 * CurrencyLegend — Display all three currency types side by side
 * Great for "How It Works" sections and wallet headers
 */
export function CurrencyLegend({
  size = 32,
  showLabels = true,
  className = "",
}: {
  size?: number;
  showLabels?: boolean;
  className?: string;
}) {
  const currencies: Array<{ type: CurrencyType; label: string; description: string }> = [
    { type: 'credit', label: 'Credit', description: '1:1 with USD' },
    { type: 'mark', label: 'Mark', description: 'Effort-debt' },
    { type: 'joule', label: 'Joule', description: 'Forever stamp' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {currencies.map(({ type, label, description }) => (
        <div key={type} className="flex items-center gap-2">
          <CurrencyGlyph currency={type} size={size} showAnvil={size >= 32} />
          {showLabels && (
            <div>
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TEXT FALLBACKS
// ============================================================================

/**
 * Text-only Anvil symbol for contexts where SVG can't render
 * Uses Unicode Ↄ (U+2183) + double bar
 */
export function anvilText(amount?: number, currency?: CurrencyType): string {
  const suffix = currency ? ` ${currency === 'credit' ? 'Cr' : currency === 'mark' ? 'Mk' : 'J'}` : '';
  if (amount !== undefined) {
    return `Ↄ‖${amount}${suffix}`;
  }
  return "Ↄ‖";
}

// Legacy alias
export const creditSymbolText = anvilText;

export default Anvil;
