const { HealthCheck, Pet } = require('../models');
const { 
    CONCERNS, CONCERN_LABELS, 
    APPETITE, APPETITE_LABELS,
    ACTIVITY, ACTIVITY_LABELS,
    TEMPERATURE, TEMPERATURE_LABELS
} = require('../constants/HealthCheck');

class HealthCheckService {
    /**
     * 한글 라벨을 영어 enum 값으로 변환
     */
    _convertLabelToEnum(label, labelMap, enumValues) {
        // 이미 영어 enum 값인 경우 그대로 반환
        if (enumValues.includes(label)) {
            return label;
        }
        
        // 한글 라벨을 영어 enum 값으로 변환
        for (const [enumValue, labelValue] of Object.entries(labelMap)) {
            if (labelValue === label) {
                return enumValue;
            }
        }
        
        // 변환 실패 시 원래 값 반환 (에러는 모델 validation에서 처리)
        return label;
    }

    /**
     * 건강 체크표 데이터 변환 (한글 → 영어 enum)
     */
    _transformHealthCheckData(concernType, appetite, activity, temperature) {
        // concernType 배열 변환
        let transformedConcernType = concernType;
        if (Array.isArray(concernType)) {
            transformedConcernType = concernType.map(concern => {
                // 한글 값인 경우 영어 enum으로 변환
                return this._convertLabelToEnum(concern, CONCERN_LABELS, Object.values(CONCERNS));
            });
        } else if (typeof concernType === 'string') {
            // 단일 문자열인 경우 배열로 변환
            transformedConcernType = [this._convertLabelToEnum(concernType, CONCERN_LABELS, Object.values(CONCERNS))];
        }

        // appetite 변환
        const transformedAppetite = this._convertLabelToEnum(appetite, APPETITE_LABELS, Object.values(APPETITE));

        // activity 변환
        const transformedActivity = this._convertLabelToEnum(activity, ACTIVITY_LABELS, Object.values(ACTIVITY));

        // temperature 변환 (한글 값이 복잡하므로 직접 매핑)
        let transformedTemperature = temperature;
        if (temperature === '정상(37.5~39.2)' || temperature === '정상') {
            transformedTemperature = TEMPERATURE.NORMAL;
        } else if (temperature === '낮음(≤37)' || temperature === '낮음') {
            transformedTemperature = TEMPERATURE.LOW;
        } else if (temperature === '높음(≥39.5)' || temperature === '높음') {
            transformedTemperature = TEMPERATURE.HIGH;
        } else if (temperature === '미측정') {
            transformedTemperature = TEMPERATURE.NOT_MEASURED;
        } else if (!Object.values(TEMPERATURE).includes(temperature)) {
            // 이미 영어 enum 값이 아닌 경우 원래 값 유지 (validation에서 처리)
            transformedTemperature = temperature;
        }

        return {
            concernType: transformedConcernType,
            appetite: transformedAppetite,
            activity: transformedActivity,
            temperature: transformedTemperature
        };
    }

    async createHealthCheck(petId, userId, concernType, appetite, activity, temperature, note) {
        try {
            // 1. petId 존재 여부 및 소유권 확인
            const pet = await Pet.findOne({
                where: { 
                    petId: parseInt(petId),  // 문자열로 전달될 수 있으므로 정수로 변환
                    userId: parseInt(userId),
                    isDeleted: false 
                }
            });

            if (!pet) {
                throw new Error('반려동물을 찾을 수 없거나 접근 권한이 없습니다.');
            }

            // 2. 한글 값을 영어 enum 값으로 변환
            const transformed = this._transformHealthCheckData(concernType, appetite, activity, temperature);
            
            // 3. 건강 체크표 생성
            const healthCheck = await HealthCheck.create({ 
                petId: parseInt(petId),  // 정수로 변환하여 저장
                userId: parseInt(userId), 
                concernType: transformed.concernType, 
                appetite: transformed.appetite, 
                activity: transformed.activity, 
                temperature: transformed.temperature, 
                note 
            });
            return healthCheck;
        } catch (error) {
            console.error('건강체크 생성 오류:', error);
            throw error;
        }
    }

    async getHealthCheckById(healthCheckId) {
        try {
            // healthCheckId를 정수로 변환
            const checkId = parseInt(healthCheckId);
            if (isNaN(checkId)) {
                throw new Error(`유효하지 않은 healthCheckId입니다: ${healthCheckId}`);
            }

            console.log(`건강체크표 조회 시도: checkId=${checkId} (타입: ${typeof checkId})`);
            
            const healthCheck = await HealthCheck.findByPk(checkId);
            
            if (!healthCheck) {
                console.log(`건강체크표를 찾을 수 없음: checkId=${checkId}`);
                // 데이터베이스에 실제로 존재하는지 확인
                const allChecks = await HealthCheck.findAll({ limit: 10 });
                console.log(`현재 health_checks 테이블의 모든 레코드:`, allChecks.map(hc => ({ checkId: hc.checkId, petId: hc.petId, userId: hc.userId })));
                throw new Error(`건강체크표를 찾을 수 없습니다. checkId: ${checkId}`);
            }
            
            console.log(`건강체크표 조회 성공: checkId=${healthCheck.checkId}, petId=${healthCheck.petId}, userId=${healthCheck.userId}`);
            return healthCheck;
        } catch (error) {
            console.error('건강체크표 조회 오류:', error);
            throw error;
        }
    }
    
}
module.exports = new HealthCheckService();