import { readFileSync } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import { City, Good, Offer, OfferType, UserType, isCity, isGood, isOfferType, isUserType } from '../../types/index.js';

const COLUMNS_COUNT = 19;
const LIST_SEPARATOR = ';';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }

  public toArray(): Offer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((row, index) => this.parseRow(row, index + 1));
  }

  private parseRow(row: string, rowNumber: number): Offer {
    const columns = row.split('\t');

    if (columns.length !== COLUMNS_COUNT) {
      throw new Error(`Row ${rowNumber}: expected ${COLUMNS_COUNT} columns, got ${columns.length}`);
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
      city: this.parseCity(city, rowNumber),
      previewImage,
      images: images.split(LIST_SEPARATOR),
      isPremium: isPremium === 'true',
      isFavorite: isFavorite === 'true',
      rating: Number.parseFloat(rating),
      type: this.parseOfferType(type, rowNumber),
      bedrooms: Number.parseInt(bedrooms, 10),
      maxAdults: Number.parseInt(maxAdults, 10),
      price: Number.parseInt(price, 10),
      goods: goods.split(LIST_SEPARATOR).map((good) => this.parseGood(good, rowNumber)),
      author: { name, email, avatarPath, type: this.parseUserType(userType, rowNumber) },
      location: {
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      },
    };
  }

  private parseCity(value: string, rowNumber: number): City {
    const city = isCity(value);
    if (!city) {
      throw new Error(`Row ${rowNumber}: unknown city "${value}"`);
    }
    return city;
  }

  private parseOfferType(value: string, rowNumber: number): OfferType {
    const offerType = isOfferType(value);
    if (!offerType) {
      throw new Error(`Row ${rowNumber}: unknown offer type "${value}"`);
    }
    return offerType;
  }

  private parseGood(value: string, rowNumber: number): Good {
    const good = isGood(value);
    if (!good) {
      throw new Error(`Row ${rowNumber}: unknown good "${value}"`);
    }
    return good;
  }

  private parseUserType(value: string, rowNumber: number): UserType {
    const userType = isUserType(value);
    if (!userType) {
      throw new Error(`Row ${rowNumber}: unknown user type "${value}"`);
    }
    return userType;
  }
}
