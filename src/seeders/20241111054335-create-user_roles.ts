import bcrypt from 'bcrypt';

export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'manager',
        chinese_name: '管理員',
        permission: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'user',
        chinese_name: '使用者',
        permission: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkUpdate(
      'Roles',
      { deletedAt: new Date() }, // Setting deletedAt to current date to indicate a soft delete
      { role_name: ['manager', 'user'] } // Condition to match specific rows
    );
  }
};
