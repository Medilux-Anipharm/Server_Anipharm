const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CommunityPost = sequelize.define('CommunityPost', {
        postId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'post_id'
        },
        userId : {
            type: DataTypes.BIGINT,
            primaryKey: true,
            field:'user_id',
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        boardType :{
            type : DataTypes.ENUM('free', 'qna'),
            allowNull : false,
            field : 'board_type',
            comment : '게시판 유형 : free(자유게시판), qna(질문게시판)'
        },
        latitude : {
            type : DataTypes.DECIMAL(10, 8),
            allowNull : false,
            field : 'latitude',
            comment : '사용자 위치 위도'
        },
        longitude : {
            type : DataTypes.DECIMAL(11, 8),
            allowNull : false,
            field : 'longitude',
            comment : '사용자 위치 경도'
        },
        locationName:{
            type: DataTypes.STRING(100),
            allowNull : false,
            field : 'location_name',
            comment : '사용자 위치 이름'
        },
        title : {
            type : DataTypes.STRING(100),
            allowNull : false,
            field : 'title',
            comment : '게시글 제목'
        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
            field : 'content',
            comment : '게시글 내용'
        },
        viewCount : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0,
            field : 'view_count',
            comment : '조회수'
        },
        likeCount : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0,
            field : 'like_count',
            comment : '좋아요 수'
        },
        commentCount : {
            type : DataTypes.INTEGER,
            allowNull : false,
            defaultValue : 0,
            field : 'comment_count',
            comment : '댓글 수'
        }
    },{
        tableName : 'community_posts',
        timestamps : true,
        createdAt : 'created_at',
        updatedAt : 'updated_at',
        indexes : [
            { fields : ['user_id'] },
            { fields : ['board_type'] },
            { fields : ['created_at'] }
        ]   
    });

    CommunityPost.associate = (models) => {
        CommunityPost.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        CommunityPost.hasMany(models.PostImage, { foreignKey: 'post_id', as: 'images' });
        CommunityPost.hasMany(models.PostLike, { foreignKey: 'post_id', as: 'likes' });
        CommunityPost.hasMany(models.PostComment, { foreignKey: 'post_id', as: 'comments' });
    };

    return CommunityPost;

};