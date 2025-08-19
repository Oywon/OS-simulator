// OS Simulator with Database Integration

// Database Configuration
class DatabaseManager {
    constructor() {
        this.isConnected = false;
        this.config = {
            host: 'localhost',
            port: 3306,
            database: 'os_simulator',
            username: 'root',
            password: ''
        };
        this.connection = null;
    }

    // Simulate database connection (in a real app, this would use actual DB drivers)
    async connect() {
        try {
            this.updateConnectionStatus('connecting');
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real application, you would use:
            // - mysql2 for MySQL
            // - pg for PostgreSQL  
            // - mongodb for MongoDB
            // - sqlite3 for SQLite
            
            this.isConnected = true;
            this.updateConnectionStatus('connected');
            this.logMessage('success', 'Database connected successfully');
            await this.initializeTables();
            return true;
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            this.logMessage('error', `Connection failed: ${error.message}`);
            return false;
        }
    }

    async disconnect() {
        this.isConnected = false;
        this.connection = null;
        this.updateConnectionStatus('disconnected');
        this.logMessage('info', 'Database disconnected');
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('dbStatus');
        if (!statusElement) return;

        statusElement.className = `db-status ${status}`;
        const indicator = statusElement.querySelector('.status-indicator');
        
        switch(status) {
            case 'connected':
                statusElement.innerHTML = '<span class="status-indicator green"></span>Connected to Database';
                break;
            case 'connecting':
                statusElement.innerHTML = '<span class="status-indicator yellow"></span>Connecting...';
                break;
            case 'disconnected':
                statusElement.innerHTML = '<span class="status-indicator red"></span>Disconnected';
                break;
        }
    }

    async initializeTables() {
        // Create tables for OS simulator data
        const tables = [
            {
                name: 'processes',
                sql: `CREATE TABLE IF NOT EXISTS processes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    arrival_time INT NOT NULL,
                    burst_time INT NOT NULL,
                    priority INT NOT NULL,
                    waiting_time INT DEFAULT 0,
                    turnaround_time INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'memory_blocks',
                sql: `CREATE TABLE IF NOT EXISTS memory_blocks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    process_name VARCHAR(50),
                    size_kb INT NOT NULL,
                    start_address INT NOT NULL,
                    end_address INT NOT NULL,
                    status ENUM('allocated', 'free') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'file_system',
                sql: `CREATE TABLE IF NOT EXISTS file_system (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type ENUM('file', 'folder') NOT NULL,
                    size_kb INT DEFAULT 0,
                    parent_path VARCHAR(500) DEFAULT '/',
                    full_path VARCHAR(755) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'disk_requests',
                sql: `CREATE TABLE IF NOT EXISTS disk_requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cylinder INT NOT NULL,
                    algorithm VARCHAR(20) NOT NULL,
                    seek_time DECIMAL(10,2) DEFAULT 0,
                    processed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'system_logs',
                sql: `CREATE TABLE IF NOT EXISTS system_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    module VARCHAR(50) NOT NULL,
                    log_level ENUM('info', 'warning', 'error', 'success') NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            }
        ];

        for (const table of tables) {
            try {
                // Simulate table creation
                await this.executeQuery(table.sql);
                this.logMessage('info', `Table '${table.name}' initialized`);
            } catch (error) {
                this.logMessage('error', `Failed to create table '${table.name}': ${error.message}`);
            }
        }
    }

    async executeQuery(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        // Simulate query execution
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real application, this would execute the actual SQL
                console.log('Executing SQL:', sql, params);
                resolve({ success: true, data: [] });
            }, 100);
        });
    }

    async saveProcess(process) {
        const sql = `INSERT INTO processes (name, arrival_time, burst_time, priority, waiting_time, turnaround_time) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            process.name,
            process.arrivalTime,
            process.burstTime,
            process.priority,
            process.waitingTime || 0,
            process.turnaroundTime || 0
        ];
        
        return await this.executeQuery(sql, params);
    }

    async saveMemoryAllocation(allocation) {
        const sql = `INSERT INTO memory_blocks (process_name, size_kb, start_address, end_address, status) 
                     VALUES (?, ?, ?, ?, ?)`;
        const params = [
            allocation.processName,
            allocation.size,
            allocation.startAddress,
            allocation.endAddress,
            allocation.status
        ];
        
        return await this.executeQuery(sql, params);
    }

    async saveFileSystemItem(item) {
        const sql = `INSERT INTO file_system (name, type, size_kb, parent_path, full_path) 
                     VALUES (?, ?, ?, ?, ?)`;
        const params = [
            item.name,
            item.type,
            item.size || 0,
            item.parentPath || '/',
            item.fullPath
        ];
        
        return await this.executeQuery(sql, params);
    }

    async saveDiskRequest(request) {
        const sql = `INSERT INTO disk_requests (cylinder, algorithm, seek_time, processed) 
                     VALUES (?, ?, ?, ?)`;
        const params = [
            request.cylinder,
            request.algorithm,
            request.seekTime || 0,
            request.processed || false
        ];
        
        return await this.executeQuery(sql, params);
    }

    async logMessage(level, message, module = 'system') {
        const sql = `INSERT INTO system_logs (module, log_level, message) VALUES (?, ?, ?)`;
        const params = [module, level, message];
        
        try {
            await this.executeQuery(sql, params);
            
            // Also display in UI log
            const logConsole = document.getElementById('dbLog');
            if (logConsole) {
                const logEntry = document.createElement('div');
                logEntry.className = `log-entry ${level}`;
                logEntry.textContent = `[${new Date().toLocaleTimeString()}] [${module.toUpperCase()}] ${message}`;
                logConsole.appendChild(logEntry);
                logConsole.scrollTop = logConsole.scrollHeight;
            }
        } catch (error) {
            console.error('Failed to log message:', error);
        }
    }

    async exportData() {
        if (!this.isConnected) {
            alert('Database not connected');
            return;
        }

        const tables = ['processes', 'memory_blocks', 'file_system', 'disk_requests', 'system_logs'];
        const exportData = {};

        for (const table of tables) {
            try {
                const result = await this.executeQuery(`SELECT * FROM ${table}`);
                exportData[table] = result.data;
            } catch (error) {
                console.error(`Failed to export ${table}:`, error);
            }
        }

        // Download as JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `os_simulator_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.logMessage('success', 'Data exported successfully');
    }

    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            for (const [table, records] of Object.entries(data)) {
                if (records && Array.isArray(records)) {
                    // In a real app, you would clear and insert the data
                    console.log(`Importing ${records.length} records to ${table}`);
                }
            }
            
            this.logMessage('success', 'Data imported successfully');
        } catch (error) {
            this.logMessage('error', `Import failed: ${error.message}`);
        }
    }
}

