const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SearchLog = sequelize.define('SearchLog', {
    logId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'log_id'
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    searchType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'search_type',
      validate: {
        isIn: [['pharmacy', 'hospital', 'community', 'product']]
      }
    },
    keyword: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    resultCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'result_count'
    },
    searchedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'searched_at'
    }
  }, {
    tableName: 'search_logs',
    timestamps: false,
    indexes: [
      { fields: ['keyword'] },
      { fields: ['search_type', 'searched_at'] }
    ]
  });

  SearchLog.associate = (models) => {
    SearchLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return SearchLog;
};

