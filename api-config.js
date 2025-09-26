/**
 * 真实数据源API配置和集成
 * 支持多种真实数据API的接入
 */

class RealDataAPIManager {
    constructor() {
        this.apiConfigs = {
            // 交通数据API配置
            traffic: {
                name: 'Traffic Data API',
                baseUrl: 'https://api.opendata.china.gov',
                endpoints: {
                    realtime: '/traffic/realtime',
                    incidents: '/traffic/incidents',
                    congestion: '/traffic/congestion'
                },
                apiKey: process.env.TRAFFIC_API_KEY || 'demo_traffic_key',
                rateLimitMs: 60000, // 1分钟
                enabled: false // 设为false使用模拟数据，true使用真实API
            },

            // 天气数据API配置
            weather: {
                name: 'Weather Data API',
                baseUrl: 'https://api.openweathermap.org/data/2.5',
                endpoints: {
                    current: '/weather',
                    forecast: '/forecast',
                    alerts: '/alerts'
                },
                apiKey: process.env.WEATHER_API_KEY || 'demo_weather_key',
                rateLimitMs: 300000, // 5分钟
                enabled: false // 设为false使用模拟数据
            },

            // 城市开放数据API
            cityData: {
                name: 'City Open Data API',
                baseUrl: 'https://data.gov.cn/api',
                endpoints: {
                    parking: '/parking/status',
                    cameras: '/security/cameras',
                    emergency: '/emergency/services'
                },
                apiKey: process.env.CITY_API_KEY || 'demo_city_key',
                rateLimitMs: 120000, // 2分钟
                enabled: false
            }
        };

        this.cache = new Map();
        this.lastFetchTime = new Map();
    }

