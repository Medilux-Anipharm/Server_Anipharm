/**
 * 게시글 목록조ㅗ히
 *게시글 지역별로조회
 게시글 카테고리별로 조회
 * 게시글 상세조회
 * 게시글 작성
 * 게시글 수정
 * 게시글 삭제
 * 게시글 좋아요
 * 좋야요 추가
 * 좋아요 제거
 * 댓글 작성
 * 잿글 삭제
 * 댓글 목록 조회(마이페이ㅣㅈ용)
 */

const db = require('../models');
const { CommunityPost, PostImage, PostLike, PostComment, User } = db;
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class CommunityService {
    async getPostList(boardType, options = {}){
        const {
            page = 1,
            limit = 20,
            sortBy = 'latest',
            category = null,
            location = null,
            userId = null
        } = options

        const where = {
            boardType,
        }
        if (location && location.latitude && location.longitude){
            const radius = location.radius || 5
            const lat = parseFloat(location.latitude)
            const long = parseFloat(location.longitude)

            const latRange = radius / 1111
            const longRange  = radius / (111 + Math.cos(lat * Math.PI / 180))

            where.latitude = {
                [Op.between] : [lat - latRange, lat + latRange] 
            }
            where.longitude = {
                [Op.between] : [long - longRange, long + longRange]

            }
        }

        let order = []
        switch(sortBy){
            case 'popular':
                order = [['like_count', 'DESC'], ['created_at', 'DESC']]
                break;
            case 'comments':
                order = [['comment_count', 'DESC'], ['created_at', 'DESC']]
                break;
            case 'latest':
            default:
                order = [['created_at', 'DESC']]
                break;
        }

        const offset = (page - 1 ) * limit

        const { count, rows: posts} = await CommunityPost.findAndCountAll({
            where,
            include : [
                {
                    model : User,
                    as : 'user',
                    attributes : ['userId', 'nickname', 'profileImageUrl'],
                    required : true
                },
                {
                    model : PostImage,
                    as: 'images',
                    attributes : ['imageId', 'imageUrl'],
                    limit : 1
                }
            ],
            attributes: [
                'postId',
                'title',
                'viewCount',
                'likeCount',
                'commentCount',
                'locationName',
                [sequelize.literal('"CommunityPost"."created_at"'), 'createdAt']
            ],
            order,
            limit,
            offset,
            distinct : true
        })

        let likedPostIds = []
        if (userId){
            const likes = await PostLike.findAll({
                where : {
                    postId : { [Op.in] : posts.map (p => p.postId)},
                    userId
                },
                attributes : ['postId']
            })
            likedPostIds = likes.map(l => l.postId)
        }

        const formattedPosts = posts.map(post => ({
            postId : post.postId,
            title : post.title,
            author : {
                userId : post.user.userId,
                nickname : post.user.nickname,
                profileImage : post.user.profileImageUrl
            },
            thumbnail : post.images && post.images.length > 0
                ? post.images[0].imageUrl
                : null,
            viewCount : post.viewCount,
            likeCount : post.likeCount,
            commentCount : post.commentCount,
            locationName : post.locationName,
            isLiked : userId ? likedPostIds.includes(post.postId) : false,
            createdAt : post.createdAt
        }))

        return {
            posts : formattedPosts,
            pagination : {
                currentPage : parseInt(page),
                totalPages : Math.ceil(count/limit),
                totalItems : count,
                itemsPerPage : parseInt(limit)
            }
        }
    }// end getPostList(boardType, options = {})

    async getPostListByLocation(boardType, location, options = {}){
        if(!location.latitude || !location.longitude){
            throw new Error('위치 조회 실패')
        }

        return await this.getPostList(boardType, {
            ...options,
            location
        })

    }// end getPostListByLocation(boardType, location, options = {})// 게시글 지역별 조회

    async getPostDetail(postId, userId = null){
        const post = await CommunityPost.findOne({
            where : {
                postId
            },
            include : [
                {
                    model : User,
                    as : 'user',
                    attributes : ['userId', 'nickname', 'profileImageUrl']
                },
                {
                    model : PostImage,
                    as : 'images',
                    attributes : ['imageId', 'imageUrl'],
                    order :[['imageId', 'ASC']]

                },
                {
                    model : PostComment,
                    as : 'comments',
                    include : [
                        {
                            model : User,
                            as : 'user',
                            attributes : ['userId', 'nickname', 'profileImageUrl']
                        }
                    ],
                    where : {
                        parentCommentId : null
                    },
                    required : false,
                    order : [['created_at', 'ASC']]
                }
            ]
        })

        if(!post) {
            throw new Error('게시글을 찾을 수 없습니다' , 400)

        }

        await post.increment('viewCount')

        let isLiked = false
        if (userId){
            const like = await PostLike.findOne({
                where : {
                    postId,
                    userId
                }
            })
            isLiked = !!like
        }

        const location = post.latitude && post.longitude ?{
            latitude : parseFloat(post.latitude),
            longitude : parseFloat(post.longitude)
        } : null

        return {
            postId : post.postId,
            boardType : post.boardType,
            title : post.title,
            content : post.content,
            author : {
                userId : post.user.userId,
                nickname : post.user.nickname,
                profileImage : post.user.profileImageUrl
            },
            images: post.images.map(img => ({
                imageId : img.imageId,
                imageUrl : img.imageUrl
            })),
            comments: post.comments.map(comment => ({
                commentId : comment.commentId,
                postId : comment.postId,
                userId : comment.user.userId,
                userNickname : comment.user.nickname,
                userProfileUrl : comment.user.profileImageUrl,
                content : comment.content,
                parentCommentId : comment.parentCommentId,
                createdAt : comment.createdAt,
                updatedAt : comment.updatedAt
            })),
            viewCount : post.viewCount + 1,
            likeCount : post.likeCount,
            commentCount : post.commentCount,
            isLiked,
            location,
            locationName: post.locationName,
            createdAt : post.createdAt,
            updatedAt : post.updatedAt
        }
    }// end getPostDetail(postId, userId)

    async createdPost(userId, postData){
        const {
            boardType,
            title,
            content,
            images = [],
            latitude,
            longitude,
            locationName
        } = postData

        // 유효성 검사
        if (!boardType || !['free', 'qna'].includes(boardType)) {
            throw new Error('올바른 게시판 유형을 선택해주세요.', 400);
        }
        if (!title || title.trim().length === 0) {
            throw new Error('제목을 입력해주세요.', 400);
        }
        if (!content || content.trim().length === 0) {
            throw new Error('내용을 입력해주세요.', 400);
        }
        if (!latitude || !longitude || !locationName) {
            throw new Error('위치 정보(위도, 경도, 위치명)는 필수입니다.', 400);
        }
        if (images.length > 5) {
            throw new Error('이미지는 최대 5개까지 업로드할 수 있습니다.', 400);
        }

        const transaction = await sequelize.transaction();

        try{
            const post = await CommunityPost.create({
                userId,
                boardType,
                title : title.trim(),
                content : content.trim(),
                latitude: parseFloat(latitude),
                longitude : parseFloat(longitude),
                locationName : locationName.trim(),
                viewCount : 0,
                likeCount : 0,
                commentCount : 0
            }, {transaction})

            if(images.length > 0){
                console.log('이미지 저장을 시작합니다')
                const imageRecords = images.map((imageUrl) => ({
                    postId : post.postId,
                    imageUrl
                }))

                await PostImage.bulkCreate(imageRecords, {transaction})
                
            }

            await transaction.commit()

            return {
                postId : post.postId,
                message : '게시물이 등록되었씁니다.ㅇ'
            }
        }catch(error){
            await transaction.rollback();
            throw error
        }

    }// end createdPost(userId, postData)

    async updatePost(postId, userId, postData){
        const {
            title,
            content,
            images = [],
            latitude = null,
            longitude = null,
            locationName = null
        } = postData;

        const post = await CommunityPost.findOne({
            where : {
                postId
            }
        })

        if(!post){
            throw new Error('게시글을 찾을 수 없습니다,', 404)
        }

        if(post.userId !== userId){
            throw new Error('본인의 게시글만 수정할 수 있습니다', 403)
        }

        // 유효성 검사
        if (title && title.trim().length === 0) {
            throw new Error('제목을 입력해주세요.', 400);
        }
        if (content && content.trim().length === 0) {
            throw new Error('내용을 입력해주세요.', 400);
        }
        if (images.length > 5) {
            throw new Error('이미지는 최대 5개까지 업로드할 수 있습니다.', 400);
        }

        const transaction = await sequelize.transaction();

        try{
            //게시글 업데이트
            const updateData = {}
            if (title !== undefined) updateData.title = title.trim()
            if (content !== undefined) updateData.content = content.trim()
            if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
            if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
            if (locationName !== undefined) updateData.locationName = locationName.trim();

            await post.update(updateData, { transaction})

            //기존 이미지 삭제 및 새 이미지 저장
            if (images !== undefined){
                await PostImage.destroy({
                    where : {
                        postId
                    },
                    transaction
                })
                if(images.length > 0 ){
                    const imageRecords = images.map((imageUrl) => {
                        postId : post.postId,
                        imageUrl
                    })

                    await PostImage.bulkCreate(imageRecords, { transaction})
                }  
            }
            await transaction.commit()
            return {
                postId: post.postId,
                message : '게시글이 수정되었습니다'
            }

            
        }catch(error){
            await transaction.rollback()
            throw error
        }

        

    }// end updatePost(postId, userId , postData)

    async deletePost(postId, userId){
        const post = await CommunityPost.findOne({
            where : {
                postId
            }
        })

        if(!post){
            throw new Error('게시글을 찾을 수 없습니다', 400)
        }

        if(post.userId !== userId){
            throw new Error('본인의 게시물만 삭제 ㄱㄴㄴ', 403)
        }

        await post.destroy()
        return{
            message : '게시글이 삭제되었습니다'
        }
    }// end deletePost(postId, userId)

    async createComment(postId, userId, commentData){
        const {content, parentCommentId = null} = commentData
        if(!content || content.trim().length === 0){
            throw new Error('댓글 내용을 확인해주세요', 400)
        }

        const post = await CommunityPost.findOne({
            where : {postId}
        })

        if (!post){
            throw new Error('게시글을 찾을 수 없습니다.', 404)
        }
        //대댓글이 존재할 경우 부모댓글 확인합니다.
        if(parentCommentId){
            const parentComment = await PostComment.findOne({
                where : {
                    commentId : parentCommentId,
                    postId
                }
            })

            if(!parentComment){
                throw new Error('부모댓글을 찾을 수 없습니다', 404)
            }
            //depth가 2이상 존재할 경우
            if(parentComment.parentCommentId){
                throw new Error('대댓글에는 답글을 달 수 없습니다.',400)
            }
        }

        const transaction = await sequelize.transaction()
        try{
            const comment = await PostComment.create({
                postId,
                userId,
                parentCommentId,
                content : content.trim()

            }, {transaction})

            await post.increment('commentCount',{
                transaction
            })

            const createdComment = await PostComment.findByPk(comment.commentId,{
                include : [
                    {
                        model: User,
                        as : 'user',
                        attributes : ['userId', 'nickname', 'profileImageUrl']
                    }
                ],
                transaction
            })

            await transaction.commit()

            return {
                commentId : createdComment.commentId,
                content : createdComment.content,
                author : {
                    userId : createdComment.user.userId,
                    nickname : createdComment.user.nickname,
                    profileImage : createdComment.user.profileImageUrl
                },
                parentCommentId : createdComment.parentCommentId,
                createdAt : createdComment.createdAt,
                message: '댓글이 등록되었습니다.'
            }
        }catch(error){
            if (transaction && !transaction.finished) {
                await transaction.rollback()
            }
            throw error
        }
    }// end createComment

    async deleteComment(commentId, userId){
        const comment = await PostComment.findOne({
            where : {commentId},
            include : [
                {model : CommunityPost,
                    as : 'post',
                    attributes : ['postId']
                }
            ]
        })

        if(!comment){
            throw new Error('댓글을 찾을 수 없습니다. ', 404)
        }

        if(comment.userId !== userId){
            throw new Error('본인의 댓글만 삭제 가능합니다. ', 403)

        }

        const transaction = await sequelize.transaction()

        try {
            const replyCount = await PostComment.count({
                where : {
                    parentCommentId : commentId
                }, 
                transaction
            })

            if (replyCount > 0){
                await comment.update({
                    content : '삭제된 댓글입니다'
                }, {transaction})
            }else{
                await comment.destroy({transaction})
                await comment.post.decrement('commentCount', { transaction})

            }
            await transaction.commit()
            return {
                message :'댓글이 삭제되었습니다.'
            }
        }catch(error){
            await transaction.rollback()
            throw error
        }
    }// deleteComment(commentId, userId)


    //댓글 목록 조회
    async getUserComments(userId, options = {}){
        const {
            page = 1,
            limit = 20
        } = options

        const offset = (page - 1 ) * limit 

        const { count , rows : comments} = await PostComment.findAndCountAll({
            where : {userId},
            include : [
                {
                    model : CommunityPost,
                    as : 'post',
                    attributes : ['postId', 'title', 'boardType'],
                    required : true
                }
            ],
            attributes : [
                'commentId',
                'content',
                'createdAt'
            ],
            order : [['createdAt', 'DESC']],
            limit,
            offset,
            distinct : true
        })

        const formattedComments = comments.map(comment => ({
            commentId : comment.commentId,
            content : comment.content,
            createdAt : comment.createdAt,
            post : {
                postId : comment.post.postId,
                title : comment.post.title,
                boardType : comment.post.boardType
            }
        }))

        return {
            comments : formattedComments,
            pagination : {
                currentPage : parseInt(page),
                totalPages : Math.ceil(count/limit),
                totalItems : count,
                itemsPerPage : parseInt(limit)
            }
        }
    }// end getUserComments


    async addLike(postId, userId){
        const post = await CommunityPost.findOne({
            where : {
                postId
            }
        })
        if(!post){
            throw new Error('게시글을 찾을 수 없습니다', 404)
        }

        const existingLike = await PostLike.findOne({
            where : {
                postId,
                userId
            }
        })

        if(existingLike){
            throw new Error('이미 좋아요를 누른 게시물입니다', 400)
        }

        const transaction = await sequelize.transaction()

        try {
            //좋아요 추가
            await PostLike.create({
                postId,
                userId
            }, {transaction})

            // 
            await post.increment('likeCount',{transaction})

            await transaction.commit()
            return {
                message : '좋아요가 추가되었습니다',
                likeCount : post.likeCount +1
            }
        }catch(error){
            await transaction.rollback()
            throw error
        }
    }// end addLike(postId, userId)

    async removeLike(postId, userId){
        const post = await CommunityPost.findOne({
            where : {
                postId
            }
        })

        if(!post){
            throw new Error('게시글을 찾을 수 없습니다.', 404 )
        }

        const like = await PostLike.findOne({
            where : {
                postId,
                userId
            }
        })

        if(!like){
            throw new Error('좋아요를 누르지 않은 게시글입니다', 400)
        }

        const transaction = await sequelize.transaction()
        try {
            await like.destroy({transaction})

            await post.decrement('likeCount', {transaction})
            await transaction.commit()

            return {
                message : '좋아요가 제거되었습니다.',
                likeCount : Math.max(0, post.likeCount - 1 )
            }
        }catch(error){
            await transaction.rollback()
            throw error
        }
    }// end removeLike(postId, userId)
}

module.exports = new CommunityService()