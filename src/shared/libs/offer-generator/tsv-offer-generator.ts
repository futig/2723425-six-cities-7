import { OfferGenerator } from './offer-generator.interface.js';
import { Cities, CityLocations, Goods, MockServerData, OfferTypes, UserTypes } from '../../types/index.js';
import { generateRandomValue, getRandomItem, getRandomItems } from '../../helpers/index.js';

const IMAGES_COUNT = 6;

const MIN_RATING = 1;
const MAX_RATING = 5;
const RATING_DIGITS = 1;

const MIN_BEDROOMS = 1;
const MAX_BEDROOMS = 8;

const MIN_ADULTS = 1;
const MAX_ADULTS = 10;

const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export class TSVOfferGenerator implements OfferGenerator {
  constructor(
    private readonly mockData: MockServerData
  ) {}

  public generate(): string {
    const title = getRandomItem(this.mockData.titles);
    const description = getRandomItem(this.mockData.descriptions);
    const postDate = new Date(Date.now() - generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY) * MS_IN_DAY).toISOString();
    const city = getRandomItem(Cities);
    const previewImage = getRandomItem(this.mockData.previewImages);
    const images = getRandomItems(this.mockData.images, IMAGES_COUNT).join(';');
    const isPremium = getRandomItem([true, false]);
    const isFavorite = getRandomItem([true, false]);
    const rating = generateRandomValue(MIN_RATING, MAX_RATING, RATING_DIGITS);
    const type = getRandomItem(OfferTypes);
    const bedrooms = generateRandomValue(MIN_BEDROOMS, MAX_BEDROOMS);
    const maxAdults = generateRandomValue(MIN_ADULTS, MAX_ADULTS);
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const goods = getRandomItems(Goods).join(';');
    const { name, email, avatarPath } = getRandomItem(this.mockData.users);
    const userType = getRandomItem(UserTypes);
    const { latitude, longitude } = CityLocations[city];

    return [
      title, description, postDate, city, previewImage, images, isPremium, isFavorite, rating,
      type, bedrooms, maxAdults, price, goods, name, email, avatarPath, userType, `${latitude};${longitude}`,
    ].join('\t');
  }
}
