const { HealthRecord } = require('../models');
const {
  HEALTH_RECORD_TYPES,
} = require("../constants/HealthRecordType");


class HealthRecordService {
    // 건강기록
    async createHealthRecord(petId, userId, recordDate, recordType, mealAmount, waterAmount, urineColor, fecesConsistency, fecesColor, fecesPhotoUrl, activityMinutes, weightKg, symptoms, symptomPhotoUrls, memo) {
        try {
            const hasAnyValue = 
                mealAmount != null ||
                waterAmount != null ||
                urineColor != null ||
                fecesConsistency != null ||
                fecesColor != null ||
                fecesPhotoUrl != null ||
                activityMinutes != null ||
                weightKg != null ||
                symptoms != null ||
                symptomPhotoUrls != null ||
                memo != null;

            if (!hasAnyValue) {
                throw new Error('최소 하나 이상의 건강 기록 데이터를 입력해야 합니다.');
            }

            // 필드가 없거나 undefined인 경우 null로 처리
            const healthRecord = await HealthRecord.create({
                petId,
                userId,
                recordDate,
                recordType,
                mealAmount: mealAmount ?? null,
                waterAmount: waterAmount ?? null,
                urineColor: urineColor ?? null,
                fecesConsistency: fecesConsistency ?? null,
                fecesColor: fecesColor ?? null,
                fecesPhotoUrl: fecesPhotoUrl ?? null,
                activityMinutes: activityMinutes ?? null,
                weightKg: weightKg ?? null,
                symptoms: symptoms ?? null,
                symptomPhotoUrls: symptomPhotoUrls ?? null,
                memo: memo ?? null,
            });

            return healthRecord;
        } catch (error) {
            console.error('건강기록 생성 오류:', error);
            throw error;
        }
    }// end createHealthRecord method
    // 건강기록 수정
    async updateHealthRecord(recordId, petId, userId, recordDate, recordType, mealAmount, waterAmount, urineColor, fecesConsistency, fecesColor, fecesPhotoUrl, activityMinutes, weightKg, symptoms, symptomPhotoUrls, memo) {
        try{
            const health_records = await HealthRecord.findOne({
                where: {
                    recordId,
                    petId,
                    userId,
                },
            });
            if (!health_records) {
                throw new Error('건강기록을 찾을 수 없습니다.');
            }
            await HealthRecord.update({
                mealAmount: mealAmount ?? null,
                waterAmount: waterAmount ?? null,
                urineColor: urineColor ?? null,
                fecesConsistency: fecesConsistency ?? null,
                fecesColor: fecesColor ?? null,
                fecesPhotoUrl: fecesPhotoUrl ?? null,
                activityMinutes: activityMinutes ?? null,
                weightKg: weightKg ?? null,
                symptoms: symptoms ?? null,
                symptomPhotoUrls: symptomPhotoUrls ?? null,
                memo: memo ?? null,
            }, {
                where: {
                    recordId,
                },
            });
            return health_records;
        } catch (error) {
            console.error('건강기록 수정 오류:', error);
            throw error;
        }
    }// end updateHealthRecord method
    // 건강기록 삭제
    async deleteHealthRecord(recordId) {
        try{
            const health_records = await HealthRecord.findOne({
                where: {
                    recordId,
                },
            });
            if (!health_records) {
                throw new Error('건강기록을 찾을 수 없습니다.');
            }
            await health_records.destroy();
            return health_records;
        } catch (error) {
            console.error('건강기록 삭제 오류:', error);
            throw error;
        }
    }// end deleteHealthRecord method
    
    // 배변 사진 URL 저장/업데이트
    async saveFecesPhoto(recordId, petId, userId, photoUrl) {
        try {
            // 건강 기록 존재 및 권한 확인
            const healthRecord = await HealthRecord.findOne({
                where: {
                    recordId,
                    petId,
                    userId,
                },
            });

            if (!healthRecord) {
                throw new Error('건강기록을 찾을 수 없거나 권한이 없습니다.');
            }

            // 배변 사진 URL 업데이트
            await HealthRecord.update(
                { fecesPhotoUrl: photoUrl },
                {
                    where: {
                        recordId,
                    },
                }
            );

            // 업데이트된 기록 반환
            const updatedRecord = await HealthRecord.findByPk(recordId);
            return updatedRecord;
        } catch (error) {
            console.error('배변 사진 저장 오류:', error);
            throw error;
        }
    }// end saveFecesPhoto method

