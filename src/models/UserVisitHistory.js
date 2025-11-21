const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserVisitHistory = sequelize.define('UserVisitHistory', {
    historyId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'history_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    facilityType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'facility_type',
      validate: {
        isIn: [['pharmacy', 'hospital']]
      }
    },
    facilityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'facility_id'
    },
    visitedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'visited_at'
    }
  }, {
    tableName: 'user_visit_history',
    timestamps: false,
    indexes: [
      { fields: ['user_id', 'visited_at'] }
    ]
  });

  UserVisitHistory.associate = (models) => {
    UserVisitHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return UserVisitHistory;
};

