# 🖥️ Operating System Simulator

Interactive web simulator for learning OS concepts including CPU scheduling, memory management, file systems, and disk operations.

**🔗 [Live Demo]( https://oywon.github.io/OS-simulator/)**

## Features

- **CPU Scheduling**: FCFS, SJF, Priority, Round Robin with Gantt charts
- **Memory Management**: First/Best/Worst Fit allocation with visual blocks
- **File System**: Create/delete files and folders with directory tree
- **Disk Management**: SCAN, C-SCAN, SSTF algorithms with seek time analysis
- **Performance Monitor**: Real-time CPU, memory, disk usage metrics
- **Database Integration**: Save results and run SQL queries

## Quick Start

```bash
git clone https://github.com/yourusername/os-simulator.git
cd os-simulator
python -m http.server 8000
# Open http://localhost:8000
```

## Usage

1. **CPU Scheduling**: Add processes → Select algorithm → Run scheduler
2. **Memory**: Enter size → Choose allocation method → Allocate
3. **Files**: Create files/folders → Manage directory structure
4. **Disk**: Add cylinder requests → Process with scheduling algorithm

## Technologies

- Pure HTML5, CSS3, JavaScript
- No external dependencies
- Responsive design
- Works in all modern browsers

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.
