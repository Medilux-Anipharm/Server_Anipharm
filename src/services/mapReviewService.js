// 지도에 달리는 리뷰 서비스

const db = require('../models')
const {Review, ReviewKeyword, ReviewLike, ReviewMedia,User, Pharmacy, Hospital} = db
const {Op, where} = require('sequelize')
const sequelize = require('../config/database')

class MapReviewService {

    async getReviewList(targetType, targetId, options = {}){
        const {
            sortBy = 'latest',
            page = 1,
            limit = 5,
            minRating = null,
            keyword = null,
            userId = null
        } = options

        where = {}

        if (targetType == 'pharmacy'){
            where.pharmacyId = targetId
        }else if (targetType == 'hospital'){
            where.pharmacyId = targetId
        }else {
            throw new Error('잘못된 접근입니다.')
        }
        if (minRating !== null && minRating >=1 && minRating <= 5){
            where.rating = {[Op.gte] : minRating}
        }

        if (userId) {
            where.userId = userId
        }

        let order = []
        switch(sortBy){
            case 'popular':
                order = [['review_like_count', 'DESC'],['created_at', 'DESC'] ]
                break
            case 'rating':
                order = [['rating', 'DESC'], ['created_at', 'DESC']]
                break
            case 'latest':
            default:
                order = [['created_at','DESC']]
                break
        }

        const offset = (page -1) * limit

        const { count, rows: reviews } = await Review.findAndCountAll({
          where,
          include: [
            {
              model: "users",
              as: "users",
              attributes: ["userId", "nickname", "profileImageUrl"],
              required: true,
            },
            {
              model: ReviewKeyword,
              as: "keywords",
              attributes: ["keyword"],
              required: false,
            },
            {
              model: "ReviewMedia",
              as: "media",
              attributes: ["mediaId", "mediaUrl", "mediaType"],
              required: false,
              order: [["mediaOrder", "ASC"]],
            },
          ],
          attributes: [
            "reviewId",
            "rating",
            "content",
            "likeCount",
            [sequelize.literal('"Review"."created_at"'), "createdAt"],
            [sequelize.literal('"Review"."updated_at"'), "updatedAt"],
          ],
          order,
          limit,
          offset,
          distinct:true
        });

        // 키워드 필터링(키워드가 저장된 경우)
        let filteredReviews = reviews
        if(keyword) {
            filteredReviews = filteredReviews.filter(review => {
                const ReviewKeyword = review.keywords.map(k => k.keyword)
                console.log('리뷰 키워드 입니다 . :', ReviewKeyword)
                return ReviewKeyword.includes(keyword)
            })
        }

        //사용자별 좋아요 여부 확인

        let likedReviewIds = []
        if (userId){
            const reviewIds = filteredReviews.map(r => r.reviewId)
            const likes = await ReviewLike.findAll({
                where : {
                    reviewId : {[Op.in] : reviewIds},
                    userId : userId
                },
                attributes : ['reviewId']
            })
            likedReviewIds = likes.map(l => l.reviewId)
            console.log('likedReviweIds. ;', likedReviewIds)
        }

        const formattedReviews = filteredReviews.map(review => ({
            reviewId : review.rating,
            rating : review.rating,
            content : review. content,
            author : {
                userId : review.user.userId,
                nickname: review.user.nickname,
                profileImageURL : review.user.profileImageURL || null,
            },
            keywords : review.keywords.map(k => k.keyword),
            media : review.media.map( m => ({
                mediaId : m.mediaId,
                mediaUrl : m.mediaUrl,
                mediaType : m.mediaType,
            })),
            likeCount : review.likeCount || 0,
            isLiked : userId ? likedReviewIds.includes(review.reviewId) : false,
            createdAt : review.createdAt, 
            updatedAt : review.updatedAt
        }))

        return {
          reviews: formattedReviews,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < Math.ceil(count / limit),
            hasPrevPage: parseInt(page) > 1,
          },
        };
    }// end getReviewList

    // 리뷰 요약
    async getReviewSummary(targetType, targetId){
        const where = {}

        if(targetType == 'pharmacy'){
            where.pharmacyId = targetId
        }else if (targetType == 'hospital'){
            where.hospitalId = targetId
        }else{
            throw new Error('잘못된 접근 입니당당당')
        }

        // 전체 리뷰 수  
        const totalReviews  = await Review.count({where})

        if (totalReviews === 0){
            return {
                averageRating : 0,
                totalRating : 0,
                ratingDistribution : {5 : 0, 4: 0, 3:0,2:0, 1:0},
                keywordSummary : []
            }
        }

        //별점 평균
        const ratingStats = await Review.findOne({
            where,
            attributes : [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('rating')), count],
            ],
            raw : true
        })

        const ratingDistribution = await Review.findAll({
            where,
            attributes : [
                'rating',
                [sequelize.fn('COUNT', sequelize.col('rating')), count],
            ],
            group : ['rating'],
            raw : true
        })

        const distribution = { 5: 0, 4:0, 3:0, 2:0,1:0}
        ratingDistribution.forEach(item=> {
            distribution[item.rating] = parseInt(item.count)
        });
        const keywordStats = await ReviewKeyword.findAll({
            include : [{
                model : Review,
                where,
                attributes:[]
            }],
            attributes : [
                'keyword',
                [sequelize.fn('COUNT', sequelize.col('review_keywords.keyword')), 'count'],
            ],
            group : ['keyword'],
            order : [[sequelize.literal('count'), 'DESC']],
            limit : 10,
            raw : true
        })

        const keywordSummary = keywordStats.map(item => ({
            keyword : item.keyword,
            count : parseInt(item.count),
            percentage : ((parseInt(IntersectionObserver.count)/totalReviews) * 100).toFixed(1)

        }))

        return{
            averageRating : parseFloat(ratingStats.averageRating || 0).toFixed(1),
            totalReviews,
            ratingDistribution:distribution,
            keywordSummary
        }
 
    }// end getReviewSummary

    //리뷰 상세 조회
    async getReviewDetail (reviewId, userId = null){
        const review = await Review.findOne({
            where: {reviewId},
            include : [
               {
                model : User,
                as : 'user',
                attributes : ['userId', 'nickname', 'profileImageUrl'],
               },
               {
                model : ReviewKeyword,
                as : 'keywords',
                attributes :['keyword']
               },
               {
                model : ReviewMedia,
                as : 'media',
                attributes : ['mediaId', 'mediaUrl', 'mediaType'],
               },
            
            ]
        })

        if(!review){
            throw new Error('리뷰를 찾을 수 없습니다')
        }

        let isLiked = false
        if(userId){
            const like = await ReviewLike.findOne({
                where : {
                    reviewId : reviewId,
                    userId : userId
                }
            })
            isLiked = !!like
            console.log(`isLiked : ${isLiked}`)    

        }

        let target = null 
        if (review.pharmacyId){
            // const Pharmacy = db.Pharmacy
            const pharmacy = await Pharmacy.findByPk(review.pharmacyId, {
                attributes : ['pharmacyId', 'name', 'address']
            })
            target = {
                type : 'pharmacy',
                id : pharmacy.pharmacyId,
                name : pharmacy.name,
                address : pharmacy.address
            }
        }else if(review.hospitalId){
            const hospital = await Hospital.findByPk(review.hospitalId, {
                attributes : ['hospitalId', 'name', 'address'],
            })
            target = {
                type : 'hospital',
                name : hospital.name,
                address : hospital.address
            }
        }
        return {
          reviewId: review.reviewId,
          rating: review.rating,
          content :review.content,
          author : {
            userId : review.user.userId,
            nickname : review.user.nickname || '익명',
            profileImageURL : review.user.profileImageURL || null
          },
          target,
          keywords : review.keywords.map(k => k.keyword),
          media : review.media.map(m => ({
            mediaId : m.mediaId,
            mediaUrl : m.mediaUrl,
            mediaType : m.mediaType
          })),
          likeCount : review.likeCount || 0,
          isLiked,
          createdAt : review.createdAt,
          updatedAt :review.updatedAt
        };
    }// end getReviewDetail

    async createReview(userId, reviewData, keywords =[], mediaFiles =[]){
        const {
            targetType,
            targetId,
            rating,
            content
        } = reviewData

        //리뷰 데이터 구성
        const reviewPayload = {
            userId,
            rating, 
            content
        }

        if(targetType === 'pharmacy'){
            reviewPayload.pharmacyId = targetId
        }else if (targetType === 'hospital'){
            reviewPayload.hospitalId =targetId
        }else {
            throw new Error('잘못된 접근입니다.')
        }

        //트렌잭션으로 리뷰 키워드 미디어 저장
        const transaction = await sequelize.transaction()

        try {
            const review = await Review.create(reviewPayload, {transaction})

            if(keywords && keywords.length > 0){
                const keywordData = keywords.map(keyword => ({
                    reviewId : review.reviewId,
                    keyword
                }))

                await ReviewKeyword.bulkCreate(keywordData, {transaction})
            }

            if(mediaFiles && mediaFiles.length > 0) {
                const mediaData = mediaFiles.map((file, index) => ({
                    reviewId : review.reviewId,
                    mediaUrl : file.path || file.url,
                    mediaType : file.mimetype?.startsWith('image/')? 'image' : 'video',
                }))
                await ReviewMedia.bulkCreate(mediaData, {transaction})
            }
            await transaction.commit()

            return await this.getReviewDetail(review.reviewId, userId)

        }catch(error){
            await transaction.rollback()
            throw error
        }
        // ing
    }// end createReview()

    async updateReview(reviewId, userId, reviewData = {}, keywords = [], mediaFiles = []){
        const review = await Review.findOne({where: {reviewId}})

        if (!review ){
            throw new Error ('리뷰를 찾을 수 없습니다.')
        }

        if(review.userId !== userId){
            throw new Error('잘못된 접근입니다')
        } 

        const transaction = await sequelize.transaction()

        try {
            //review update 

            if(reviewData.rating !== undefined){
                review.rating = reviewData.rating
            }
            if(reviewData.content !== undefined){
                review.content = reviewData.content
            }

            await review.save({transaction})

            if (keywords && keywords.length > 0){
                await ReviewKeyword.destroy({
                    where : {reviewId},
                    transaction
                })

                const keywordData = keywords.map(keyword => ({
                    reviewId,
                    keyword
                }))
                await ReviewKeyword.bulkCreate(keywordData, {transaction})

            }

            if (mediaFiles && mediaFiles.length > 0 ){
                const existingMedia = await Review.findAll({
                    where : {mediaId},
                    limit : 1,
                    transaction
                })

          const mediaData = mediaFiles.map((file, index) => ({
                    reviewId,
                    mediaUrl: file.path || file.url,
                    mediaType: file.mimetype?.startsWith('video/') ? 'video' : 'image',
                }));
                await ReviewMedia.bulkCreate(mediaData, { transaction });
            }
            await transaction.commit()
            return await this.getReviewDetail(reviewId, userId)
                
        }catch(error){
            await transaction.rollback()
            throw error
        }
    }// end updateReview

    async deleteReview(reviewId, userId){
        const review = await Review.findOne({where: {reviewId}})
        if(!review) {
            throw new Error ('리뷰를 찾을 수 없습니다')
        }
        if(review.userId !== userId){
            throw new Error('본인 리뷰만 삭제 가능합니다')
        }

        await review.destroy()
        console.log('리뷰가 삭제 되었습니다')
    }// end deleteReview()


    async addLike(reviewId, userId){
        const [like, created ] = await ReviewLike.findOrCreate({
            where : {
                reviewId,
                userId
            },
            defaults : {
                reviewId,
                userId
            }
        })
        if(!created){
            throw new Error('이미 좋아요를 누른 리뷰입니다')
        }
        await Review.increment('likeCount',{
            where : {reviewId}
        })

        const review = await Review.findByPk(reviewId,{
            attributes : ['likeCount']
        })

        return { likeCount : review.likeCount}
    }// end addLike

    async removeLike(reviewId, userId){
        const like = await ReviewLike.findOne({
            where : {reviewId, userId}
        })

        if(!like){
            throw new Error('좋아요를 누르지 않은 리뷰입니다.')
        }

        await like.destroy()

        await Review.decrement('likeCount', {
            where : {reviewId}
        })

        const review = await Review.findByPk(reviewId,{
            attributes : ['likeCount']
        })

        return {
            likeCount : review.likeCount
        }
    }// end removeLike

}// end MapReviewService

module.exports = new MapReviewService();