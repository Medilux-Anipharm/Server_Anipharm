const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostLike = sequelize.define('PostLike', {
    likeId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'like_id'
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
    tableName: 'post_likes',
    timestamps: false,
    indexes: [
      { fields: ['user_id', 'post_id'], unique: true },
      { fields: ['post_id'] }
    ]
  });

  PostLike.associate = (models) => {
    PostLike.belongsTo(models.CommunityPost, { foreignKey: 'post_id', as: 'post' });
    PostLike.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return PostLike;
};