    // 증상 사진 URL 배열에 추가
    async addSymptomPhoto(recordId, petId, userId, photoUrl) {
        try {
            // 건강 기록 존재 및 권한 확인
            const healthRecord = await HealthRecord.findOne({
                where: {
                    recordId,
                    petId,
                    userId,
                },
            });

            if (!healthRecord) {
                throw new Error('건강기록을 찾을 수 없거나 권한이 없습니다.');
            }

            // 기존 증상 사진 URL 배열 가져오기
            const existingPhotos = healthRecord.symptomPhotoUrls || [];

            // 새 사진 URL 추가 (중복 방지)
            if (!existingPhotos.includes(photoUrl)) {
                existingPhotos.push(photoUrl);
            }

            // 증상 사진 URL 배열 업데이트
            await HealthRecord.update(
                { symptomPhotoUrls: existingPhotos },
                {
                    where: {
                        recordId,
                    },
                }
            );

            // 업데이트된 기록 반환
            const updatedRecord = await HealthRecord.findByPk(recordId);
            return updatedRecord;
        } catch (error) {
            console.error('증상 사진 추가 오류:', error);
            throw error;
        }
    }// end addSymptomPhoto method

    // 증상 사진 URL 배열에서 삭제
    async removeSymptomPhoto(recordId, petId, userId, photoUrl) {
        try {
            // 건강 기록 존재 및 권한 확인
            const healthRecord = await HealthRecord.findOne({
                where: {
                    recordId,
                    petId,
                    userId,
                },
            });

            if (!healthRecord) {
                throw new Error('건강기록을 찾을 수 없거나 권한이 없습니다.');
            }

            // 기존 증상 사진 URL 배열 가져오기
            const existingPhotos = healthRecord.symptomPhotoUrls || [];

            // 해당 사진 URL 제거
            const updatedPhotos = existingPhotos.filter(url => url !== photoUrl);

            // 증상 사진 URL 배열 업데이트
            await HealthRecord.update(
                { symptomPhotoUrls: updatedPhotos },
                {
                    where: {
                        recordId,
                    },
                }
            );

            // 업데이트된 기록 반환
            const updatedRecord = await HealthRecord.findByPk(recordId);
            return updatedRecord;
        } catch (error) {
            console.error('증상 사진 삭제 오류:', error);
            throw error;
        }
    }// end removeSymptomPhoto method

    // 증상 사진 URL 배열 전체 교체
    async updateSymptomPhotos(recordId, petId, userId, photoUrls) {
        try {
            // 건강 기록 존재 및 권한 확인
            const healthRecord = await HealthRecord.findOne({
                where: {
                    recordId,
                    petId,
                    userId,
                },
            });

            if (!healthRecord) {
                throw new Error('건강기록을 찾을 수 없거나 권한이 없습니다.');
            }

            // 증상 사진 URL 배열 전체 교체
            await HealthRecord.update(
                { symptomPhotoUrls: photoUrls || [] },
                {
                    where: {
                        recordId,
                    },
                }
            );

            // 업데이트된 기록 반환
            const updatedRecord = await HealthRecord.findByPk(recordId);
            return updatedRecord;
        } catch (error) {
            console.error('증상 사진 업데이트 오류:', error);
            throw error;
        }
    }// end updateSymptomPhotos method
    
    // 반려동물 별 건강기록 목록 조회
    // 날짜별 건강기록 조회
    // 기록 타입별 목록 조회
    // 최근 건강기록 조회
    // 증상사진 관리
    // 건강기록 검색
    // 배변사진 관리
    // 체중 변화 
    // 식사량 통계
    // 활동량 통계
    
}// end HealthRecordService class

module.exports = new HealthRecordService();