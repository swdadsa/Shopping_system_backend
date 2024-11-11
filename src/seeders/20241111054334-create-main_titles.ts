import bcrypt from 'bcrypt';

export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('main_titles', [
      {
        name: '',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface: any) {
    await queryInterface.bulkUpdate(
      'main_titles',
      { deletedAt: new Date() }, // Setting deletedAt to current date to indicate a soft delete
      { username: ['Finn1119'] } // Condition to match specific rows
    );
  }
};
