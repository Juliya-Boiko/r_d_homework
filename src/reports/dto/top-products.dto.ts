export type TopProductsQuery = {
  from: Date;
  to: Date;
  limit: number;
  fromLabel: string;
  toLabel: string;
};

export type TopProductItem = {
  productId: string;
  title: string;
  soldQty: number;
  revenue: string;
};

export type TopProductsResponse = {
  from: string;
  to: string;
  limit: number;
  items: TopProductItem[];
};
