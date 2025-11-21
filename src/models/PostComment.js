const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostComment = sequelize.define('PostComment', {
    commentId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'comment_id'
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
    parentCommentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'parent_comment_id',
      references: {
        model: 'post_comments',
        key: 'comment_id'
      }
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    isAcceptedAnswer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_accepted_answer'
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_reported'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted'
    }
  }, {
    tableName: 'post_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['post_id', 'created_at'] },
      { fields: ['user_id'] }
    ]
  });

  PostComment.associate = (models) => {
    PostComment.belongsTo(models.CommunityPost, { foreignKey: 'post_id', as: 'post' });
    PostComment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    PostComment.belongsTo(models.PostComment, { foreignKey: 'parent_comment_id', as: 'parentComment' });
    PostComment.hasMany(models.PostComment, { foreignKey: 'parent_comment_id', as: 'replies' });
    PostComment.hasMany(models.PostReport, { foreignKey: 'reported_id', as: 'reports', scope: { reported_type: 'comment' } });
  };

  return PostComment;
};

