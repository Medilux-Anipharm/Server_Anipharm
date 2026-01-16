// 지도에 달리는 리뷰 서비스

const db = require('../models')
const {Review, ReviewKeyword, ReviewLike, ReviewMedia,User, Pharmacy, Hospital} = db
const {Op} = require('sequelize')
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

        let whereClause = {}

        if (targetType == 'pharmacy'){
            whereClause.pharmacyId = targetId
        }else if (targetType == 'hospital'){
            whereClause.hospitalId = targetId
        }else {
            throw new Error('잘못된 접근입니다.')
        }
        if (minRating !== null && minRating >=1 && minRating <= 5){
            whereClause.rating = {[Op.gte] : minRating}
        }

        if (userId) {
            whereClause.userId = userId
        }

        let order = []
        switch(sortBy){
            case 'popular':
                order = [['likeCount', 'DESC'], [sequelize.literal('"Review"."created_at"'), 'DESC']]
                break
            case 'rating':
                order = [['rating', 'DESC'], [sequelize.literal('"Review"."created_at"'), 'DESC']]
                break
            case 'latest':
            default:
                order = [[sequelize.literal('"Review"."created_at"'), 'DESC']]
                break
        }

        const offset = (page -1) * limit

        const { count, rows: reviews } = await Review.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: User,
              as: "user",
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
              model: ReviewMedia,
              as: "media",
              attributes: ["mediaId", "mediaUrl", "mediaType"],
              required: false,
            },
          ],
          attributes: [
            "reviewId",
            "rating",
            "content",
            "likeCount",
            [sequelize.literal('"Review"."created_at"'), 'createdAt'],
            [sequelize.literal('"Review"."updated_at"'), 'updatedAt'],
          ],
          order,
          limit,
          offset,
          distinct: true,
          subQuery: false
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
        try {
            // targetId를 명시적으로 숫자로 변환
            const numericTargetId = typeof targetId === 'string' ? parseInt(targetId, 10) : Number(targetId);
            
            console.log(`[getReviewSummary 시작] targetType: ${targetType}, targetId: ${targetId} (${typeof targetId}), numericTargetId: ${numericTargetId} (${typeof numericTargetId})`);
            
            if (isNaN(numericTargetId) || numericTargetId <= 0) {
                console.error(`[getReviewSummary] 유효하지 않은 targetId: ${targetId}`);
                throw new Error(`유효하지 않은 ID: ${targetId}`);
            }
            
            const where = {}

            if(targetType == 'pharmacy'){
                where.pharmacyId = numericTargetId
            }else if (targetType == 'hospital'){
                where.hospitalId = numericTargetId
            }else{
                console.error(`[getReviewSummary] 잘못된 타입: ${targetType}`);
                throw new Error('잘못된 접근 입니당당당')
            }

            console.log(`[getReviewSummary] where 조건:`, JSON.stringify(where));

            // 전체 리뷰 수  
            console.log(`[getReviewSummary] 전체 리뷰 수 조회 시작`);
            const totalReviews  = await Review.count({where})
            console.log(`[getReviewSummary] 전체 리뷰 수: ${totalReviews}`);

            if (totalReviews === 0){
                console.log(`[getReviewSummary] 리뷰 없음, 빈 데이터 반환`);
                return {
                    averageRating : 0,
                    totalRating : 0,
                    ratingDistribution : {5 : 0, 4: 0, 3:0,2:0, 1:0},
                    keywordSummary : []
                }
            }

            //별점 평균
            console.log(`[getReviewSummary] 별점 평균 조회 시작`);
            const ratingStats = await Review.findOne({
                where,
                attributes : [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('rating')), 'count'],
                ],
                raw : true
            })
            console.log(`[getReviewSummary] 별점 평균 결과:`, JSON.stringify(ratingStats));

            console.log(`[getReviewSummary] 별점 분포 조회 시작`);
            const ratingDistribution = await Review.findAll({
                where,
                attributes : [
                    'rating',
                    [sequelize.fn('COUNT', sequelize.col('rating')), 'count'],
                ],
                group : ['rating'],
                raw : true
            })
            console.log(`[getReviewSummary] 별점 분포 결과:`, JSON.stringify(ratingDistribution));

            const distribution = { 5: 0, 4:0, 3:0, 2:0,1:0}
            ratingDistribution.forEach(item=> {
                distribution[item.rating] = parseInt(item.count)
            });
            console.log(`[getReviewSummary] 별점 분포 처리 완료:`, JSON.stringify(distribution));

            console.log(`[getReviewSummary] 키워드 통계 조회 시작`);
            const keywordStats = await ReviewKeyword.findAll({
                include : [{
                    model : Review,
                    as : 'review',  // alias 지정
                    where,
                    attributes:[]
                }],
                attributes : [
                    'keyword',
                    [sequelize.fn('COUNT', sequelize.col('ReviewKeyword.keyword')), 'count'],
                ],
                group : ['keyword'],
                order : [[sequelize.literal('count'), 'DESC']],
                limit : 10,
                raw : true
            })
            console.log(`[getReviewSummary] 키워드 통계 결과:`, JSON.stringify(keywordStats));

            const keywordSummary = keywordStats.map(item => ({
                keyword : item.keyword,
                count : parseInt(item.count),
                percentage : ((parseInt(item.count)/totalReviews) * 100).toFixed(1)

            }))
            console.log(`[getReviewSummary] 키워드 요약 처리 완료:`, JSON.stringify(keywordSummary));

            const result = {
                averageRating : parseFloat(ratingStats.averageRating || 0).toFixed(1),
                totalReviews,
                ratingDistribution:distribution,
                keywordSummary
            }
            console.log(`[getReviewSummary] 최종 결과:`, JSON.stringify(result));
            return result;
        } catch (error) {
            console.error(`[getReviewSummary 에러] targetType: ${targetType}, targetId: ${targetId}`);
            console.error(`[getReviewSummary 에러] 메시지: ${error.message}`);
            console.error(`[getReviewSummary 에러] 스택:`, error.stack);
            console.error(`[getReviewSummary 에러] 전체:`, error);
            throw error;
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

            // 트랜잭션 커밋
            await transaction.commit()

            // 커밋 후 상세 조회 (트랜잭션 밖에서)
            try {
                return await this.getReviewDetail(review.reviewId, userId)
            } catch(detailError) {
                // 상세 조회 실패 시 기본 정보 반환
                console.error('리뷰 상세 조회 실패:', detailError)
                return review
            }

        }catch(error){
            // 트랜잭션이 아직 커밋되지 않은 경우에만 롤백
            if (!transaction.finished) {
                await transaction.rollback()
            }
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
                const mediaData = mediaFiles.map((file, index) => ({
                    reviewId,
                    mediaUrl: file.path || file.url,
                    mediaType: file.mimetype?.startsWith('video/') ? 'video' : 'image',
                }));
                await ReviewMedia.bulkCreate(mediaData, { transaction });
            }

            // 트랜잭션 커밋
            await transaction.commit()

            // 커밋 후 상세 조회 (트랜잭션 밖에서)
            try {
                return await this.getReviewDetail(reviewId, userId)
            } catch(detailError) {
                console.error('리뷰 상세 조회 실패:', detailError)
                return review
            }

        }catch(error){
            // 트랜잭션이 아직 커밋되지 않은 경우에만 롤백
            if (!transaction.finished) {
                await transaction.rollback()
            }
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
        const existingLike = await ReviewLike.findOne({
            where : {
                reviewId,
                userId
            }
        })

        if(existingLike){
            // 이미 좋아요를 누른 경우 현재 좋아요 수 반환
            const review = await Review.findByPk(reviewId,{
                attributes : ['likeCount']
            })
            return { likeCount : review.likeCount}
        }

        // 좋아요 생성
        await ReviewLike.create({
            reviewId,
            userId
        })

        // 좋아요 수 증가
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
            // 이미 좋아요를 누르지 않은 경우 현재 좋아요 수 반환
            const review = await Review.findByPk(reviewId,{
                attributes : ['likeCount']
            })
            return {
                likeCount : review.likeCount
            }
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