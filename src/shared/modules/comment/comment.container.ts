import { ContainerModule } from 'inversify';
import { types } from '@typegoose/typegoose';
import { CommentService } from './comment-service.interface.js';
import { DefaultCommentService } from './default-comment.service.js';
import { CommentEntity, CommentModel } from './comment.entity.js';
import { Component } from '../../types/index.js';

export function createCommentContainer(): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<CommentService>(Component.CommentService).to(DefaultCommentService).inSingletonScope();
    bind<types.ModelType<CommentEntity>>(Component.CommentModel).toConstantValue(CommentModel);
  });
}
