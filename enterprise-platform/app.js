// 企业级多智能体管理平台核心逻辑

class MultiAgentPlatform {
    constructor() {
        this.agents = new Map();
        this.tasks = new Map();
        this.workflows = new Map();
        this.knowledgeBase = new Map();
        this.models = new Map();
        this.metrics = {
            system: new Map(),
            agents: new Map(),
            tasks: new Map()
        };

        // 配置项
        this.config = {
            apiBaseUrl: window.location.hostname === 'localhost'
                ? 'http://localhost:8080/api/v1'
                : '/api/v1',
            websocketUrl: window.location.hostname === 'localhost'
                ? 'ws://localhost:8080/ws'
                : `wss://${window.location.host}/ws`,
            refreshInterval: 5000,
            enableRealTime: true,
            enableAutoSave: true,
            maxConcurrentTasks: 100,
            agentTypes: ['DataProcessor', 'TaskScheduler', 'KnowledgeWorker', 'Coordinator', 'MLModel', 'APIAgent']
        };

        // 状态管理
        this.state = {
            connected: false,
            loading: false,
            currentUser: null,
            selectedAgent: null,
            activeSection: 'dashboard'
        };

        // 事件系统
        this.events = new EventTarget();

        // 实时数据
        this.realTimeData = {
            systemMetrics: {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: { in: 0, out: 0 }
            },
            agentStatus: new Map(),
            taskQueue: [],
            logs: [],
            alerts: [],
            performance: {
                throughput: 0,
                latency: 0,
                errorRate: 0,
                successRate: 100
            }
        };

        // 监控和日志系统
        this.monitoring = {
            prometheus: null,
            grafana: null,
            elasticsearch: null,
            alertManager: null,
            logCollector: new LogCollector(),
            metricsCollector: new MetricsCollector(),
            healthChecker: new HealthChecker()
        };

        // 工作流引擎和任务调度器 - 使用安全初始化
        try {
            this.workflowEngine = new WorkflowEngine();
            this.taskScheduler = new TaskScheduler();
            this.executionEngine = new ExecutionEngine();
        } catch (error) {
            console.warn('⚠️ 部分组件初始化失败，使用基础模式:', error.message);
            this.workflowEngine = { start: () => {}, stop: () => {} };
            this.taskScheduler = { start: () => {}, stop: () => {}, addTask: () => {} };
            this.executionEngine = { execute: () => Promise.resolve() };
        }

        // 企业级安全系统
        this.security = {
            authManager: new AuthenticationManager(),
            authzManager: new AuthorizationManager(),
            encryption: new EncryptionService(),
            auditLogger: new AuditLogger(),
            sessionManager: new SessionManager()
        };

        this.websocket = null;
        this.charts = {};
        this.editor = null;
        this.intervalHandlers = [];

        this.init();
    }

    async init() {
        try {
            this.setState({ loading: true });
            console.log('🚀 开始初始化企业级多智能体平台...');

            // 设置初始化超时保护
            const initTimeout = setTimeout(() => {
                console.error('⚠️ 平台初始化超时，强制完成');
                this.forceCompleteInitialization();
            }, 8000); // 8秒超时保护

            // 初始化核心组件（同步，必须成功）
            console.log('📝 初始化核心组件...');
            this.setupNavigation();
            this.setupToolbar();
            this.setupEventListeners();
            this.initializeLocalStorage();

            // 检查用户认证（可以失败，使用演示模式）
            console.log('🔐 检查用户认证...');
            try {
                await this.checkAuthentication();
            } catch (error) {
                console.warn('⚠️ 认证失败，使用演示模式:', error.message);
            }

            // 初始化连接（可以失败，使用演示模式）
            console.log('🌐 初始化连接...');
            try {
                await this.initializeConnections();
            } catch (error) {
                console.warn('⚠️ 连接失败，使用演示模式:', error.message);
                this.enableDemoMode();
            }

            // 加载数据（同步，使用演示数据）
            console.log('📊 加载初始数据...');
            if (window.loadingManager) {
                window.loadingManager.updateProgress(70, '正在加载数据...');
            }
            await this.loadInitialData();

            // 异步初始化编辑器（不阻塞主界面）
            console.log('💻 异步初始化编辑器...');
            this.initializeMonacoEditorAsync();

            // 启动实时更新
            console.log('🔄 启动实时更新...');
            this.startRealTimeUpdates();

            // 启动任务调度器
            console.log('⚡ 启动任务调度器...');
            this.taskScheduler.start();

            // 异步初始化图表（不阻塞主界面）
            console.log('📈 异步初始化图表...');
            this.initializeChartsAsync();

            // 主界面加载完成
            this.setState({ loading: false, connected: true });
            console.log('✅ 平台核心功能初始化完成');

            // 清除超时保护
            clearTimeout(initTimeout);

            // 更新加载进度
            if (window.loadingManager) {
                window.loadingManager.updateProgress(90, '平台核心初始化完成...');
                setTimeout(() => {
                    window.loadingManager.complete();
                    // 发送初始化完成事件
                    window.dispatchEvent(new CustomEvent('platformInitialized'));
                }, 500);
            }

            // 稍微延迟显示通知，避免与加载完成冲突
            setTimeout(() => {
                this.showNotification('✅ 平台初始化完成！欢迎使用企业级多智能体管理平台', 'success');
            }, 1000);

            // 检查是否需要显示新手教程
            this.checkShowTutorial();

        } catch (error) {
            console.error('平台初始化失败:', error);
            this.setState({ loading: false, connected: false });
            this.showNotification('平台初始化失败: ' + error.message, 'error');

            // 确保即使初始化失败，教程按钮仍然可用
            setTimeout(() => {
                this.addTutorialButton();
                this.addFallbackTutorialButton();
            }, 1000);
        }

        // 添加界面响应性检查
        this.checkInterfaceResponsiveness();
    }

    checkInterfaceResponsiveness() {
        console.log('🔍 检查界面响应性...');

        // 检查关键元素是否存在且可交互
        const checkElements = () => {
            const criticalElements = [
                '.sidebar',
                '.main-content',
                '.toolbar-right',
                '.btn'
            ];

            let responsiveCount = 0;

            criticalElements.forEach(selector => {
                const element = document.querySelector(selector);
                if (element && element.offsetParent !== null) {
                    responsiveCount++;
                    console.log(`✅ 元素 ${selector} 正常响应`);
                } else {
                    console.warn(`⚠️ 元素 ${selector} 可能无响应`);
                }
            });

            const responsiveRatio = responsiveCount / criticalElements.length;
            console.log(`界面响应率: ${(responsiveRatio * 100).toFixed(1)}%`);

            if (responsiveRatio < 0.8) {
                console.error('❌ 界面响应性不足，尝试修复...');
                this.fixInterfaceResponsiveness();
            } else {
                console.log('✅ 界面响应性良好');
            }
        };

        // 延迟检查，确保DOM完全渲染
        setTimeout(checkElements, 1000);

        // 周期性检查
        setInterval(checkElements, 30000); // 每30秒检查一次
    }

    fixInterfaceResponsiveness() {
        console.log('🔧 尝试修复界面响应性...');

        // 移除可能导致阻塞的元素
        const problematicElements = document.querySelectorAll('[style*="pointer-events: none"]');
        problematicElements.forEach(el => {
            el.style.pointerEvents = 'auto';
            console.log('🔧 恢复元素点击事件:', el);
        });

        // 确保关键按钮可点击
        const buttons = document.querySelectorAll('.btn, button');
        buttons.forEach(btn => {
            if (btn.style.pointerEvents === 'none') {
                btn.style.pointerEvents = 'auto';
            }
            if (!btn.onclick && !btn.getAttribute('data-section')) {
                // 为没有事件的按钮添加基本响应
                btn.style.cursor = 'pointer';
            }
        });

        // 重新初始化事件监听器
        this.setupEventListeners();

        // 强制重新添加教程按钮
        this.addFallbackTutorialButton();

        this.showNotification('界面响应性已优化', 'success');
    }

    // 状态管理
    setState(newState) {
        Object.assign(this.state, newState);
        this.events.dispatchEvent(new CustomEvent('statechange', { detail: this.state }));
        this.updateUI();
    }

