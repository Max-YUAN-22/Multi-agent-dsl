/**
 * 任务状态跟踪和报告生成系统
 * 提供完整的任务生命周期管理和详细报告
 */

class TaskTracker {
    constructor() {
        this.activeTasks = new Map();
        this.completedTasks = [];
        this.taskHistory = [];
        this.performanceMetrics = {
            totalTasks: 0,
            successfulTasks: 0,
            failedTasks: 0,
            averageExecutionTime: 0,
            agentUtilization: {
                traffic: 0,
                weather: 0,
                parking: 0,
                security: 0
            }
        };

        this.reportGenerator = new ReportGenerator();
        this.startPerformanceMonitoring();
    }

    // 创建新任务跟踪
    createTaskTracker(taskId, description, priority = 'medium') {
        const task = {
            id: taskId,
            description,
            priority,
            status: 'created',
            createdAt: Date.now(),
            startTime: null,
            endTime: null,
            duration: null,
            phases: [],
            agentsInvolved: [],
            sensorDataUsed: {},
            results: null,
            errors: [],
            metrics: {
                dataProcessingTime: 0,
                apiCalls: 0,
                cacheHits: 0,
                accuracy: null
            }
        };

        this.activeTasks.set(taskId, task);
        this.addTaskPhase(taskId, 'initialization', '任务初始化', 'info');

        console.log(`📋 创建任务跟踪: ${taskId} - ${description}`);
        return task;
    }

    // 添加任务阶段
    addTaskPhase(taskId, phaseType, description, status = 'info', data = {}) {
        const task = this.activeTasks.get(taskId);
        if (!task) {
            console.warn(`任务 ${taskId} 不存在`);
            return;
        }

        const phase = {
            type: phaseType,
            description,
            status,
            timestamp: Date.now(),
            duration: null,
            data,
            agent: data.agent || 'system'
        };

        task.phases.push(phase);

        // 如果是智能体阶段，记录智能体参与
        if (data.agent && !task.agentsInvolved.includes(data.agent)) {
            task.agentsInvolved.push(data.agent);
        }

        console.log(`📊 任务 ${taskId} 新阶段: ${description}`);
    }

    // 更新任务状态
    updateTaskStatus(taskId, status, details = {}) {
        const task = this.activeTasks.get(taskId);
        if (!task) return;

        const previousStatus = task.status;
        task.status = status;

        // 记录状态变化
        this.addTaskPhase(taskId, 'status_change', `状态变更: ${previousStatus} → ${status}`, status, details);

        // 特殊状态处理
        switch (status) {
            case 'running':
                if (!task.startTime) {
                    task.startTime = Date.now();
                }
                break;
            case 'completed':
            case 'failed':
                task.endTime = Date.now();
                task.duration = task.endTime - (task.startTime || task.createdAt);
                this.completeTask(taskId);
                break;
        }

        console.log(`🔄 任务 ${taskId} 状态更新: ${status}`);
    }

    // 记录传感器数据使用
    recordSensorDataUsage(taskId, sensorType, dataSize, processingTime) {
        const task = this.activeTasks.get(taskId);
        if (!task) return;

        if (!task.sensorDataUsed[sensorType]) {
            task.sensorDataUsed[sensorType] = {
                calls: 0,
                totalDataSize: 0,
                totalProcessingTime: 0
            };
        }

        const sensorData = task.sensorDataUsed[sensorType];
        sensorData.calls++;
        sensorData.totalDataSize += dataSize;
        sensorData.totalProcessingTime += processingTime;

        task.metrics.dataProcessingTime += processingTime;
        task.metrics.apiCalls++;

        console.log(`📡 记录传感器数据使用: ${sensorType} (${dataSize}KB, ${processingTime}ms)`);
    }

    // 记录错误
    recordError(taskId, error, agent = 'system') {
        const task = this.activeTasks.get(taskId);
        if (!task) return;

        const errorRecord = {
            timestamp: Date.now(),
            message: error.message || error,
            stack: error.stack,
            agent,
            phase: task.phases.length > 0 ? task.phases[task.phases.length - 1].type : 'unknown'
        };

        task.errors.push(errorRecord);
        this.addTaskPhase(taskId, 'error', `错误: ${errorRecord.message}`, 'error', { agent });

        console.error(`❌ 任务 ${taskId} 记录错误:`, errorRecord);
    }

