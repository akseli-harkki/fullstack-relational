const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    /* await queryInterface.addColumn('users', 'banned', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }) */
    await queryInterface.addColumn('users', 'banned', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('users', 'admin', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('users', 'session_id', {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id'}
    })
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id'
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'banned')
    await queryInterface.removeColumn('users', 'admin')
    await queryInterface.removeColumn('users', 'session_id')
    await queryInterface.dropTable('sessions')
  },
}