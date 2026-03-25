// Indian number formatting utilities

export const formatIndianNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

export const formatIndianCurrency = (num: number): string => {
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatFollowers = (num: number): string => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};
