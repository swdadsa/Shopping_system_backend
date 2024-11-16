export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('Main_titles', [
      {
        name: 'Electronics',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Home & Kitchen',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Clothing, Shoes & Accessories',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Health & Personal Care',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Beauty & Makeup',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Books & Media',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface: any) {

  }
};
