
// Data and state for all visualizations
const initialValues = [10, 1, 8, -4, 0, -2, 3, 5, -2, -3, 2, 7, 0, 11, 1, 2];
const visualizations = {
    1: { values: [...initialValues], step: 0 },
    2: { values: [...initialValues], step: 0 },
    3: { values: [...initialValues], step: 0 },
    4: { values: [...initialValues], step: 0 },
    5: { values: [...initialValues], step: 0 }
};

const steps = {
    1: [
        {
            title: "Step 1: Stride 1",
            description: "Active threads read from adjacent memory locations",
            stride: 1,
            activeThreads: [0, 2, 4, 6, 8, 10, 12, 14]
        },
        {
            title: "Step 2: Stride 2", 
            description: "Fewer threads active as stride increases",
            stride: 2,
            activeThreads: [0, 4, 8, 12]
        },
        {
            title: "Step 3: Stride 4",
            description: "Thread utilization continues to decrease",
            stride: 4,
            activeThreads: [0, 8]
        },
        {
            title: "Step 4: Stride 8",
            description: "Final reduction with single active thread",
            stride: 8,
            activeThreads: [0]
        }
    ],
    2: [
        {
            title: "Step 1: Stride 1",
            description: "Consecutive threads reduce warp divergence",
            stride: 1,
            activeThreads: [0, 1, 2, 3, 4, 5, 6, 7]
        },
        {
            title: "Step 2: Stride 2",
            description: "Bank conflicts may occur with certain strides",
            stride: 2,
            activeThreads: [0, 1, 2, 3]
        },
        {
            title: "Step 3: Stride 4",
            description: "Reduced active threads, potential bank conflicts",
            stride: 4,
            activeThreads: [0, 1]
        },
        {
            title: "Step 4: Stride 8",
            description: "Final reduction stage",
            stride: 8,
            activeThreads: [0]
        }
    ],
    3: [
        {
            title: "Step 1: Stride 8",
            description: "Sequential addressing from the start",
            stride: 8,
            activeThreads: [0, 1, 2, 3, 4, 5, 6, 7]
        },
        {
            title: "Step 2: Stride 4",
            description: "Halving the active threads",
            stride: 4,
            activeThreads: [0, 1, 2, 3]
        },
        {
            title: "Step 3: Stride 2",
            description: "Continuing sequential reduction",
            stride: 2,
            activeThreads: [0, 1]
        },
        {
            title: "Step 4: Stride 1",
            description: "Final reduction",
            stride: 1,
            activeThreads: [0]
        }
    ],
    4: [
        {
            title: "Step 1: Stride 8",
            description: "Each thread loads 2 elements initially",
            stride: 8,
            activeThreads: [0, 1, 2, 3, 4, 5, 6, 7]
        },
        {
            title: "Step 2: Stride 4",
            description: "Standard reduction continues",
            stride: 4,
            activeThreads: [0, 1, 2, 3]
        },
        {
            title: "Step 3: Stride 2",
            description: "Further reduction",
            stride: 2,
            activeThreads: [0, 1]
        },
        {
            title: "Step 4: Stride 1",
            description: "Final sum",
            stride: 1,
            activeThreads: [0]
        }
    ]
};

function initializeVisualization(vizNum) {
    const valuesContainer = document.getElementById(`values${vizNum}`);
    const threadsContainer = document.getElementById(`threads${vizNum}`);
    
    valuesContainer.innerHTML = '';
    threadsContainer.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const valueCell = document.createElement('div');
        valueCell.className = 'memory-cell';
        valueCell.textContent = visualizations[vizNum].values[i];
        valueCell.id = `value-${vizNum}-${i}`;
        valuesContainer.appendChild(valueCell);
        
        const threadCell = document.createElement('div');
        threadCell.className = 'memory-cell';
        threadCell.textContent = i;
        threadCell.id = `thread-${vizNum}-${i}`;
        threadsContainer.appendChild(threadCell);
    }

    // Initialize global memory for visualization 4
    if (vizNum === 4) {
        const globalContainer = document.getElementById('global4');
        globalContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const globalCell = document.createElement('div');
            globalCell.className = 'memory-cell';
            globalCell.textContent = initialValues[i];
            globalCell.id = `global-${vizNum}-${i}`;
            globalContainer.appendChild(globalCell);
        }
    }

    // Initialize visualization 5 for warp-level operations
    if (vizNum === 5) {
        const threadsContainer = document.getElementById('threads5');
        threadsContainer.innerHTML = '';
        for (let i = 0; i < 32; i++) {
            const threadCell = document.createElement('div');
            threadCell.className = 'memory-cell';
            threadCell.textContent = i;
            threadCell.id = `thread-${vizNum}-${i}`;
            threadCell.style.fontSize = '6px';
            threadCell.style.width = '16px';
            threadCell.style.height = '16px';
            threadsContainer.appendChild(threadCell);
        }
    }
}

