import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Download, Sun, Moon, Zap, Battery } from 'lucide-react';

// Loop categories with colors
const loopCategories = [
  { id: 'energy', label: 'Energy Boost', color: '#FBBF24', icon: Zap },
  { id: 'focus', label: 'Focus Work', color: '#60A5FA', icon: Sun },
  { id: 'creative', label: 'Creative Time', color: '#A78BFA', icon: Battery },
  { id: 'rest', label: 'Rest & Recovery', color: '#34D399', icon: Moon },
];

// Helper to flatten time windows into hour arrays
const getFlatHours = (windows) => {
  const hours = [];
  windows.forEach(([start, end]) => {
    if (start <= end) {
      for (let h = start; h < end; h++) hours.push(h);
    } else {
      // Handles overnight windows
      for (let h = start; h < 24; h++) hours.push(h);
      for (let h = 0; h < end; h++) hours.push(h);
    }
  });
  return hours;
};

// Radial Clock Visualization Component
const RadialClock = ({ data }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const centerX = 250;
  const centerY = 250;
  const outerRadius = 200;
  const innerRadius = 100;
  const labelRadius = 230;

  // Get flat hours for peak and depleted windows
  const peakHours = data.peakWindows ? getFlatHours(data.peakWindows) : [];
  const depletedHours = data.depletedWindows ? getFlatHours(data.depletedWindows) : [];
  const sleepHours = data.sleepHours || [];

  // Helper to get hour color and opacity
  const getHourStyle = (hour) => {
    if (sleepHours.includes(hour)) {
      return { fill: '#1e293b', opacity: 0.3 };
    }
    if (peakHours.includes(hour)) {
      return { fill: '#FBBF24', opacity: 0.8 };
    }
    if (depletedHours.includes(hour)) {
      return { fill: '#60A5FA', opacity: 0.7 };
    }
    return { fill: '#475569', opacity: 0.5 };
  };

  // Generate hour segments
  const hourSegments = [];
  for (let hour = 0; hour < 24; hour++) {
    const startAngle = (hour * 15 - 90) * (Math.PI / 180); // 15° per hour, start at top
    const endAngle = ((hour + 1) * 15 - 90) * (Math.PI / 180);

    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(startAngle);
    const y2 = centerY + outerRadius * Math.sin(startAngle);
    const x3 = centerX + outerRadius * Math.cos(endAngle);
    const y3 = centerY + outerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(endAngle);
    const y4 = centerY + innerRadius * Math.sin(endAngle);

    const style = getHourStyle(hour);
    const path = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

    hourSegments.push(
      <g key={hour}>
        <path
          d={path}
          fill={style.fill}
          opacity={style.opacity}
          stroke="#1e293b"
          strokeWidth="1"
        />
      </g>
    );
  }

  // Generate hour labels
  const hourLabels = [];
  for (let hour = 0; hour < 24; hour++) {
    const angle = (hour * 15 - 90) * (Math.PI / 180);
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);

    // Only show labels for key hours (every 3 hours)
    if (hour % 3 === 0) {
      hourLabels.push(
        <text
          key={`label-${hour}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#94a3b8"
          fontSize="12"
          fontWeight="600"
        >
          {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
        </text>
      );
    }
  }

  // Current time indicator
  const currentAngle = (currentHour * 15 + (new Date().getMinutes() / 60) * 15 - 90) * (Math.PI / 180);
  const indicatorX = centerX + (outerRadius + 10) * Math.cos(currentAngle);
  const indicatorY = centerY + (outerRadius + 10) * Math.sin(currentAngle);

  // Loop markers
  const loopMarkers = data.loops?.map((loop, idx) => {
    const category = loopCategories.find(c => c.id === loop.categoryId);
    return loop.hours.map((hour, hIdx) => {
      const angle = (hour * 15 - 90) * (Math.PI / 180);
      const markerRadius = outerRadius + 5;
      const x = centerX + markerRadius * Math.cos(angle);
      const y = centerY + markerRadius * Math.sin(angle);

      return (
        <circle
          key={`loop-${idx}-${hIdx}`}
          cx={x}
          cy={y}
          r="4"
          fill={category?.color || '#888'}
          stroke="#0f172a"
          strokeWidth="2"
        />
      );
    });
  }).flat() || [];

  return (
    <div className="flex flex-col items-center">
      <svg width="500" height="500" className="drop-shadow-2xl">
        <defs>
          {/* Gradient for current time glow */}
          <radialGradient id="currentTimeGlow">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hour segments */}
        {hourSegments}

        {/* Loop markers */}
        {loopMarkers}

        {/* Hour labels */}
        {hourLabels}

        {/* Current time indicator with glow */}
        <circle
          cx={centerX}
          cy={centerY}
          r="50"
          fill="url(#currentTimeGlow)"
          opacity="0.3"
        />
        <line
          x1={centerX}
          y1={centerY}
          x2={indicatorX}
          y2={indicatorY}
          stroke="#34D399"
          strokeWidth="3"
          strokeLinecap="round"
          className="drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))'
          }}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="#34D399"
          stroke="#0f172a"
          strokeWidth="2"
        />
      </svg>

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e293b', opacity: 0.5 }}></div>
          <span className="text-sm text-slate-300">Sleep</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FBBF24' }}></div>
          <span className="text-sm text-slate-300">Peak Capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60A5FA' }}></div>
          <span className="text-sm text-slate-300">Depleted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#475569' }}></div>
          <span className="text-sm text-slate-300">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#34D399' }}></div>
          <span className="text-sm text-slate-300">Current Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
          <span className="text-sm text-slate-300">Loop Markers</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const STORAGE_KEY = 'daily-energy-cycle-data';

  // Load from localStorage on mount
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
    return null;
  };

  const [stage, setStage] = useState(0);
  const [data, setData] = useState(() => {
    const saved = loadSavedData();
    return saved || {
      sleepHours: [],
      peakWindows: [],
      depletedWindows: [],
      loops: [],
    };
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (stage === 5) { // Only save when we reach results
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    }
  }, [data, stage]);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadSavedData();
    if (saved) {
      setData(saved);
      // Optionally start at results if data exists
      // setStage(5);
    }
  }, []);

  const [tempSleepStart, setTempSleepStart] = useState(22);
  const [tempSleepEnd, setTempSleepEnd] = useState(6);
  const [tempPeakWindow, setTempPeakWindow] = useState({ start: 9, end: 12 });
  const [tempDepletedWindow, setTempDepletedWindow] = useState({ start: 14, end: 16 });
  const [tempLoop, setTempLoop] = useState({ label: '', categoryId: 'energy', hour: 9 });

  // Helper to generate sleep hours array
  const generateSleepHours = (start, end) => {
    const hours = [];
    if (start <= end) {
      for (let h = start; h < end; h++) hours.push(h);
    } else {
      for (let h = start; h < 24; h++) hours.push(h);
      for (let h = 0; h < end; h++) hours.push(h);
    }
    return hours;
  };

  const nextStage = () => setStage(stage + 1);
  const goToStage = (stageNum) => setStage(stageNum);

  // Export to JSON
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'daily-energy-cycle-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Daily Energy Cycle Mapper</h1>
          </div>
          {stage < 5 && (
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-12 h-2 rounded-full transition-colors ${
                    s === stage ? 'bg-blue-400' : s < stage ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Stage 0: Sleep Schedule */}
        {stage === 0 && (
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Moon className="w-6 h-6 text-purple-400" />
              What's your typical sleep schedule?
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Sleep Start Time</label>
                <select
                  value={tempSleepStart}
                  onChange={(e) => setTempSleepStart(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Wake Up Time</label>
                <select
                  value={tempSleepEnd}
                  onChange={(e) => setTempSleepEnd(parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setData({ ...data, sleepHours: generateSleepHours(tempSleepStart, tempSleepEnd) });
                  nextStage();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Stage 1: Peak Energy Windows */}
        {stage === 1 && (
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              When do you feel most energized?
            </h2>
            <p className="text-slate-400 mb-6">Add time windows when you typically have peak energy and focus.</p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <select
                    value={tempPeakWindow.start}
                    onChange={(e) => setTempPeakWindow({ ...tempPeakWindow, start: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <select
                    value={tempPeakWindow.end}
                    onChange={(e) => setTempPeakWindow({ ...tempPeakWindow, end: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  setData({ ...data, peakWindows: [...data.peakWindows, [tempPeakWindow.start, tempPeakWindow.end]] });
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Add Another Window
              </button>
              {data.peakWindows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Added windows:</p>
                  {data.peakWindows.map((window, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded">
                      <span>
                        {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                        {' - '}
                        {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                      </span>
                      <button
                        onClick={() => setData({ ...data, peakWindows: data.peakWindows.filter((_, i) => i !== idx) })}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={nextStage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Depleted Energy Windows */}
        {stage === 2 && (
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Battery className="w-6 h-6 text-blue-400" />
              When do you typically feel depleted?
            </h2>
            <p className="text-slate-400 mb-6">Add time windows when your energy is typically low.</p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <select
                    value={tempDepletedWindow.start}
                    onChange={(e) => setTempDepletedWindow({ ...tempDepletedWindow, start: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <select
                    value={tempDepletedWindow.end}
                    onChange={(e) => setTempDepletedWindow({ ...tempDepletedWindow, end: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  setData({ ...data, depletedWindows: [...data.depletedWindows, [tempDepletedWindow.start, tempDepletedWindow.end]] });
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Add Another Window
              </button>
              {data.depletedWindows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Added windows:</p>
                  {data.depletedWindows.map((window, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700 px-4 py-2 rounded">
                      <span>
                        {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                        {' - '}
                        {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                      </span>
                      <button
                        onClick={() => setData({ ...data, depletedWindows: data.depletedWindows.filter((_, i) => i !== idx) })}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={nextStage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Recurring Loops */}
        {stage === 3 && (
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Add Recurring Activities</h2>
            <p className="text-slate-400 mb-6">What activities do you do regularly throughout the day?</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Activity Name</label>
                <input
                  type="text"
                  value={tempLoop.label}
                  onChange={(e) => setTempLoop({ ...tempLoop, label: e.target.value })}
                  placeholder="e.g., Morning coffee, Exercise, Lunch"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {loopCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setTempLoop({ ...tempLoop, categoryId: cat.id })}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          tempLoop.categoryId === cat.id
                            ? 'border-current bg-slate-700'
                            : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                        }`}
                        style={tempLoop.categoryId === cat.id ? { color: cat.color } : {}}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <select
                  value={tempLoop.hour}
                  onChange={(e) => setTempLoop({ ...tempLoop, hour: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  if (tempLoop.label.trim()) {
                    const newLoop = {
                      id: Date.now(),
                      label: tempLoop.label,
                      categoryId: tempLoop.categoryId,
                      hours: [tempLoop.hour],
                    };
                    setData({ ...data, loops: [...data.loops, newLoop] });
                    setTempLoop({ label: '', categoryId: 'energy', hour: 9 });
                  }
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
                disabled={!tempLoop.label.trim()}
              >
                Add Activity
              </button>
              {data.loops.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Added activities:</p>
                  {data.loops.map((loop, idx) => {
                    const category = loopCategories.find(c => c.id === loop.categoryId);
                    const Icon = category?.icon;
                    return (
                      <div key={loop.id} className="flex items-center justify-between bg-slate-700 px-4 py-3 rounded">
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="w-5 h-5" style={{ color: category.color }} />}
                          <div>
                            <p className="font-medium">{loop.label}</p>
                            <p className="text-sm text-slate-400">
                              {loop.hours[0] === 0 ? '12:00 AM' : loop.hours[0] < 12 ? `${loop.hours[0]}:00 AM` : loop.hours[0] === 12 ? '12:00 PM' : `${loop.hours[0] - 12}:00 PM`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setData({ ...data, loops: data.loops.filter((_, i) => i !== idx) })}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={nextStage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Review */}
        {stage === 4 && (
          <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Review Your Energy Cycle</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-400" />
                  Sleep Schedule
                </h3>
                <p className="text-slate-400">
                  {data.sleepHours.length > 0 && (
                    <>
                      {data.sleepHours[0] === 0 ? '12:00 AM' : data.sleepHours[0] < 12 ? `${data.sleepHours[0]}:00 AM` : data.sleepHours[0] === 12 ? '12:00 PM' : `${data.sleepHours[0] - 12}:00 PM`}
                      {' - '}
                      {data.sleepHours[data.sleepHours.length - 1] + 1 === 0 ? '12:00 AM' : data.sleepHours[data.sleepHours.length - 1] + 1 < 12 ? `${data.sleepHours[data.sleepHours.length - 1] + 1}:00 AM` : data.sleepHours[data.sleepHours.length - 1] + 1 === 12 ? '12:00 PM' : `${data.sleepHours[data.sleepHours.length - 1] + 1 - 12}:00 PM`}
                    </>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Peak Energy Windows
                </h3>
                <div className="space-y-1">
                  {data.peakWindows.map((window, idx) => (
                    <p key={idx} className="text-slate-400">
                      {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                      {' - '}
                      {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Battery className="w-5 h-5 text-blue-400" />
                  Depleted Energy Windows
                </h3>
                <div className="space-y-1">
                  {data.depletedWindows.map((window, idx) => (
                    <p key={idx} className="text-slate-400">
                      {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                      {' - '}
                      {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Recurring Activities</h3>
                <div className="space-y-1">
                  {data.loops.map((loop) => (
                    <p key={loop.id} className="text-slate-400">
                      {loop.label} at{' '}
                      {loop.hours[0] === 0 ? '12:00 AM' : loop.hours[0] < 12 ? `${loop.hours[0]}:00 AM` : loop.hours[0] === 12 ? '12:00 PM' : `${loop.hours[0] - 12}:00 PM`}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  nextStage();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        )}

        {/* Stage 5: Results with Radial Clock */}
        {stage === 5 && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Your Energy Cycle</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStage(0)}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                    title="Edit your data"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                    title="Export as JSON"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
              </div>

              {/* Radial Clock Visualization */}
              <RadialClock data={data} />
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  Peak Performance
                </h3>
                <p className="text-slate-400 mb-4">
                  You have {data.peakWindows.length} peak energy window{data.peakWindows.length !== 1 ? 's' : ''} during your day.
                </p>
                <div className="space-y-2">
                  {data.peakWindows.map((window, idx) => (
                    <div key={idx} className="bg-slate-700 px-4 py-2 rounded">
                      {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                      {' - '}
                      {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Battery className="w-6 h-6 text-blue-400" />
                  Recovery Periods
                </h3>
                <p className="text-slate-400 mb-4">
                  You have {data.depletedWindows.length} low-energy period{data.depletedWindows.length !== 1 ? 's' : ''} to be mindful of.
                </p>
                <div className="space-y-2">
                  {data.depletedWindows.map((window, idx) => (
                    <div key={idx} className="bg-slate-700 px-4 py-2 rounded">
                      {window[0] === 0 ? '12:00 AM' : window[0] < 12 ? `${window[0]}:00 AM` : window[0] === 12 ? '12:00 PM' : `${window[0] - 12}:00 PM`}
                      {' - '}
                      {window[1] === 0 ? '12:00 AM' : window[1] < 12 ? `${window[1]}:00 AM` : window[1] === 12 ? '12:00 PM' : `${window[1] - 12}:00 PM`}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {data.loops.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Daily Activities</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {data.loops.map((loop) => {
                    const category = loopCategories.find(c => c.id === loop.categoryId);
                    const Icon = category?.icon;
                    return (
                      <div key={loop.id} className="bg-slate-700 px-4 py-3 rounded flex items-center gap-3">
                        {Icon && <Icon className="w-5 h-5" style={{ color: category.color }} />}
                        <div>
                          <p className="font-medium">{loop.label}</p>
                          <p className="text-sm text-slate-400">
                            {loop.hours[0] === 0 ? '12:00 AM' : loop.hours[0] < 12 ? `${loop.hours[0]}:00 AM` : loop.hours[0] === 12 ? '12:00 PM' : `${loop.hours[0] - 12}:00 PM`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