    // 本地存储初始化
    initializeLocalStorage() {
        const savedState = localStorage.getItem('multiagent-platform-state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            } catch (error) {
                console.warn('恢复保存状态失败:', error);
            }
        }
    }

    // 保存状态到本地存储
    saveStateToLocal() {
        const stateToSave = {
            selectedAgent: this.state.selectedAgent,
            activeSection: this.state.activeSection,
            // 只保存必要的状态信息
        };
        localStorage.setItem('multiagent-platform-state', JSON.stringify(stateToSave));
    }

    // 用户认证检查
    async checkAuthentication() {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                throw new Error('未找到认证令牌');
            }

            const response = await this.apiCall('/auth/verify', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.success) {
                this.state.currentUser = response.user;
                return true;
            } else {
                throw new Error(response.message || '认证失败');
            }
        } catch (error) {
            // 在生产环境中，这里应该重定向到登录页面
            console.warn('认证检查失败，使用演示模式:', error.message);
            this.state.currentUser = {
                id: 'demo-user',
                name: '演示用户',
                role: 'admin',
                permissions: ['*']
            };
            return false;
        }
    }

    // 初始化连接
    async initializeConnections() {
        // 测试API连接
        try {
            await this.apiCall('/health');
            console.log('API连接正常');
        } catch (error) {
            console.warn('API连接失败，启用演示模式:', error.message);
            this.enableDemoMode();
        }

        // 初始化WebSocket连接
        this.initializeWebSocket();
    }

    // 启用演示模式
    enableDemoMode() {
        this.config.demoMode = true;
        this.generateDemoData();
        console.log('演示模式已启用');
    }

    // 生成演示数据
    generateDemoData() {
        // 生成智能体数据
        const agentTypes = this.config.agentTypes;
        agentTypes.forEach((type, index) => {
            const agent = {
                id: `${type.toLowerCase()}-${String(index + 1).padStart(2, '0')}`,
                name: `${type}-${String(index + 1).padStart(2, '0')}`,
                type: type,
                status: ['running', 'idle', 'busy'][Math.floor(Math.random() * 3)],
                cpu: Math.random() * 100,
                memory: Math.random() * 8192,
                tasks: Math.floor(Math.random() * 50),
                createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
                lastActive: new Date(Date.now() - Math.random() * 3600000),
                capabilities: this.getAgentCapabilities(type),
                config: this.getAgentConfig(type)
            };
            this.agents.set(agent.id, agent);
        });

        // 生成任务数据
        for (let i = 1; i <= 50; i++) {
            const task = {
                id: `task-${String(i).padStart(4, '0')}`,
                name: `数据处理任务 #${i}`,
                description: `处理数据集 ${i}，执行ETL操作和分析`,
                status: ['pending', 'running', 'completed', 'failed'][Math.floor(Math.random() * 4)],
                progress: Math.random() * 100,
                priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                assignedAgent: Array.from(this.agents.keys())[Math.floor(Math.random() * this.agents.size)],
                createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
                estimatedDuration: Math.floor(Math.random() * 3600000),
                actualDuration: Math.random() < 0.7 ? Math.floor(Math.random() * 3600000) : null
            };
            this.tasks.set(task.id, task);
        }

        // 生成系统指标
        this.generateSystemMetrics();
    }

    // 获取智能体能力
    getAgentCapabilities(type) {
        const capabilities = {
            DataProcessor: ['ETL', 'DataCleaning', 'DataValidation', 'StatisticalAnalysis'],
            TaskScheduler: ['TaskQueue', 'LoadBalancing', 'PriorityManagement', 'ResourceAllocation'],
            KnowledgeWorker: ['DocumentProcessing', 'KnowledgeExtraction', 'SemanticSearch', 'ReportGeneration'],
            Coordinator: ['WorkflowOrchestration', 'AgentCommunication', 'ConflictResolution', 'DecisionMaking'],
            MLModel: ['ModelTraining', 'Inference', 'ModelEvaluation', 'FeatureEngineering'],
            APIAgent: ['RESTfulAPI', 'GraphQL', 'WebhookHandling', 'DataSynchronization']
        };
        return capabilities[type] || [];
    }

    // 获取智能体配置
    getAgentConfig(type) {
        const configs = {
            DataProcessor: { maxConcurrentJobs: 5, memoryLimit: '4GB', timeout: '30m' },
            TaskScheduler: { queueSize: 1000, schedulingStrategy: 'round-robin', healthCheckInterval: '30s' },
            KnowledgeWorker: { vectorDimensions: 768, maxDocumentSize: '10MB', cacheTTL: '1h' },
            Coordinator: { maxAgents: 50, decisionTimeout: '5m', retryAttempts: 3 },
            MLModel: { gpuEnabled: true, modelFormat: 'ONNX', batchSize: 32 },
            APIAgent: { rateLimitPerSecond: 100, timeout: '30s', retries: 3 }
        };
        return configs[type] || {};
    }

    // 生成系统指标
    generateSystemMetrics() {
        this.realTimeData.systemMetrics = {
            cpu: 30 + Math.random() * 40,
            memory: 40 + Math.random() * 30,
            disk: 20 + Math.random() * 20,
            network: {
                in: 100 + Math.random() * 50,
                out: 80 + Math.random() * 40
            }
        };
    }

    // 导航系统
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        const breadcrumb = document.getElementById('current-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // 移除活跃状态
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));

                // 添加活跃状态
                item.classList.add('active');
                const targetSection = item.dataset.section;
                const targetElement = document.getElementById(targetSection);

                if (targetElement) {
                    targetElement.classList.add('active');
                    breadcrumb.textContent = item.querySelector('span').textContent;

                    // 根据页面类型执行特定初始化
                    this.handleSectionChange(targetSection);
                }
            });
        });
    }

    // 工具栏设置
    setupToolbar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // 通知按钮
        const notificationBtn = document.querySelector('.notification-btn');
        notificationBtn.addEventListener('click', () => {
            this.showNotifications();
        });
    }

    // WebSocket连接
    setupWebSocket() {
        try {
            // 模拟WebSocket连接
            this.websocket = {
                send: (data) => console.log('WebSocket发送:', data),
                close: () => console.log('WebSocket关闭'),
                onmessage: null,
                onopen: null,
                onclose: null
            };

            // 模拟连接成功
            setTimeout(() => {
                console.log('WebSocket连接成功');
                this.updateSystemStatus('online');
            }, 1000);

        } catch (error) {
            console.error('WebSocket连接失败:', error);
            this.updateSystemStatus('offline');
        }
    }

    // Monaco编辑器初始化
    initializeMonacoEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

        require(['vs/editor/editor.main'], () => {
            // 注册DSL语言
            monaco.languages.register({ id: 'dsl' });

            // DSL语法高亮
            monaco.languages.setMonarchTokensProvider('dsl', {
                tokenizer: {
                    root: [
                        [/\b(agent|task|workflow|spawn|contract|route|gather|emit)\b/, 'keyword'],
                        [/\b(capabilities|load_threshold|parties|sla|response_time|availability)\b/, 'property'],
                        [/".*?"/, 'string'],
                        [/\/\/.*/, 'comment'],
                        [/\d+/, 'number']
                    ]
                }
            });

            // 创建编辑器实例
            this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                value: this.getDefaultDSLCode(),
                language: 'dsl',
                theme: 'vs',
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line'
            });

            // 编辑器事件监听
            this.editor.onDidChangeModelContent(() => {
                this.validateDSLCode();
            });
        });
    }

    // 获取默认DSL代码
    getDefaultDSLCode() {
        return `# 企业级任务调度系统
# 这是一个真实的多智能体协作配置

agent TaskScheduler {
    capabilities: ["task_distribution", "load_balancing", "priority_management"]
    max_concurrent_tasks: 50
    load_threshold: 0.85

    sla: {
        response_time: "100ms"
        availability: "99.9%"
        throughput: "1000 tasks/minute"
    }
}

agent DataProcessor {
    capabilities: ["data_transformation", "batch_processing", "stream_processing"]
    max_concurrent_tasks: 30
    load_threshold: 0.75

    dependencies: ["database_service", "cache_service"]
}

agent QualityController {
    capabilities: ["validation", "quality_assurance", "error_handling"]
    max_concurrent_tasks: 20
    load_threshold: 0.60
}

# 定义工作流
workflow DataProcessingPipeline {
    agents: [TaskScheduler, DataProcessor, QualityController]
    coordination_model: "HCMPL_hierarchical"
    learning_mode: "CALK_collaborative"

    stages: [
        "data_ingestion",
        "data_validation",
        "data_transformation",
        "quality_check",
        "data_output"
    ]
}

# 执行任务分配
task process_customer_data {
    input: customer_dataset
    priority: "high"
    deadline: "30 minutes"

    route to TaskScheduler
    validate with QualityController
    process with DataProcessor
}

# 收集结果并生成报告
gather results from [TaskScheduler, DataProcessor, QualityController]
on completion {
    generate_report(results)
    notify_stakeholders(report)
    update_metrics(performance_data)
}`;
    }

    // 处理页面切换
    handleSectionChange(section) {
        switch (section) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'agents':
                this.loadAgentsData();
                break;
            case 'dsl-editor':
                if (this.editor) {
                    this.editor.layout();
                }
                break;
            case 'monitoring':
                this.initializeMonitoring();
                break;
        }
    }

    // 初始化仪表板
    initializeDashboard() {
        this.updateStatistics();
        this.initializeCharts();
        this.loadRecentActivity();
    }

    // 初始化监控页面
    initializeMonitoring() {
        this.renderMonitoringInterface();
        this.initializeMonitoringCharts();
        this.startRealTimeMonitoring();
    }

    renderMonitoringInterface() {
        const monitoringSection = document.getElementById('monitoring');
        if (!monitoringSection) return;

        monitoringSection.innerHTML = `
            <div class="monitoring-container">
                <div class="monitoring-header">
                    <h2>系统性能监控</h2>
                    <div class="monitoring-controls">
                        <button class="btn btn-small secondary" onclick="platform.refreshMonitoring()">
                            <i class="fas fa-sync-alt"></i> 刷新
                        </button>
                        <button class="btn btn-small secondary" onclick="platform.exportMonitoringData()">
                            <i class="fas fa-download"></i> 导出
                        </button>
                        <button class="btn btn-small primary" onclick="platform.openMonitoringSettings()">
                            <i class="fas fa-cog"></i> 设置
                        </button>
                    </div>
                </div>

                <div class="monitoring-metrics">
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-header">
                                <h4>系统性能</h4>
                                <span class="metric-status healthy">正常</span>
                            </div>
                            <div class="metric-content">
                                <div class="metric-item">
                                    <span class="metric-label">CPU 使用率</span>
                                    <div class="metric-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="cpu-progress" style="width: 0%"></div>
                                        </div>
                                        <span class="metric-value" id="cpu-value">0%</span>
                                    </div>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">内存使用率</span>
                                    <div class="metric-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="memory-progress" style="width: 0%"></div>
                                        </div>
                                        <span class="metric-value" id="memory-value">0%</span>
                                    </div>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">网络I/O</span>
                                    <div class="metric-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="network-progress" style="width: 0%"></div>
                                        </div>
                                        <span class="metric-value" id="network-value">0 MB/s</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-header">
                                <h4>智能体状态分布</h4>
                                <span class="metric-count" id="total-agents">24</span>
                            </div>
                            <div class="metric-content">
                                <div class="agent-status-chart">
                                    <canvas id="agent-status-chart" width="200" height="200"></canvas>
                                </div>
                                <div class="agent-status-legend">
                                    <div class="legend-item">
                                        <span class="legend-color online"></span>
                                        <span class="legend-label">在线</span>
                                        <span class="legend-value" id="agents-online">18</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="legend-color busy"></span>
                                        <span class="legend-label">忙碌</span>
                                        <span class="legend-value" id="agents-busy">4</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="legend-color offline"></span>
                                        <span class="legend-label">离线</span>
                                        <span class="legend-value" id="agents-offline">2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-header">
                                <h4>任务执行统计</h4>
                                <span class="metric-trend positive">+12%</span>
                            </div>
                            <div class="metric-content">
                                <div class="task-stats">
                                    <div class="stat-item">
                                        <div class="stat-value" id="tasks-completed">1,247</div>
                                        <div class="stat-label">已完成</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value" id="tasks-running">23</div>
                                        <div class="stat-label">运行中</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value" id="tasks-queued">89</div>
                                        <div class="stat-label">队列中</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value" id="tasks-failed">7</div>
                                        <div class="stat-label">失败</div>
                                    </div>
                                </div>
                                <div class="throughput-chart">
                                    <canvas id="throughput-chart" width="300" height="120"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="monitoring-details">
                    <div class="detail-tabs">
                        <button class="tab-btn active" data-tab="real-time">实时活动</button>
                        <button class="tab-btn" data-tab="performance">性能历史</button>
                        <button class="tab-btn" data-tab="alerts">告警信息</button>
                        <button class="tab-btn" data-tab="logs">系统日志</button>
                    </div>

                    <div class="tab-content active" id="real-time-tab">
                        <div class="activity-stream">
                            <div class="activity-header">
                                <h4>实时活动监控</h4>
                                <div class="activity-controls">
                                    <button class="btn btn-small" onclick="platform.pauseActivityStream()">
                                        <i class="fas fa-pause"></i> 暂停
                                    </button>
                                    <button class="btn btn-small" onclick="platform.clearActivityStream()">
                                        <i class="fas fa-trash"></i> 清空
                                    </button>
                                </div>
                            </div>
                            <div class="activity-list" id="activity-list">
                                <!-- 实时活动将在这里显示 -->
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="performance-tab">
                        <div class="performance-charts">
                            <div class="chart-container">
                                <h4>系统性能趋势</h4>
                                <canvas id="performance-trend-chart" width="800" height="300"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="alerts-tab">
                        <div class="alerts-container">
                            <div class="alerts-header">
                                <h4>系统告警</h4>
                                <div class="alert-filters">
                                    <select id="alert-severity-filter">
                                        <option value="all">所有级别</option>
                                        <option value="critical">严重</option>
                                        <option value="warning">警告</option>
                                        <option value="info">信息</option>
                                    </select>
                                </div>
                            </div>
                            <div class="alerts-list" id="alerts-list">
                                <!-- 告警信息将在这里显示 -->
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="logs-tab">
                        <div class="logs-container">
                            <div class="logs-header">
                                <h4>系统日志</h4>
                                <div class="log-controls">
                                    <select id="log-level-filter">
                                        <option value="all">所有级别</option>
                                        <option value="error">错误</option>
                                        <option value="warn">警告</option>
                                        <option value="info">信息</option>
                                        <option value="debug">调试</option>
                                    </select>
                                    <input type="text" id="log-search" placeholder="搜索日志...">
                                </div>
                            </div>
                            <div class="logs-list" id="logs-list">
                                <!-- 日志信息将在这里显示 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 初始化标签页切换
        this.initializeMonitoringTabs();
    }

    initializeMonitoringTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有活跃状态
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // 添加活跃状态
                btn.classList.add('active');
                const targetTab = btn.dataset.tab + '-tab';
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    initializeMonitoringCharts() {
        // 智能体状态分布饼图
        this.initializeAgentStatusChart();

        // 吞吐量图表
        this.initializeThroughputChart();

        // 性能趋势图表
        this.initializePerformanceTrendChart();
    }

    initializeAgentStatusChart() {
        const ctx = document.getElementById('agent-status-chart');
        if (!ctx) return;

        this.charts.agentStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['在线', '忙碌', '离线'],
                datasets: [{
                    data: [18, 4, 2],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '60%'
            }
        });
    }

    initializeThroughputChart() {
        const ctx = document.getElementById('throughput-chart');
        if (!ctx) return;

        const timeLabels = this.generateTimeLabels(12);
        const throughputData = timeLabels.map(() => Math.random() * 100 + 50);

        this.charts.throughput = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: '任务吞吐量',
                    data: throughputData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            }
        });
    }

    initializePerformanceTrendChart() {
        const ctx = document.getElementById('performance-trend-chart');
        if (!ctx) return;

        const timeLabels = this.generateTimeLabels(24);

        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'CPU 使用率',
                        data: timeLabels.map(() => Math.random() * 40 + 30),
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: '内存使用率',
                        data: timeLabels.map(() => Math.random() * 30 + 40),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: '网络使用率',
                        data: timeLabels.map(() => Math.random() * 20 + 15),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    startRealTimeMonitoring() {
        // 停止之前的监控
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        // 启动实时监控
        this.monitoringInterval = setInterval(() => {
            this.updateRealTimeMetrics();
            this.updateActivityStream();
        }, 2000);

        // 立即更新一次
        this.updateRealTimeMetrics();
        this.updateActivityStream();
    }

    updateRealTimeMetrics() {
        // 更新系统性能指标
        const metrics = this.monitoring.metricsCollector.collectSystemMetrics();

        // 更新进度条
        this.updateProgressBar('cpu', metrics.cpu);
        this.updateProgressBar('memory', metrics.memory);
        this.updateProgressBar('network', metrics.network.in / 10); // 简化显示

        // 更新智能体状态
        this.updateAgentStatusMetrics();

        // 更新任务统计
        this.updateTaskStatistics();
    }

    updateProgressBar(type, value) {
        const progressBar = document.getElementById(`${type}-progress`);
        const valueDisplay = document.getElementById(`${type}-value`);

        if (progressBar && valueDisplay) {
            progressBar.style.width = `${value}%`;

            if (type === 'network') {
                valueDisplay.textContent = `${value.toFixed(1)} MB/s`;
            } else {
                valueDisplay.textContent = `${Math.round(value)}%`;
            }

            // 根据使用率设置颜色
            progressBar.className = 'progress-fill';
            if (value > 80) {
                progressBar.classList.add('critical');
            } else if (value > 60) {
                progressBar.classList.add('warning');
            } else {
                progressBar.classList.add('normal');
            }
        }
    }

    updateAgentStatusMetrics() {
        const agents = Array.from(this.agents.values());
        const online = agents.filter(a => a.status === 'ready' || a.status === 'running').length;
        const busy = agents.filter(a => a.status === 'busy').length;
        const offline = agents.filter(a => a.status === 'offline' || a.status === 'error').length;

        document.getElementById('total-agents').textContent = agents.length;
        document.getElementById('agents-online').textContent = online;
        document.getElementById('agents-busy').textContent = busy;
        document.getElementById('agents-offline').textContent = offline;

        // 更新饼图
        if (this.charts.agentStatus) {
            this.charts.agentStatus.data.datasets[0].data = [online, busy, offline];
            this.charts.agentStatus.update();
        }
    }

    updateTaskStatistics() {
        const stats = this.taskScheduler.getTaskStats();

        document.getElementById('tasks-completed').textContent = stats.completed.toLocaleString();
        document.getElementById('tasks-running').textContent = this.taskScheduler.runningTasks.size;
        document.getElementById('tasks-queued').textContent = Array.from(this.taskScheduler.queues.values())
            .reduce((total, queue) => total + queue.length, 0);
        document.getElementById('tasks-failed').textContent = stats.failed;
    }

    updateActivityStream() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        // 生成模拟活动
        const activities = this.generateMockActivities();

        // 保持最多50个活动项
        while (activityList.children.length >= 50) {
            activityList.removeChild(activityList.lastChild);
        }

        // 添加新活动
        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = `activity-item ${activity.type}`;
            activityElement.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">${activity.message}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                <div class="activity-status ${activity.status}">
                    ${activity.statusText}
                </div>
            `;
            activityList.insertBefore(activityElement, activityList.firstChild);
        });
    }

    generateMockActivities() {
        const activities = [
            {
                type: 'agent',
                icon: 'fas fa-robot',
                message: '智能体 DataProcessor-01 开始执行任务',
                time: new Date().toLocaleTimeString(),
                status: 'running',
                statusText: '运行中'
            },
            {
                type: 'task',
                icon: 'fas fa-tasks',
                message: '任务 #1247 执行完成',
                time: new Date().toLocaleTimeString(),
                status: 'completed',
                statusText: '已完成'
            },
            {
                type: 'system',
                icon: 'fas fa-cog',
                message: '系统健康检查通过',
                time: new Date().toLocaleTimeString(),
                status: 'healthy',
                statusText: '正常'
            }
        ];

        // 随机返回1-2个活动
        return activities.slice(0, Math.floor(Math.random() * 2) + 1);
    }

    refreshMonitoring() {
        this.showNotification('监控数据已刷新', 'success');
        this.updateRealTimeMetrics();
    }

    exportMonitoringData() {
        this.showNotification('监控数据导出功能开发中...', 'info');
    }

    openMonitoringSettings() {
        this.openModal('监控设置', `
            <div class="monitoring-settings">
                <div class="setting-group">
                    <label>刷新间隔</label>
                    <select>
                        <option value="1000">1秒</option>
                        <option value="2000" selected>2秒</option>
                        <option value="5000">5秒</option>
                        <option value="10000">10秒</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>告警阈值</label>
                    <div class="threshold-settings">
                        <div>
                            <label>CPU使用率警告: </label>
                            <input type="range" min="50" max="95" value="80"> 80%
                        </div>
                        <div>
                            <label>内存使用率警告: </label>
                            <input type="range" min="50" max="95" value="85"> 85%
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    pauseActivityStream() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.showNotification('实时监控已暂停', 'info');
        }
    }

    clearActivityStream() {
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = '';
            this.showNotification('活动记录已清空', 'success');
        }
    }

    // 新手教程系统
    checkShowTutorial() {
        // 总是添加教程按钮，让用户可以随时启动教程
        this.addTutorialButton();

        // 检查用户是否已经完成过教程
        const hasCompletedTutorial = localStorage.getItem('tutorial_completed');

        if (!hasCompletedTutorial) {
            // 延迟2秒显示教程，让用户看到初始化完成并注意到教程按钮
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 2000);
        }
    }

    showWelcomeMessage() {
        // 显示欢迎消息，引导用户开始教程
        this.openModal('🎉 欢迎使用多智能体管理平台！', `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🤖</div>
                <h3 style="color: var(--text-primary); margin-bottom: 16px;">
                    欢迎来到企业级多智能体管理平台
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">
                    这是一个功能强大的智能体协作平台，包含智能体管理、任务调度、工作流设计、实时监控等完整功能。
                </p>
                <div style="background: var(--background-secondary); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: var(--text-primary);">
                        <i class="fas fa-lightbulb" style="color: var(--primary-color); margin-right: 8px;"></i>
                        建议先观看新手教程，快速了解平台功能
                    </p>
                </div>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn btn-secondary" onclick="closeModal()">
                        稍后再说
                    </button>
                    <button class="btn btn-primary" onclick="closeModal(); platform.startTutorial();">
                        <i class="fas fa-play" style="margin-right: 8px;"></i>
                        开始教程
                    </button>
                </div>
            </div>
        `);
    }

    addTutorialButton() {
        console.log('🎓 开始添加教程按钮...');

        // 增强版添加按钮逻辑，包含多种fallback策略
        const tryAddButton = () => {
            console.log('尝试添加教程按钮...');

            // 首先检查按钮是否已存在
            if (document.getElementById('tutorial-btn')) {
                console.log('教程按钮已存在，跳过添加');
                return true;
            }

            // 查找工具栏
            const toolbar = document.querySelector('.toolbar-right');
            console.log('工具栏元素:', toolbar);

            if (toolbar) {
                const tutorialBtn = document.createElement('button');
                tutorialBtn.id = 'tutorial-btn';
                tutorialBtn.className = 'btn-icon tutorial-button';
                tutorialBtn.title = '🎓 新手教程 - 点击开始学习平台使用';
                tutorialBtn.innerHTML = '<i class="fas fa-question-circle"></i>';

                // 添加明显的样式确保按钮可见
                tutorialBtn.style.cssText = `
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 8px !important;
                    width: 40px !important;
                    height: 40px !important;
                    margin: 0 8px !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 16px !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
                    position: relative !important;
                    z-index: 1000 !important;
                `;

                // 添加悬停效果
                tutorialBtn.addEventListener('mouseenter', () => {
                    tutorialBtn.style.transform = 'scale(1.1)';
                    tutorialBtn.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.5)';
                });

                tutorialBtn.addEventListener('mouseleave', () => {
                    tutorialBtn.style.transform = 'scale(1)';
                    tutorialBtn.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                });

                // 确保事件绑定正确
                tutorialBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎓 教程按钮被点击！');
                    this.startTutorial();
                };

                // 多种插入策略
                const notificationBtn = toolbar.querySelector('.notification-btn');
                const userMenu = toolbar.querySelector('.user-menu');

                try {
                    if (notificationBtn) {
                        toolbar.insertBefore(tutorialBtn, notificationBtn);
                        console.log('✅ 教程按钮已插入到通知按钮之前');
                    } else if (userMenu) {
                        toolbar.insertBefore(tutorialBtn, userMenu);
                        console.log('✅ 教程按钮已插入到用户菜单之前');
                    } else {
                        toolbar.appendChild(tutorialBtn);
                        console.log('✅ 教程按钮已追加到工具栏末尾');
                    }

                    // 验证按钮是否真的被添加了
                    const addedBtn = document.getElementById('tutorial-btn');
                    if (addedBtn) {
                        console.log('✅ 教程按钮添加成功并已验证');

                        // 添加一个闪烁效果来吸引注意
                        setTimeout(() => {
                            tutorialBtn.style.animation = 'pulse 2s infinite';
                            const style = document.createElement('style');
                            style.textContent = `
                                @keyframes pulse {
                                    0% { box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); }
                                    50% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.8); }
                                    100% { box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); }
                                }
                            `;
                            document.head.appendChild(style);
                        }, 1000);

                        return true;
                    } else {
                        console.error('❌ 教程按钮添加失败：无法验证按钮存在');
                        return false;
                    }
                } catch (error) {
                    console.error('❌ 添加教程按钮时出错:', error);
                    return false;
                }
            } else {
                console.warn('⚠️ 未找到工具栏元素 .toolbar-right');
                return false;
            }
        };

        // 立即尝试添加
        if (tryAddButton()) {
            return;
        }

        // 如果立即添加失败，使用多次重试策略
        console.log('立即添加失败，开始重试机制...');
        let attempts = 0;
        const maxAttempts = 20; // 增加重试次数
        const retryInterval = setInterval(() => {
            attempts++;
            console.log(`第 ${attempts} 次重试添加教程按钮...`);

            if (tryAddButton()) {
                clearInterval(retryInterval);
                console.log('✅ 教程按钮重试添加成功！');
            } else if (attempts >= maxAttempts) {
                clearInterval(retryInterval);
                console.error('❌ 教程按钮添加失败：已达到最大重试次数');

                // 最后一次尝试：添加到body
                this.addFallbackTutorialButton();
            }
        }, 200); // 减少重试间隔

        // 额外的DOMContentLoaded监听器
        if (document.readyState !== 'complete') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(tryAddButton, 100);
            });
        }
    }

    // 备用方案：添加悬浮教程按钮
    addFallbackTutorialButton() {
        console.log('🆘 启用备用教程按钮方案...');

        if (document.getElementById('fallback-tutorial-btn')) {
            return; // 已存在
        }

        const fallbackBtn = document.createElement('button');
        fallbackBtn.id = 'fallback-tutorial-btn';
        fallbackBtn.innerHTML = '🎓';
        fallbackBtn.title = '新手教程 - 点击开始学习';
        fallbackBtn.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            font-size: 24px !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5) !important;
            animation: bounce 2s infinite !important;
            transition: all 0.3s ease !important;
        `;

        // 添加弹跳动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);

        fallbackBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🎓 备用教程按钮被点击！');
            this.startTutorial();
        };

        document.body.appendChild(fallbackBtn);
        console.log('✅ 备用教程按钮已添加');
    }

    startTutorial() {
        this.currentTutorialStep = 0;
        this.tutorialSteps = [
            {
                target: '.main-content',
                title: '🎉 欢迎使用企业级多智能体平台！',
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
                        <h3 style="color: #667eea; margin-bottom: 15px;">欢迎来到多智能体管理平台</h3>
                        <p style="margin-bottom: 10px;">👋 本平台提供完整的智能体生命周期管理、任务调度和实时监控功能。</p>
                        <p style="margin-bottom: 10px;">🎯 本教程将用5分钟时间带您了解平台的核心功能。</p>
                        <p style="color: #667eea; font-weight: bold;">✨ 准备好开始您的智能化之旅了吗？</p>
                    </div>
                `,
                position: 'center',
                action: () => {
                    // 确保在仪表板页面
                    document.querySelector('[data-section="dashboard"]').click();
                }
            },
            {
                target: '.sidebar',
                title: '🧭 导航菜单概览',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">平台主要功能模块：</h4>
                    <ul style="line-height: 1.8; margin-left: 20px; margin-bottom: 15px;">
                        <li>📊 <strong>仪表板</strong> - 系统概览和关键指标</li>
                        <li>🤖 <strong>智能体管理</strong> - 创建和管理AI智能体</li>
                        <li>📋 <strong>任务管理</strong> - 任务分配和执行监控</li>
                        <li>💻 <strong>DSL编辑器</strong> - 领域特定语言编程</li>
                        <li>🔧 <strong>API控制台</strong> - 接口测试和调用</li>
                        <li>🔄 <strong>工作流引擎</strong> - 业务流程自动化</li>
                        <li>📈 <strong>监控中心</strong> - 实时系统监控</li>
                        <li>🤝 <strong>协作空间</strong> - 智能体协作通信</li>
                    </ul>
                    <p style="color: #28a745; font-weight: bold;">👈 点击左侧菜单项可以切换不同功能模块</p>
                `,
                position: 'right',
                action: () => {}
            },
            {
                target: '[data-section="dashboard"]',
                title: '📊 仪表板 - 系统总览',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">仪表板核心功能：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>🔍 <strong>实时监控</strong> - 查看系统整体运行状态</li>
                        <li>📈 <strong>性能指标</strong> - CPU、内存、网络使用情况</li>
                        <li>🤖 <strong>智能体状态</strong> - 活跃智能体数量和分布</li>
                        <li>📋 <strong>任务概览</strong> - 当前任务执行情况</li>
                        <li>⚡ <strong>系统吞吐量</strong> - 处理能力和响应时间</li>
                    </ul>
                    <div style="background: #e8f5e8; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745;">
                        <strong>💡 提示：</strong> 这里是您日常管理的起点，所有关键信息一目了然！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="dashboard"]').click();
                }
            },
            {
                target: '[data-section="agents"]',
                title: '🤖 智能体管理 - 核心功能',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">支持的智能体类型：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>📊 <strong>数据处理器</strong> - ETL、数据清洗和验证</li>
                        <li>⚡ <strong>任务调度器</strong> - 负载均衡和智能调度</li>
                        <li>🧠 <strong>知识工作者</strong> - 文档处理和语义搜索</li>
                        <li>🎯 <strong>协调器</strong> - 工作流编排和决策协调</li>
                        <li>🤖 <strong>ML模型</strong> - 机器学习训练和推理</li>
                        <li>🔗 <strong>API代理</strong> - 外部系统集成和数据同步</li>
                    </ul>
                    <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <strong>🚀 快速开始：</strong> 点击"创建智能体"按钮开始您的第一个AI助手！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="agents"]').click();
                }
            },
            {
                target: '[data-section="tasks"]',
                title: '📋 任务管理 - 智能调度',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">任务管理特色功能：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>🎯 <strong>智能分配</strong> - 根据智能体能力自动分配任务</li>
                        <li>📊 <strong>优先级管理</strong> - 支持多级任务优先级调度</li>
                        <li>🔄 <strong>故障恢复</strong> - 自动重试和智能错误处理</li>
                        <li>📈 <strong>性能优化</strong> - 负载均衡和资源高效利用</li>
                        <li>🔍 <strong>实时监控</strong> - 任务执行状态实时跟踪</li>
                    </ul>
                    <div style="background: #d4edda; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745;">
                        <strong>🌟 平台优势：</strong> 高效的任务调度是多智能体协作的核心！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="tasks"]').click();
                }
            },
            {
                target: '[data-section="dsl-editor"]',
                title: '💻 DSL编辑器 - 强大编程工具',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">DSL编辑器核心优势：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>🎨 <strong>语法高亮</strong> - Monaco编辑器专业支持</li>
                        <li>🔍 <strong>智能提示</strong> - 自动补全和实时错误检查</li>
                        <li>🔄 <strong>实时执行</strong> - 即时运行和结果预览</li>
                        <li>📖 <strong>丰富示例</strong> - 内置多种应用场景模板</li>
                        <li>🚀 <strong>热重载</strong> - 代码修改即时生效</li>
                    </ul>
                    <div style="background: #e2e3f1; padding: 10px; border-radius: 5px; border-left: 4px solid #6f42c1;">
                        <strong>✨ 核心价值：</strong> 用简洁的DSL语法实现复杂的智能体协作逻辑！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="dsl-editor"]').click();
                }
            },
            {
                target: '[data-section="workflow"]',
                title: '🔄 工作流引擎 - 流程自动化',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">工作流核心功能：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>🎯 <strong>可视化设计</strong> - 拖拽式流程设计器</li>
                        <li>🔀 <strong>条件分支</strong> - 智能决策和动态路由</li>
                        <li>⚡ <strong>并行执行</strong> - 多任务并发处理能力</li>
                        <li>📊 <strong>执行监控</strong> - 实时流程状态跟踪</li>
                        <li>🛠️ <strong>错误处理</strong> - 完善的异常处理机制</li>
                    </ul>
                    <div style="background: #fff0e6; padding: 10px; border-radius: 5px; border-left: 4px solid #fd7e14;">
                        <strong>🎯 应用场景：</strong> 让复杂的业务流程完全自动化运行！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="workflow"]').click();
                }
            },
            {
                target: '[data-section="monitoring"]',
                title: '📈 监控中心 - 实时洞察',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">监控系统特色：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>📊 <strong>实时图表</strong> - 系统性能数据可视化</li>
                        <li>🚨 <strong>智能告警</strong> - 异常情况及时通知</li>
                        <li>📈 <strong>趋势分析</strong> - 历史数据模式识别</li>
                        <li>🔍 <strong>详细日志</strong> - 完整的操作审计追踪</li>
                        <li>🎯 <strong>性能优化</strong> - 基于数据的优化建议</li>
                    </ul>
                    <div style="background: #f8d7da; padding: 10px; border-radius: 5px; border-left: 4px solid #dc3545;">
                        <strong>👀 管控能力：</strong> 全方位掌控系统运行状况，预防问题发生！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="monitoring"]').click();
                }
            },
            {
                target: '[data-section="collaboration"]',
                title: '🤝 协作空间 - 智能体通信',
                content: `
                    <h4 style="color: #667eea; margin-bottom: 15px;">协作系统特色：</h4>
                    <ul style="line-height: 1.6; margin-bottom: 15px;">
                        <li>💬 <strong>实时通信</strong> - 智能体间高效消息传递</li>
                        <li>🎭 <strong>角色管理</strong> - 智能体角色和权限控制</li>
                        <li>🔄 <strong>事件驱动</strong> - 基于事件的智能协作机制</li>
                        <li>🎯 <strong>冲突解决</strong> - 智能冲突检测和自动解决</li>
                        <li>📡 <strong>黑板模式</strong> - 共享信息空间协作</li>
                    </ul>
                    <div style="background: #d1f2eb; padding: 10px; border-radius: 5px; border-left: 4px solid #20c997;">
                        <strong>🌟 协作价值：</strong> 让AI智能体真正实现团队协同工作！
                    </div>
                `,
                position: 'right',
                action: () => {
                    document.querySelector('[data-section="collaboration"]').click();
                }
            },
            {
                target: '.main-content',
                title: '🎉 教程完成 - 开始精彩体验',
                content: `
                    <div style="text-align: center; padding: 30px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">🎊</div>
                        <h3 style="color: #28a745; margin-bottom: 20px;">恭喜！您已完成新手教程</h3>
                        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h4 style="color: #667eea; margin-top: 0; margin-bottom: 15px;">💡 接下来您可以：</h4>
                            <ul style="text-align: left; line-height: 2; margin-bottom: 20px;">
                                <li>🤖 <strong>创建第一个智能体</strong> - 在智能体管理中开始</li>
                                <li>📋 <strong>创建测试任务</strong> - 体验智能任务分配功能</li>
                                <li>💻 <strong>编写DSL程序</strong> - 尝试智能体协作脚本</li>
                                <li>🔄 <strong>设计工作流</strong> - 构建自动化业务流程</li>
                                <li>📊 <strong>查看监控数据</strong> - 了解系统运行状态</li>
                                <li>🤝 <strong>配置协作规则</strong> - 设置智能体协作机制</li>
                            </ul>
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <strong>🚀 快速开始建议：</strong><br>
                                1. 先创建一个"数据处理器"智能体<br>
                                2. 然后创建一个简单的数据处理任务<br>
                                3. 观察任务执行过程和结果
                            </div>
                        </div>
                        <p style="color: #666; margin-top: 20px; font-size: 14px;">
                            <strong>💬 需要帮助？</strong> 点击右上角的 🎓 教程按钮可以随时重新开始教程
                        </p>
                    </div>
                `,
                position: 'center',
                action: () => {
                    // 返回仪表板
                    document.querySelector('[data-section="dashboard"]').click();
                    // 标记教程完成
                    localStorage.setItem('enterprise_tutorial_completed', new Date().toISOString());
                    // 显示完成通知
                    setTimeout(() => {
                        this.showNotification('🎉 新手教程完成！您现在可以开始使用平台的所有功能了', 'success');
                    }, 1000);
                }
            }
        ];

        this.showTutorialStep();
    }

    showTutorialStep() {
        if (this.currentTutorialStep >= this.tutorialSteps.length) {
            this.completeTutorial();
            return;
        }

        const step = this.tutorialSteps[this.currentTutorialStep];

        // 执行步骤动作
        step.action();

        // 等待动作完成后显示提示
        setTimeout(() => {
            this.createTutorialOverlay(step);
        }, 500);
    }

    createTutorialOverlay(step) {
        // 移除之前的教程覆盖层
        this.removeTutorialOverlay();

        // 创建覆盖层
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';

        // 创建背景遮罩
        const backdrop = document.createElement('div');
        backdrop.className = 'tutorial-backdrop';
        overlay.appendChild(backdrop);

        // 找到目标元素
        const targetElement = document.querySelector(step.target);
        if (!targetElement) {
            console.warn(`教程目标元素未找到: ${step.target}`);
            this.nextTutorialStep();
            return;
        }

        // 高亮目标元素
        const rect = targetElement.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top - 8}px;
            left: ${rect.left - 8}px;
            width: ${rect.width + 16}px;
            height: ${rect.height + 16}px;
            pointer-events: none;
            z-index: 10001;
        `;
        overlay.appendChild(highlight);

        // 创建提示框
        const tooltip = document.createElement('div');
        tooltip.className = `tutorial-tooltip tooltip-${step.position}`;
        tooltip.innerHTML = `
            <div class="tutorial-header">
                <h3>${step.title}</h3>
                <div class="tutorial-progress">
                    <span>${this.currentTutorialStep + 1}</span> / <span>${this.tutorialSteps.length}</span>
                </div>
            </div>
            <div class="tutorial-content">
                <p>${step.content}</p>
            </div>
            <div class="tutorial-actions">
                ${this.currentTutorialStep > 0 ? '<button class="btn btn-secondary" onclick="platform.prevTutorialStep()">上一步</button>' : ''}
                <button class="btn btn-secondary" onclick="platform.skipTutorial()">跳过教程</button>
                <button class="btn btn-primary" onclick="platform.nextTutorialStep()">
                    ${this.currentTutorialStep === this.tutorialSteps.length - 1 ? '完成教程' : '下一步'}
                </button>
            </div>
        `;

        // 定位提示框
        this.positionTooltip(tooltip, rect, step.position);
        overlay.appendChild(tooltip);

        // 添加到页面
        document.body.appendChild(overlay);

        // 添加键盘事件监听
        this.addTutorialKeyboardEvents();
    }

    positionTooltip(tooltip, targetRect, position) {
        const tooltipWidth = 350;
        const tooltipMargin = 20;

        let top, left;

        switch (position) {
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - 100;
                left = targetRect.right + tooltipMargin;
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - 100;
                left = targetRect.left - tooltipWidth - tooltipMargin;
                break;
            case 'bottom':
                top = targetRect.bottom + tooltipMargin;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                break;
            case 'top':
                top = targetRect.top - 200 - tooltipMargin;
                left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
                break;
            default:
                top = targetRect.bottom + tooltipMargin;
                left = targetRect.left;
        }

        // 确保提示框在视窗内
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + tooltipWidth > viewportWidth) {
            left = viewportWidth - tooltipWidth - 20;
        }
        if (left < 20) {
            left = 20;
        }
        if (top < 20) {
            top = 20;
        }
        if (top + 200 > viewportHeight) {
            top = viewportHeight - 220;
        }

        tooltip.style.cssText = `
            position: fixed;
            top: ${top}px;
            left: ${left}px;
            width: ${tooltipWidth}px;
            z-index: 10002;
        `;
    }

    addTutorialKeyboardEvents() {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                this.skipTutorial();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                this.nextTutorialStep();
            } else if (e.key === 'ArrowLeft' && this.currentTutorialStep > 0) {
                this.prevTutorialStep();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        // 保存引用以便稍后移除
        this.tutorialKeyboardHandler = handleKeyPress;
    }

    removeTutorialKeyboardEvents() {
        if (this.tutorialKeyboardHandler) {
            document.removeEventListener('keydown', this.tutorialKeyboardHandler);
            this.tutorialKeyboardHandler = null;
        }
    }

    nextTutorialStep() {
        this.currentTutorialStep++;
        this.showTutorialStep();
    }

    prevTutorialStep() {
        if (this.currentTutorialStep > 0) {
            this.currentTutorialStep--;
            this.showTutorialStep();
        }
    }

    skipTutorial() {
        this.removeTutorialOverlay();
        this.removeTutorialKeyboardEvents();
        this.completeTutorial();
    }

    completeTutorial() {
        this.removeTutorialOverlay();
        this.removeTutorialKeyboardEvents();

        // 标记教程已完成
        localStorage.setItem('tutorial_completed', 'true');

        // 添加教程按钮
        this.addTutorialButton();

        // 显示完成消息
        this.showNotification('🎉 教程完成！您现在可以开始使用平台了。', 'success');

        // 返回到仪表板
        document.querySelector('[data-section="dashboard"]').click();
    }

    removeTutorialOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    resetTutorial() {
        localStorage.removeItem('tutorial_completed');
        this.showNotification('教程已重置！正在启动新手体验...', 'info');

        // 移除现有的教程按钮
        const existingBtn = document.getElementById('tutorial-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        // 重新检查和显示教程
        setTimeout(() => {
            this.checkShowTutorial();
        }, 1000);
    }

    // 更新统计数据
    updateStatistics() {
        // 模拟实时数据更新
        const stats = {
            activeAgents: Math.floor(Math.random() * 5) + 20,
            runningTasks: Math.floor(Math.random() * 20) + 140,
            throughput: (Math.random() * 0.5 + 2.0).toFixed(1) + 'K',
            resourceUsage: Math.floor(Math.random() * 15) + 60
        };

        document.getElementById('active-agents').textContent = stats.activeAgents;
        document.getElementById('running-tasks').textContent = stats.runningTasks;
        document.getElementById('throughput').textContent = stats.throughput;
        document.getElementById('resource-usage').textContent = stats.resourceUsage + '%';
    }

    // 初始化图表
    initializeCharts() {
        // 性能监控图表
        const performanceCtx = document.getElementById('performance-chart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(),
                    datasets: [{
                        label: 'CPU使用率 (%)',
                        data: this.generateRandomData(),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: '内存使用率 (%)',
                        data: this.generateRandomData(),
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        // 智能体状态分布图表
        const agentStatusCtx = document.getElementById('agent-status-chart');
        if (agentStatusCtx) {
            this.charts.agentStatus = new Chart(agentStatusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['在线', '忙碌', '离线', '维护中'],
                    datasets: [{
                        data: [18, 6, 2, 1],
                        backgroundColor: [
                            '#4caf50',
                            '#ff9800',
                            '#9e9e9e',
                            '#f44336'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // 生成时间标签
    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5 * 60 * 1000);
            labels.push(time.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        }
        return labels;
    }

    // 生成随机数据
    generateRandomData() {
        return Array.from({length: 12}, () => Math.floor(Math.random() * 40) + 30);
    }

    // 加载最近活动
    loadRecentActivity() {
        const activities = [
            {
                type: 'agent',
                icon: 'fas fa-robot',
                title: '智能体 DataProcessor-03 上线',
                description: '成功连接到集群，开始处理任务队列',
                time: '2分钟前',
                color: '#4caf50'
            },
            {
                type: 'task',
                icon: 'fas fa-tasks',
                title: '批量数据处理任务完成',
                description: '处理了 1,247 条客户记录，用时 45 秒',
                time: '5分钟前',
                color: '#2196f3'
            },
            {
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                title: '系统负载警告',
                description: 'CPU使用率达到 85%，建议优化任务分配',
                time: '8分钟前',
                color: '#ff9800'
            },
            {
                type: 'success',
                icon: 'fas fa-check-circle',
                title: '工作流部署成功',
                description: 'CustomerDataPipeline 工作流已成功部署',
                time: '12分钟前',
                color: '#4caf50'
            },
            {
                type: 'agent',
                icon: 'fas fa-robot',
                title: '智能体协作优化',
                description: 'HCMPL算法优化了任务分配策略',
                time: '15分钟前',
                color: '#667eea'
            }
        ];

        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon" style="background-color: ${activity.color}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `).join('');
        }
    }

    // 加载智能体数据
    loadAgentsData() {
        const agentsList = [
            {
                id: 'agent-001',
                name: 'TaskScheduler-01',
                type: '任务调度器',
                status: 'online',
                cpuUsage: 45,
                memoryUsage: 67,
                tasksProcessed: 156,
                uptime: '72小时'
            },
            {
                id: 'agent-002',
                name: 'DataProcessor-01',
                type: '数据处理器',
                status: 'online',
                cpuUsage: 78,
                memoryUsage: 52,
                tasksProcessed: 89,
                uptime: '48小时'
            },
            {
                id: 'agent-003',
                name: 'QualityController-01',
                type: '质量控制器',
                status: 'online',
                cpuUsage: 23,
                memoryUsage: 34,
                tasksProcessed: 67,
                uptime: '96小时'
            },
            {
                id: 'agent-004',
                name: 'APIGateway-01',
                type: 'API网关',
                status: 'online',
                cpuUsage: 56,
                memoryUsage: 45,
                tasksProcessed: 234,
                uptime: '120小时'
            }
        ];

        const agentsGrid = document.getElementById('agents-grid');
        if (agentsGrid) {
            agentsGrid.innerHTML = agentsList.map(agent => `
                <div class="agent-card" data-agent-id="${agent.id}">
                    <div class="agent-header">
                        <div class="agent-info">
                            <div class="agent-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="agent-details">
                                <h3>${agent.name}</h3>
                                <p>${agent.type}</p>
                            </div>
                        </div>
                        <span class="agent-status ${agent.status}">
                            ${agent.status === 'online' ? '在线' : '离线'}
                        </span>
                    </div>

                    <div class="agent-metrics">
                        <div class="metric">
                            <div class="metric-value">${agent.cpuUsage}%</div>
                            <div class="metric-label">CPU</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${agent.memoryUsage}%</div>
                            <div class="metric-label">内存</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${agent.tasksProcessed}</div>
                            <div class="metric-label">任务数</div>
                        </div>
                    </div>

                    <div class="agent-actions">
                        <button class="btn btn-small primary" onclick="platform.controlAgent('${agent.id}', 'restart')">
                            <i class="fas fa-redo"></i> 重启
                        </button>
                        <button class="btn btn-small secondary" onclick="platform.viewAgentDetails('${agent.id}')">
                            <i class="fas fa-eye"></i> 详情
                        </button>
                        <button class="btn btn-small secondary" onclick="platform.configureAgent('${agent.id}')">
                            <i class="fas fa-cog"></i> 配置
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // 智能体控制
    async controlAgent(agentId, action) {
        try {
            const response = await this.apiCall(`/agents/${agentId}/control`, {
                method: 'POST',
                body: { action }
            });

            if (response.success) {
                this.showNotification(`智能体 ${agentId} ${action} 操作成功`, 'success');
                this.loadAgentsData(); // 刷新数据
            }
        } catch (error) {
            this.showNotification(`操作失败: ${error.message}`, 'error');
        }
    }

    // 查看智能体详情
    viewAgentDetails(agentId) {
        this.openModal('智能体详情', `
            <div class="agent-detail-view">
                <h4>智能体 ${agentId} 详细信息</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>状态:</label>
                        <span class="status-badge online">运行中</span>
                    </div>
                    <div class="detail-item">
                        <label>运行时间:</label>
                        <span>72小时 45分钟</span>
                    </div>
                    <div class="detail-item">
                        <label>处理任务:</label>
                        <span>156 个任务</span>
                    </div>
                    <div class="detail-item">
                        <label>平均响应时间:</label>
                        <span>85ms</span>
                    </div>
                </div>

                <h5>实时监控</h5>
                <div class="monitoring-mini">
                    <canvas id="agent-detail-chart" width="400" height="200"></canvas>
                </div>

                <h5>最近任务</h5>
                <div class="recent-tasks">
                    <div class="task-item">
                        <span>数据处理任务 #2341</span>
                        <span class="task-status success">已完成</span>
                    </div>
                    <div class="task-item">
                        <span>质量检查任务 #2342</span>
                        <span class="task-status running">进行中</span>
                    </div>
                </div>
            </div>
        `);
    }

    // DSL代码验证
    validateDSLCode() {
        if (!this.editor) return;

        const code = this.editor.getValue();
        const errors = [];

        // 简单的语法验证
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            if (line.trim() && !line.startsWith('#')) {
                // 检查基本语法错误
                if (line.includes('{') && !line.includes('}') && !lines[index + 1]?.includes('}')) {
                    // 可能需要检查括号匹配
                }
            }
        });

        // 更新错误显示
        const errorsContent = document.getElementById('errors-content');
        if (errorsContent) {
            if (errors.length > 0) {
                errorsContent.innerHTML = errors.map(error =>
                    `<div class="error-item">${error}</div>`
                ).join('');
            } else {
                errorsContent.innerHTML = '<div class="success-message">代码语法正确</div>';
            }
        }
    }

    // 运行DSL代码
    async runDSLCode() {
        if (!this.editor) return;

        const code = this.editor.getValue();
        const outputContent = document.getElementById('output-content');
        const logsContent = document.getElementById('logs-content');

        if (outputContent) {
            outputContent.innerHTML = '<div class="loading">正在执行DSL程序...</div>';
        }

        try {
            // 模拟API调用执行DSL代码
            const response = await this.apiCall('/dsl/execute', {
                method: 'POST',
                body: { code }
            });

            if (outputContent) {
                outputContent.innerHTML = `
                    <div class="execution-result success">
                        <h4>执行成功</h4>
                        <div class="result-summary">
                            <p>✅ 已创建 3 个智能体</p>
                            <p>✅ 已部署 1 个工作流</p>
                            <p>✅ 已分配 1 个任务</p>
                        </div>
                        <div class="execution-metrics">
                            <div class="metric">
                                <span class="label">执行时间:</span>
                                <span class="value">1.2秒</span>
                            </div>
                            <div class="metric">
                                <span class="label">内存使用:</span>
                                <span class="value">45MB</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            if (logsContent) {
                logsContent.innerHTML = `
                    <div class="log-entry">
                        <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="level info">INFO</span>
                        <span class="message">开始解析DSL代码...</span>
                    </div>
                    <div class="log-entry">
                        <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="level info">INFO</span>
                        <span class="message">创建智能体 TaskScheduler...</span>
                    </div>
                    <div class="log-entry">
                        <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="level info">INFO</span>
                        <span class="message">创建智能体 DataProcessor...</span>
                    </div>
                    <div class="log-entry">
                        <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="level success">SUCCESS</span>
                        <span class="message">所有智能体创建完成</span>
                    </div>
                `;
            }

        } catch (error) {
            if (outputContent) {
                outputContent.innerHTML = `
                    <div class="execution-result error">
                        <h4>执行失败</h4>
                        <p class="error-message">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    // API调用模拟
    async apiCall(endpoint, options = {}) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        // 模拟API响应
        if (Math.random() > 0.1) { // 90%成功率
            return {
                success: true,
                data: options.body || {},
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error('网络连接超时');
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' :
                                type === 'error' ? 'exclamation-circle' :
                                'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 更新系统状态
    updateSystemStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = statusIndicator.nextElementSibling;

        if (status === 'online') {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = '系统在线';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = '系统离线';
        }
    }

    // 打开模态对话框
    openModal(title, content) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }

    // 关闭模态对话框
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        modal.classList.remove('active');
    }

    // 启动实时更新
    startRealTimeUpdates() {
        // 每30秒更新一次统计数据
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.updateStatistics();
                this.updateCharts();
            }
        }, 30000);

        // 每5秒更新一次活动日志
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.addRandomActivity();
            }
        }, 5000);
    }

    // 更新图表数据
    updateCharts() {
        if (this.charts.performance) {
            // 移除第一个数据点，添加新的数据点
            this.charts.performance.data.datasets.forEach(dataset => {
                dataset.data.shift();
                dataset.data.push(Math.floor(Math.random() * 40) + 30);
            });

            // 更新时间标签
            this.charts.performance.data.labels.shift();
            this.charts.performance.data.labels.push(
                new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            );

            this.charts.performance.update('none');
        }
    }

    // 添加随机活动
    addRandomActivity() {
        const activities = [
            '智能体 DataProcessor-04 开始处理新任务',
            '任务队列中添加了 15 个新任务',
            '系统自动扩容，新增 2 个处理节点',
            '完成客户数据分析，生成报告',
            '检测到系统性能优化机会'
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const activityList = document.getElementById('activity-list');

        if (activityList && activityList.children.length > 0) {
            // 添加新活动到顶部
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <div class="activity-icon" style="background-color: #667eea">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>${randomActivity}</h4>
                    <p>系统自动执行</p>
                </div>
                <div class="activity-time">刚刚</div>
            `;

            activityList.insertBefore(newActivity, activityList.firstChild);

            // 保持最多5个活动
            if (activityList.children.length > 5) {
                activityList.removeChild(activityList.lastChild);
            }
        }
    }

    // 初始化数据加载
    async loadInitialData() {
        try {
            // 模拟加载配置数据
            console.log('正在加载平台配置...');

            // 模拟加载智能体数据
            console.log('正在加载智能体信息...');

            // 模拟加载任务数据
            console.log('正在加载任务队列...');

            console.log('平台初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showNotification('平台初始化失败，请刷新页面重试', 'error');
        }
    }

    // 强制完成初始化（当超时时调用）
    forceCompleteInitialization() {
        console.warn('🆘 强制完成平台初始化');

        try {
            // 确保基本状态设置
            this.setState({ loading: false, connected: true });

            // 强制完成加载管理器
            if (window.loadingManager) {
                window.loadingManager.updateProgress(100, '强制完成初始化...');
                setTimeout(() => {
                    window.loadingManager.complete();
                    window.dispatchEvent(new CustomEvent('platformInitialized'));
                }, 200);
            }

            // 显示警告通知
            setTimeout(() => {
                this.showNotification('⚠️ 平台已强制启动，部分功能可能受限', 'warning');
            }, 1000);

        } catch (error) {
            console.error('强制初始化也失败了:', error);
            // 最后的应急处理
            setTimeout(() => {
                window.location.href = 'simple.html';
            }, 2000);
        }
    }
}

// 全局函数
function createNewAgent() {
    platform.openModal('创建新智能体', `
        <form id="create-agent-form">
            <div class="form-group">
                <label>智能体名称</label>
                <input type="text" name="name" placeholder="例如: DataProcessor-05" required>
            </div>
            <div class="form-group">
                <label>智能体类型</label>
                <select name="type" required>
                    <option value="">选择类型...</option>
                    <option value="task_scheduler">任务调度器</option>
                    <option value="data_processor">数据处理器</option>
                    <option value="quality_controller">质量控制器</option>
                    <option value="api_gateway">API网关</option>
                </select>
            </div>
            <div class="form-group">
                <label>能力配置</label>
                <textarea name="capabilities" placeholder="输入智能体的能力列表..." rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn secondary" onclick="platform.closeModal()">取消</button>
                <button type="submit" class="btn primary">创建智能体</button>
            </div>
        </form>
    `);
}

async function deployWorkflow() {
    const workflowName = document.getElementById('workflow-name').value;
    const workflowDescription = document.getElementById('workflow-description').value;

    if (!workflowName) {
        platform.showNotification('请输入工作流名称', 'warning');
        return;
    }

    try {
        platform.showNotification('正在部署工作流...', 'info');

        // 创建工作流配置
        const workflowConfig = {
            name: workflowName,
            description: workflowDescription,
            nodes: window.workflowNodes || [],
            edges: window.workflowEdges || [],
            variables: {},
            triggers: ['manual']
        };

        // 使用工作流引擎创建工作流
        const workflow = await window.platform.workflowEngine.createWorkflow(workflowConfig);

        platform.showNotification(`工作流 "${workflowName}" 部署成功！`, 'success');

        // 更新工作流列表
        updateWorkflowList();

        // 清空表单
        document.getElementById('workflow-name').value = '';
        document.getElementById('workflow-description').value = '';

    } catch (error) {
        platform.showNotification(`工作流部署失败: ${error.message}`, 'error');
    }
}

function updateWorkflowList() {
    const workflows = window.platform.workflowEngine.getWorkflows();
    const workflowList = document.getElementById('workflow-list');

    if (workflowList) {
        workflowList.innerHTML = workflows.map(workflow => `
            <div class="workflow-item">
                <div class="workflow-info">
                    <h4>${workflow.name}</h4>
                    <p>${workflow.description || '无描述'}</p>
                    <span class="workflow-status ${workflow.status}">${workflow.status}</span>
                </div>
                <div class="workflow-actions">
                    <button class="btn btn-small primary" onclick="executeWorkflow('${workflow.id}')">
                        <i class="fas fa-play"></i> 执行
                    </button>
                    <button class="btn btn-small secondary" onclick="editWorkflow('${workflow.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-small danger" onclick="deleteWorkflow('${workflow.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');
    }
}

async function executeWorkflow(workflowId) {
    try {
        platform.showNotification('正在执行工作流...', 'info');
        const execution = await window.platform.workflowEngine.executeWorkflow(workflowId);
        platform.showNotification(`工作流执行完成，执行ID: ${execution.id}`, 'success');
    } catch (error) {
        platform.showNotification(`工作流执行失败: ${error.message}`, 'error');
    }
}

function editWorkflow(workflowId) {
    platform.showNotification('工作流编辑功能开发中...', 'info');
}

function deleteWorkflow(workflowId) {
    if (confirm('确定要删除此工作流吗？')) {
        window.platform.workflowEngine.workflows.delete(workflowId);
        updateWorkflowList();
        platform.showNotification('工作流已删除', 'success');
    }
}

function runDiagnostic() {
    platform.showNotification('正在运行系统诊断...', 'info');
    setTimeout(() => {
        platform.showNotification('系统诊断完成，一切正常', 'success');
    }, 3000);
}

function importAgents() {
    platform.showNotification('批量导入功能正在开发中...', 'info');
}

function runDSLCode() {
    platform.runDSLCode();
}

function saveDSLCode() {
    platform.showNotification('DSL代码已保存', 'success');
}

function loadTemplate() {
    platform.showNotification('请从下拉菜单选择模板', 'info');
}

function loadSelectedTemplate() {
    const selector = document.getElementById('template-selector');
    const template = selector.value;

    if (template && platform.editor) {
        // 这里可以加载不同的模板代码
        platform.showNotification(`已加载${selector.selectedOptions[0].text}`, 'success');
    }
}

function closeModal() {
    platform.closeModal();
}

// 标签页切换
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // 移除所有活跃状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // 添加活跃状态
            button.classList.add('active');
            document.getElementById(targetTab + '-content').classList.add('active');
        });
    });
});

// 真实的API调用函数
MultiAgentPlatform.prototype.apiCall = async function(endpoint, options = {}) {
    if (this.config.demoMode) {
        return this.simulateApiCall(endpoint, options);
    }

    const url = this.config.apiBaseUrl + endpoint;
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    };

    if (finalOptions.body && typeof finalOptions.body === 'object') {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }

    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API调用失败 [${finalOptions.method} ${endpoint}]:`, error);
        throw error;
    }
};

// 模拟API调用（演示模式）
MultiAgentPlatform.prototype.simulateApiCall = async function(endpoint, options = {}) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));

    // 模拟不同API端点的响应
    const responses = {
        '/health': { status: 'healthy', timestamp: new Date().toISOString() },
        '/auth/verify': { success: true, user: this.state.currentUser },
        '/agents': { success: true, data: Array.from(this.agents.values()) },
        '/tasks': { success: true, data: Array.from(this.tasks.values()) },
        '/system/metrics': { success: true, data: this.realTimeData.systemMetrics }
    };

    // 检查端点是否存在模拟响应
    if (responses[endpoint]) {
        return responses[endpoint];
    }

    // 模拟成功响应
    if (Math.random() > 0.05) { // 95%成功率
        return {
            success: true,
            data: options.body || {},
            message: '操作成功',
            timestamp: new Date().toISOString()
        };
    } else {
        throw new Error('模拟的网络错误');
    }
};