    // 完成任务
    completeTask(taskId) {
        const task = this.activeTasks.get(taskId);
        if (!task) return;

        // 移动到已完成任务
        this.activeTasks.delete(taskId);
        this.completedTasks.push(task);
        this.taskHistory.push({
            ...task,
            completedAt: Date.now()
        });

        // 更新性能指标
        this.updatePerformanceMetrics(task);

        // 生成任务报告
        const report = this.reportGenerator.generateTaskReport(task);

        console.log(`✅ 任务 ${taskId} 完成，报告已生成`);
        return report;
    }

    // 更新性能指标
    updatePerformanceMetrics(task) {
        this.performanceMetrics.totalTasks++;

        if (task.status === 'completed') {
            this.performanceMetrics.successfulTasks++;
        } else if (task.status === 'failed') {
            this.performanceMetrics.failedTasks++;
        }

        // 更新平均执行时间
        const totalDuration = this.completedTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
        this.performanceMetrics.averageExecutionTime = totalDuration / this.completedTasks.length;

        // 更新智能体利用率
        task.agentsInvolved.forEach(agent => {
            if (this.performanceMetrics.agentUtilization[agent] !== undefined) {
                this.performanceMetrics.agentUtilization[agent]++;
            }
        });
    }

    // 获取任务状态
    getTaskStatus(taskId) {
        return this.activeTasks.get(taskId) ||
               this.completedTasks.find(task => task.id === taskId);
    }

    // 获取活跃任务列表
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }

    // 获取性能指标
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    // 生成系统状态报告
    generateSystemStatusReport() {
        return this.reportGenerator.generateSystemStatusReport({
            activeTasks: Array.from(this.activeTasks.values()),
            completedTasks: this.completedTasks,
            performanceMetrics: this.performanceMetrics,
            timestamp: new Date().toISOString()
        });
    }

    // 启动性能监控
    startPerformanceMonitoring() {
        setInterval(() => {
            this.cleanupOldTasks();
            this.analyzePerformancePatterns();
        }, 300000); // 每5分钟
    }

    // 清理旧任务
    cleanupOldTasks() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        this.completedTasks = this.completedTasks.filter(task =>
            (task.endTime || task.createdAt) > oneWeekAgo
        );

        this.taskHistory = this.taskHistory.filter(task =>
            task.completedAt > oneWeekAgo
        );

        console.log('🧹 清理了过期的任务记录');
    }

    // 分析性能模式
    analyzePerformancePatterns() {
        if (this.completedTasks.length < 5) return;

        const recentTasks = this.completedTasks.slice(-20);

        // 分析成功率趋势
        const successRate = recentTasks.filter(t => t.status === 'completed').length / recentTasks.length;

        // 分析执行时间趋势
        const avgTime = recentTasks.reduce((sum, t) => sum + (t.duration || 0), 0) / recentTasks.length;

        // 分析错误模式
        const errorPatterns = this.analyzeErrorPatterns(recentTasks);

        console.log(`📈 性能分析 - 成功率: ${(successRate * 100).toFixed(1)}%, 平均执行时间: ${avgTime.toFixed(0)}ms`);

        if (errorPatterns.length > 0) {
            console.log('⚠️ 发现错误模式:', errorPatterns);
        }
    }

    // 分析错误模式
    analyzeErrorPatterns(tasks) {
        const errorCounts = {};

        tasks.forEach(task => {
            task.errors.forEach(error => {
                const key = `${error.agent}:${error.phase}`;
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            });
        });

        return Object.entries(errorCounts)
            .filter(([key, count]) => count >= 2)
            .map(([key, count]) => ({ pattern: key, frequency: count }));
    }
}

// 报告生成器
class ReportGenerator {
    constructor() {
        this.reportTemplates = {
            task: 'task_report',
            system: 'system_status',
            performance: 'performance_analysis'
        };
    }

