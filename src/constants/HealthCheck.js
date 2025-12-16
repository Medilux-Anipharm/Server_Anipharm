const CONCERNS = {
    DENTAL: 'dental',
    JOINT: 'joint',
    SKIN: 'skin',
    EYE: 'eye',
    KIDNEY: 'kidney',
    VOMIT: 'vomit',
    AGING: 'aging',
    NUTRITION: 'nutrition',
    HEART: 'heart',
    OBESITY: 'obesity',
    IMMUNITY: 'immunity',
};

const APPETITE = {
    NORMAL: 'normal',
    REDUCED: 'reduced',
    ALMOST_NOT_EATING: 'almost_not_eating',
    INCREASED: 'increased',
};

const ACTIVITY = {
    NORMAL: 'normal',
    REDUCED: 'reduced',
    VERY_LAZY: 'very_lazy',
    TOO_ACTIVE: 'too_active',
};

const TEMPERATURE = {
    NORMAL: 'normal',
    LOW: 'low',
    HIGH: 'high',
    NOT_MEASURED: 'not_measured',
};

const TRIAGE_LEVEL = {
    BLUE: 'blue',
    GREEN: 'green',
    AMBER: 'amber',
    RED: 'red',
};

module.exports = {
    CONCERNS,
    CONCERN_LABELS: {
        [CONCERNS.DENTAL]: '치아/구강',
        [CONCERNS.JOINT]: '뼈/관절',
        [CONCERNS.SKIN]: '피부/미모',
        [CONCERNS.EYE]: '눈',
        [CONCERNS.KIDNEY]: '신장/요로',
        [CONCERNS.VOMIT]: '구토',
        [CONCERNS.AGING]: '노화',
        [CONCERNS.NUTRITION]: '영양',
        [CONCERNS.HEART]: '심장',
        [CONCERNS.OBESITY]: '비만',
        [CONCERNS.IMMUNITY]: '면역력',
    },
    APPETITE,
    APPETITE_LABELS: {
        [APPETITE.NORMAL]: '정상',
        [APPETITE.REDUCED]: '감소',
        [APPETITE.ALMOST_NOT_EATING]: '거의 안 먹음',
        [APPETITE.INCREASED]: '증가',
    },
    ACTIVITY,
    ACTIVITY_LABELS: {
        [ACTIVITY.NORMAL]: '정상',
        [ACTIVITY.REDUCED]: '감소',
        [ACTIVITY.VERY_LAZY]: '매우 무기력',
        [ACTIVITY.TOO_ACTIVE]: '과도하게 활동적',
    },
    TEMPERATURE,
    TEMPERATURE_LABELS: {
        [TEMPERATURE.NORMAL]: '정상',
        [TEMPERATURE.LOW]: '낮음',
        [TEMPERATURE.HIGH]: '높음',
        [TEMPERATURE.NOT_MEASURED]: '미측정',
    },
    TRIAGE_LEVEL,
    TRIAGE_LEVEL_LABELS: {
        [TRIAGE_LEVEL.BLUE]: '양호',
        [TRIAGE_LEVEL.GREEN]: '주의',
        [TRIAGE_LEVEL.AMBER]: '상담 권고',
        [TRIAGE_LEVEL.RED]: '즉시 내원',
    },
};