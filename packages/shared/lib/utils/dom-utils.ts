interface BreakpointConfig {
  [key: string]: number;
}

type CalculateBreakpointsResult<T extends BreakpointConfig> = T & { rootFontSize: number };

export const calculateBreakpoints = <T extends BreakpointConfig>(config: T): CalculateBreakpointsResult<T> => {
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const breakpoints: Record<string, number> = {};

  Object.keys(config).forEach(key => {
    breakpoints[key] = config[key] * rootFontSize;
  });

  return {
    ...breakpoints,
    rootFontSize,
  } as CalculateBreakpointsResult<T>;
};