// Initialize database manager
const dbManager = new DatabaseManager();

// OS Simulator Core Functions
let processes = [];
let memoryBlocks = [
    { id: 1, processName: 'OS', size: 128, startAddress: 0, endAddress: 128, status: 'allocated' }
];
let fileSystem = [];
let diskRequests = [];
let selectedFile = null;

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
}

// CPU Scheduling Functions
function addProcess() {
    const name = document.getElementById('processName').value || `P${processes.length + 1}`;
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value) || 0;
    const burstTime = parseInt(document.getElementById('burstTime').value) || 1;
    const priority = parseInt(document.getElementById('priority').value) || 1;

    const process = {
        id: processes.length + 1,
        name,
        arrivalTime,
        burstTime,
        priority,
        remainingTime: burstTime,
        waitingTime: 0,
        turnaroundTime: 0,
        completionTime: 0,
        status: 'ready'
    };

    processes.push(process);
    updateProcessTable();
    
    // Save to database
    if (dbManager.isConnected) {
        dbManager.saveProcess(process);
        dbManager.logMessage('info', `Process ${name} added to queue`, 'cpu');
    }

    // Clear form
    document.getElementById('processName').value = '';
    document.getElementById('arrivalTime').value = '0';
    document.getElementById('burstTime').value = '10';
    document.getElementById('priority').value = '1';
}

