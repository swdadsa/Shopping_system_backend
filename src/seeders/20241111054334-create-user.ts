import bcrypt from 'bcrypt';

export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'Finn1119',
        email: 'Finn@example.com',
        password: await bcrypt.hash("12345678", 10),
        isVerified: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkUpdate(
      'Users',
      { deletedAt: new Date() }, // Setting deletedAt to current date to indicate a soft delete
      { username: ['Finn1119'] } // Condition to match specific rows
    );
  }
};
