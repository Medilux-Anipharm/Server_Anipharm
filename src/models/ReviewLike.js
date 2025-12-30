const {DataTypes, Sequelize} = require('sequelize')

module.exports = (sequelize) => {
    const ReviewLike = sequelize.define('ReviewLike',{
        reviewLikeId :{
            type : DataTypes.BIGINT,
            primaryKye : true,
            autoIncrement : true,
            field : 'review_like_id'
        },
        reviewId : {
            type : DataTypes.BIGINT,
            allowNull : false,
            field : 'review_id',
            references : {
                model : 'reviews',
                key : 'review_id'
            }
        },
        userId : {
            type : DataTypes.BIGINT,
            allowNull : false,
            field : 'user_id',
            references : {
                model : 'users',
                key : 'user_id'
            }
        }
    },{
        tableName : 'review_likes',
        timestamps: true,
        createdAt : 'created_at',
        updatedAt : false,
        indexes : [
            {fields : ['review_id'], name : 'idx_review_id'},
            {fields : ['user_id'], name : 'idx_user_id'},
            {fields : ['review_id', 'user_id'], unique : true, name : ['idx_review_user_unique'] } 
        ]
    })

    ReviewLike.associate = (models) => {
        ReviewLike.belongsTo(models.Review, {
            foreignKey : 'review_id',
            as : 'review'
        })
        ReviewLike.belongsTo(models.User, {
            foreignKey : 'user_id',
            as : 'user'
        })
    }

    return ReviewLike
}