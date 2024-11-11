import bcrypt from 'bcrypt';

export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('users', [
      {
        username: 'Finn1119',
        email: 'Finn@example.com',
        password: await bcrypt.hash("12345678", 10),
        permissions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkUpdate(
      'users',
      { deletedAt: new Date() }, // Setting deletedAt to current date to indicate a soft delete
      { username: ['Finn1119'] } // Condition to match specific rows
    );
  }
};
