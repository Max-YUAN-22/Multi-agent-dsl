/**
 * 智慧城市多智能体系统 - 真实数据驱动的Agent实现
 * 集成真实传感器数据、任务分配和执行流程
 */

class SmartCityAgentFramework {
    constructor() {
        this.masterAgent = new MasterAgent();
        this.subAgents = {
            traffic: new TrafficAgent(),
            weather: new WeatherAgent(),
            parking: new ParkingAgent(),
            security: new SecurityAgent()
        };

        // 集成真实数据API管理器
        this.apiManager = typeof RealDataAPIManager !== 'undefined' ? new RealDataAPIManager() : null;

        // 集成任务跟踪器
        this.taskTracker = typeof TaskTracker !== 'undefined' ? new TaskTracker() : null;

        this.sensors = new SensorNetwork(this.apiManager);
        this.taskQueue = [];
        this.activeTasksMap = new Map();
        this.completedTasks = [];

        this.initializeSystem();
    }

    async initializeSystem() {
        console.log('🚀 初始化智慧城市多智能体系统...');

        // 启动传感器网络
        await this.sensors.initialize();

        // 注册所有智能体
        this.masterAgent.registerSubAgents(this.subAgents);

        // 启动实时数据采集
        this.startRealTimeDataCollection();

        console.log('✅ 系统初始化完成');
    }

    // 真实任务分配和执行
    async processUserRequest(request) {
        const taskId = `task_${Date.now()}`;

        console.log(`📋 Master Agent 接收任务: ${request.description}`);

        // 创建任务跟踪
        if (this.taskTracker) {
            this.taskTracker.createTaskTracker(taskId, request.description, request.priority);
            this.taskTracker.updateTaskStatus(taskId, 'running');
        }

        // Master Agent 分析任务并分解
        const taskPlan = await this.masterAgent.analyzeTask(request);

        const taskData = {
            id: taskId,
            description: request.description,
            plan: taskPlan,
            status: 'analyzing',
            startTime: Date.now(),
            steps: []
        };

        this.activeTasksMap.set(taskId, taskData);

        // 记录任务阶段
        if (this.taskTracker) {
            this.taskTracker.addTaskPhase(taskId, 'task_analysis', 'Master Agent任务分析', 'info', { agent: 'master' });
        }

        // 更新界面显示任务开始
        this.updateUI('task-start', { taskId, description: request.description });

        // 分配给相关子智能体
        const results = await this.executeTaskPlan(taskId, taskPlan);

        // Master Agent 汇总结果
        const finalResult = await this.masterAgent.synthesizeResults(results);

        // 生成最终报告
        const report = await this.generateTaskReport(taskId, finalResult);

        // 完成任务跟踪
        if (this.taskTracker) {
            const task = this.activeTasksMap.get(taskId);
            if (task) {
                task.results = finalResult;
                this.taskTracker.updateTaskStatus(taskId, 'completed');

                // 生成详细的任务报告
                const detailedReport = this.taskTracker.completeTask(taskId);
                if (detailedReport) {
                    report.detailedAnalysis = detailedReport;
                }
            }
        }

        this.completedTasks.push({
            taskId,
            request: request.description,
            result: finalResult,
            report,
            completedAt: Date.now()
        });

        this.updateUI('task-complete', { taskId, report });

        return report;
    }

