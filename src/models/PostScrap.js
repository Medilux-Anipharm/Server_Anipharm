const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostScrap = sequelize.define('PostScrap', {
    scrapId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'scrap_id'
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'post_id',
      references: {
        model: 'community_posts',
        key: 'post_id'
      }
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'post_scraps',
    timestamps: false,
    indexes: [
      { fields: ['user_id', 'post_id'], unique: true },
      { fields: ['user_id'] }
    ]
  });

  PostScrap.associate = (models) => {
    PostScrap.belongsTo(models.CommunityPost, { foreignKey: 'post_id', as: 'post' });
    PostScrap.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return PostScrap;
};

