import { ContainerModule } from 'inversify';
import { FavoriteController } from './favorite.controller.js';
import { Controller } from '../../libs/rest/index.js';
import { Component } from '../../types/index.js';

export function createFavoriteContainer(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<Controller>(Component.FavoriteController).to(FavoriteController).inSingletonScope();
  });
}
