export const OfferTypes = ['apartment', 'house', 'room', 'hotel'] as const;
export type OfferType = typeof OfferTypes[number];

export function isOfferType(offerType: string): OfferType | undefined {
  return OfferTypes.find((el) => el === offerType);
}
