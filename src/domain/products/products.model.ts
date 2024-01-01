export class ProductModel {
  constructor(
    public readonly category: string,
    public readonly group: string,
    public readonly modelName: string,
    public readonly ic: number,
    public readonly goodsType: number,
  ) {}
}
