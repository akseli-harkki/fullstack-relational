const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      validate: {
        isNotTooOld(value) {
          if (parseInt(value) < 1991 ) {
            throw new Error('Earliest year allowed is 1991')
          }
        },
        isNotFromFuture(value) {
          const currentYear = new Date().getFullYear()
          if (parseInt(value) > currentYear) {
            throw new Error('Year cannot be from the future')
          }
        }
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('blogs', 'year')
  },
}