function updateProcessTable() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';

    processes.forEach((process, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${process.name}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.priority}</td>
            <td><span class="status-badge ${process.status}">${process.status}</span></td>
            <td><button class="btn danger" onclick="removeProcess(${index})">Remove</button></td>
        `;
    });

    document.getElementById('totalProcesses').textContent = processes.length;
}

function removeProcess(index) {
    processes.splice(index, 1);
    updateProcessTable();
}

function clearProcesses() {
    processes = [];
    updateProcessTable();
    document.getElementById('ganttChart').innerHTML = '<p style="text-align: center; color: #7f8c8d; margin-top: 80px;">Add processes and run scheduler to see the Gantt chart</p>';
}

function runScheduler() {
    if (processes.length === 0) {
        alert('Add processes first!');
        return;
    }

    const algorithm = document.getElementById('schedulingAlgorithm').value;
    const timeQuantum = parseInt(document.getElementById('timeQuantum').value) || 4;

    let scheduledProcesses = [];
    
    switch (algorithm) {
        case 'fcfs':
            scheduledProcesses = scheduleFCFS([...processes]);
            break;
        case 'sjf':
            scheduledProcesses = scheduleSJF([...processes]);
            break;
        case 'priority':
            scheduledProcesses = schedulePriority([...processes]);
            break;
        case 'rr':
            scheduledProcesses = scheduleRoundRobin([...processes], timeQuantum);
            break;
    }

    displayGanttChart(scheduledProcesses);
    calculateStatistics(scheduledProcesses);
    
    if (dbManager.isConnected) {
        dbManager.logMessage('success', `Scheduler executed with ${algorithm.toUpperCase()} algorithm`, 'cpu');
    }
}

// Scheduling Algorithms
function scheduleFCFS(processList) {
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const scheduled = [];

    processList.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        
        process.startTime = currentTime;
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;
        
        scheduled.push({
            ...process,
            startTime: currentTime,
            duration: process.burstTime
        });
        
        currentTime = process.completionTime;
    });

    return scheduled;
}

function scheduleSJF(processList) {
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const scheduled = [];
    const readyQueue = [];
    let i = 0;

    while (i < processList.length || readyQueue.length > 0) {
        // Add processes that have arrived
        while (i < processList.length && processList[i].arrivalTime <= currentTime) {
            readyQueue.push(processList[i]);
            i++;
        }

        if (readyQueue.length === 0) {
            currentTime = processList[i].arrivalTime;
            continue;
        }

        // Sort by burst time (shortest first)
        readyQueue.sort((a, b) => a.burstTime - b.burstTime);
        const process = readyQueue.shift();

        process.startTime = currentTime;
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;

        scheduled.push({
            ...process,
            startTime: currentTime,
            duration: process.burstTime
        });

        currentTime = process.completionTime;
    }

    return scheduled;
}

function schedulePriority(processList) {
    processList.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const scheduled = [];
    const readyQueue = [];
    let i = 0;

    while (i < processList.length || readyQueue.length > 0) {
        while (i < processList.length && processList[i].arrivalTime <= currentTime) {
            readyQueue.push(processList[i]);
            i++;
        }

        if (readyQueue.length === 0) {
            currentTime = processList[i].arrivalTime;
            continue;
        }

        // Sort by priority (lower number = higher priority)
        readyQueue.sort((a, b) => a.priority - b.priority);
        const process = readyQueue.shift();

        process.startTime = currentTime;
        process.completionTime = currentTime + process.burstTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnaroundTime - process.burstTime;

        scheduled.push({
            ...process,
            startTime: currentTime,
            duration: process.burstTime
        });

        currentTime = process.completionTime;
    }

    return scheduled;
}

function scheduleRoundRobin(processList, quantum) {
    const scheduled = [];
    const queue = [...processList.sort((a, b) => a.arrivalTime - b.arrivalTime)];
    let currentTime = 0;

    queue.forEach(p => p.remainingTime = p.burstTime);

    while (queue.some(p => p.remainingTime > 0)) {
        for (let process of queue) {
            if (process.remainingTime > 0 && process.arrivalTime <= currentTime) {
                const executeTime = Math.min(quantum, process.remainingTime);
                
                scheduled.push({
                    ...process,
                    startTime: currentTime,
                    duration: executeTime
                });

                currentTime += executeTime;
                process.remainingTime -= executeTime;

                if (process.remainingTime === 0) {
                    process.completionTime = currentTime;
                    process.turnaroundTime = process.completionTime - process.arrivalTime;
                    process.waitingTime = process.turnaroundTime - process.burstTime;
                }
            }
        }
    }

    return scheduled;
}

function displayGanttChart(scheduledProcesses) {
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';

    const colors = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6', '#1abc9c', '#34495e', '#f1c40f'];
    let colorIndex = 0;
    const processColors = {};

    scheduledProcesses.forEach(process => {
        if (!processColors[process.name]) {
            processColors[process.name] = colors[colorIndex % colors.length];
            colorIndex++;
        }

        const ganttBar = document.createElement('div');
        ganttBar.className = 'gantt-bar';
        ganttBar.style.width = `${process.duration * 20}px`;
        ganttBar.style.backgroundColor = processColors[process.name];
        ganttBar.textContent = `${process.name} (${process.duration})`;
        ganttBar.title = `Process: ${process.name}\nStart: ${process.startTime}\nDuration: ${process.duration}`;
        
        ganttChart.appendChild(ganttBar);
    });
}

function calculateStatistics(scheduledProcesses) {
    const completedProcesses = {};
    
    scheduledProcesses.forEach(process => {
        if (process.completionTime) {
            completedProcesses[process.name] = process;
        }
    });

    const processArray = Object.values(completedProcesses);
    const avgWaitingTime = processArray.reduce((sum, p) => sum + p.waitingTime, 0) / processArray.length;
    const avgTurnaroundTime = processArray.reduce((sum, p) => sum + p.turnaroundTime, 0) / processArray.length;
    const totalTime = Math.max(...scheduledProcesses.map(p => p.startTime + p.duration));
    const cpuUtilization = (scheduledProcesses.reduce((sum, p) => sum + p.duration, 0) / totalTime * 100);

    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
    document.getElementById('cpuUtilization').textContent = `${cpuUtilization.toFixed(1)}%`;
}

// Memory Management Functions
function allocateMemory() {
    const processSize = parseInt(document.getElementById('processSize').value) || 100;
    const algorithm = document.getElementById('allocationAlgorithm').value;
    
    const freeBlocks = memoryBlocks.filter(block => block.status === 'free');
    let selectedBlock = null;

    switch (algorithm) {
        case 'first':
            selectedBlock = freeBlocks.find(block => block.size >= processSize);
            break;
        case 'best':
            const bestFit = freeBlocks
                .filter(block => block.size >= processSize)
                .sort((a, b) => a.size - b.size);
            selectedBlock = bestFit[0];
            break;
        case 'worst':
            const worstFit = freeBlocks
                .filter(block => block.size >= processSize)
                .sort((a, b) => b.size - a.size);
            selectedBlock = worstFit[0];
            break;
    }

    if (selectedBlock) {
        const processName = `P${memoryBlocks.filter(b => b.status === 'allocated' && b.processName !== 'OS').length + 1}`;
        
        // Create new allocated block
        const newBlock = {
            id: memoryBlocks.length + 1,
            processName: processName,
            size: processSize,
            startAddress: selectedBlock.startAddress,
            endAddress: selectedBlock.startAddress + processSize,
            status: 'allocated'
        };

        // Remove old block and add new ones
        const blockIndex = memoryBlocks.indexOf(selectedBlock);
        memoryBlocks.splice(blockIndex, 1);
        memoryBlocks.push(newBlock);

        // If there's remaining space, create a new free block
        if (selectedBlock.size > processSize) {
            const remainingBlock = {
                id: memoryBlocks.length + 1,
                processName: null,
                size: selectedBlock.size - processSize,
                startAddress: selectedBlock.startAddress + processSize,
                endAddress: selectedBlock.endAddress,
                status: 'free'
            };
            memoryBlocks.push(remainingBlock);
        }

        // Sort blocks by start address
        memoryBlocks.sort((a, b) => a.startAddress - b.startAddress);
        
        updateMemoryVisualization();
        
        if (dbManager.isConnected) {
            dbManager.saveMemoryAllocation(newBlock);
            dbManager.logMessage('success', `Allocated ${processSize}KB to ${processName} using ${algorithm} fit`, 'memory');
        }
        
        addMemoryLog('success', `Allocated ${processSize}KB to ${processName} using ${algorithm} fit algorithm`);
    } else {
        addMemoryLog('error', `Failed to allocate ${processSize}KB - insufficient memory`);
        if (dbManager.isConnected) {
            dbManager.logMessage('error', `Memory allocation failed: insufficient space for ${processSize}KB`, 'memory');
        }
    }
}

function deallocateMemory() {
    // Remove all allocated blocks except OS
    memoryBlocks = memoryBlocks.filter(block => block.processName === 'OS');
    
    // Add one large free block
    memoryBlocks.push({
        id: 2,
        processName: null,
        size: 896, // 1024 - 128 (OS)
        startAddress: 128,
        endAddress: 1024,
        status: 'free'
    });
    
    updateMemoryVisualization();
    addMemoryLog('info', 'All user processes deallocated');
    
    if (dbManager.isConnected) {
        dbManager.logMessage('info', 'Memory deallocated - all user processes removed', 'memory');
    }
}

function compactMemory() {
    const allocatedBlocks = memoryBlocks.filter(block => block.status === 'allocated').sort((a, b) => a.startAddress - b.startAddress);
    const totalAllocated = allocatedBlocks.reduce((sum, block) => sum + block.size, 0);
    const totalFree = 1024 - totalAllocated;
    
    // Rebuild memory layout with compacted allocated blocks
    memoryBlocks = [];
    let currentAddress = 0;
    
    allocatedBlocks.forEach((block, index) => {
        memoryBlocks.push({
            ...block,
            id: index + 1,
            startAddress: currentAddress,
            endAddress: currentAddress + block.size
        });
        currentAddress += block.size;
    });
    
    // Add single free block at the end
    if (totalFree > 0) {
        memoryBlocks.push({
            id: memoryBlocks.length + 1,
            processName: null,
            size: totalFree,
            startAddress: currentAddress,
            endAddress: 1024,
            status: 'free'
        });
    }
    
    updateMemoryVisualization();
    addMemoryLog('success', 'Memory compacted successfully');
    
    if (dbManager.isConnected) {
        dbManager.logMessage('success', 'Memory compaction completed', 'memory');
    }
}

function updateMemoryVisualization() {
    const memoryVisual = document.getElementById('memoryVisual');
    memoryVisual.innerHTML = '';
    
    memoryBlocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = `memory-block ${block.status}`;
        
        if (block.processName === 'OS') {
            blockDiv.classList.add('os');
        }
        
        const height = (block.size / 1024) * 100;
        blockDiv.style.height = `${height}%`;
        blockDiv.textContent = block.processName || `Free ${block.size}KB`;
        blockDiv.title = `${block.processName || 'Free'}\nSize: ${block.size}KB\nRange: ${block.startAddress}-${block.endAddress}`;
        
        memoryVisual.appendChild(blockDiv);
    });
    
    updateMemoryStats();
}

function updateMemoryStats() {
    const totalMemory = 1024;
    const usedMemory = memoryBlocks.filter(b => b.status === 'allocated').reduce((sum, b) => sum + b.size, 0);
    const freeMemory = totalMemory - usedMemory;
    const freeBlocks = memoryBlocks.filter(b => b.status === 'free').length;
    const allocatedBlocks = memoryBlocks.filter(b => b.status === 'allocated').length;
    
    // Calculate fragmentation (external fragmentation)
    const largestFreeBlock = Math.max(...memoryBlocks.filter(b => b.status === 'free').map(b => b.size), 0);
    const fragmentation = freeMemory > 0 ? ((freeMemory - largestFreeBlock) / freeMemory * 100) : 0;
    
    document.getElementById('usedMemory').textContent = `${usedMemory} KB`;
    document.getElementById('freeMemory').textContent = `${freeMemory} KB`;
    document.getElementById('fragmentation').textContent = `${fragmentation.toFixed(1)}%`;
    document.getElementById('allocatedBlocks').textContent = allocatedBlocks;
    document.getElementById('freeBlocks').textContent = freeBlocks;
}

function addMemoryLog(type, message) {
    const logConsole = document.getElementById('memoryLog');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logConsole.appendChild(logEntry);
    logConsole.scrollTop = logConsole.scrollHeight;
}

// File System Functions
function createFileOrFolder() {
    const fileName = document.getElementById('fileName').value;
    const fileType = document.getElementById('fileType').value;
    const fileSize = parseInt(document.getElementById('fileSize').value) || 0;
    
    if (!fileName) {
        alert('Please enter a file/folder name');
        return;
    }
    
    const fileItem = {
        id: fileSystem.length + 1,
        name: fileName,
        type: fileType,
        size: fileType === 'file' ? fileSize : 0,
        parentPath: '/',
        fullPath: `/${fileName}`,
        created: new Date()
    };
    
    fileSystem.push(fileItem);
    updateFileTree();
    
    if (dbManager.isConnected) {
        dbManager.saveFileSystemItem(fileItem);
        dbManager.logMessage('info', `Created ${fileType}: ${fileName}`, 'filesystem');
    }
    
    addFileLog('success', `Created ${fileType}: ${fileName} (${fileSize}KB)`);
    
    // Clear form
    document.getElementById('fileName').value = '';
    document.getElementById('fileSize').value = '10';
}

function updateFileTree() {
    // This would be more complex in a real implementation with nested folders
    updateFileStats();
}

function updateFileStats() {
    const files = fileSystem.filter(item => item.type === 'file');
    const folders = fileSystem.filter(item => item.type === 'folder');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0) + 182; // 182 from initial files
    
    document.getElementById('totalFiles').textContent = files.length + 4; // +4 for initial files
    document.getElementById('totalFolders').textContent = folders.length + 4; // +4 for initial folders
    document.getElementById('usedSpace').textContent = `${totalSize} KB`;
    document.getElementById('freeSpace').textContent = `${((10 * 1024) - totalSize) / 1024}MB`;
}

function selectFile(element) {
    // Remove previous selection
    document.querySelectorAll('.file-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    
    selectedFile = element.textContent;
    document.getElementById('selectedItem').textContent = selectedFile;
}

function deleteSelected() {
    if (!selectedFile) {
        alert('Please select a file or folder to delete');
        return;
    }
    
    addFileLog('warning', `Deleted: ${selectedFile}`);
    
    if (dbManager.isConnected) {
        dbManager.logMessage('warning', `Deleted: ${selectedFile}`, 'filesystem');
    }
    
    selectedFile = null;
    document.getElementById('selectedItem').textContent = 'None';
}

function saveFileSystem() {
    if (!dbManager.isConnected) {
        alert('Database not connected. Cannot save file system.');
        return;
    }
    
    // Save current file system state to database
    fileSystem.forEach(item => {
        dbManager.saveFileSystemItem(item);
    });
    
    addFileLog('success', 'File system saved to database');
    dbManager.logMessage('success', 'File system data saved to database', 'filesystem');
}

function addFileLog(type, message) {
    const logConsole = document.getElementById('fileLog');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logConsole.appendChild(logEntry);
    logConsole.scrollTop = logConsole.scrollHeight;
}

// Disk Management Functions
function addDiskRequest() {
    const cylinder = parseInt(document.getElementById('cylinderRequest').value);
    const algorithm = document.getElementById('diskAlgorithm').value;
    
    if (cylinder < 0 || cylinder > 199) {
        alert('Cylinder must be between 0 and 199');
        return;
    }
    
    const request = {
        id: diskRequests.length + 1,
        cylinder: cylinder,
        algorithm: algorithm,
        seekTime: 0,
        processed: false,
        timestamp: new Date()
    };
    
    diskRequests.push(request);
    updateDiskRequestTable();
    
    if (dbManager.isConnected) {
        dbManager.saveDiskRequest(request);
        dbManager.logMessage('info', `Disk request added: cylinder ${cylinder}`, 'disk');
    }
}

function updateDiskRequestTable() {
    const tbody = document.getElementById('diskRequestBody');
    tbody.innerHTML = '';
    
    diskRequests.forEach(request => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.cylinder}</td>
            <td>${request.processed ? 'Completed' : 'Pending'}</td>
            <td>${request.seekTime.toFixed(2)} ms</td>
        `;
    });
    
    document.getElementById('requestsInQueue').textContent = diskRequests.filter(r => !r.processed).length;
}

