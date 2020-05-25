import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class transactionForeignKey1590414523612 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      // column for foreign key
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'category_id',
          type: 'uuid',
          isNullable:true
        })
      )

      // the foreign key
      await queryRunner.createForeignKey(
        'transactions',
        new TableForeignKey({
          name: 'TransactionCategory',
          columnNames: ['category_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        })
      )

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('transactions','TransactionCategory');

      await queryRunner.dropColumn('transactions','category_id');
    }

}
