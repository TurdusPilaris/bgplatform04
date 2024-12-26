import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserForLikesForComments1735036267535 implements MigrationInterface {
    name = 'AddUserForLikesForComments1735036267535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likeForComments" RENAME COLUMN "login" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForComments" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForComments" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "likeForComments" ADD CONSTRAINT "FK_a4a42ef8c8aa315c24cf3b50960" FOREIGN KEY ("userId") REFERENCES "user_tor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likeForComments" DROP CONSTRAINT "FK_a4a42ef8c8aa315c24cf3b50960"`);
        await queryRunner.query(`ALTER TABLE "likeForComments" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForComments" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "likeForComments" RENAME COLUMN "userId" TO "login"`);
    }

}