function processDiskRequests() {
    if (diskRequests.filter(r => !r.processed).length === 0) {
        alert('No pending disk requests');
        return;
    }
    
    const algorithm = document.getElementById('diskAlgorithm').value;
    const pendingRequests = diskRequests.filter(r => !r.processed);
    let currentHeadPosition = parseInt(document.getElementById('headPosition').textContent) || 0;
    let totalSeekDistance = 0;
    
    // Simple FCFS processing for demonstration
    pendingRequests.forEach(request => {
        const seekDistance = Math.abs(request.cylinder - currentHeadPosition);
        const seekTime = seekDistance * 0.1; // 0.1ms per cylinder
        
        request.seekTime = seekTime;
        request.processed = true;
        
        totalSeekDistance += seekDistance;
        currentHeadPosition = request.cylinder;
    });
    
    const avgSeekTime = pendingRequests.reduce((sum, r) => sum + r.seekTime, 0) / pendingRequests.length;
    
    document.getElementById('headPosition').textContent = currentHeadPosition;
    document.getElementById('totalSeekDistance').textContent = totalSeekDistance;
    document.getElementById('avgSeekTime').textContent = avgSeekTime.toFixed(2);
    
    updateDiskRequestTable();
    
    if (dbManager.isConnected) {
        dbManager.logMessage('success', `Processed ${pendingRequests.length} disk requests`, 'disk');
    }
}