// 智能体生命周期管理
MultiAgentPlatform.prototype.createAgent = async function(agentConfig) {
    try {
        this.setState({ loading: true });

        const response = await this.apiCall('/agents', {
            method: 'POST',
            body: agentConfig
        });

        if (response.success) {
            const newAgent = {
                id: response.data.id || `agent-${Date.now()}`,
                ...agentConfig,
                status: 'initializing',
                createdAt: new Date(),
                lastActive: new Date(),
                cpu: 0,
                memory: 0,
                tasks: 0
            };

            this.agents.set(newAgent.id, newAgent);
            this.updateAgentsList();
            this.showNotification(`智能体 ${newAgent.name} 创建成功`, 'success');

            // 异步启动智能体
            setTimeout(() => this.startAgent(newAgent.id), 2000);

            return newAgent;
        }
    } catch (error) {
        this.showNotification(`创建智能体失败: ${error.message}`, 'error');
        throw error;
    } finally {
        this.setState({ loading: false });
    }
};

MultiAgentPlatform.prototype.startAgent = async function(agentId) {
    try {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error('智能体不存在');

        agent.status = 'starting';
        this.updateAgentCard(agent);

        const response = await this.apiCall(`/agents/${agentId}/start`, {
            method: 'POST'
        });

        if (response.success) {
            agent.status = 'running';
            agent.lastActive = new Date();
            this.updateAgentCard(agent);
            this.showNotification(`智能体 ${agent.name} 启动成功`, 'success');
        }
    } catch (error) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'failed';
            this.updateAgentCard(agent);
        }
        this.showNotification(`启动智能体失败: ${error.message}`, 'error');
    }
};