    // 生成任务报告
    generateTaskReport(task) {
        const report = {
            taskId: task.id,
            title: `任务执行报告 - ${task.description}`,
            executionSummary: this.generateExecutionSummary(task),
            timeline: this.generateTimeline(task),
            agentPerformance: this.analyzeAgentPerformance(task),
            dataUsage: this.analyzeSensorDataUsage(task),
            results: task.results,
            recommendations: this.generateRecommendations(task),
            metadata: {
                generatedAt: new Date().toISOString(),
                taskDuration: this.formatDuration(task.duration),
                successRate: task.errors.length === 0 ? '100%' : this.calculateSuccessRate(task)
            }
        };

        return report;
    }

    // 生成执行摘要
    generateExecutionSummary(task) {
        const summary = {
            status: task.status,
            duration: this.formatDuration(task.duration),
            agentsInvolved: task.agentsInvolved.length,
            phasesCompleted: task.phases.length,
            errorsEncountered: task.errors.length,
            dataProcessed: this.formatDataSize(
                Object.values(task.sensorDataUsed).reduce((sum, data) => sum + data.totalDataSize, 0)
            )
        };

        return summary;
    }

    // 生成时间线
    generateTimeline(task) {
        return task.phases.map(phase => ({
            timestamp: new Date(phase.timestamp).toLocaleTimeString(),
            relativeTime: this.formatRelativeTime(phase.timestamp - task.createdAt),
            phase: phase.type,
            description: phase.description,
            status: phase.status,
            agent: phase.agent
        }));
    }

    // 分析智能体性能
    analyzeAgentPerformance(task) {
        const agentStats = {};

        task.agentsInvolved.forEach(agent => {
            const agentPhases = task.phases.filter(phase => phase.agent === agent);
            const agentErrors = task.errors.filter(error => error.agent === agent);

            agentStats[agent] = {
                phasesHandled: agentPhases.length,
                errorsGenerated: agentErrors.length,
                successRate: agentPhases.length > 0 ?
                    ((agentPhases.length - agentErrors.length) / agentPhases.length * 100).toFixed(1) + '%' : 'N/A',
                averageProcessingTime: this.calculateAverageProcessingTime(agentPhases)
            };
        });

        return agentStats;
    }

    // 分析传感器数据使用
    analyzeSensorDataUsage(task) {
        const dataUsage = {};

        Object.entries(task.sensorDataUsed).forEach(([sensorType, data]) => {
            dataUsage[sensorType] = {
                calls: data.calls,
                totalDataSize: this.formatDataSize(data.totalDataSize),
                averageProcessingTime: (data.totalProcessingTime / data.calls).toFixed(1) + 'ms',
                efficiency: this.calculateDataEfficiency(data)
            };
        });

        return dataUsage;
    }

    // 生成建议
    generateRecommendations(task) {
        const recommendations = [];

        // 基于错误生成建议
        if (task.errors.length > 0) {
            recommendations.push({
                type: 'error_prevention',
                priority: 'high',
                description: '检测到错误，建议增强错误处理机制',
                details: task.errors.map(error => error.message)
            });
        }

        // 基于执行时间生成建议
        if (task.duration > 30000) { // 超过30秒
            recommendations.push({
                type: 'performance_optimization',
                priority: 'medium',
                description: '任务执行时间较长，建议优化处理流程',
                details: '考虑并行处理或缓存优化'
            });
        }

        // 基于数据使用生成建议
        const totalDataCalls = Object.values(task.sensorDataUsed).reduce((sum, data) => sum + data.calls, 0);
        if (totalDataCalls > 10) {
            recommendations.push({
                type: 'data_optimization',
                priority: 'low',
                description: '数据调用频率较高，建议启用更智能的缓存策略',
                details: '可以减少API调用次数并提升响应速度'
            });
        }

        return recommendations;
    }

    // 生成系统状态报告
    generateSystemStatusReport(systemData) {
        const report = {
            title: '智慧城市系统状态报告',
            overview: {
                activeTasks: systemData.activeTasks.length,
                completedTasks: systemData.completedTasks.length,
                totalTasks: systemData.performanceMetrics.totalTasks,
                systemUptime: this.formatDuration(Date.now() - (systemData.systemStartTime || Date.now())),
                successRate: ((systemData.performanceMetrics.successfulTasks / systemData.performanceMetrics.totalTasks) * 100).toFixed(1) + '%'
            },
            agentStatus: this.generateAgentStatusSummary(systemData.performanceMetrics.agentUtilization),
            recentActivity: this.generateRecentActivitySummary(systemData.completedTasks.slice(-10)),
            systemHealth: this.assessSystemHealth(systemData),
            recommendations: this.generateSystemRecommendations(systemData),
            timestamp: systemData.timestamp
        };

        return report;
    }