    async executeTaskPlan(taskId, taskPlan) {
        const results = {};
        const task = this.activeTasksMap.get(taskId);

        console.log(`👑 Master Agent 开始协调子智能体执行...`);
        task.status = 'coordinating';
        this.updateUI('master-coordinating', { taskId });

        // 并行执行多个子任务
        const promises = taskPlan.subtasks.map(async (subtask) => {
            const agentType = subtask.assignedAgent;
            const agent = this.subAgents[agentType];

            if (!agent) {
                throw new Error(`Unknown agent type: ${agentType}`);
            }

            console.log(`🤝 分配任务给 ${agentType} Agent: ${subtask.description}`);
            task.steps.push({
                agent: agentType,
                description: subtask.description,
                status: 'executing',
                startTime: Date.now()
            });

            this.updateUI('sub-agent-start', {
                taskId,
                agentType,
                subtask: subtask.description
            });

            try {
                // 记录任务阶段
                if (this.taskTracker) {
                    this.taskTracker.addTaskPhase(taskId, 'data_acquisition', `${agentType} Agent数据获取`, 'info', { agent: agentType });
                }

                // 获取实时传感器数据
                const startTime = Date.now();
                const sensorData = await this.sensors.getData(subtask.dataRequirements);
                const dataProcessingTime = Date.now() - startTime;

                // 记录数据使用情况
                if (this.taskTracker) {
                    const dataSize = JSON.stringify(sensorData).length / 1024; // 估算KB
                    this.taskTracker.recordSensorDataUsage(taskId, agentType, dataSize, dataProcessingTime);
                }

                // 执行任务
                if (this.taskTracker) {
                    this.taskTracker.addTaskPhase(taskId, 'task_execution', `${agentType} Agent执行分析`, 'info', { agent: agentType });
                }

                const result = await agent.executeTask(subtask, sensorData);

                // 更新任务步骤状态
                const stepIndex = task.steps.findIndex(s =>
                    s.agent === agentType && s.status === 'executing'
                );
                if (stepIndex !== -1) {
                    task.steps[stepIndex].status = 'completed';
                    task.steps[stepIndex].endTime = Date.now();
                    task.steps[stepIndex].result = result;
                }

                this.updateUI('sub-agent-complete', {
                    taskId,
                    agentType,
                    result
                });

                return { [agentType]: result };
            } catch (error) {
                console.error(`❌ ${agentType} Agent 执行失败:`, error);

                // 记录错误
                if (this.taskTracker) {
                    this.taskTracker.recordError(taskId, error, agentType);
                }

                task.steps[task.steps.length - 1].status = 'failed';
                task.steps[task.steps.length - 1].error = error.message;

                this.updateUI('sub-agent-error', {
                    taskId,
                    agentType,
                    error: error.message
                });

                throw error;
            }
        });

        const subResults = await Promise.all(promises);
        subResults.forEach(result => Object.assign(results, result));

        task.status = 'synthesizing';
        console.log(`🧠 Master Agent 开始综合分析结果...`);
        this.updateUI('master-synthesizing', { taskId });

        return results;
    }

    startRealTimeDataCollection() {
        // 每30秒更新一次传感器数据
        setInterval(async () => {
            try {
                const latestData = await this.sensors.collectAllData();
                this.updateUI('sensor-data-update', latestData);

                // 检查是否需要主动告警
                this.checkAlertConditions(latestData);
            } catch (error) {
                console.error('传感器数据采集失败:', error);
            }
        }, 30000);
    }

    checkAlertConditions(sensorData) {
        // 基于真实数据的告警逻辑
        if (sensorData.traffic.congestionLevel > 0.8) {
            this.processUserRequest({
                description: "检测到严重交通拥堵，请优化交通信号控制",
                priority: "high",
                autoGenerated: true
            });
        }

        if (sensorData.weather.windSpeed > 15 || sensorData.weather.visibility < 1000) {
            this.processUserRequest({
                description: "恶劣天气条件检测，请评估交通安全风险",
                priority: "high",
                autoGenerated: true
            });
        }
    }

    async generateTaskReport(taskId, results) {
        const task = this.activeTasksMap.get(taskId);
        const duration = Date.now() - task.startTime;

        return {
            taskId,
            executionTime: `${(duration / 1000).toFixed(1)}秒`,
            agentsInvolved: task.steps.map(s => s.agent),
            resultsummary: results.summary,
            detailedResults: results.details,
            recommendations: results.recommendations || [],
            timestamp: new Date().toLocaleString()
        };
    }

    updateUI(eventType, data) {
        // 向前端发送实时更新
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: data
        };

        // 如果在浏览器环境中，触发自定义事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('smartCityUpdate', {
                detail: event
            }));
        }

        // 控制台输出用于调试
        console.log(`🔄 UI更新 [${eventType}]:`, data);
    }
}

// Master Agent - 主智能体
class MasterAgent {
    constructor() {
        this.subAgents = {};
        this.knowledgeBase = new KnowledgeBase();
    }

    registerSubAgents(agents) {
        this.subAgents = agents;
        console.log('👑 Master Agent 注册子智能体:', Object.keys(agents));
    }

