const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Blog extends Model {}

Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  author: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      isPositive(value) {
        if (parseInt(value) < 0) {
          throw new Error('Likes must be a positive value')
        }
      }
    }    
  },
  year: {
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
  }
}, {
  sequelize,
  underscored: true,
  modelName: 'blog'
})

module.exports = Blog