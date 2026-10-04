import { City, Good, Offer, OfferType, UserType, isCity, isGood, isOfferType, isUserType } from '../types/index.js';

const COLUMNS_COUNT = 19;
const LIST_SEPARATOR = ';';

function parseCity(value: string): City {
  const city = isCity(value);
  if (!city) {
    throw new Error(`unknown city "${value}"`);
  }
  return city;
}

function parseOfferType(value: string): OfferType {
  const offerType = isOfferType(value);
  if (!offerType) {
    throw new Error(`unknown offer type "${value}"`);
  }
  return offerType;
}

function parseGood(value: string): Good {
  const good = isGood(value);
  if (!good) {
    throw new Error(`unknown good "${value}"`);
  }
  return good;
}

function parseUserType(value: string): UserType {
  const userType = isUserType(value);
  if (!userType) {
    throw new Error(`unknown user type "${value}"`);
  }
  return userType;
}

export function createOffer(line: string): Offer {
  const columns = line.split('\t');

  if (columns.length !== COLUMNS_COUNT) {
    throw new Error(`expected ${COLUMNS_COUNT} columns, got ${columns.length}`);
  }

  const [
    title, description, postDate, city, previewImage, images, isPremium, isFavorite, rating,
    type, bedrooms, maxAdults, price, goods, name, email, avatarPath, userType, coordinates,
  ] = columns;
  const [latitude, longitude] = coordinates.split(LIST_SEPARATOR);

  return {
    title,
    description,
    postDate: new Date(postDate),
    city: parseCity(city),
    previewImage,
    images: images.split(LIST_SEPARATOR),
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number.parseFloat(rating),
    type: parseOfferType(type),
    bedrooms: Number.parseInt(bedrooms, 10),
    maxAdults: Number.parseInt(maxAdults, 10),
    price: Number.parseInt(price, 10),
    goods: goods.split(LIST_SEPARATOR).map(parseGood),
    author: { name, email, avatarPath: avatarPath || undefined, type: parseUserType(userType) },
    location: {
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude),
    },
  };
}