    async analyzeTask(request) {
        // 使用NLP分析任务需求
        const analysis = this.analyzeRequirement(request.description);

        // 根据分析结果制定执行计划
        const plan = {
            taskType: analysis.type,
            priority: request.priority || 'medium',
            subtasks: [],
            estimatedDuration: 0
        };

        // 基于任务类型分配给相应的子智能体
        if (analysis.involvesTraffic) {
            plan.subtasks.push({
                assignedAgent: 'traffic',
                description: '分析交通状况并优化',
                dataRequirements: ['traffic', 'roads'],
                estimatedTime: 30
            });
        }

        if (analysis.involvesWeather) {
            plan.subtasks.push({
                assignedAgent: 'weather',
                description: '获取天气数据并评估影响',
                dataRequirements: ['weather'],
                estimatedTime: 15
            });
        }

        if (analysis.involvesParking) {
            plan.subtasks.push({
                assignedAgent: 'parking',
                description: '优化停车资源分配',
                dataRequirements: ['parking'],
                estimatedTime: 20
            });
        }

        if (analysis.involvesSecurity) {
            plan.subtasks.push({
                assignedAgent: 'security',
                description: '评估安全风险并提供建议',
                dataRequirements: ['security'],
                estimatedTime: 25
            });
        }

        plan.estimatedDuration = plan.subtasks.reduce((sum, task) => sum + task.estimatedTime, 0);

        return plan;
    }

    analyzeRequirement(description) {
        const keywords = description.toLowerCase();

        return {
            type: this.determineTaskType(keywords),
            involvesTraffic: /traffic|交通|拥堵|路况|信号|道路/.test(keywords),
            involvesWeather: /weather|天气|雨|雪|风|温度|湿度/.test(keywords),
            involvesParking: /parking|停车|车位|停车场/.test(keywords),
            involvesSecurity: /security|安全|监控|告警|风险/.test(keywords)
        };
    }

    determineTaskType(keywords) {
        if (/optimize|优化/.test(keywords)) return 'optimization';
        if (/analyze|分析/.test(keywords)) return 'analysis';
        if (/monitor|监控/.test(keywords)) return 'monitoring';
        if (/alert|告警/.test(keywords)) return 'alert';
        return 'general';
    }

    async synthesizeResults(results) {
        // Master Agent 综合分析所有子智能体的结果
        const synthesis = {
            summary: "任务执行完成",
            details: {},
            recommendations: []
        };

        // 合并各个子智能体的分析结果
        for (const [agentType, result] of Object.entries(results)) {
            synthesis.details[agentType] = result;

            if (result.recommendations) {
                synthesis.recommendations.push(...result.recommendations);
            }
        }

        // 生成综合建议
        synthesis.summary = this.generateSummary(results);
        synthesis.overallRecommendation = this.generateOverallRecommendation(results);

        return synthesis;
    }

    generateSummary(results) {
        const agentCount = Object.keys(results).length;
        const hasIssues = Object.values(results).some(r => r.hasIssues);

        if (hasIssues) {
            return `通过${agentCount}个智能体协作分析，发现需要注意的问题并提供了优化建议`;
        } else {
            return `通过${agentCount}个智能体协作分析，系统运行正常，提供了进一步优化建议`;
        }
    }

    generateOverallRecommendation(results) {
        const recommendations = [];

        if (results.traffic && results.weather) {
            recommendations.push("建议根据天气条件动态调整交通管控策略");
        }

        if (results.parking && results.traffic) {
            recommendations.push("建议优化停车引导系统以缓解交通压力");
        }

        return recommendations.join("; ");
    }
}

// 传感器网络 - 真实数据源接口
class SensorNetwork {
    constructor(apiManager = null) {
        this.apiManager = apiManager;

        // 如果有API管理器，使用增强的传感器；否则使用基础传感器
        if (apiManager && typeof EnhancedTrafficSensors !== 'undefined') {
            this.sensors = {
                traffic: new EnhancedTrafficSensors(apiManager),
                weather: new EnhancedWeatherSensors(apiManager),
                parking: new EnhancedParkingSensors(apiManager),
                security: new EnhancedSecuritySensors(apiManager)
            };
        } else {
            this.sensors = {
                traffic: new TrafficSensors(),
                weather: new WeatherSensors(),
                parking: new ParkingSensors(),
                security: new SecuritySensors()
            };
        }

        this.dataCache = {};
        this.lastUpdate = {};
    }