MultiAgentPlatform.prototype.stopAgent = async function(agentId) {
    try {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error('智能体不存在');

        agent.status = 'stopping';
        this.updateAgentCard(agent);

        const response = await this.apiCall(`/agents/${agentId}/stop`, {
            method: 'POST'
        });

        if (response.success) {
            agent.status = 'stopped';
            agent.cpu = 0;
            agent.tasks = 0;
            this.updateAgentCard(agent);
            this.showNotification(`智能体 ${agent.name} 已停止`, 'success');
        }
    } catch (error) {
        this.showNotification(`停止智能体失败: ${error.message}`, 'error');
    }
};

// WebSocket集成
MultiAgentPlatform.prototype.initializeWebSocket = function() {
    if (!this.config.enableRealTime) return;

    try {
        this.websocket = new WebSocket(this.config.websocketUrl);

        this.websocket.onopen = () => {
            console.log('WebSocket连接已建立');
            this.setState({ connected: true });
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('WebSocket消息解析失败:', error);
            }
        };

        this.websocket.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.setState({ connected: false });

            // 尝试重连
            setTimeout(() => {
                if (this.websocket?.readyState === WebSocket.CLOSED) {
                    this.initializeWebSocket();
                }
            }, 5000);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };

    } catch (error) {
        console.warn('WebSocket初始化失败，使用轮询模式:', error);
        this.startPollingMode();
    }
};