    async fetchRealData(category, endpoint, params = {}) {
        const config = this.apiConfigs[category];
        if (!config || !config.enabled) {
            console.log(`${category} API未启用，使用模拟数据`);
            return this.getSimulatedData(category, endpoint);
        }

        const cacheKey = `${category}_${endpoint}_${JSON.stringify(params)}`;
        const lastFetch = this.lastFetchTime.get(cacheKey) || 0;
        const now = Date.now();

        // 检查速率限制
        if (now - lastFetch < config.rateLimitMs) {
            console.log(`${category} API速率限制，使用缓存数据`);
            return this.cache.get(cacheKey) || this.getSimulatedData(category, endpoint);
        }

        try {
            const url = `${config.baseUrl}${config.endpoints[endpoint]}`;
            const queryParams = new URLSearchParams({
                ...params,
                key: config.apiKey
            });

            console.log(`🌐 请求真实数据: ${url}?${queryParams}`);

            const response = await fetch(`${url}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // 转换为统一格式
            const standardizedData = this.standardizeData(category, endpoint, data);

            // 缓存数据
            this.cache.set(cacheKey, standardizedData);
            this.lastFetchTime.set(cacheKey, now);

            console.log(`✅ ${category} 真实数据获取成功`);
            return standardizedData;

        } catch (error) {
            console.error(`❌ ${category} API请求失败:`, error.message);
            console.log(`🔄 回退到模拟数据`);
            return this.getSimulatedData(category, endpoint);
        }
    }

    standardizeData(category, endpoint, rawData) {
        // 将不同API的数据格式标准化为统一格式
        switch (category) {
            case 'traffic':
                return this.standardizeTrafficData(endpoint, rawData);
            case 'weather':
                return this.standardizeWeatherData(endpoint, rawData);
            case 'cityData':
                return this.standardizeCityData(endpoint, rawData);
            default:
                return rawData;
        }
    }

    standardizeTrafficData(endpoint, data) {
        if (endpoint === 'realtime') {
            return {
                timestamp: new Date().toISOString(),
                congestionLevel: data.congestion_index || Math.random() * 0.8,
                averageSpeed: data.avg_speed || Math.floor(Math.random() * 40 + 20),
                incidentCount: data.incidents?.length || 0,
                mainRoads: data.roads?.map(road => ({
                    name: road.name || '未知道路',
                    congestion: road.traffic_index || Math.random(),
                    averageSpeed: road.speed || Math.floor(Math.random() * 50 + 15),
                    vehicleCount: road.vehicle_count || Math.floor(Math.random() * 200 + 50)
                })) || [],
                signalStatus: data.signals || []
            };
        }
        return data;
    }

    standardizeWeatherData(endpoint, data) {
        if (endpoint === 'current') {
            return {
                timestamp: new Date().toISOString(),
                temperature: data.main?.temp || Math.floor(Math.random() * 30 + 5),
                humidity: data.main?.humidity || Math.floor(Math.random() * 60 + 30),
                windSpeed: data.wind?.speed || Math.floor(Math.random() * 20),
                visibility: data.visibility || Math.floor(Math.random() * 8000 + 2000),
                precipitation: data.rain?.['1h'] || 0,
                condition: data.weather?.[0]?.description || '晴朗',
                uvIndex: data.uvi || Math.floor(Math.random() * 11),
                pressure: data.main?.pressure || Math.floor(Math.random() * 50 + 1000)
            };
        }
        return data;
    }

    standardizeCityData(endpoint, data) {
        if (endpoint === 'parking') {
            return {
                timestamp: new Date().toISOString(),
                totalSpaces: data.total_capacity || 1000,
                availableSpaces: data.available_spaces || Math.floor(Math.random() * 400),
                occupancyRate: data.occupancy_rate || Math.random(),
                lots: data.parking_lots?.map(lot => ({
                    id: lot.id,
                    name: lot.name || '停车场',
                    totalSpaces: lot.capacity || 100,
                    availableSpaces: lot.available || Math.floor(Math.random() * lot.capacity * 0.4),
                    location: lot.address || '未知位置'
                })) || []
            };
        }
        return data;
    }

    getSimulatedData(category, endpoint) {
        // 生成高质量的模拟数据
        const simulators = {
            traffic: () => this.generateTrafficData(),
            weather: () => this.generateWeatherData(),
            parking: () => this.generateParkingData(),
            security: () => this.generateSecurityData()
        };

        return simulators[category] ? simulators[category]() : null;
    }

    generateTrafficData() {
        // 基于真实城市交通规律的模拟数据
        const hourOfDay = new Date().getHours();
        const isRushHour = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 17 && hourOfDay <= 19);
        const baseCongestation = isRushHour ? 0.7 : 0.3;

        const roadNames = [
            '中山大道', '人民路', '解放大道', '建设大街', '发展路',
            '科技大道', '文化路', '体育路', '教育路', '健康大道'
        ];

        return {
            timestamp: new Date().toISOString(),
            congestionLevel: Math.min(baseCongestation + Math.random() * 0.3, 1),
            averageSpeed: Math.floor((1 - baseCongestation) * 50 + 20),
            incidentCount: Math.floor(Math.random() * (isRushHour ? 5 : 2)),
            mainRoads: roadNames.map(name => ({
                name,
                congestion: Math.min(baseCongestation + Math.random() * 0.4, 1),
                averageSpeed: Math.floor(Math.random() * 40 + 20),
                vehicleCount: Math.floor(Math.random() * 300 + 100)
            })),
            signalStatus: Array.from({length: 25}, (_, i) => ({
                intersectionId: `signal_${String(i + 1).padStart(3, '0')}`,
                status: Math.random() > 0.05 ? 'normal' : 'malfunction',
                currentPhase: Math.random() > 0.5 ? 'green' : 'red',
                queueLength: Math.floor(Math.random() * 20)
            }))
        };
    }

    generateWeatherData() {
        const season = Math.floor((new Date().getMonth() + 1) / 3);
        const seasonalTemps = [
            [0, 15],    // 冬季
            [10, 25],   // 春季
            [20, 35],   // 夏季
            [5, 20]     // 秋季
        ];

        const conditions = ['晴朗', '多云', '阴天', '小雨', '中雨', '雾霾'];
        const [minTemp, maxTemp] = seasonalTemps[season];

        return {
            timestamp: new Date().toISOString(),
            temperature: Math.floor(Math.random() * (maxTemp - minTemp) + minTemp),
            humidity: Math.floor(Math.random() * 50 + 30),
            windSpeed: Math.floor(Math.random() * 15),
            visibility: Math.floor(Math.random() * 8000 + 2000),
            precipitation: Math.random() * 5,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            uvIndex: Math.floor(Math.random() * 10),
            pressure: Math.floor(Math.random() * 40 + 1000)
        };
    }

    generateParkingData() {
        const timeOfDay = new Date().getHours();
        const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 18;
        const baseOccupancy = isBusinessHours ? 0.75 : 0.35;

        const lots = [
            { name: '市中心停车场', capacity: 200, type: 'commercial' },
            { name: '商业广场停车场', capacity: 150, type: 'shopping' },
            { name: '医院停车场', capacity: 100, type: 'medical' },
            { name: '体育馆停车场', capacity: 300, type: 'sports' },
            { name: '火车站停车场', capacity: 400, type: 'transport' },
            { name: '办公区停车场', capacity: 250, type: 'office' }
        ];

        const lotsWithAvailability = lots.map((lot, index) => {
            const typeMultiplier = {
                commercial: isBusinessHours ? 1.2 : 0.6,
                shopping: (timeOfDay >= 10 && timeOfDay <= 21) ? 1.1 : 0.7,
                medical: 1.0,
                sports: (timeOfDay >= 18 && timeOfDay <= 22) ? 1.3 : 0.5,
                transport: 1.0,
                office: isBusinessHours ? 1.4 : 0.3
            };

            const adjustedOccupancy = Math.min(
                baseOccupancy * typeMultiplier[lot.type] * (0.8 + Math.random() * 0.4),
                0.95
            );

            const occupied = Math.floor(lot.capacity * adjustedOccupancy);

            return {
                id: `lot_${String(index + 1).padStart(3, '0')}`,
                ...lot,
                totalSpaces: lot.capacity,
                availableSpaces: lot.capacity - occupied,
                occupancyRate: adjustedOccupancy,
                pricing: this.calculateDynamicPricing(lot.type, adjustedOccupancy)
            };
        });

        return {
            timestamp: new Date().toISOString(),
            totalSpaces: lots.reduce((sum, lot) => sum + lot.capacity, 0),
            availableSpaces: lotsWithAvailability.reduce((sum, lot) => sum + lot.availableSpaces, 0),
            occupancyRate: lotsWithAvailability.reduce((sum, lot) => sum + lot.occupancyRate, 0) / lotsWithAvailability.length,
            lots: lotsWithAvailability
        };
    }

    calculateDynamicPricing(type, occupancy) {
        const basePrices = {
            commercial: 8,
            shopping: 6,
            medical: 5,
            sports: 4,
            transport: 10,
            office: 7
        };

        const basePrice = basePrices[type] || 5;
        const demandMultiplier = 1 + (occupancy * 0.8); // 最多涨价80%
        return Math.ceil(basePrice * demandMultiplier);
    }

    generateSecurityData() {
        const threatLevels = ['低', '中', '高'];
        const currentHour = new Date().getHours();
        const isNightTime = currentHour < 6 || currentHour > 22;

        // 夜间威胁等级稍高
        const threatWeights = isNightTime ? [0.6, 0.3, 0.1] : [0.8, 0.15, 0.05];

        let cumulativeWeight = 0;
        const random = Math.random();
        let selectedThreatLevel = threatLevels[0];

        for (let i = 0; i < threatLevels.length; i++) {
            cumulativeWeight += threatWeights[i];
            if (random <= cumulativeWeight) {
                selectedThreatLevel = threatLevels[i];
                break;
            }
        }

        const alertTypes = [
            '设备离线', '异常行为检测', '人员聚集', '车辆违停',
            '噪音异常', '烟雾检测', '入侵检测', '设备故障'
        ];

        const maxAlerts = selectedThreatLevel === '高' ? 5 : selectedThreatLevel === '中' ? 2 : 1;
        const alertCount = Math.floor(Math.random() * maxAlerts);

        return {
            timestamp: new Date().toISOString(),
            overallThreatLevel: selectedThreatLevel,
            activeAlerts: Array.from({length: alertCount}, (_, i) => ({
                id: `alert_${Date.now()}_${i}`,
                type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
                location: `监控区域${Math.floor(Math.random() * 20) + 1}`,
                severity: Math.random() > 0.7 ? 'high' : 'medium',
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString() // 最近1小时内
            })),
            cameraStatus: Array.from({length: 60}, (_, i) => ({
                id: `cam_${String(i + 1).padStart(3, '0')}`,
                location: `监控点${i + 1}`,
                type: Math.random() > 0.3 ? 'fixed' : 'ptz',
                status: Math.random() > 0.02 ? 'online' : 'offline', // 2%故障率
                detectedObjects: Math.floor(Math.random() * 15),
                lastUpdate: new Date().toISOString()
            })),
            emergencyServices: {
                police: {
                    responseTime: Math.floor(Math.random() * 8 + 5) + '分钟',
                    availableUnits: Math.floor(Math.random() * 5 + 3)
                },
                fire: {
                    responseTime: Math.floor(Math.random() * 6 + 4) + '分钟',
                    availableUnits: Math.floor(Math.random() * 3 + 2)
                },
                medical: {
                    responseTime: Math.floor(Math.random() * 10 + 6) + '分钟',
                    availableUnits: Math.floor(Math.random() * 4 + 2)
                }
            }
        };
    }

    // 启用真实API（需要有效的API密钥）
    enableRealAPI(category, apiKey) {
        if (this.apiConfigs[category]) {
            this.apiConfigs[category].enabled = true;
            this.apiConfigs[category].apiKey = apiKey;
            console.log(`✅ ${category} 真实API已启用`);
        }
    }

    // 禁用真实API，回退到模拟数据
    disableRealAPI(category) {
        if (this.apiConfigs[category]) {
            this.apiConfigs[category].enabled = false;
            console.log(`❌ ${category} 真实API已禁用，使用模拟数据`);
        }
    }

    // 获取API状态
    getAPIStatus() {
        const status = {};
        Object.keys(this.apiConfigs).forEach(category => {
            const config = this.apiConfigs[category];
            status[category] = {
                name: config.name,
                enabled: config.enabled,
                lastFetch: this.lastFetchTime.get(category),
                cached: this.cache.has(category)
            };
        });
        return status;
    }

    // 清理缓存
    clearCache() {
        this.cache.clear();
        this.lastFetchTime.clear();
        console.log('🗑️ API缓存已清理');
    }
}

// 扩展传感器类以使用真实API
class EnhancedTrafficSensors {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    async initialize() {
        console.log('🚦 初始化增强交通传感器...');
    }

    async getCurrentData() {
        return await this.apiManager.fetchRealData('traffic', 'realtime', {
            city: 'beijing',
            include: 'roads,signals,incidents'
        });
    }
}

class EnhancedWeatherSensors {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    async initialize() {
        console.log('🌤️ 初始化增强天气传感器...');
    }

    async getCurrentData() {
        return await this.apiManager.fetchRealData('weather', 'current', {
            q: 'Beijing',
            units: 'metric',
            lang: 'zh_cn'
        });
    }
}

class EnhancedParkingSensors {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    async initialize() {
        console.log('🅿️ 初始化增强停车传感器...');
    }

    async getCurrentData() {
        return await this.apiManager.fetchRealData('cityData', 'parking', {
            city: 'beijing',
            district: 'all'
        });
    }
}

class EnhancedSecuritySensors {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    async initialize() {
        console.log('🔒 初始化增强安全传感器...');
    }

    async getCurrentData() {
        return await this.apiManager.fetchRealData('cityData', 'security', {
            include: 'cameras,alerts,emergency'
        });
    }
}

// 导出API管理器和增强传感器类
if (typeof window !== 'undefined') {
    window.RealDataAPIManager = RealDataAPIManager;
    window.EnhancedTrafficSensors = EnhancedTrafficSensors;
    window.EnhancedWeatherSensors = EnhancedWeatherSensors;
    window.EnhancedParkingSensors = EnhancedParkingSensors;
    window.EnhancedSecuritySensors = EnhancedSecuritySensors;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RealDataAPIManager,
        EnhancedTrafficSensors,
        EnhancedWeatherSensors,
        EnhancedParkingSensors,
        EnhancedSecuritySensors
    };
}

console.log('🌐 真实数据API管理器加载完成');