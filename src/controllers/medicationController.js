/**
 * 약제품 컨트롤러
 */

const medicationService = require('../services/medicationService');

/**
 * JSON 데이터 import (관리자용)
 */
exports.importJSONData = async (req, res) => {
    try {
        const result = await medicationService.importFromJSON();
        res.status(200).json({
            success: true,
            message: '약제품 데이터를 성공적으로 저장했습니다.',
            data: result
        });
    } catch (error) {
        console.error('JSON import 오류:', error);
        res.status(500).json({
            success: false,
            message: 'JSON 데이터 import 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 키워드로 약제품 검색
 */
exports.searchByKeyword = async (req, res) => {
    try {
        const { query, species, limit = 5 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: '검색어를 입력해주세요.'
            });
        }

        const medications = await medicationService.searchByKeyword(
            query,
            species || null,
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            data: medications,
            count: medications.length
        });
    } catch (error) {
        console.error('약제품 검색 오류:', error);
        res.status(500).json({
            success: false,
            message: '약제품 검색 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 건강 고민별 약제품 추천
 */
exports.recommendByHealthConcern = async (req, res) => {
    try {
        const { concernType, species, limit = 3 } = req.query;

        if (!concernType) {
            return res.status(400).json({
                success: false,
                message: '건강 고민 타입을 입력해주세요. (dental, joint, skin, eye, kidney, vomit, aging, nutrition, heart, obesity, constipation, immunity)'
            });
        }

        if (!species) {
            return res.status(400).json({
                success: false,
                message: '반려동물 종류를 입력해주세요. (강아지, 고양이)'
            });
        }

        const medications = await medicationService.recommendByHealthConcern(
            concernType,
            species,
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            data: medications,
            count: medications.length
        });
    } catch (error) {
        console.error('약제품 추천 오류:', error);
        res.status(500).json({
            success: false,
            message: '약제품 추천 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 약제품 상세 정보 조회
 */
exports.getDetail = async (req, res) => {
    try {
        const { medicationId } = req.params;

        const { PetMedication } = require('../models');
        const medication = await PetMedication.findByPk(medicationId, {
            attributes: [
                'medicationId',
                'originalId',
                'productName',
                'brandName',
                'company',
                'approvalDate',
                'approvalStatus',
                'productType',
                'manufacturingType',
                'indication',
                'dosage',
                'sideEffects',
                'precautions',
                'storage',
                'keywords',
                'fullText'
            ]
            // createdAt, updatedAt은 Sequelize가 자동으로 포함 (timestamps: true)
        });

        if (!medication) {
            return res.status(404).json({
                success: false,
                message: '해당 약제품을 찾을 수 없습니다.'
            });
        }

        res.status(200).json({
            success: true,
            data: medication
        });
    } catch (error) {
        console.error('약제품 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '약제품 정보 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 사용자 메시지에서 약제품 키워드 추출 (테스트용)
 */
exports.extractKeywords = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: '메시지를 입력해주세요.'
            });
        }

        const keywords = medicationService.extractMedicationKeywords(message);

        res.status(200).json({
            success: true,
            data: {
                message,
                keywords,
                hasMedicationKeywords: keywords.length > 0
            }
        });
    } catch (error) {
        console.error('키워드 추출 오류:', error);
        res.status(500).json({
            success: false,
            message: '키워드 추출 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

