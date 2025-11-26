const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middleware/auth');
const { validateCreatePet, validateUpdatePet } = require('../middleware/validation');

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: 반려동물 목록 조회
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 반려동물 목록 조회 성공
 *       401:
 *         description: 인증 실패
 */
router.get('/', authenticate, petController.getPets);

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: 반려동물 등록
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *               - birthDate
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 10
 *                 example: 멍멍이
 *               species:
 *                 type: string
 *                 enum: [강아지, 고양이]
 *                 example: 강아지
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 2020-01-15
 *               breed:
 *                 type: string
 *                 maxLength: 50
 *                 example: 골든 리트리버
 *               gender:
 *                 type: string
 *                 enum: [male, female, neutered_male, neutered_female]
 *                 example: neutered_male
 *               weight:
 *                 type: number
 *                 format: float
 *                 example: 25.5
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/pet.jpg
 *               healthConcerns:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   enum: [dental, joint, skin, eye, kidney, vomit, aging, nutrition, heart, obesity, constipation, immunity]
 *                 example: [dental, joint, skin]
 *     responses:
 *       201:
 *         description: 반려동물 등록 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 */
router.post('/', authenticate, validateCreatePet, petController.createPet);

/**
 * @swagger
 * /api/pets/{petId}:
 *   get:
 *     summary: 반려동물 상세 조회
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 반려동물 조회 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 접근 권한 없음
 *       404:
 *         description: 반려동물을 찾을 수 없음
 */
router.get('/:petId', authenticate, petController.getPet);

/**
 * @swagger
 * /api/pets/{petId}:
 *   put:
 *     summary: 반려동물 정보 수정
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 10
 *               species:
 *                 type: string
 *                 enum: [강아지, 고양이]
 *               birthDate:
 *                 type: string
 *                 format: date
 *               breed:
 *                 type: string
 *                 maxLength: 50
 *               gender:
 *                 type: string
 *                 enum: [male, female, neutered_male, neutered_female]
 *               weight:
 *                 type: number
 *                 format: float
 *               profileImageUrl:
 *                 type: string
 *               healthConcerns:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   enum: [dental, joint, skin, eye, kidney, vomit, aging, nutrition, heart, obesity, constipation, immunity]
 *     responses:
 *       200:
 *         description: 반려동물 수정 성공
 *       400:
 *         description: 입력값 검증 실패
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 반려동물을 찾을 수 없음
 */
router.put('/:petId', authenticate, validateUpdatePet, petController.updatePet);

/**
 * @swagger
 * /api/pets/{petId}:
 *   delete:
 *     summary: 반려동물 삭제
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 반려동물 삭제 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 반려동물을 찾을 수 없음
 */
router.delete('/:petId', authenticate, petController.deletePet);

/**
 * @swagger
 * /api/pets/{petId}/primary:
 *   patch:
 *     summary: 대표 반려동물 설정
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 대표 반려동물 설정 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 반려동물을 찾을 수 없음
 */
router.patch('/:petId/primary', authenticate, petController.setPrimaryPet);

module.exports = router;