function clearDiskRequests() {
    diskRequests = [];
    updateDiskRequestTable();
    document.getElementById('totalSeekDistance').textContent = '0';
    document.getElementById('avgSeekTime').textContent = '0.00';
}

function spinDisk() {
    const disk = document.getElementById('diskVisual');
    disk.style.transform = 'rotate(720deg) scale(1.1)';
    setTimeout(() => {
        disk.style.transform = '';
    }, 500);
}

// Performance Monitor Functions
function updatePerformanceMetrics() {
    // Simulate dynamic performance data
    const cpuUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
    const memoryUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
    const diskUsage = Math.floor(Math.random() * 50) + 10; // 10-60%
    const networkUsage = Math.floor(Math.random() * 25) + 5; // 5-30%
    
    updateCircularProgress('cpuProgress', 'cpuMetric', cpuUsage);
    updateCircularProgress('memoryProgress', 'memoryMetric', memoryUsage);
    updateCircularProgress('diskProgress', 'diskMetric', diskUsage);
    updateCircularProgress('networkProgress', 'networkMetric', networkUsage);
}

function updateCircularProgress(progressId, metricId, percentage) {
    const progressCircle = document.getElementById(progressId);
    const metricElement = document.getElementById(metricId);
    
    if (progressCircle && metricElement) {
        const circumference = 2 * Math.PI * 42; // radius = 42
        const offset = circumference - (percentage / 100) * circumference;
        
        progressCircle.style.strokeDashoffset = offset;
        metricElement.textContent = `${percentage}%`;
    }
}

