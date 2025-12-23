const { PetMedication, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class MedicationService {
    async searchByKeyword(query, species = null, limit = 5) {
        try {
            console.log(`[약제품 검색] 시작 - 검색어: "${query}", 종류: ${species || '전체'}, 제한: ${limit}`);
            
            const where = {
                [Op.or]: [
                    { productName: { [Op.like]: `%${query}%` } },
                    { indication: { [Op.like]: `%${query}%` } },
                    { keywords: { [Op.like]: `%${query}%` } },
                    { fullText: { [Op.like]: `%${query}%` } },
                    { searchText: { [Op.like]: `%${query}%` } }
                ],
                approvalStatus: '정상'
            };

            console.log(`[약제품 검색] 검색 조건:`, JSON.stringify(where, null, 2));

            const medications = await PetMedication.findAll({
                where,
                limit,
                order: [
                    // 제품명이 정확히 일치하는 것을 우선
                    [sequelize.literal(`CASE WHEN product_name ILIKE '${query.replace(/'/g, "''")}' THEN 1 ELSE 2 END`), 'ASC'],
                    ['product_name', 'ASC'],
                    ['approval_date', 'DESC']
                ],
                attributes: [
                    'medicationId',
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
                    'searchText'
                ]
            });

            console.log(`[약제품 검색] 결과: ${medications.length}개 약제품 발견`);
            if (medications.length > 0) {
                medications.forEach((med, index) => {
                    console.log(`[약제품 검색] ${index + 1}. ${med.productName} (ID: ${med.medicationId})`);
                });
            } else {
                console.log(`[약제품 검색] 검색 결과 없음 - 검색어: "${query}"`);
            }

            return medications;
        } catch (error) {
            console.error('[약제품 검색] 오류 발생:', error.message);
            console.error('[약제품 검색] 스택:', error.stack);
            return [];
        }
    }

    async recommendByHealthConcern(concernType, species, limit = 3) {
        console.log(`[건강고민 기반 추천] 시작 - 고민타입: ${concernType}, 종류: ${species}, 제한: ${limit}`);
        
        const concernToKeyWords = {
            dental: ['치아', '구강', '치아질환', '치아건강', '치아질병'],
            joint: ['뼈', '관절', '뼈건강', '관절건강', '뼈관절', '관절문제'],
            skin: ['피부', '피부질환', '피부건강', '피불문제', '피불질환'],
            eye: ['눈', '눈질환', '눈건강', '눈문제', '눈질병'],
            kidney: ['신장', '신장질환', '신장건강', '신장문제', '신장질병'],
            vomit: ['구토', '구토질환', '구토건강', '구토문제', '구토질병'],
            aging: ['노화', '노화질환', '노화건강', '노화문제', '노화질병'],
            nutrition: ['영양', '영양질환', '영양건강', '영양문제', '영양질병'],
            heart: ['심장', '심장질환', '심장건강', '심장문제', '심장질병'],
            obesity: ['비만', '비만질환', '비만건강', '비만문제', '비만질병'],
            constipation: ['변비', '변비질환', '변비건강', '변비문제', '변비질병'],
            immunity: ['면역', '면역질환', '면역건강', '면역문제', '면역질병']
        };
        
        const keywords = concernToKeyWords[concernType] || [];
        console.log(`[건강고민 기반 추천] 매핑된 키워드:`, keywords);
        
        if (keywords.length === 0) {
            console.log(`[건강고민 기반 추천] 알 수 없는 고민 타입: ${concernType}`);
            return [];
        }
        
        console.log(`[건강고민 기반 추천] ${keywords.length}개 키워드로 검색 시작`);
        const searchPromises = keywords.map(keyword => this.searchByKeyword(keyword, species, limit));
        const results = await Promise.all(searchPromises);

        console.log(`[건강고민 기반 추천] 검색 완료 - 총 ${results.length}개 키워드 검색, 결과 수: ${results.map(r => r.length).join(', ')}`);

        const uniqueMedications = new Map();
        results.flat().forEach(medication => {
            if (!uniqueMedications.has(medication.medicationId)) {
                uniqueMedications.set(medication.medicationId, medication);
            }
        });

        const finalMedications = Array.from(uniqueMedications.values()).slice(0, limit);
        console.log(`[건강고민 기반 추천] 최종 추천: ${finalMedications.length}개 약제품`);
        finalMedications.forEach((med, index) => {
            console.log(`[건강고민 기반 추천] ${index + 1}. ${med.productName}`);
        });

        return finalMedications;
    }

    extractMedicationKeywords(message) {
        const medicationKeywords = [
            '약', '약물', '약제', '처방', '투약', '복용', '투여',
            '항생제', '진통제', '영양제', '보조제', '비타민',
            '치료', '복용량', '용법', '효과', '부작용',
            '삼푸', '샴푸', '연고', '크림', '스프레이'
        ];
        
        const result = medicationKeywords.filter(keyword => message.includes(keyword));
        console.log('추출된 약제 키워드:', result);
        return result;
    }

    formatMedicationsForChat(medications) {
        if (!medications || medications.length === 0) {
            return '';
        }
        let text = "\n\n";
        text += "═══════════════════════════════════════════════════════════════\n";
        text += "🔍 RAG로 검색된 약제품 정보 (반드시 확인 필수!)\n";
        text += "═══════════════════════════════════════════════════════════════\n";
        text += "⚠️ 중요: 아래 약제품 정보는 RAG 서비스를 통해 검색된 것입니다.\n";
        text += "사용자가 약물에 대해 질문하거나 관련 증상을 언급한 경우,\n";
        text += "반드시 아래 약제품 정보를 참고하여 구체적으로 답변해야 합니다.\n";
        text += "약제품 정보가 있다면 반드시 언급하고 설명해야 합니다.\n\n";

        medications.forEach((med, index) => {
            text += `${index + 1}. ${med.productName}`;
            if (med.brandName) {
                text += ` (${med.brandName})`;
            }
            text += "\n";

            if (med.company) {
                text += `   제조업체: ${med.company}\n`;
            }

            if (med.indication) {
                const indicationShort =
                    med.indication.length > 150
                        ? med.indication.substring(0, 150) + "..."
                        : med.indication;
                text += `   효능효과: ${indicationShort}\n`;
            }

            if (med.dosage) {
                const dosageShort =
                    med.dosage.length > 100
                        ? med.dosage.substring(0, 100) + "..."
                        : med.dosage;
                text += `   용법: ${dosageShort}\n`;
            }

            if (med.productType && med.productType.includes("의약품")) {
                text += `   ⚠️ 처방전 필요\n`;
            }

            text += "\n";
        });

        text += "⚠️ 약물은 반드시 수의사의 진단과 처방에 따라 사용하세요. 자가 투약은 위험할 수 있습니다.\n";

        return text;
    }

    async importFromJSON() {
        const jsonFilePath = path.join(__dirname, '../../data/medications/pet_medicine_data.json');
        
        try {
            console.log('약제품 JSON 파일 경로:', jsonFilePath);
            
            // 파일 존재 확인
            if (!fs.existsSync(jsonFilePath)) {
                throw new Error(`JSON 파일을 찾을 수 없습니다: ${jsonFilePath}`);
            }

            // JSON 파일 읽기
            console.log('[약제품 Import] JSON 파일 읽기 시작...');
            let fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
            console.log(`[약제품 Import] 파일 크기: ${(fileContent.length / 1024 / 1024).toFixed(2)} MB`);
            
            // JSON에 유효하지 않은 값들 치환 (NaN, Infinity 등)
            console.log('[약제품 Import] JSON 정규화 중...');
            fileContent = fileContent
                .replace(/:\s*NaN\s*([,}])/g, ': null$1')  // NaN -> null
                .replace(/:\s*Infinity\s*([,}])/g, ': null$1')  // Infinity -> null
                .replace(/:\s*-Infinity\s*([,}])/g, ': null$1')  // -Infinity -> null
                .replace(/:\s*undefined\s*([,}])/g, ': null$1');  // undefined -> null
            
            // JSON 파싱 (에러 처리 강화)
            let jsonData;
            try {
                jsonData = JSON.parse(fileContent);
            } catch (parseError) {
                console.error('[약제품 Import] JSON 파싱 오류:', parseError.message);
                console.error(`[약제품 Import] 오류 위치: ${parseError.message.match(/position (\d+)/)?.[1] || 'unknown'}`);
                
                // 오류 위치 주변 텍스트 출력
                if (parseError.message.includes('position')) {
                    const position = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
                    const start = Math.max(0, position - 100);
                    const end = Math.min(fileContent.length, position + 100);
                    console.error(`[약제품 Import] 오류 주변 텍스트:\n${fileContent.substring(start, end)}`);
                }
                
                throw new Error(`JSON 파일 파싱 실패: ${parseError.message}. 파일이 손상되었거나 유효하지 않은 JSON 형식일 수 있습니다.`);
            }

            // JSON 데이터가 배열인지 확인
            if (!Array.isArray(jsonData)) {
                throw new Error('JSON 파일은 배열 형식이어야 합니다.');
            }

            console.log(`총 ${jsonData.length}개의 데이터를 읽었습니다.`);

            // JSON 데이터를 DB 모델 형식으로 변환
            const results = [];
            let processedCount = 0;
            let skippedCount = 0;

            for (let i = 0; i < jsonData.length; i++) {
                const data = jsonData[i];
                
                try {
                    const medicationData = this._parseJSONRow(data);
                    if (medicationData) {
                        results.push(medicationData);
                        processedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    skippedCount++;
                    if (i < 10 || i % 1000 === 0) {
                        console.warn(`행 ${i + 1} 파싱 오류:`, error.message);
                    }
                }

                // 진행 상황 로깅
                if ((i + 1) % 10000 === 0) {
                    console.log(`진행 중... ${i + 1}/${jsonData.length} 처리됨`);
                }
            }

            console.log(`총 ${jsonData.length}개 중 ${processedCount}개의 유효한 데이터를 처리했습니다. (${skippedCount}개 건너뜀)`);

            if (results.length === 0) {
                throw new Error('처리할 유효한 데이터가 없습니다.');
            }

            // 중복 제거 (같은 originalId가 여러 개 있으면 마지막 것만 사용)
            console.log('[약제품 Import] 중복 데이터 제거 중...');
            const uniqueResults = new Map();
            results.forEach(item => {
                uniqueResults.set(item.originalId, item);
            });
            const deduplicatedResults = Array.from(uniqueResults.values());
            console.log(`[약제품 Import] 중복 제거 완료: ${results.length}개 → ${deduplicatedResults.length}개`);

            // DB에 bulk insert (배치 단위로 처리하여 성능 향상)
            const batchSize = 1000;
            let totalInserted = 0;
            
            for (let i = 0; i < deduplicatedResults.length; i += batchSize) {
                const batch = deduplicatedResults.slice(i, i + batchSize);
                console.log(`[약제품 Import] 배치 ${Math.floor(i / batchSize) + 1} 처리 중... (${i + 1}~${Math.min(i + batchSize, deduplicatedResults.length)}/${deduplicatedResults.length})`);
                
                try {
                    await PetMedication.bulkCreate(batch, {
                        updateOnDuplicate: [
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
                            'fullText',
                            'keywords',
                            'searchText'
                        ]
                        // ignoreDuplicates는 updateOnDuplicate와 함께 사용할 수 없음
                    });
                    
                    totalInserted += batch.length;
                } catch (batchError) {
                    console.error(`[약제품 Import] 배치 ${Math.floor(i / batchSize) + 1} 오류:`, batchError.message);
                    // 배치 단위로 실패하면 개별 처리 시도
                    console.log(`[약제품 Import] 개별 처리로 전환...`);
                    for (const item of batch) {
                        try {
                            await PetMedication.upsert(item, {
                                conflictFields: ['originalId'],
                                updateFields: [
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
                                    'fullText',
                                    'keywords',
                                    'searchText'
                                ]
                            });
                            totalInserted++;
                        } catch (itemError) {
                            console.warn(`[약제품 Import] 개별 항목 저장 실패 (originalId: ${item.originalId}):`, itemError.message);
                        }
                    }
                }
            }
            
            console.log(`[약제품 Import] 총 ${totalInserted}개 데이터 저장 완료`);

            console.log('약제품 데이터 저장 완료!');
            return { success: true, count: results.length, processed: processedCount, skipped: skippedCount };
        } catch (error) {
            console.error('JSON 파일 읽기/처리 오류:', error);
            throw error;
        }
    }

    /**
     * JSON 행 데이터 파싱
     * @private
     */
    _parseJSONRow(data) {
        // JSON 구조: { id, text, metadata }
        const text = data.text || '';
        const originalId = data.id || '';
        
        if (!text || !originalId) {
            return null;
        }

        // text 필드에서 정보 추출 (이스케이프된 \n 처리)
        const normalizedText = text.replace(/\\n/g, '\n');
        
        // 제품명 추출 (text 필드에서)
        const productName = this._extractField(normalizedText, '제품명') || '';
        if (!productName) {
            return null; // 제품명이 없으면 건너뜀
        }

        // text 필드에서 정보 추출
        const company = this._extractField(normalizedText, '제조업체');
        const approvalDateStr = this._extractField(normalizedText, '허가일');
        const productType = this._extractField(normalizedText, '품목정보');
        const brandName = this._extractField(normalizedText, '영문명'); // 영문명을 브랜드명으로 사용
        const indication = this._extractField(normalizedText, '효능효과');
        const dosage = this._extractField(normalizedText, '용법용량');
        const precautions = this._extractField(normalizedText, '주의사항');
        const sideEffects = this._extractField(normalizedText, '부작용');
        const storage = this._extractField(normalizedText, '보관방법') || this._extractField(normalizedText, '보관');

        // 키워드 추출 (text 필드에서)
        let keywords = [];
        const keywordsText = this._extractField(normalizedText, '키워드');
        if (keywordsText) {
            keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
        }

        // metadata에서 추가 정보 추출 (있는 경우)
        const metadata = data.metadata || {};
        const approvalStatus = metadata.approval_status || '정상';
        const manufacturingType = metadata.manufacturing_type || '제조';

        // 날짜 파싱 (유효성 검증)
        let approvalDate = null;
        if (approvalDateStr) {
            // YYYY-MM-DD 형식인지 확인
            const dateMatch = approvalDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (dateMatch) {
                const year = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]);
                const day = parseInt(dateMatch[3]);
                
                // 유효한 날짜인지 확인
                if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    const date = new Date(year, month - 1, day);
                    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                        approvalDate = date;
                    }
                }
            } else {
                // 다른 형식 시도
                const parsedDate = new Date(approvalDateStr);
                if (!isNaN(parsedDate.getTime())) {
                    approvalDate = parsedDate;
                }
            }
        }

        // 검색용 텍스트 생성
        const searchText = [
            productName,
            brandName || '',
            company || '',
            indication || '',
            keywords.join(' ')
        ].filter(t => t).join(' ').toLowerCase();

        // 문자열 길이 제한 적용 (DB 스키마에 맞춤)
        const truncateString = (str, maxLength) => {
            if (!str) return null;
            const trimmed = str.trim();
            return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
        };

        return {
            originalId: truncateString(originalId, 200),
            productName: truncateString(productName, 200),
            brandName: brandName ? truncateString(brandName, 200) : null,
            company: company ? truncateString(company, 200) : null,
            approvalDate: approvalDate,
            approvalStatus: truncateString(approvalStatus, 200),
            productType: productType ? truncateString(productType, 200) : null,
            manufacturingType: truncateString(manufacturingType, 200),
            indication: indication || null, // TEXT 타입이므로 제한 없음
            dosage: dosage || null, // TEXT 타입이므로 제한 없음
            precautions: precautions || null, // TEXT 타입이므로 제한 없음
            sideEffects: sideEffects || null, // TEXT 타입이므로 제한 없음
            storage: storage || null, // TEXT 타입이므로 제한 없음
            fullText: normalizedText, // TEXT 타입이므로 제한 없음
            keywords: keywords.length > 0 ? truncateString(keywords.join(', '), null) : null, // TEXT 타입이므로 제한 없음
            searchText: searchText // TEXT 타입이므로 제한 없음
        };
    }

    /**
     * text 필드에서 특정 정보 추출
     * @private
     */
    _extractField(text, fieldName) {
        const patterns = [
            new RegExp(`${fieldName}:\\s*([^\\n]+(?:\\n(?!\\n|${fieldName}:)[^\\n]+)*)`, 'i'),
            new RegExp(`${fieldName}\\s*:?\\s*([^\\n]+(?:\\n(?!\\n|${fieldName})[^\\n]+)*)`, 'i')
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/\n\s+/g, ' ');
            }
        }

        return null;
    }
}


module.exports = new MedicationService();