    async initialize() {
        console.log('🔌 初始化传感器网络...');

        for (const [type, sensor] of Object.entries(this.sensors)) {
            try {
                await sensor.initialize();
                console.log(`✅ ${type} 传感器网络就绪`);
            } catch (error) {
                console.error(`❌ ${type} 传感器初始化失败:`, error);
            }
        }
    }

    async getData(requirements) {
        const data = {};

        for (const requirement of requirements) {
            if (this.sensors[requirement]) {
                // 检查缓存，如果数据太旧则重新获取
                if (this.shouldUpdateCache(requirement)) {
                    this.dataCache[requirement] = await this.sensors[requirement].getCurrentData();
                    this.lastUpdate[requirement] = Date.now();
                }
                data[requirement] = this.dataCache[requirement];
            }
        }

        return data;
    }

    shouldUpdateCache(sensorType) {
        const cacheTimeout = {
            traffic: 60000,    // 1分钟
            weather: 300000,   // 5分钟
            parking: 120000,   // 2分钟
            security: 30000    // 30秒
        };

        const lastUpdate = this.lastUpdate[sensorType] || 0;
        const timeout = cacheTimeout[sensorType] || 60000;

        return (Date.now() - lastUpdate) > timeout;
    }

    async collectAllData() {
        const allData = {};

        for (const [type, sensor] of Object.entries(this.sensors)) {
            try {
                allData[type] = await sensor.getCurrentData();
                this.dataCache[type] = allData[type];
                this.lastUpdate[type] = Date.now();
            } catch (error) {
                console.error(`获取${type}数据失败:`, error);
                allData[type] = this.dataCache[type] || null;
            }
        }

        return allData;
    }
}

// 交通传感器
class TrafficSensors {
    async initialize() {
        // 初始化交通传感器连接
        this.apiKey = process.env.TRAFFIC_API_KEY || 'demo_key';
        this.endpoints = {
            realtime: 'https://api.traffic.gov/realtime',
            incidents: 'https://api.traffic.gov/incidents'
        };
    }

    async getCurrentData() {
        // 模拟真实交通数据获取
        // 在实际应用中，这里会调用真实的交通API
        return {
            timestamp: new Date().toISOString(),
            congestionLevel: Math.random() * 0.6 + 0.2, // 0.2-0.8
            averageSpeed: Math.floor(Math.random() * 40 + 20), // 20-60 km/h
            incidentCount: Math.floor(Math.random() * 3),
            mainRoads: this.generateRoadData(),
            signalStatus: this.generateSignalData()
        };
    }

    generateRoadData() {
        const roads = ['中山路', '人民大道', '解放路', '建设路', '发展大街'];
        return roads.map(road => ({
            name: road,
            congestion: Math.random(),
            averageSpeed: Math.floor(Math.random() * 50 + 15),
            vehicleCount: Math.floor(Math.random() * 200 + 50)
        }));
    }

    generateSignalData() {
        return Array.from({length: 20}, (_, i) => ({
            intersectionId: `signal_${i + 1}`,
            status: Math.random() > 0.1 ? 'normal' : 'malfunction',
            currentPhase: Math.random() > 0.5 ? 'green' : 'red',
            queueLength: Math.floor(Math.random() * 15)
        }));
    }
}

// 天气传感器
class WeatherSensors {
    async initialize() {
        this.apiKey = process.env.WEATHER_API_KEY || 'demo_key';
        this.endpoint = 'https://api.weather.gov/current';
    }

    async getCurrentData() {
        // 模拟真实天气数据获取
        return {
            timestamp: new Date().toISOString(),
            temperature: Math.floor(Math.random() * 30 + 5), // 5-35°C
            humidity: Math.floor(Math.random() * 60 + 30), // 30-90%
            windSpeed: Math.floor(Math.random() * 20), // 0-20 m/s
            visibility: Math.floor(Math.random() * 8000 + 2000), // 2-10km
            precipitation: Math.random() * 10, // 0-10mm
            condition: this.getRandomWeatherCondition(),
            uvIndex: Math.floor(Math.random() * 11),
            pressure: Math.floor(Math.random() * 50 + 1000) // 1000-1050 hPa
        };
    }