    // 生成智能体状态摘要
    generateAgentStatusSummary(utilization) {
        const agents = ['traffic', 'weather', 'parking', 'security'];

        return agents.map(agent => ({
            name: agent,
            tasksHandled: utilization[agent] || 0,
            status: utilization[agent] > 0 ? 'active' : 'standby',
            utilizationRate: this.calculateUtilizationRate(utilization[agent], utilization)
        }));
    }

    // 生成最近活动摘要
    generateRecentActivitySummary(recentTasks) {
        return recentTasks.map(task => ({
            taskId: task.id,
            description: task.description.substring(0, 50) + '...',
            status: task.status,
            duration: this.formatDuration(task.duration),
            completedAt: new Date(task.endTime).toLocaleString()
        }));
    }

    // 评估系统健康状态
    assessSystemHealth(systemData) {
        const metrics = systemData.performanceMetrics;
        const successRate = metrics.successfulTasks / metrics.totalTasks;
        const errorRate = metrics.failedTasks / metrics.totalTasks;

        let healthScore = 100;
        let status = 'excellent';
        let issues = [];

        if (errorRate > 0.1) {
            healthScore -= 30;
            status = 'fair';
            issues.push('错误率较高');
        }

        if (metrics.averageExecutionTime > 20000) {
            healthScore -= 20;
            status = 'fair';
            issues.push('平均执行时间过长');
        }

        if (successRate < 0.9) {
            healthScore -= 25;
            status = 'poor';
            issues.push('成功率偏低');
        }

        return {
            score: Math.max(healthScore, 0),
            status: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : 'poor',
            issues: issues.length > 0 ? issues : ['系统运行正常']
        };
    }

    // 生成系统建议
    generateSystemRecommendations(systemData) {
        const recommendations = [];
        const health = this.assessSystemHealth(systemData);

        if (health.score < 80) {
            recommendations.push({
                priority: 'high',
                category: 'system_optimization',
                description: '系统健康分数偏低，建议进行全面优化',
                actions: health.issues
            });
        }

        if (systemData.activeTasks.length > 10) {
            recommendations.push({
                priority: 'medium',
                category: 'load_management',
                description: '当前活跃任务较多，建议启用负载均衡',
                actions: ['增加任务队列管理', '优化任务调度算法']
            });
        }

        return recommendations;
    }

    // 辅助方法
    formatDuration(ms) {
        if (!ms) return 'N/A';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    formatDataSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatRelativeTime(ms) {
        return '+' + this.formatDuration(ms);
    }

    calculateSuccessRate(task) {
        const totalPhases = task.phases.length;
        const errorPhases = task.phases.filter(p => p.status === 'error').length;
        return ((totalPhases - errorPhases) / totalPhases * 100).toFixed(1) + '%';
    }

    calculateAverageProcessingTime(phases) {
        if (phases.length === 0) return 'N/A';
        const totalTime = phases.reduce((sum, phase) => sum + (phase.duration || 0), 0);
        return (totalTime / phases.length).toFixed(1) + 'ms';
    }

    calculateDataEfficiency(data) {
        const efficiency = data.totalDataSize / data.totalProcessingTime;
        return efficiency.toFixed(2) + ' KB/ms';
    }

    calculateUtilizationRate(agentTasks, allUtilization) {
        const totalTasks = Object.values(allUtilization).reduce((sum, count) => sum + count, 0);
        return totalTasks > 0 ? ((agentTasks / totalTasks) * 100).toFixed(1) + '%' : '0%';
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.TaskTracker = TaskTracker;
    window.ReportGenerator = ReportGenerator;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TaskTracker, ReportGenerator };
}

console.log('📊 任务跟踪和报告生成系统加载完成');