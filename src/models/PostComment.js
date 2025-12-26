const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PostComment = sequelize.define('PostComment', {
        commentId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'comment_id'
        },
        postId : {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'post_id',
            references: {
                model: 'community_posts',
                key: 'post_id'
            }
        },
        userId : {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        content : {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content'
        },
        parentCommentId : {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'parent_comment_id',
            references: {
                model: 'post_comments',
                key: 'comment_id'
            }
        },
    },{
        tableName : 'post_comments',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : 'updated_at',
        indexes : [
            { fields : ['post_id'] },
            { fields : ['user_id'] }
        ]
    });
    PostComment.associate = (models) => {
        PostComment.belongsTo(models.CommunityPost, { foreignKey: 'post_id', as: 'post' });
        PostComment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        PostComment.belongsTo(models.PostComment, { foreignKey: 'parent_comment_id', as: 'parentComment' });
    };

    return PostComment;
    };