    getRandomWeatherCondition() {
        const conditions = ['晴朗', '多云', '阴天', '小雨', '大雨', '雪', '雾'];
        return conditions[Math.floor(Math.random() * conditions.length)];
    }
}

// 停车传感器
class ParkingSensors {
    async initialize() {
        this.parkingLots = this.generateParkingLots();
    }

    async getCurrentData() {
        return {
            timestamp: new Date().toISOString(),
            totalSpaces: this.parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0),
            availableSpaces: this.parkingLots.reduce((sum, lot) => sum + lot.availableSpaces, 0),
            occupancyRate: this.calculateOverallOccupancy(),
            lots: this.parkingLots.map(lot => ({
                ...lot,
                availableSpaces: Math.max(0, Math.floor(Math.random() * lot.totalSpaces * 0.4)),
                pricing: this.calculateDynamicPricing(lot)
            }))
        };
    }

    generateParkingLots() {
        return [
            { id: 'lot_001', name: '市中心停车场', totalSpaces: 200, location: '中山路100号' },
            { id: 'lot_002', name: '商业广场停车场', totalSpaces: 150, location: '人民大道50号' },
            { id: 'lot_003', name: '医院停车场', totalSpaces: 100, location: '健康路25号' },
            { id: 'lot_004', name: '体育馆停车场', totalSpaces: 300, location: '体育路88号' },
            { id: 'lot_005', name: '火车站停车场', totalSpaces: 400, location: '站前广场1号' }
        ];
    }

    calculateOverallOccupancy() {
        const total = this.parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0);
        const occupied = this.parkingLots.reduce((sum, lot) =>
            sum + (lot.totalSpaces - (lot.availableSpaces || 0)), 0);
        return occupied / total;
    }

    calculateDynamicPricing(lot) {
        const basePrice = 5; // 基础价格
        const occupancyRate = (lot.totalSpaces - (lot.availableSpaces || 0)) / lot.totalSpaces;
        const multiplier = 1 + (occupancyRate * 0.5); // 占用率越高价格越高
        return Math.floor(basePrice * multiplier);
    }
}

// 安全传感器
class SecuritySensors {
    async initialize() {
        this.cameras = this.generateCameras();
        this.alarmSystems = this.generateAlarmSystems();
    }

    async getCurrentData() {
        return {
            timestamp: new Date().toISOString(),
            overallThreatLevel: this.calculateThreatLevel(),
            activeAlerts: this.generateActiveAlerts(),
            cameraStatus: this.cameras.map(camera => ({
                ...camera,
                status: Math.random() > 0.05 ? 'online' : 'offline',
                detectedObjects: Math.floor(Math.random() * 20)
            })),
            emergencyServices: {
                police: { responseTime: Math.floor(Math.random() * 10 + 5) + '分钟' },
                fire: { responseTime: Math.floor(Math.random() * 8 + 4) + '分钟' },
                medical: { responseTime: Math.floor(Math.random() * 12 + 6) + '分钟' }
            }
        };
    }

    generateCameras() {
        return Array.from({length: 50}, (_, i) => ({
            id: `cam_${String(i + 1).padStart(3, '0')}`,
            location: `监控点${i + 1}`,
            type: Math.random() > 0.5 ? 'fixed' : 'ptz'
        }));
    }

    generateAlarmSystems() {
        return Array.from({length: 10}, (_, i) => ({
            id: `alarm_${i + 1}`,
            location: `重点区域${i + 1}`,
            type: 'intrusion_detection'
        }));
    }

    calculateThreatLevel() {
        const levels = ['低', '中', '高'];
        const weights = [0.7, 0.25, 0.05]; // 大部分时间应该是低威胁
        const random = Math.random();
        let cumulativeWeight = 0;

        for (let i = 0; i < levels.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return levels[i];
            }
        }
        return levels[0];
    }

    generateActiveAlerts() {
        const alertTypes = ['设备故障', '异常行为检测', '人员聚集', '车辆违停'];
        const alertCount = Math.floor(Math.random() * 3);

        return Array.from({length: alertCount}, (_, i) => ({
            id: `alert_${Date.now()}_${i}`,
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            location: `区域${Math.floor(Math.random() * 10) + 1}`,
            severity: Math.random() > 0.7 ? 'high' : 'medium',
            timestamp: new Date().toISOString()
        }));
    }
}

