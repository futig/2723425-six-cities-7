export const Cities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'] as const;
export type City = typeof Cities[number];

export function isCity(city: string): City | undefined {
  return Cities.find((el) => el === city);
}
