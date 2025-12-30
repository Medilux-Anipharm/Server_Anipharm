const { DataTypes, Model, Sequelize } = require("sequelize");

module.exports = (sequelize) => {
    const ReviewKeyword = sequelize.define('ReviewKeyword', {
        reviewKeywordId : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true,
            field: 'review_keyword_id'
        },
        reviewId : {
            type: DataTypes.BIGINT,
            allowNull : false,
            field: 'review_id',
            references : {
                model : 'reviews',
                key : 'review_id'
            }

        },
        keyword : {
            type: DataTypes.STRING(60),
            allowNull : false,
            comment : '리뷰 키워드(태그)'
        },{
            tableName : 'review_keywords',
            timestamps : true,
            createdAt : 'created_at',
            updatedAt : false,
            indexes : [
                {field : ['review_id'], name : ['idx_review_id']},
                {field : ['keyword'], name : ['idx_keyword_id']},
            ]
        },

    );

    ReviewKeyword.associate = (models) => {
        ReviewKeyword.belongsTo(models.Review, {
            foreignKey : 'review_id',
            as :'review'
        });
    };

    return ReviewKeyword;
};