function updateVisualization(vizNum) {
    const viz = visualizations[vizNum];
    const step = steps[vizNum][viz.step];
    
    document.getElementById(`stepTitle${vizNum}`).textContent = step.title;
    
    // Reset all cells
    for (let i = 0; i < 16; i++) {
        const valueCell = document.getElementById(`value-${vizNum}-${i}`);
        const threadCell = document.getElementById(`thread-${vizNum}-${i}`);
        
        valueCell.className = 'memory-cell';
        threadCell.className = 'memory-cell';
    }
    
    // Highlight active threads and their operations
    if (vizNum === 1) {
        // Reduction 1: Interleaved addressing
        step.activeThreads.forEach(threadId => {
            const threadCell = document.getElementById(`thread-${vizNum}-${threadId}`);
            const valueCell = document.getElementById(`value-${vizNum}-${threadId}`);
            const readCell = document.getElementById(`value-${vizNum}-${threadId + step.stride}`);
            
            threadCell.classList.add('thread-active');
            valueCell.classList.add('thread-active');
            if (readCell && threadId + step.stride < 16) {
                readCell.classList.add('thread-reading');
            }
        });
    } else if (vizNum === 2) {
        // Reduction 2: Without bank visualization
        step.activeThreads.forEach((threadId, idx) => {
            const index = 2 * step.stride * idx;
            if (index < 16) {
                const threadCell = document.getElementById(`thread-${vizNum}-${threadId}`);
                const valueCell = document.getElementById(`value-${vizNum}-${index}`);
                const readCell = document.getElementById(`value-${vizNum}-${index + step.stride}`);
                
                threadCell.classList.add('thread-active');
                valueCell.classList.add('thread-active');
                if (readCell && index + step.stride < 16) {
                    readCell.classList.add('thread-reading');
                }
            }
        });
    } else if (vizNum === 3 || vizNum === 4) {
        // Reduction 3 & 4: Sequential addressing
        step.activeThreads.forEach(threadId => {
            const threadCell = document.getElementById(`thread-${vizNum}-${threadId}`);
            const valueCell = document.getElementById(`value-${vizNum}-${threadId}`);
            const readCell = document.getElementById(`value-${vizNum}-${threadId + step.stride}`);
            
            threadCell.classList.add('thread-active');
            valueCell.classList.add('thread-active');
            if (readCell && threadId + step.stride < 16) {
                readCell.classList.add('thread-reading');
            }
        });
    }
    
    // Simulate reduction
    setTimeout(() => {
        if (vizNum === 1) {
            step.activeThreads.forEach(threadId => {
                if (threadId + step.stride < viz.values.length) {
                    viz.values[threadId] += viz.values[threadId + step.stride];
                    document.getElementById(`value-${vizNum}-${threadId}`).textContent = viz.values[threadId];
                }
            });
        } else if (vizNum === 2) {
            step.activeThreads.forEach((threadId, idx) => {
                const index = 2 * step.stride * idx;
                if (index + step.stride < viz.values.length) {
                    viz.values[index] += viz.values[index + step.stride];
                    document.getElementById(`value-${vizNum}-${index}`).textContent = viz.values[index];
                }
            });
        } else if (vizNum === 3 || vizNum === 4) {
            step.activeThreads.forEach(threadId => {
                if (threadId + step.stride < viz.values.length) {
                    viz.values[threadId] += viz.values[threadId + step.stride];
                    document.getElementById(`value-${vizNum}-${threadId}`).textContent = viz.values[threadId];
                }
            });
        }
    }, 300);
}

function nextStep(vizNum) {
    const viz = visualizations[vizNum];
    if (viz.step < steps[vizNum].length - 1) {
        viz.step++;
        updateVisualization(vizNum);
    }
}

function prevStep(vizNum) {
    const viz = visualizations[vizNum];
    if (viz.step > 0) {
        viz.step--;
        viz.values = [...initialValues];
        // Replay all steps up to current
        for (let i = 0; i < viz.step; i++) {
            const step = steps[vizNum][i];
            if (vizNum === 1) {
                step.activeThreads.forEach(threadId => {
                    if (threadId + step.stride < viz.values.length) {
                        viz.values[threadId] += viz.values[threadId + step.stride];
                    }
                });
            } else if (vizNum === 2) {
                step.activeThreads.forEach((threadId, idx) => {
                    const index = 2 * step.stride * idx;
                    if (index + step.stride < viz.values.length) {
                        viz.values[index] += viz.values[index + step.stride];
                    }
                });
            } else if (vizNum === 3 || vizNum === 4) {
                step.activeThreads.forEach(threadId => {
                    if (threadId + step.stride < viz.values.length) {
                        viz.values[threadId] += viz.values[threadId + step.stride];
                    }
                });
            }
        }
        initializeVisualization(vizNum);
        updateVisualization(vizNum);
    }
}

function reset(vizNum) {
    visualizations[vizNum].step = 0;
    visualizations[vizNum].values = [...initialValues];
    initializeVisualization(vizNum);
    if (vizNum !== 5) {
        updateVisualization(vizNum);
    }
}

// Initialize all visualizations
window.onload = function() {
    for (let i = 1; i <= 5; i++) {
        initializeVisualization(i);
        if (i !== 5) {
            updateVisualization(i);
        }
    }
};
