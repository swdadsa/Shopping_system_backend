export = {
  async up(queryInterface: any) {
    await queryInterface.bulkInsert('Sub_titles', [
      {
        main_title_id: 1,
        name: 'Mobile Phones & Accessories',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 1,
        name: 'Computers & Tablets',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 1,
        name: 'TV & Home Entertainment',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 1,
        name: 'Wearable Technology',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 1,
        name: 'Cameras & Photography',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 2,
        name: 'Kitchen Appliances',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 2,
        name: 'Furniture',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 2,
        name: 'Home Decor',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 2,
        name: 'Bedding & Bath',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 2,
        name: 'Cleaning Supplies',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 3,
        name: 'Women’s Clothing',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 3,
        name: 'Men’s Clothing',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 3,
        name: 'Shoes',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 3,
        name: 'Accessories',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 4,
        name: 'Vitamins & Supplements',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 4,
        name: 'Skincare',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 4,
        name: 'Hair Care',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 4,
        name: 'Oral Care',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 5,
        name: 'Makeup',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 5,
        name: 'Fragrance',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 5,
        name: 'Nail Care',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 5,
        name: 'Tools & Accessories',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 6,
        name: 'Books',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 6,
        name: 'Movies & TV',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        main_title_id: 6,
        name: 'Music',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ]);
  },

  async down(queryInterface: any) {

  }
};
