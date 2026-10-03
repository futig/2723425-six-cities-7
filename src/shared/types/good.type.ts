export const Goods = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge',
] as const;
export type Good = typeof Goods[number];

export function isGood(good: string): Good | undefined {
  return Goods.find((el) => el === good);
}
