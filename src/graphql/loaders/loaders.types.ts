import DataLoader from 'dataloader';
import { User } from '../../users/user.entity';
import { Product } from '../../products/product.entity';

export type AppLoaders = {
  userByIdLoader: DataLoader<string, User | null>;
  productByIdLoader: DataLoader<string, Product | null>;
};

export type GraphQLContext = {
  loaders: AppLoaders;
  strategy?: 'naive' | 'optimized';
};
