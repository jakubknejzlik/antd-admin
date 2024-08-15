import numeral from "numeral";

export const formatNumber = (
  value: string | number | undefined,
  format = "0,0"
) => {
  if (value === undefined) {
    return "–";
  }
  if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
    return "–";
  }
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  // handle folloring issue by rounding by removing exponential: https://github.com/adamwdraper/Numeral-js/issues/512
  const precision = 1000000.0;
  value = Math.round(value * precision) / precision;

  if (Number.isNaN(value)) return "–";

  return numeral(value).format(format).replace(/ /g, "\u00A0");
};

export const formatShortNumber = (
  value: string | number | undefined,
  decimals?: number
) => {
  return formatNumber(value, `0.${"0".repeat(decimals ?? 0)}a`);
};

export const formatDecimalNumber = (
  value: string | number | undefined,
  decimals?: number
) => {
  return formatNumber(value, `0,0.${"0".repeat(decimals ?? 0)}`);
};

export const formatPercentNumber = (
  value: string | number | undefined,
  decimals: number = 0
) => {
  return formatNumber(value, `0.${"0".repeat(decimals ?? 0)} %`);
};