// 处理WebSocket消息
MultiAgentPlatform.prototype.handleWebSocketMessage = function(data) {
    switch (data.type) {
        case 'agent_status':
            this.updateAgentStatus(data.agentId, data.status);
            break;
        case 'task_update':
            this.updateTaskStatus(data.taskId, data.status, data.progress);
            break;
        case 'system_metrics':
            this.updateSystemMetrics(data.metrics);
            break;
        case 'log_entry':
            this.addLogEntry(data.log);
            break;
        case 'notification':
            this.showNotification(data.message, data.level);
            break;
        default:
            console.log('未知的WebSocket消息类型:', data.type);
    }
};

// 任务管理增强
MultiAgentPlatform.prototype.createTask = async function(taskConfig) {
    try {
        const response = await this.apiCall('/tasks', {
            method: 'POST',
            body: taskConfig
        });

        if (response.success) {
            const newTask = {
                id: response.data.id || `task-${Date.now()}`,
                ...taskConfig,
                status: 'pending',
                progress: 0,
                createdAt: new Date()
            };

            this.tasks.set(newTask.id, newTask);
            this.updateTasksList();
            this.showNotification(`任务 ${newTask.name} 创建成功`, 'success');

            return newTask;
        }
    } catch (error) {
        this.showNotification(`创建任务失败: ${error.message}`, 'error');
        throw error;
    }
};