// Database Integration UI Functions
function createDatabaseSection() {
    const container = document.querySelector('.container');
    const dbSection = document.createElement('div');
    dbSection.id = 'database-section';
    dbSection.className = 'section';
    dbSection.innerHTML = `
        <div class="card">
            <h2>🗄️ Database Management</h2>
            
            <div id="dbStatus" class="db-status disconnected">
                <span class="status-indicator red"></span>Disconnected
            </div>
            
            <div class="db-config-form">
                <h3>Database Configuration</h3>
                <div class="config-row">
                    <div class="config-group">
                        <label>Host:</label>
                        <input type="text" id="dbHost" value="localhost">
                    </div>
                    <div class="config-group">
                        <label>Port:</label>
                        <input type="number" id="dbPort" value="3306">
                    </div>
                </div>
                <div class="config-row">
                    <div class="config-group">
                        <label>Database:</label>
                        <input type="text" id="dbName" value="os_simulator">
                    </div>
                    <div class="config-group">
                        <label>Username:</label>
                        <input type="text" id="dbUser" value="root">
                    </div>
                </div>
                <div class="config-row">
                    <div class="config-group">
                        <label>Password:</label>
                        <input type="password" id="dbPassword" placeholder="Enter password">
                    </div>
                    <div class="config-group">
                        <label>Database Type:</label>
                        <select id="dbType">
                            <option value="mysql">MySQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="sqlite">SQLite</option>
                            <option value="mongodb">MongoDB</option>
                        </select>
                    </div>
                </div>
                
                <div class="db-operations">
                    <button class="btn success" onclick="connectDatabase()">Connect</button>
                    <button class="btn danger" onclick="disconnectDatabase()">Disconnect</button>
                    <button class="btn" onclick="testConnection()">Test Connection</button>
                </div>
            </div>
            
            <div class="grid grid-2">
                <div>
                    <h3>SQL Query Editor</h3>
                    <textarea class="query-editor" id="sqlQuery" placeholder="Enter your SQL query here...
Example:
SELECT * FROM processes 
WHERE burst_time > 10 
ORDER BY arrival_time;">SELECT * FROM processes ORDER BY created_at DESC LIMIT 10;</textarea>
                    
                    <div style="margin-top: 10px;">
                        <button class="btn" onclick="executeQuery()">Execute Query</button>
                        <button class="btn" onclick="clearQuery()">Clear</button>
                    </div>
                    
                    <div class="query-result" id="queryResult">
                        Query results will appear here...
                    </div>
                </div>
                
                <div>
                    <h3>Database Operations</h3>
                    
                    <div class="backup-restore">
                        <button class="btn success" onclick="dbManager.exportData()">Export Data</button>
                        
                        <div class="file-input-wrapper">
                            <input type="file" id="importFile" accept=".json" onchange="handleImportFile(this)">
                            <label for="importFile" class="file-input-label">Import Data</label>
                        </div>
                        
                        <button class="btn danger" onclick="clearAllData()">Clear All Data</button>
                    </div>
                    
                    <h4>Quick Actions</h4>
                    <div class="db-operations">
                        <button class="btn" onclick="showTableSchema()">Show Schema</button>
                        <button class="btn" onclick="optimizeDatabase()">Optimize DB</button>
                        <button class="btn" onclick="showDatabaseStats()">Show Stats</button>
                    </div>
                    
                    <h3>Database Log</h3>
                    <div class="log-console" id="dbLog">
                        <div class="log-entry info">[INIT] Database manager initialized</div>
                        <div class="log-entry warning">[STATUS] Not connected to database</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(dbSection);
    
    // Add database tab to navigation
    const navMenu = document.querySelector('.nav-menu');
    const dbNavItem = document.createElement('div');
    dbNavItem.className = 'nav-item';
    dbNavItem.textContent = 'Database';
    dbNavItem.onclick = () => showSection('database');
    navMenu.appendChild(dbNavItem);
}

// Database connection functions
async function connectDatabase() {
    const config = {
        host: document.getElementById('dbHost').value,
        port: parseInt(document.getElementById('dbPort').value),
        database: document.getElementById('dbName').value,
        username: document.getElementById('dbUser').value,
        password: document.getElementById('dbPassword').value,
        type: document.getElementById('dbType').value
    };
    
    dbManager.config = config;
    await dbManager.connect();
}

async function disconnectDatabase() {
    await dbManager.disconnect();
}

async function testConnection() {
    dbManager.logMessage('info', 'Testing database connection...');
    
    // Simulate connection test
    setTimeout(() => {
        if (dbManager.isConnected) {
            dbManager.logMessage('success', 'Connection test successful');
        } else {
            dbManager.logMessage('error', 'Connection test failed');
        }
    }, 1000);
}

async function executeQuery() {
    const query = document.getElementById('sqlQuery').value.trim();
    const resultDiv = document.getElementById('queryResult');
    
    if (!query) {
        resultDiv.textContent = 'Please enter a SQL query';
        return;
    }
    
    if (!dbManager.isConnected) {
        resultDiv.textContent = 'Database not connected';
        return;
    }
    
    try {
        resultDiv.textContent = 'Executing query...';
        
        // Simulate query execution
        setTimeout(() => {
            resultDiv.textContent = `Query executed successfully!\nRows affected: ${Math.floor(Math.random() * 10) + 1}\nExecution time: ${(Math.random() * 100).toFixed(2)}ms`;
            dbManager.logMessage('success', 'SQL query executed successfully');
        }, 500);
        
    } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
        dbManager.logMessage('error', `Query execution failed: ${error.message}`);
    }
}

function clearQuery() {
    document.getElementById('sqlQuery').value = '';
    document.getElementById('queryResult').textContent = 'Query results will appear here...';
}

function handleImportFile(input) {
    const file = input.files[0];
    if (file) {
        dbManager.importData(file);
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        dbManager.logMessage('warning', 'All data cleared from database');
    }
}

function showTableSchema() {
    const resultDiv = document.getElementById('queryResult');
    resultDiv.textContent = `
Table Schema:

processes:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(50), NOT NULL)
- arrival_time (INT, NOT NULL)
- burst_time (INT, NOT NULL)
- priority (INT, NOT NULL)
- waiting_time (INT, DEFAULT 0)
- turnaround_time (INT, DEFAULT 0)
- created_at (TIMESTAMP)

