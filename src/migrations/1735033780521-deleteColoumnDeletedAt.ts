import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteColoumnDeletedAt1735033780521 implements MigrationInterface {
    name = 'DeleteColoumnDeletedAt1735033780521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "deletedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "deletedAt" TIMESTAMP`);
    }

}
