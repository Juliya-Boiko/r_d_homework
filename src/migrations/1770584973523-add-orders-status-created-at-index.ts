import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersStatusCreatedAtIndex1770584973523 implements MigrationInterface {
  name = 'AddOrdersStatusCreatedAtIndex1770584973523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "idx_orders_status_created_at"
      ON "orders" ("status", "created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "idx_orders_status_created_at";
    `);
  }
}