// 子智能体基类
class BaseAgent {
    constructor(name) {
        this.name = name;
        this.capabilities = [];
        this.knowledgeBase = new KnowledgeBase();
    }

    async executeTask(task, sensorData) {
        console.log(`🤖 ${this.name} 开始执行任务: ${task.description}`);

        // 分析传感器数据
        const analysis = await this.analyzeData(sensorData);

        // 执行具体任务逻辑
        const result = await this.processTask(task, analysis);

        // 学习和更新知识库
        await this.updateKnowledge(task, result);

        console.log(`✅ ${this.name} 任务完成`);
        return result;
    }

    async analyzeData(sensorData) {
        // 子类实现具体的数据分析逻辑
        throw new Error('analyzeData method must be implemented by subclass');
    }

    async processTask(task, analysis) {
        // 子类实现具体的任务处理逻辑
        throw new Error('processTask method must be implemented by subclass');
    }

    async updateKnowledge(task, result) {
        // 更新知识库
        await this.knowledgeBase.updateLearning(this.name, task, result);
    }
}

// 交通管理智能体
class TrafficAgent extends BaseAgent {
    constructor() {
        super('交通管理智能体');
        this.capabilities = ['traffic_analysis', 'route_optimization', 'signal_control'];
    }

    async analyzeData(sensorData) {
        const trafficData = sensorData.traffic;

        return {
            congestionLevel: trafficData.congestionLevel,
            problematicRoads: trafficData.mainRoads.filter(road => road.congestion > 0.6),
            signalIssues: trafficData.signalStatus.filter(signal => signal.status === 'malfunction'),
            averageSpeed: trafficData.averageSpeed
        };
    }

    async processTask(task, analysis) {
        const recommendations = [];
        const hasIssues = analysis.congestionLevel > 0.7 || analysis.problematicRoads.length > 0;

        if (analysis.congestionLevel > 0.7) {
            recommendations.push('建议启动交通拥堵应急预案');
            recommendations.push('增加交警现场疏导');
        }

        if (analysis.problematicRoads.length > 0) {
            analysis.problematicRoads.forEach(road => {
                recommendations.push(`${road.name}出现严重拥堵，建议绕行引导`);
            });
        }

        if (analysis.signalIssues.length > 0) {
            recommendations.push(`发现${analysis.signalIssues.length}个信号灯故障，需要紧急维修`);
        }

        // 模拟优化算法计算
        const optimizedRoutes = this.calculateOptimalRoutes(analysis);

        return {
            analysisResult: analysis,
            hasIssues,
            optimizedRoutes,
            recommendations,
            impactAssessment: this.assessTrafficImpact(analysis),
            estimatedImprovements: hasIssues ? '预计可减少30%拥堵时间' : '交通状况良好'
        };
    }

    calculateOptimalRoutes(analysis) {
        // 模拟路径优化算法
        return analysis.problematicRoads.map(road => ({
            problematicRoad: road.name,
            alternativeRoute: `建议绕行路线：避开${road.name}，使用次干道`,
            estimatedTimeReduction: '10-15分钟'
        }));
    }

    assessTrafficImpact(analysis) {
        if (analysis.congestionLevel > 0.8) return '严重影响';
        if (analysis.congestionLevel > 0.6) return '中等影响';
        return '轻微影响';
    }
}

// 天气监测智能体
class WeatherAgent extends BaseAgent {
    constructor() {
        super('天气监测智能体');
        this.capabilities = ['weather_analysis', 'impact_prediction', 'alert_generation'];
    }

    async analyzeData(sensorData) {
        const weatherData = sensorData.weather;

        return {
            currentCondition: weatherData.condition,
            riskLevel: this.assessWeatherRisk(weatherData),
            visibility: weatherData.visibility,
            precipitation: weatherData.precipitation,
            windSpeed: weatherData.windSpeed
        };
    }

    assessWeatherRisk(weatherData) {
        let risk = 'low';

        if (weatherData.windSpeed > 15) risk = 'high';
        else if (weatherData.precipitation > 5) risk = 'high';
        else if (weatherData.visibility < 1000) risk = 'high';
        else if (weatherData.windSpeed > 10 || weatherData.precipitation > 2) risk = 'medium';

        return risk;
    }

