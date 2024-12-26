import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserForLikesForPosts1735036077148 implements MigrationInterface {
    name = 'AddUserForLikesForPosts1735036077148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likeForPosts" RENAME COLUMN "login" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" ADD CONSTRAINT "FK_a7e830d66403b43b3cf52068b84" FOREIGN KEY ("userId") REFERENCES "user_tor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likeForPosts" DROP CONSTRAINT "FK_a7e830d66403b43b3cf52068b84"`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "likeForPosts" RENAME COLUMN "userId" TO "login"`);
    }

}