memory_blocks:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- process_name (VARCHAR(50))
- size_kb (INT, NOT NULL)
- start_address (INT, NOT NULL)
- end_address (INT, NOT NULL)
- status (ENUM('allocated', 'free'))
- created_at (TIMESTAMP)

file_system:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(255), NOT NULL)
- type (ENUM('file', 'folder'))
- size_kb (INT, DEFAULT 0)
- parent_path (VARCHAR(500))
- full_path (VARCHAR(755), UNIQUE)
- created_at (TIMESTAMP)
- modified_at (TIMESTAMP)

disk_requests:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- cylinder (INT, NOT NULL)
- algorithm (VARCHAR(20))
- seek_time (DECIMAL(10,2))
- processed (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP)

system_logs:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- module (VARCHAR(50))
- log_level (ENUM('info', 'warning', 'error', 'success'))
- message (TEXT)
- created_at (TIMESTAMP)
    `;
}

function optimizeDatabase() {
    dbManager.logMessage('info', 'Database optimization started...');
    setTimeout(() => {
        dbManager.logMessage('success', 'Database optimization completed');
    }, 2000);
}

function showDatabaseStats() {
    const resultDiv = document.getElementById('queryResult');
    resultDiv.textContent = `
Database Statistics:

Total Records:
- Processes: ${processes.length}
- Memory Blocks: ${memoryBlocks.length}
- File System Items: ${fileSystem.length}
- Disk Requests: ${diskRequests.length}

Database Size: 2.4 MB
Last Backup: Never
Connection Uptime: ${dbManager.isConnected ? '00:05:23' : 'Not connected'}
    `;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);