    async processTask(task, analysis) {
        const recommendations = [];
        const hasIssues = analysis.riskLevel !== 'low';

        if (analysis.riskLevel === 'high') {
            recommendations.push('发布恶劣天气预警');
            recommendations.push('建议减速慢行，注意交通安全');

            if (analysis.visibility < 1000) {
                recommendations.push('能见度极低，建议开启大灯和雾灯');
            }

            if (analysis.windSpeed > 15) {
                recommendations.push('大风天气，注意高空坠物风险');
            }
        }

        const trafficImpact = this.assessTrafficImpact(analysis);

        return {
            analysisResult: analysis,
            hasIssues,
            weatherForecast: this.generateForecast(),
            trafficImpact,
            recommendations,
            alertLevel: analysis.riskLevel === 'high' ? 'red' : analysis.riskLevel === 'medium' ? 'yellow' : 'green'
        };
    }

    generateForecast() {
        // 模拟天气预报
        return {
            next1Hour: '天气状况预计保持稳定',
            next3Hours: '可能有轻微变化',
            next24Hours: '整体平稳，注意温度变化'
        };
    }

    assessTrafficImpact(analysis) {
        if (analysis.riskLevel === 'high') {
            return {
                level: '严重',
                expectedDelay: '20-40分钟',
                affectedAreas: '全市范围'
            };
        } else if (analysis.riskLevel === 'medium') {
            return {
                level: '中等',
                expectedDelay: '10-20分钟',
                affectedAreas: '部分主干道'
            };
        }

        return {
            level: '轻微',
            expectedDelay: '5分钟以内',
            affectedAreas: '无显著影响'
        };
    }
}

// 停车管理智能体
class ParkingAgent extends BaseAgent {
    constructor() {
        super('停车管理智能体');
        this.capabilities = ['parking_analysis', 'space_optimization', 'pricing_strategy'];
    }

    async analyzeData(sensorData) {
        const parkingData = sensorData.parking;

        return {
            overallOccupancy: parkingData.occupancyRate,
            availableSpaces: parkingData.availableSpaces,
            totalSpaces: parkingData.totalSpaces,
            criticalLots: parkingData.lots.filter(lot =>
                (lot.availableSpaces / lot.totalSpaces) < 0.1
            ),
            underutilizedLots: parkingData.lots.filter(lot =>
                (lot.availableSpaces / lot.totalSpaces) > 0.7
            )
        };
    }

    async processTask(task, analysis) {
        const recommendations = [];
        const hasIssues = analysis.overallOccupancy > 0.9 || analysis.criticalLots.length > 0;

        if (analysis.criticalLots.length > 0) {
            analysis.criticalLots.forEach(lot => {
                recommendations.push(`${lot.name}空位紧张，建议引导至其他停车场`);
            });
        }

        if (analysis.underutilizedLots.length > 0) {
            recommendations.push('发现空闲停车资源，可优化车位引导');
        }

        const optimizationStrategy = this.generateOptimizationStrategy(analysis);
        const pricingStrategy = this.generatePricingStrategy(analysis);

        return {
            analysisResult: analysis,
            hasIssues,
            optimizationStrategy,
            pricingStrategy,
            recommendations,
            expectedImprovements: hasIssues ? '预计可提高15%停车效率' : '停车资源配置良好'
        };
    }

    generateOptimizationStrategy(analysis) {
        const strategies = [];

        if (analysis.criticalLots.length > 0 && analysis.underutilizedLots.length > 0) {
            strategies.push({
                type: 'load_balancing',
                description: '均衡负载，引导车辆从饱和停车场转至空闲停车场',
                targetLots: analysis.underutilizedLots.map(lot => lot.name)
            });
        }

        strategies.push({
            type: 'dynamic_guidance',
            description: '实时更新停车引导信息，提供最优停车建议'
        });

        return strategies;
    }

    generatePricingStrategy(analysis) {
        return {
            dynamicPricing: true,
            strategy: '根据实时占用率调整停车费用',
            highDemandSurcharge: analysis.overallOccupancy > 0.8 ? '20%' : '0%',
            incentiveDiscount: analysis.underutilizedLots.length > 0 ? '15%' : '0%'
        };
    }
}

