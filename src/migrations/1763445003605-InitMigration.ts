import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1763445003605 implements MigrationInterface {
    name = 'InitMigration1763445003605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('customer', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(96) NOT NULL, "lastName" character varying(96) NOT NULL, "email" character varying(96) NOT NULL, "password" character varying(96) NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book" ("id" BIGSERIAL NOT NULL, "title" character varying(96) NOT NULL, "author" character varying(96) NOT NULL, "description" character varying(1500) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "price" numeric(12,2) NOT NULL, "coverUrl" character varying(1024), "thumbnailUrl" character varying(1024), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "transactionId" uuid, "bookId" bigint, CONSTRAINT "PK_b40595241a69876722f692d041f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_paymentstatus_enum" AS ENUM('pending', 'success', 'failed')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalAmount" numeric(12,2) NOT NULL, "paymentStatus" "public"."transaction_paymentstatus_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "bookId" bigint NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "error_log" ("id" BIGSERIAL NOT NULL, "message" text, "stack" text, "context" character varying, "status" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0284e7aa7afe77ea1ce1621c252" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction_item" ADD CONSTRAINT "FK_2705caeb66a0fa4505f53f04e8f" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction_item" ADD CONSTRAINT "FK_f339b1f8ee2d54bf0fe3b47b8aa" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_158f0325ccf7f68a5b395fa2f6a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_228cd21c0af322f67cfc0e8013d" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_228cd21c0af322f67cfc0e8013d"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_158f0325ccf7f68a5b395fa2f6a"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "transaction_item" DROP CONSTRAINT "FK_f339b1f8ee2d54bf0fe3b47b8aa"`);
        await queryRunner.query(`ALTER TABLE "transaction_item" DROP CONSTRAINT "FK_2705caeb66a0fa4505f53f04e8f"`);
        await queryRunner.query(`DROP TABLE "error_log"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_paymentstatus_enum"`);
        await queryRunner.query(`DROP TABLE "transaction_item"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