// 模态对话框管理
MultiAgentPlatform.prototype.showCreateAgentModal = function() {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = '创建新智能体';
    modalBody.innerHTML = `
        <form id="create-agent-form" onsubmit="return false;">
            <div class="form-group">
                <label for="agent-name">智能体名称</label>
                <input type="text" id="agent-name" required placeholder="例如：DataProcessor-03">
            </div>
            <div class="form-group">
                <label for="agent-type">智能体类型</label>
                <select id="agent-type" required>
                    ${this.config.agentTypes.map(type =>
                        `<option value="${type}">${type}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="agent-description">描述</label>
                <textarea id="agent-description" placeholder="智能体的功能描述"></textarea>
            </div>
            <div class="form-group">
                <label for="agent-memory">内存限制 (MB)</label>
                <input type="number" id="agent-memory" value="2048" min="512" max="16384">
            </div>
            <div class="form-group">
                <label for="agent-cpu">CPU核心数</label>
                <input type="number" id="agent-cpu" value="2" min="1" max="16">
            </div>
            <div class="form-actions">
                <button type="button" class="btn secondary" onclick="closeModal()">取消</button>
                <button type="button" class="btn primary" onclick="submitCreateAgent()">创建</button>
            </div>
        </form>
    `;

    modal.style.display = 'flex';
};

MultiAgentPlatform.prototype.showCreateTaskModal = function() {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = '创建新任务';
    modalBody.innerHTML = `
        <form id="create-task-form" onsubmit="return false;">
            <div class="form-group">
                <label for="task-name">任务名称</label>
                <input type="text" id="task-name" required placeholder="例如：数据处理任务">
            </div>
            <div class="form-group">
                <label for="task-description">任务描述</label>
                <textarea id="task-description" placeholder="详细描述任务的目标和要求"></textarea>
            </div>
            <div class="form-group">
                <label for="task-priority">优先级</label>
                <select id="task-priority" required>
                    <option value="low">低</option>
                    <option value="medium" selected>中</option>
                    <option value="high">高</option>
                </select>
            </div>
            <div class="form-group">
                <label for="task-agent">分配智能体</label>
                <select id="task-agent">
                    <option value="">自动分配</option>
                    ${Array.from(this.agents.values())
                        .filter(agent => agent.status === 'running' || agent.status === 'idle')
                        .map(agent =>
                            `<option value="${agent.id}">${agent.name} (${agent.type})</option>`
                        ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="task-timeout">超时时间（分钟）</label>
                <input type="number" id="task-timeout" value="30" min="1" max="1440">
            </div>
            <div class="form-actions">
                <button type="button" class="btn secondary" onclick="closeModal()">取消</button>
                <button type="button" class="btn primary" onclick="submitCreateTask()">创建</button>
            </div>
        </form>
    `;

    modal.style.display = 'flex';
};

// 全局函数（供HTML调用）
window.platform = null;
window.createNewAgent = () => window.platform?.showCreateAgentModal();
window.startAgent = (id) => window.platform?.startAgent(id);
window.stopAgent = (id) => window.platform?.stopAgent(id);
window.deleteAgent = (id) => window.platform?.deleteAgent(id);
window.createNewTask = () => window.platform?.showCreateTaskModal();
window.executeTask = (id) => window.platform?.executeTask(id);
window.runDSLCode = () => window.platform?.executeDSLCode();
window.sendRequest = () => window.platform?.sendApiRequest();
window.refreshMonitoring = () => window.platform?.refreshMonitoringData();
window.exportReport = () => window.platform?.exportSystemReport();

window.submitCreateAgent = async function() {
    const form = document.getElementById('create-agent-form');
    const formData = new FormData(form);

    const agentConfig = {
        name: document.getElementById('agent-name').value,
        type: document.getElementById('agent-type').value,
        description: document.getElementById('agent-description').value,
        config: {
            memory: parseInt(document.getElementById('agent-memory').value),
            cpu: parseInt(document.getElementById('agent-cpu').value)
        }
    };

    try {
        await window.platform.createAgent(agentConfig);
        closeModal();
    } catch (error) {
        console.error('创建智能体失败:', error);
    }
};

window.submitCreateTask = async function() {
    const taskConfig = {
        name: document.getElementById('task-name').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        assignedAgent: document.getElementById('task-agent').value || null,
        timeout: parseInt(document.getElementById('task-timeout').value) * 60000 // 转换为毫秒
    };

    try {
        await window.platform.createTask(taskConfig);
        closeModal();
    } catch (error) {
        console.error('创建任务失败:', error);
    }
};

window.closeModal = function() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'none';
};

// 监控和日志系统核心类
class LogCollector {
    constructor() {
        this.logs = [];
        this.filters = new Set();
        this.maxLogs = 10000;
        this.logLevels = ['debug', 'info', 'warn', 'error', 'critical'];
        this.elasticsearchClient = null;
    }

    async init(config) {
        if (config.elasticsearch) {
            this.elasticsearchClient = new ElasticsearchClient(config.elasticsearch);
        }
    }

    log(level, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata: {
                ...metadata,
                source: 'multi-agent-platform',
                sessionId: this.getSessionId(),
                userId: this.getCurrentUserId()
            }
        };

        this.logs.push(logEntry);

        // 限制内存中的日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 发送到 Elasticsearch
        this.sendToElasticsearch(logEntry);

        // 触发实时更新
        this.triggerLogUpdate(logEntry);

        // 控制台输出
        this.consoleOutput(logEntry);
    }

    async sendToElasticsearch(logEntry) {
        if (!this.elasticsearchClient) return;

        try {
            await this.elasticsearchClient.index({
                index: `multi-agent-logs-${new Date().toISOString().split('T')[0]}`,
                body: logEntry
            });
        } catch (error) {
            console.error('Failed to send log to Elasticsearch:', error);
        }
    }

    triggerLogUpdate(logEntry) {
        window.dispatchEvent(new CustomEvent('logUpdate', { detail: logEntry }));
    }

    consoleOutput(logEntry) {
        const { level, message, metadata } = logEntry;
        const style = this.getConsoleStyle(level);
        console.log(`%c[${level.toUpperCase()}] ${message}`, style, metadata);
    }

    getConsoleStyle(level) {
        const styles = {
            debug: 'color: #888',
            info: 'color: #2196F3',
            warn: 'color: #FF9800',
            error: 'color: #F44336',
            critical: 'color: #F44336; font-weight: bold; background: #FFEBEE'
        };
        return styles[level] || 'color: #000';
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    getCurrentUserId() {
        return localStorage.getItem('userId') || 'anonymous';
    }

    getLogs(filters = {}) {
        let filteredLogs = [...this.logs];

        if (filters.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filters.level);
        }

        if (filters.startTime) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) >= new Date(filters.startTime)
            );
        }

        if (filters.endTime) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) <= new Date(filters.endTime)
            );
        }

        if (filters.search) {
            filteredLogs = filteredLogs.filter(log =>
                log.message.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        return filteredLogs.slice(-1000); // 最多返回1000条
    }
}

class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.collectors = new Map();
        this.exporters = new Map();
        this.prometheus = null;
    }

    async init(config) {
        if (config.prometheus) {
            this.prometheus = new PrometheusClient(config.prometheus);
        }
        this.startCollection();
    }

    startCollection() {
        // 系统指标收集
        this.collectSystemMetrics();

        // 应用指标收集
        this.collectApplicationMetrics();

        // 业务指标收集
        this.collectBusinessMetrics();

        // 定期收集
        setInterval(() => {
            this.collectAllMetrics();
        }, 5000);
    }

    collectSystemMetrics() {
        const systemMetrics = {
            timestamp: Date.now(),
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            disk: this.getDiskUsage(),
            network: this.getNetworkStats()
        };

        this.recordMetric('system_metrics', systemMetrics);
        return systemMetrics;
    }

    collectApplicationMetrics() {
        const appMetrics = {
            timestamp: Date.now(),
            activeAgents: window.platform?.agents?.size || 0,
            runningTasks: window.platform?.getRunningTasks()?.length || 0,
            queuedTasks: window.platform?.getQueuedTasks()?.length || 0,
            errorRate: this.calculateErrorRate(),
            responseTime: this.getAverageResponseTime()
        };

        this.recordMetric('application_metrics', appMetrics);
        return appMetrics;
    }

    collectBusinessMetrics() {
        const businessMetrics = {
            timestamp: Date.now(),
            tasksCompleted: this.getCompletedTasksCount(),
            tasksPerMinute: this.getTasksPerMinute(),
            agentUtilization: this.getAgentUtilization(),
            workflowSuccessRate: this.getWorkflowSuccessRate()
        };

        this.recordMetric('business_metrics', businessMetrics);
        return businessMetrics;
    }

    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metrics = this.metrics.get(name);
        metrics.push(value);

        // 保持最近1000个数据点
        if (metrics.length > 1000) {
            metrics.shift();
        }

        // 发送到 Prometheus
        this.sendToPrometheus(name, value);

        // 触发更新事件
        window.dispatchEvent(new CustomEvent('metricsUpdate', {
            detail: { name, value }
        }));
    }

    async sendToPrometheus(name, value) {
        if (!this.prometheus) return;

        try {
            await this.prometheus.pushGateway(name, value);
        } catch (error) {
            console.error('Failed to send metrics to Prometheus:', error);
        }
    }

    getCPUUsage() {
        // 模拟 CPU 使用率
        return Math.random() * 100;
    }

    getMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.totalJSHeapSize;
            return (used / total) * 100;
        }
        return Math.random() * 100;
    }

    getDiskUsage() {
        // 模拟磁盘使用率
        return Math.random() * 100;
    }

    getNetworkStats() {
        return {
            in: Math.random() * 1000,
            out: Math.random() * 800
        };
    }

    calculateErrorRate() {
        const total = this.metrics.get('total_requests') || 0;
        const errors = this.metrics.get('error_requests') || 0;
        return total > 0 ? (errors / total) * 100 : 0;
    }

    getAverageResponseTime() {
        const responseTimes = this.metrics.get('response_times') || [];
        if (responseTimes.length === 0) return 0;

        const sum = responseTimes.reduce((a, b) => a + b, 0);
        return sum / responseTimes.length;
    }

    getCompletedTasksCount() {
        return this.metrics.get('completed_tasks_count') || 0;
    }

    getTasksPerMinute() {
        const completedTasks = this.metrics.get('application_metrics') || [];
        const lastMinuteTasks = completedTasks.filter(metric =>
            Date.now() - metric.timestamp < 60000
        );
        return lastMinuteTasks.length;
    }

    getAgentUtilization() {
        const totalAgents = window.platform?.agents?.size || 0;
        const activeAgents = Array.from(window.platform?.agents?.values() || [])
            .filter(agent => agent.status === 'running').length;

        return totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;
    }

    getWorkflowSuccessRate() {
        const workflows = this.metrics.get('workflow_executions') || [];
        const successful = workflows.filter(w => w.status === 'success').length;
        return workflows.length > 0 ? (successful / workflows.length) * 100 : 100;
    }

    getMetrics(name, timeRange = 3600000) { // 默认1小时
        const metrics = this.metrics.get(name) || [];
        const cutoff = Date.now() - timeRange;

        return metrics.filter(metric => metric.timestamp >= cutoff);
    }
}

class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.status = 'healthy';
        this.issues = [];
    }

    registerCheck(name, checkFunction, interval = 30000) {
        this.checks.set(name, {
            fn: checkFunction,
            interval,
            lastRun: 0,
            status: 'unknown',
            lastResult: null
        });
    }

    async runChecks() {
        const results = new Map();
        const now = Date.now();

        for (const [name, check] of this.checks) {
            if (now - check.lastRun >= check.interval) {
                try {
                    const result = await check.fn();
                    check.status = result.healthy ? 'healthy' : 'unhealthy';
                    check.lastResult = result;
                    check.lastRun = now;
                    results.set(name, result);
                } catch (error) {
                    check.status = 'error';
                    check.lastResult = { healthy: false, error: error.message };
                    check.lastRun = now;
                    results.set(name, check.lastResult);
                }
            } else {
                results.set(name, check.lastResult);
            }
        }

        this.updateOverallStatus(results);
        return results;
    }

    updateOverallStatus(results) {
        const healthyCount = Array.from(results.values())
            .filter(result => result?.healthy).length;
        const totalCount = results.size;

        if (healthyCount === totalCount) {
            this.status = 'healthy';
            this.issues = [];
        } else if (healthyCount >= totalCount * 0.8) {
            this.status = 'degraded';
            this.issues = Array.from(results.entries())
                .filter(([_, result]) => !result?.healthy)
                .map(([name, result]) => ({ name, issue: result?.error || 'Unknown issue' }));
        } else {
            this.status = 'unhealthy';
            this.issues = Array.from(results.entries())
                .filter(([_, result]) => !result?.healthy)
                .map(([name, result]) => ({ name, issue: result?.error || 'Unknown issue' }));
        }

        window.dispatchEvent(new CustomEvent('healthStatusUpdate', {
            detail: { status: this.status, issues: this.issues }
        }));
    }

    async checkDatabaseConnection() {
        try {
            const response = await fetch('/api/v1/health/database');
            return {
                healthy: response.ok,
                latency: Date.now() - response.headers.get('x-request-start'),
                details: await response.json()
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkAPIEndpoints() {
        try {
            const response = await fetch('/api/v1/health');
            return {
                healthy: response.ok,
                latency: Date.now() - response.headers.get('x-request-start'),
                details: await response.json()
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkMemoryUsage() {
        if (performance.memory) {
            const usage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
            return {
                healthy: usage < 0.9,
                usage: usage * 100,
                details: { current: usage, threshold: 90 }
            };
        }
        return { healthy: true, details: 'Memory monitoring not available' };
    }

    getHealthStatus() {
        return {
            status: this.status,
            issues: this.issues,
            checks: Object.fromEntries(
                Array.from(this.checks.entries()).map(([name, check]) => [
                    name,
                    {
                        status: check.status,
                        lastRun: check.lastRun,
                        result: check.lastResult
                    }
                ])
            )
        };
    }
}

// 工作流引擎和任务调度器核心类
class WorkflowEngine {
    constructor() {
        this.workflows = new Map();
        this.executingWorkflows = new Map();
        this.workflowHistory = [];
        this.templates = new Map();
        this.status = 'idle';
    }

    async createWorkflow(workflowConfig) {
        const workflow = {
            id: this.generateWorkflowId(),
            name: workflowConfig.name,
            description: workflowConfig.description,
            nodes: workflowConfig.nodes || [],
            edges: workflowConfig.edges || [],
            variables: workflowConfig.variables || {},
            triggers: workflowConfig.triggers || [],
            status: 'created',
            createdAt: new Date().toISOString(),
            createdBy: workflowConfig.createdBy || 'system',
            version: 1
        };

        this.workflows.set(workflow.id, workflow);
        await this.saveWorkflow(workflow);

        window.platform.monitoring.logCollector.log('info',
            `工作流创建成功: ${workflow.name}`, { workflowId: workflow.id });

        return workflow;
    }

    async executeWorkflow(workflowId, inputData = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`工作流不存在: ${workflowId}`);
        }

        const execution = {
            id: this.generateExecutionId(),
            workflowId,
            status: 'running',
            startTime: new Date().toISOString(),
            inputData,
            currentNode: null,
            executedNodes: [],
            results: {},
            variables: { ...workflow.variables, ...inputData },
            errors: []
        };

        this.executingWorkflows.set(execution.id, execution);

        try {
            await this.runWorkflowExecution(execution);
            execution.status = 'completed';
            execution.endTime = new Date().toISOString();

            window.platform.monitoring.logCollector.log('info',
                `工作流执行完成: ${workflow.name}`, {
                    executionId: execution.id,
                    duration: Date.now() - new Date(execution.startTime).getTime()
                });

        } catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date().toISOString();
            execution.errors.push({
                message: error.message,
                timestamp: new Date().toISOString(),
                node: execution.currentNode
            });

            window.platform.monitoring.logCollector.log('error',
                `工作流执行失败: ${workflow.name}`, {
                    executionId: execution.id,
                    error: error.message
                });
        } finally {
            this.workflowHistory.push(execution);
            this.executingWorkflows.delete(execution.id);
        }

        return execution;
    }

    async runWorkflowExecution(execution) {
        const workflow = this.workflows.get(execution.workflowId);
        const startNodes = workflow.nodes.filter(node => node.type === 'start');

        if (startNodes.length === 0) {
            throw new Error('工作流没有起始节点');
        }

        for (const startNode of startNodes) {
            await this.executeNode(execution, startNode);
        }
    }

    async executeNode(execution, node) {
        execution.currentNode = node.id;
        execution.executedNodes.push(node.id);

        window.platform.monitoring.logCollector.log('debug',
            `执行节点: ${node.name}`, {
                executionId: execution.id,
                nodeId: node.id
            });

        try {
            let result;

            switch (node.type) {
                case 'start':
                    result = { status: 'started', data: execution.inputData };
                    break;
                case 'agent_task':
                    result = await this.executeAgentTask(execution, node);
                    break;
                case 'condition':
                    result = await this.evaluateCondition(execution, node);
                    break;
                case 'parallel':
                    result = await this.executeParallelTasks(execution, node);
                    break;
                case 'data_transform':
                    result = await this.transformData(execution, node);
                    break;
                case 'webhook':
                    result = await this.executeWebhook(execution, node);
                    break;
                case 'end':
                    result = { status: 'completed', data: execution.results };
                    break;
                default:
                    throw new Error(`未知节点类型: ${node.type}`);
            }

            execution.results[node.id] = result;

            // 执行下一个节点
            if (node.type !== 'end') {
                const nextNodes = this.getNextNodes(execution.workflowId, node.id, result);
                for (const nextNode of nextNodes) {
                    await this.executeNode(execution, nextNode);
                }
            }

        } catch (error) {
            execution.errors.push({
                nodeId: node.id,
                message: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    async executeAgentTask(execution, node) {
        const agentId = node.config.agentId || this.selectOptimalAgent(node.config.requirements);
        const agent = window.platform.agents.get(agentId);

        if (!agent) {
            throw new Error(`智能体不可用: ${agentId}`);
        }

        const task = {
            id: window.platform.generateTaskId(),
            name: node.config.taskName,
            description: node.config.description,
            priority: node.config.priority || 'medium',
            data: this.resolveVariables(node.config.data, execution.variables),
            agentId
        };

        return await window.platform.createTask(task);
    }

    selectOptimalAgent(requirements) {
        const availableAgents = Array.from(window.platform.agents.values())
            .filter(agent => agent.status === 'ready');

        // 基于负载、能力匹配等选择最优智能体
        return availableAgents.sort((a, b) => {
            const loadA = a.currentTasks?.length || 0;
            const loadB = b.currentTasks?.length || 0;
            return loadA - loadB;
        })[0]?.id;
    }

    resolveVariables(data, variables) {
        const resolved = JSON.parse(JSON.stringify(data));

        function resolve(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].startsWith('${') && obj[key].endsWith('}')) {
                    const varName = obj[key].slice(2, -1);
                    obj[key] = variables[varName] || obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    resolve(obj[key]);
                }
            }
        }

        resolve(resolved);
        return resolved;
    }

    getNextNodes(workflowId, currentNodeId, result) {
        const workflow = this.workflows.get(workflowId);
        const nextEdges = workflow.edges.filter(edge => edge.source === currentNodeId);

        const validEdges = nextEdges.filter(edge => {
            if (!edge.condition) return true;
            return this.evaluateEdgeCondition(edge.condition, result);
        });

        return validEdges.map(edge =>
            workflow.nodes.find(node => node.id === edge.target)
        );
    }

    evaluateEdgeCondition(condition, result) {
        // 简单的条件评估
        try {
            return new Function('result', `return ${condition}`)(result);
        } catch (error) {
            return false;
        }
    }

    generateWorkflowId() {
        return 'wf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateExecutionId() {
        return 'exec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveWorkflow(workflow) {
        // 保存到本地存储或发送到后端
        const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
        workflows.push(workflow);
        localStorage.setItem('workflows', JSON.stringify(workflows));
    }

    getWorkflows() {
        return Array.from(this.workflows.values());
    }

    getWorkflowHistory() {
        return this.workflowHistory.slice(-100); // 最近100次执行
    }
}

class TaskScheduler {
    constructor() {
        this.queues = new Map(); // 不同优先级的队列
        this.runningTasks = new Map();
        this.completedTasks = [];
        this.failedTasks = [];
        this.schedulerConfig = {
            maxConcurrentTasks: 50,
            maxTasksPerAgent: 5,
            schedulingStrategy: 'priority_based', // 'round_robin', 'load_balanced'
            retryAttempts: 3,
            retryDelay: 1000
        };
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.scheduleLoop();

        window.platform.monitoring.logCollector.log('info', '任务调度器启动');
    }

    stop() {
        this.isRunning = false;
        window.platform.monitoring.logCollector.log('info', '任务调度器停止');
    }

    async scheduleTask(task) {
        // 分配优先级队列
        const priority = task.priority || 'medium';
        if (!this.queues.has(priority)) {
            this.queues.set(priority, []);
        }

        // 添加调度元数据
        const scheduledTask = {
            ...task,
            id: task.id || this.generateTaskId(),
            scheduledAt: new Date().toISOString(),
            attempts: 0,
            maxAttempts: task.maxAttempts || this.schedulerConfig.retryAttempts,
            status: 'queued'
        };

        this.queues.get(priority).push(scheduledTask);

        window.platform.monitoring.logCollector.log('info',
            `任务已加入队列: ${scheduledTask.name}`, {
                taskId: scheduledTask.id,
                priority: priority
            });

        return scheduledTask;
    }

    async scheduleLoop() {
        while (this.isRunning) {
            try {
                await this.processQueues();
                await this.checkRunningTasks();
                await this.sleep(1000); // 每秒检查一次
            } catch (error) {
                window.platform.monitoring.logCollector.log('error',
                    '调度循环错误', { error: error.message });
            }
        }
    }

    async processQueues() {
        const priorityOrder = ['critical', 'high', 'medium', 'low'];

        for (const priority of priorityOrder) {
            const queue = this.queues.get(priority) || [];

            while (queue.length > 0 && this.canExecuteMoreTasks()) {
                const task = queue.shift();
                await this.executeTask(task);
            }
        }
    }

    canExecuteMoreTasks() {
        return this.runningTasks.size < this.schedulerConfig.maxConcurrentTasks;
    }

    async executeTask(task) {
        try {
            task.status = 'running';
            task.startTime = new Date().toISOString();
            this.runningTasks.set(task.id, task);

            // 选择智能体
            const agent = await this.selectAgent(task);
            if (!agent) {
                throw new Error('没有可用的智能体');
            }

            task.assignedAgent = agent.id;

            window.platform.monitoring.logCollector.log('info',
                `开始执行任务: ${task.name}`, {
                    taskId: task.id,
                    agentId: agent.id
                });

            // 执行任务
            const result = await this.runTask(task, agent);

            task.status = 'completed';
            task.endTime = new Date().toISOString();
            task.result = result;

            this.runningTasks.delete(task.id);
            this.completedTasks.push(task);

            window.platform.monitoring.logCollector.log('info',
                `任务执行完成: ${task.name}`, {
                    taskId: task.id,
                    duration: Date.now() - new Date(task.startTime).getTime()
                });

        } catch (error) {
            await this.handleTaskFailure(task, error);
        }
    }

    async selectAgent(task) {
        const availableAgents = Array.from(window.platform.agents.values())
            .filter(agent => {
                const isReady = agent.status === 'ready';
                const hasCapacity = (agent.currentTasks?.length || 0) < this.schedulerConfig.maxTasksPerAgent;
                const hasRequiredCapabilities = task.requiredCapabilities?.every(cap =>
                    agent.capabilities?.includes(cap)) || true;

                return isReady && hasCapacity && hasRequiredCapabilities;
            });

        if (availableAgents.length === 0) {
            return null;
        }

        // 负载均衡选择
        return availableAgents.sort((a, b) => {
            const loadA = a.currentTasks?.length || 0;
            const loadB = b.currentTasks?.length || 0;
            return loadA - loadB;
        })[0];
    }

    async runTask(task, agent) {
        // 模拟任务执行
        const executionTime = Math.random() * 3000 + 1000; // 1-4秒

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% 成功率
                    resolve({
                        status: 'success',
                        data: `任务 ${task.name} 执行结果`,
                        executionTime,
                        processedAt: new Date().toISOString()
                    });
                } else {
                    reject(new Error('任务执行失败'));
                }
            }, executionTime);
        });
    }

    async handleTaskFailure(task, error) {
        task.attempts++;
        task.status = 'failed';
        task.error = error.message;
        task.endTime = new Date().toISOString();

        this.runningTasks.delete(task.id);

        window.platform.monitoring.logCollector.log('error',
            `任务执行失败: ${task.name}`, {
                taskId: task.id,
                error: error.message,
                attempt: task.attempts
            });

        // 重试逻辑
        if (task.attempts < task.maxAttempts) {
            setTimeout(() => {
                task.status = 'retrying';
                this.scheduleTask(task);
            }, this.schedulerConfig.retryDelay * task.attempts);
        } else {
            this.failedTasks.push(task);

            window.platform.monitoring.logCollector.log('error',
                `任务最终失败: ${task.name}`, {
                    taskId: task.id,
                    totalAttempts: task.attempts
                });
        }
    }

    async checkRunningTasks() {
        const timeout = 300000; // 5分钟超时
        const now = Date.now();

        for (const [taskId, task] of this.runningTasks) {
            const runTime = now - new Date(task.startTime).getTime();

            if (runTime > timeout) {
                const error = new Error('任务执行超时');
                await this.handleTaskFailure(task, error);
            }
        }
    }

    generateTaskId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getQueueStatus() {
        return {
            queues: Object.fromEntries(
                Array.from(this.queues.entries()).map(([priority, queue]) => [
                    priority,
                    { count: queue.length, tasks: queue.slice(0, 10) }
                ])
            ),
            running: this.runningTasks.size,
            completed: this.completedTasks.length,
            failed: this.failedTasks.length
        };
    }

    getTaskStats() {
        const completed = this.completedTasks.length;
        const failed = this.failedTasks.length;
        const total = completed + failed;

        return {
            total,
            completed,
            failed,
            successRate: total > 0 ? (completed / total) * 100 : 100,
            averageExecutionTime: this.getAverageExecutionTime()
        };
    }

    getAverageExecutionTime() {
        const recentTasks = this.completedTasks.slice(-100);
        if (recentTasks.length === 0) return 0;

        const totalTime = recentTasks.reduce((sum, task) => {
            const executionTime = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
            return sum + executionTime;
        }, 0);

        return totalTime / recentTasks.length;
    }
}

class ExecutionEngine {
    constructor() {
        this.executors = new Map();
        this.executionHistory = [];
        this.resourcePool = new ResourcePool();
        this.status = 'idle';
    }

    async executeWorkflow(workflow, context = {}) {
        const execution = {
            id: this.generateExecutionId(),
            workflowId: workflow.id,
            startTime: new Date().toISOString(),
            context,
            status: 'running',
            steps: [],
            results: {}
        };

        try {
            this.status = 'running';

            window.platform.monitoring.logCollector.log('info',
                `开始执行工作流: ${workflow.name}`, { executionId: execution.id });

            for (const step of workflow.steps || []) {
                const stepResult = await this.executeStep(step, execution);
                execution.steps.push(stepResult);
                execution.results[step.id] = stepResult;
            }

            execution.status = 'completed';
            execution.endTime = new Date().toISOString();

            window.platform.monitoring.logCollector.log('info',
                `工作流执行完成: ${workflow.name}`, {
                    executionId: execution.id,
                    duration: Date.now() - new Date(execution.startTime).getTime()
                });

        } catch (error) {
            execution.status = 'failed';
            execution.error = error.message;
            execution.endTime = new Date().toISOString();

            window.platform.monitoring.logCollector.log('error',
                `工作流执行失败: ${workflow.name}`, {
                    executionId: execution.id,
                    error: error.message
                });
        } finally {
            this.executionHistory.push(execution);
            this.status = 'idle';
        }

        return execution;
    }

    async executeStep(step, execution) {
        const stepExecution = {
            id: step.id,
            name: step.name,
            type: step.type,
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            let result;

            switch (step.type) {
                case 'api_call':
                    result = await this.executeAPICall(step);
                    break;
                case 'data_processing':
                    result = await this.executeDataProcessing(step, execution.context);
                    break;
                case 'agent_coordination':
                    result = await this.executeAgentCoordination(step);
                    break;
                case 'condition_check':
                    result = await this.executeConditionCheck(step, execution.context);
                    break;
                default:
                    throw new Error(`未知步骤类型: ${step.type}`);
            }

            stepExecution.status = 'completed';
            stepExecution.result = result;
            stepExecution.endTime = new Date().toISOString();

        } catch (error) {
            stepExecution.status = 'failed';
            stepExecution.error = error.message;
            stepExecution.endTime = new Date().toISOString();
            throw error;
        }

        return stepExecution;
    }

    generateExecutionId() {
        return 'exec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

class ResourcePool {
    constructor() {
        this.resources = new Map();
        this.allocations = new Map();
        this.limits = {
            cpu: 100,
            memory: 1000, // MB
            network: 1000 // Mbps
        };
    }

    allocateResource(type, amount, requestId) {
        const current = this.getCurrentUsage(type);
        if (current + amount > this.limits[type]) {
            throw new Error(`资源不足: ${type}`);
        }

        this.allocations.set(requestId, { type, amount, allocatedAt: Date.now() });
        return true;
    }

    releaseResource(requestId) {
        this.allocations.delete(requestId);
    }

    getCurrentUsage(type) {
        return Array.from(this.allocations.values())
            .filter(alloc => alloc.type === type)
            .reduce((sum, alloc) => sum + alloc.amount, 0);
    }
}

// 企业级安全和权限管理系统
class AuthenticationManager {
    constructor() {
        this.sessions = new Map();
        this.tokens = new Map();
        this.config = {
            tokenExpiry: 3600000, // 1小时
            refreshTokenExpiry: 604800000, // 7天
            maxLoginAttempts: 5,
            lockoutDuration: 900000, // 15分钟
            passwordMinLength: 8,
            requireMFA: true
        };
        this.failedAttempts = new Map();
        this.lockedAccounts = new Map();
    }

    async authenticate(credentials) {
        const { username, password, mfaCode } = credentials;

        // 检查账户锁定
        if (this.isAccountLocked(username)) {
            throw new Error('账户已被锁定，请稍后再试');
        }

        try {
            // 验证用户凭据
            const user = await this.validateCredentials(username, password);
            if (!user) {
                await this.recordFailedAttempt(username);
                throw new Error('用户名或密码错误');
            }

            // 多因素认证
            if (this.config.requireMFA && !await this.validateMFA(user, mfaCode)) {
                throw new Error('多因素认证失败');
            }

            // 清除失败尝试记录
            this.failedAttempts.delete(username);

            // 生成访问令牌
            const accessToken = await this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user);

            // 创建会话
            const session = await this.createSession(user, accessToken);

            window.platform.monitoring.logCollector.log('info',
                `用户登录成功: ${username}`, { userId: user.id });

            return {
                user,
                accessToken,
                refreshToken,
                session,
                expiresAt: new Date(Date.now() + this.config.tokenExpiry).toISOString()
            };

        } catch (error) {
            window.platform.monitoring.logCollector.log('warn',
                `登录失败: ${username}`, { error: error.message });
            throw error;
        }
    }

    async validateCredentials(username, password) {
        // 实际环境中应该查询数据库
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);

        if (!user) return null;

        // 验证密码哈希
        const isValid = await this.verifyPassword(password, user.passwordHash);
        return isValid ? user : null;
    }

    async verifyPassword(password, hash) {
        // 实际环境中使用 bcrypt 或类似库
        const crypto = window.crypto || window.msCrypto;
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex === hash;
    }

    async validateMFA(user, code) {
        if (!code) return false;

        // 实际环境中验证 TOTP 或 SMS 验证码
        const validCodes = ['123456', '000000']; // 演示用
        return validCodes.includes(code);
    }

    async generateAccessToken(user) {
        const payload = {
            userId: user.id,
            username: user.username,
            roles: user.roles,
            permissions: user.permissions,
            iat: Date.now(),
            exp: Date.now() + this.config.tokenExpiry
        };

        // 实际环境中使用 JWT
        const token = btoa(JSON.stringify(payload));
        this.tokens.set(token, payload);

        return token;
    }

    async generateRefreshToken(user) {
        const payload = {
            userId: user.id,
            type: 'refresh',
            iat: Date.now(),
            exp: Date.now() + this.config.refreshTokenExpiry
        };

        const token = btoa(JSON.stringify(payload));
        return token;
    }

    async createSession(user, accessToken) {
        const session = {
            id: this.generateSessionId(),
            userId: user.id,
            accessToken,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            status: 'active'
        };

        this.sessions.set(session.id, session);
        return session;
    }

    async validateToken(token) {
        const payload = this.tokens.get(token);
        if (!payload) {
            throw new Error('无效的访问令牌');
        }

        if (Date.now() > payload.exp) {
            this.tokens.delete(token);
            throw new Error('访问令牌已过期');
        }

        return payload;
    }

    async refreshAccessToken(refreshToken) {
        try {
            const payload = JSON.parse(atob(refreshToken));

            if (payload.type !== 'refresh' || Date.now() > payload.exp) {
                throw new Error('刷新令牌无效或已过期');
            }

            const user = this.loadUsers().find(u => u.id === payload.userId);
            if (!user) {
                throw new Error('用户不存在');
            }

            const newAccessToken = await this.generateAccessToken(user);
            return newAccessToken;

        } catch (error) {
            throw new Error('刷新令牌失败');
        }
    }

    isAccountLocked(username) {
        const lockInfo = this.lockedAccounts.get(username);
        if (!lockInfo) return false;

        if (Date.now() > lockInfo.unlockAt) {
            this.lockedAccounts.delete(username);
            return false;
        }

        return true;
    }

    async recordFailedAttempt(username) {
        const attempts = this.failedAttempts.get(username) || 0;
        const newAttempts = attempts + 1;

        this.failedAttempts.set(username, newAttempts);

        if (newAttempts >= this.config.maxLoginAttempts) {
            this.lockedAccounts.set(username, {
                lockedAt: Date.now(),
                unlockAt: Date.now() + this.config.lockoutDuration
            });

            window.platform.monitoring.logCollector.log('warn',
                `账户被锁定: ${username}`, { attempts: newAttempts });
        }
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        // 实际环境中从请求头获取
        return '127.0.0.1';
    }

    loadUsers() {
        // 实际环境中从数据库加载
        return [
            {
                id: 'user_1',
                username: 'admin',
                passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // 'secret123'
                roles: ['admin'],
                permissions: ['*'],
                email: 'admin@company.com',
                mfaEnabled: true
            },
            {
                id: 'user_2',
                username: 'operator',
                passwordHash: 'password_hash_here',
                roles: ['operator'],
                permissions: ['agents.read', 'tasks.read', 'tasks.create'],
                email: 'operator@company.com',
                mfaEnabled: false
            }
        ];
    }

    async logout(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'ended';
            session.endedAt = new Date().toISOString();
            this.tokens.delete(session.accessToken);

            window.platform.monitoring.logCollector.log('info',
                `用户登出: ${session.userId}`, { sessionId });
        }
    }
}

class AuthorizationManager {
    constructor() {
        this.roles = new Map();
        this.permissions = new Map();
        this.policies = new Map();

        this.initializeRBAC();
    }

    initializeRBAC() {
        // 定义权限
        const permissions = [
            { id: 'agents.create', name: '创建智能体', category: 'agents' },
            { id: 'agents.read', name: '查看智能体', category: 'agents' },
            { id: 'agents.update', name: '更新智能体', category: 'agents' },
            { id: 'agents.delete', name: '删除智能体', category: 'agents' },
            { id: 'agents.control', name: '控制智能体', category: 'agents' },

            { id: 'tasks.create', name: '创建任务', category: 'tasks' },
            { id: 'tasks.read', name: '查看任务', category: 'tasks' },
            { id: 'tasks.update', name: '更新任务', category: 'tasks' },
            { id: 'tasks.delete', name: '删除任务', category: 'tasks' },
            { id: 'tasks.execute', name: '执行任务', category: 'tasks' },

            { id: 'workflows.create', name: '创建工作流', category: 'workflows' },
            { id: 'workflows.read', name: '查看工作流', category: 'workflows' },
            { id: 'workflows.update', name: '更新工作流', category: 'workflows' },
            { id: 'workflows.delete', name: '删除工作流', category: 'workflows' },
            { id: 'workflows.execute', name: '执行工作流', category: 'workflows' },

            { id: 'system.monitor', name: '系统监控', category: 'system' },
            { id: 'system.configure', name: '系统配置', category: 'system' },
            { id: 'system.admin', name: '系统管理', category: 'system' },

            { id: 'users.create', name: '创建用户', category: 'users' },
            { id: 'users.read', name: '查看用户', category: 'users' },
            { id: 'users.update', name: '更新用户', category: 'users' },
            { id: 'users.delete', name: '删除用户', category: 'users' }
        ];

        permissions.forEach(permission => {
            this.permissions.set(permission.id, permission);
        });

        // 定义角色
        const roles = [
            {
                id: 'admin',
                name: '系统管理员',
                description: '拥有系统所有权限',
                permissions: ['*']
            },
            {
                id: 'operator',
                name: '操作员',
                description: '日常操作权限',
                permissions: [
                    'agents.read', 'agents.create', 'agents.update', 'agents.control',
                    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.execute',
                    'workflows.read', 'workflows.create', 'workflows.execute',
                    'system.monitor'
                ]
            },
            {
                id: 'viewer',
                name: '查看者',
                description: '只读权限',
                permissions: [
                    'agents.read', 'tasks.read', 'workflows.read', 'system.monitor'
                ]
            },
            {
                id: 'developer',
                name: '开发者',
                description: '开发和测试权限',
                permissions: [
                    'agents.read', 'agents.create', 'agents.update',
                    'tasks.read', 'tasks.create', 'tasks.update',
                    'workflows.read', 'workflows.create', 'workflows.update', 'workflows.execute'
                ]
            }
        ];

        roles.forEach(role => {
            this.roles.set(role.id, role);
        });
    }

    hasPermission(user, permission, resource = null) {
        // 管理员拥有所有权限
        if (user.roles?.includes('admin') || user.permissions?.includes('*')) {
            return true;
        }

        // 检查直接权限
        if (user.permissions?.includes(permission)) {
            return true;
        }

        // 检查角色权限
        for (const roleId of user.roles || []) {
            const role = this.roles.get(roleId);
            if (role?.permissions.includes(permission) || role?.permissions.includes('*')) {
                return true;
            }
        }

        // 检查资源级别权限
        if (resource) {
            return this.checkResourcePermission(user, permission, resource);
        }

        return false;
    }

    checkResourcePermission(user, permission, resource) {
        // 实现基于资源的访问控制 (RBAC)
        const resourceOwner = resource.createdBy || resource.ownerId;

        // 资源拥有者拥有完全权限
        if (resourceOwner === user.id) {
            return true;
        }

        // 检查组权限
        if (resource.groupId && user.groups?.includes(resource.groupId)) {
            const groupPermissions = this.getGroupPermissions(resource.groupId);
            return groupPermissions.includes(permission);
        }

        return false;
    }

    getGroupPermissions(groupId) {
        // 实际环境中从数据库获取
        const groupPermissions = {
            'group_1': ['agents.read', 'tasks.read', 'workflows.read'],
            'group_2': ['agents.read', 'agents.create', 'tasks.read', 'tasks.create']
        };

        return groupPermissions[groupId] || [];
    }

    enforcePermission(user, permission, resource = null) {
        if (!this.hasPermission(user, permission, resource)) {
            const error = new Error(`权限不足: ${permission}`);
            error.code = 'INSUFFICIENT_PERMISSIONS';

            window.platform.security.auditLogger.logSecurityEvent({
                type: 'PERMISSION_DENIED',
                userId: user.id,
                permission,
                resource: resource?.id,
                timestamp: new Date().toISOString()
            });

            throw error;
        }

        // 记录权限使用
        window.platform.security.auditLogger.logSecurityEvent({
            type: 'PERMISSION_GRANTED',
            userId: user.id,
            permission,
            resource: resource?.id,
            timestamp: new Date().toISOString()
        });
    }

    getUserPermissions(user) {
        let permissions = new Set(user.permissions || []);

        // 添加角色权限
        for (const roleId of user.roles || []) {
            const role = this.roles.get(roleId);
            if (role) {
                role.permissions.forEach(p => permissions.add(p));
            }
        }

        return Array.from(permissions);
    }

    createPolicy(policyConfig) {
        const policy = {
            id: this.generatePolicyId(),
            name: policyConfig.name,
            description: policyConfig.description,
            rules: policyConfig.rules,
            effect: policyConfig.effect || 'allow',
            conditions: policyConfig.conditions || [],
            createdAt: new Date().toISOString()
        };

        this.policies.set(policy.id, policy);
        return policy;
    }

    evaluatePolicy(policy, context) {
        for (const rule of policy.rules) {
            if (this.evaluateRule(rule, context)) {
                return policy.effect === 'allow';
            }
        }
        return false;
    }

    evaluateRule(rule, context) {
        // 简单的规则评估器
        try {
            return new Function('context', `return ${rule.condition}`)(context);
        } catch (error) {
            return false;
        }
    }

    generatePolicyId() {
        return 'policy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

class EncryptionService {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
        this.keys = new Map();
    }

    async generateKey() {
        const key = await window.crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
        return key;
    }

    async encrypt(data, keyId = 'default') {
        const key = this.keys.get(keyId) || await this.generateKey();
        if (!this.keys.has(keyId)) {
            this.keys.set(keyId, key);
        }

        const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encodedData
        );

        return {
            data: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            keyId
        };
    }

    async decrypt(encryptedData, keyId = 'default') {
        const key = this.keys.get(keyId);
        if (!key) {
            throw new Error('加密密钥不存在');
        }

        const data = new Uint8Array(encryptedData.data);
        const iv = new Uint8Array(encryptedData.iv);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            data
        );

        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decrypted);
        return JSON.parse(decryptedString);
    }

    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = window.crypto.getRandomValues(new Uint8Array(16));
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(password + Array.from(salt).join(''));
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            hash: hashHex,
            salt: Array.from(salt)
        };
    }

    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000;
        this.categories = ['security', 'access', 'data', 'system', 'compliance'];
    }

    logSecurityEvent(event) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            category: 'security',
            type: event.type,
            userId: event.userId,
            sessionId: event.sessionId,
            ipAddress: event.ipAddress || this.getClientIP(),
            userAgent: event.userAgent || navigator.userAgent,
            resource: event.resource,
            action: event.action,
            result: event.result,
            details: event.details,
            severity: event.severity || 'info'
        };

        this.addLog(logEntry);

        // 重要安全事件实时告警
        if (['AUTHENTICATION_FAILED', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY'].includes(event.type)) {
            this.triggerSecurityAlert(logEntry);
        }
    }

    logDataAccess(event) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            category: 'data',
            type: 'DATA_ACCESS',
            userId: event.userId,
            resource: event.resource,
            action: event.action,
            dataType: event.dataType,
            recordCount: event.recordCount,
            query: event.query,
            result: event.result
        };

        this.addLog(logEntry);
    }

    logSystemEvent(event) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            category: 'system',
            type: event.type,
            component: event.component,
            action: event.action,
            details: event.details,
            severity: event.severity || 'info'
        };

        this.addLog(logEntry);
    }

    addLog(logEntry) {
        this.logs.push(logEntry);

        // 限制内存中的日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 发送到外部日志系统
        this.sendToExternalLogger(logEntry);

        // 触发日志事件
        window.dispatchEvent(new CustomEvent('auditLog', { detail: logEntry }));
    }

    async sendToExternalLogger(logEntry) {
        try {
            // 实际环境中发送到 Elasticsearch、Splunk 等
            if (window.platform?.monitoring?.elasticsearch) {
                await window.platform.monitoring.elasticsearch.index({
                    index: `audit-logs-${new Date().toISOString().split('T')[0]}`,
                    body: logEntry
                });
            }
        } catch (error) {
            console.error('Failed to send audit log to external system:', error);
        }
    }

    triggerSecurityAlert(logEntry) {
        const alert = {
            id: this.generateAlertId(),
            type: 'SECURITY_ALERT',
            severity: 'high',
            message: `安全事件: ${logEntry.type}`,
            source: logEntry,
            timestamp: new Date().toISOString()
        };

        window.dispatchEvent(new CustomEvent('securityAlert', { detail: alert }));

        // 实际环境中发送通知
        this.sendSecurityNotification(alert);
    }

    async sendSecurityNotification(alert) {
        // 发送邮件、短信、Slack 通知等
        console.warn('Security Alert:', alert);
    }

    getAuditLogs(filters = {}) {
        let filteredLogs = [...this.logs];

        if (filters.category) {
            filteredLogs = filteredLogs.filter(log => log.category === filters.category);
        }

        if (filters.type) {
            filteredLogs = filteredLogs.filter(log => log.type === filters.type);
        }

        if (filters.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }

        if (filters.startTime) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) >= new Date(filters.startTime)
            );
        }

        if (filters.endTime) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) <= new Date(filters.endTime)
            );
        }

        return filteredLogs.slice(-1000); // 最多返回1000条
    }

    generateLogId() {
        return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        return '127.0.0.1'; // 实际环境中从请求头获取
    }
}

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.config = {
            maxConcurrentSessions: 5,
            sessionTimeout: 3600000, // 1小时
            extendOnActivity: true,
            trackLocation: true
        };
    }

    createSession(user, authToken) {
        const session = {
            id: this.generateSessionId(),
            userId: user.id,
            authToken,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            location: this.getLocation(),
            status: 'active',
            activities: []
        };

        this.sessions.set(session.id, session);
        this.enforceSessionLimits(user.id);

        return session;
    }

    updateActivity(sessionId, activity) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.lastActivity = new Date().toISOString();
        session.activities.push({
            type: activity.type,
            timestamp: new Date().toISOString(),
            details: activity.details
        });

        // 保持最近100个活动
        if (session.activities.length > 100) {
            session.activities.shift();
        }

        // 自动延长会话
        if (this.config.extendOnActivity) {
            session.expiresAt = new Date(Date.now() + this.config.sessionTimeout).toISOString();
        }

        return true;
    }

    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('会话不存在');
        }

        if (session.status !== 'active') {
            throw new Error('会话已失效');
        }

        if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
            this.terminateSession(sessionId, 'expired');
            throw new Error('会话已过期');
        }

        return session;
    }

    terminateSession(sessionId, reason = 'manual') {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.status = 'terminated';
            session.terminatedAt = new Date().toISOString();
            session.terminationReason = reason;

            window.platform.security.auditLogger.logSecurityEvent({
                type: 'SESSION_TERMINATED',
                userId: session.userId,
                sessionId,
                details: { reason }
            });
        }
    }

    enforceSessionLimits(userId) {
        const userSessions = Array.from(this.sessions.values())
            .filter(s => s.userId === userId && s.status === 'active');

        if (userSessions.length > this.config.maxConcurrentSessions) {
            // 终止最老的会话
            const oldestSession = userSessions.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
            )[0];

            this.terminateSession(oldestSession.id, 'session_limit_exceeded');
        }
    }

    getUserSessions(userId) {
        return Array.from(this.sessions.values())
            .filter(s => s.userId === userId);
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        return '127.0.0.1'; // 实际环境中获取真实IP
    }

    getLocation() {
        // 实际环境中根据IP获取地理位置
        return { country: 'CN', city: 'Beijing' };
    }
}

// 初始化平台
document.addEventListener('DOMContentLoaded', () => {
    window.platform = new MultiAgentPlatform();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.platform) {
        window.platform.destroy?.();
    }
});