// 安全监测智能体
class SecurityAgent extends BaseAgent {
    constructor() {
        super('安全监测智能体');
        this.capabilities = ['threat_assessment', 'incident_detection', 'emergency_response'];
    }

    async analyzeData(sensorData) {
        const securityData = sensorData.security;

        return {
            threatLevel: securityData.overallThreatLevel,
            activeAlerts: securityData.activeAlerts,
            cameraStatus: securityData.cameraStatus,
            equipmentHealth: this.assessEquipmentHealth(securityData.cameraStatus),
            emergencyReadiness: securityData.emergencyServices
        };
    }

    assessEquipmentHealth(cameras) {
        const onlineCount = cameras.filter(cam => cam.status === 'online').length;
        const healthPercentage = (onlineCount / cameras.length) * 100;

        return {
            percentage: Math.round(healthPercentage),
            status: healthPercentage > 95 ? 'excellent' :
                   healthPercentage > 90 ? 'good' :
                   healthPercentage > 80 ? 'fair' : 'poor'
        };
    }

    async processTask(task, analysis) {
        const recommendations = [];
        const hasIssues = analysis.threatLevel !== '低' ||
                         analysis.activeAlerts.length > 0 ||
                         analysis.equipmentHealth.status === 'poor';

        if (analysis.threatLevel === '高') {
            recommendations.push('威胁等级较高，建议加强巡逻力度');
            recommendations.push('启动应急响应预案');
        }

        if (analysis.activeAlerts.length > 0) {
            analysis.activeAlerts.forEach(alert => {
                recommendations.push(`${alert.location}发生${alert.type}，需要关注处理`);
            });
        }

        if (analysis.equipmentHealth.status === 'poor') {
            recommendations.push('监控设备健康状况不佳，需要维护检修');
        }

        const riskAssessment = this.generateRiskAssessment(analysis);

        return {
            analysisResult: analysis,
            hasIssues,
            riskAssessment,
            responseplan: this.generateResponsePlan(analysis),
            recommendations,
            estimatedResponseTime: '5-8分钟'
        };
    }

    generateRiskAssessment(analysis) {
        const factors = [];

        if (analysis.threatLevel !== '低') factors.push('威胁等级');
        if (analysis.activeAlerts.length > 0) factors.push('活跃告警');
        if (analysis.equipmentHealth.percentage < 90) factors.push('设备故障');

        return {
            overallRisk: factors.length > 1 ? 'high' : factors.length === 1 ? 'medium' : 'low',
            riskFactors: factors,
            mitigation: factors.length > 0 ? '需要采取预防措施' : '风险可控'
        };
    }

    generateResponsePlan(analysis) {
        const actions = [];

        if (analysis.threatLevel === '高') {
            actions.push('增派安保人员到重点区域');
            actions.push('提高监控系统警戒级别');
        }

        if (analysis.activeAlerts.length > 0) {
            actions.push('派遣相关人员处理告警事件');
            actions.push('实时跟踪事件处理进度');
        }

        return {
            immediateActions: actions,
            timeframe: '立即执行',
            responsibleUnit: '安全运营中心'
        };
    }
}

// 知识库
class KnowledgeBase {
    constructor() {
        this.experiences = new Map();
        this.learningData = [];
    }

    async updateLearning(agentName, task, result) {
        const experience = {
            agent: agentName,
            task: task.description,
            result: result.analysisResult,
            timestamp: new Date().toISOString(),
            success: !result.hasIssues
        };

        this.learningData.push(experience);

        // 保持最近1000条记录
        if (this.learningData.length > 1000) {
            this.learningData = this.learningData.slice(-1000);
        }

        console.log(`📚 ${agentName} 更新知识库`);
    }

    getExperience(agentName, taskType) {
        return this.learningData.filter(exp =>
            exp.agent === agentName && exp.task.includes(taskType)
        );
    }
}

// 导出主框架类，供前端使用
if (typeof window !== 'undefined') {
    window.SmartCityAgentFramework = SmartCityAgentFramework;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartCityAgentFramework;
}

console.log('🏗️ 智慧城市多智能体系统框架加载完成');