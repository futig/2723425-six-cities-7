import { ContainerModule } from 'inversify';
import { types } from '@typegoose/typegoose';
import { OfferService } from './offer-service.interface.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { Component } from '../../types/index.js';

export function createOfferContainer(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
    bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);
  });
}
