import React, { useState } from 'react';
import { GardenLocation, GardenTask } from '../types/garden';
import { CROPS_DATA } from '../data/cropsData';
import { Calendar, CheckCircle2, Circle, Clock, Printer, Plus, Sparkles, Filter, AlertCircle, Moon, Bell, BellRing } from 'lucide-react';
import { getLunarPlantingInfo } from '../services/weatherAlmanacService';
import { requestNotificationPermission, getNotificationStatus, sendLocalNotification } from '../services/notificationService';

interface CalendarTasksProps {
  location: GardenLocation;
  tasks: GardenTask[];
  onUpdateTasks: (tasks: GardenTask[]) => void;
}

export const CalendarTasks: React.FC<CalendarTasksProps> = ({
  location,
  tasks,
  onUpdateTasks,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'tasks'>('timeline');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string>(() => {
    const s = getNotificationStatus();
    return s.permission === 'granted' ? 'active' : 'idle';
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskType, setNewTaskType] = useState<GardenTask['type']>('maintenance');

  const currentYear = new Date().getFullYear();
  const lunarToday = getLunarPlantingInfo(new Date());

  // Helper to parse MM-DD into a real Date in the current year with safe fallbacks
  const parseFrostDate = (mmdd?: string, year = currentYear): Date => {
    if (!mmdd || typeof mmdd !== 'string' || !mmdd.includes('-')) {
      return new Date(year, 3, 15); // April 15 safe default
    }
    const parts = mmdd.split('-').map(Number);
    const month = parts[0];
    const day = parts[1];
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return new Date(year, 3, 15);
    }
    return new Date(year, month - 1, day);
  };

  const springFrostDate = parseFrostDate(location?.lastSpringFrost);
  const fallFrostDate = parseFrostDate(location?.firstFallFrost, currentYear);

  // Compute planting calendar windows dynamically for each crop
  const calendarWindows = CROPS_DATA.map(crop => {
    const timing = crop.plantingTiming;
    let indoorStart: { start: Date; end: Date } | null = null;
    let transplant: { start: Date; end: Date } | null = null;
    let directSow: { start: Date; end: Date } | null = null;
    let fallSow: { start: Date; end: Date } | null = null;
    let harvestWindow: { start: Date; end: Date } | null = null;

    if (timing.indoorStartWeeksBeforeLastFrost) {
      const weeks = Array.isArray(timing.indoorStartWeeksBeforeLastFrost)
        ? timing.indoorStartWeeksBeforeLastFrost
        : [timing.indoorStartWeeksBeforeLastFrost, timing.indoorStartWeeksBeforeLastFrost];
      const start = new Date(springFrostDate.getTime() - weeks[1] * 7 * 86400000);
      const end = new Date(springFrostDate.getTime() - weeks[0] * 7 * 86400000);
      indoorStart = { start, end };
    }

    if (timing.transplantWeeksAfterLastFrost) {
      const weeks = Array.isArray(timing.transplantWeeksAfterLastFrost)
        ? timing.transplantWeeksAfterLastFrost
        : [timing.transplantWeeksAfterLastFrost, timing.transplantWeeksAfterLastFrost];
      const start = new Date(springFrostDate.getTime() + weeks[0] * 7 * 86400000);
      const end = new Date(springFrostDate.getTime() + weeks[1] * 7 * 86400000);
      transplant = { start, end };

      // Estimated harvest based on transplant + maturity days
      const hStart = new Date(start.getTime() + crop.daysToMaturityRange[0] * 86400000);
      const hEnd = new Date(end.getTime() + crop.daysToMaturityRange[1] * 86400000);
      harvestWindow = { start: hStart, end: hEnd };
    }

    if (timing.directSowWeeksBeforeLastFrost) {
      const weeks = Array.isArray(timing.directSowWeeksBeforeLastFrost)
        ? timing.directSowWeeksBeforeLastFrost
        : [timing.directSowWeeksBeforeLastFrost, timing.directSowWeeksBeforeLastFrost];
      const start = new Date(springFrostDate.getTime() - weeks[1] * 7 * 86400000);
      const end = new Date(springFrostDate.getTime() - weeks[0] * 7 * 86400000);
      directSow = { start, end };

      if (!harvestWindow) {
        const hStart = new Date(start.getTime() + crop.daysToMaturityRange[0] * 86400000);
        const hEnd = new Date(end.getTime() + crop.daysToMaturityRange[1] * 86400000);
        harvestWindow = { start: hStart, end: hEnd };
      }
    } else if (timing.directSowWeeksAfterLastFrost) {
      const weeks = Array.isArray(timing.directSowWeeksAfterLastFrost)
        ? timing.directSowWeeksAfterLastFrost
        : [timing.directSowWeeksAfterLastFrost, timing.directSowWeeksAfterLastFrost];
      const start = new Date(springFrostDate.getTime() + weeks[0] * 7 * 86400000);
      const end = new Date(springFrostDate.getTime() + weeks[1] * 7 * 86400000);
      directSow = { start, end };

      if (!harvestWindow) {
        const hStart = new Date(start.getTime() + crop.daysToMaturityRange[0] * 86400000);
        const hEnd = new Date(end.getTime() + crop.daysToMaturityRange[1] * 86400000);
        harvestWindow = { start: hStart, end: hEnd };
      }
    }

    if (timing.fallPlantingWeeksBeforeFirstFrost) {
      const weeks = Array.isArray(timing.fallPlantingWeeksBeforeFirstFrost)
        ? timing.fallPlantingWeeksBeforeFirstFrost
        : [timing.fallPlantingWeeksBeforeFirstFrost, timing.fallPlantingWeeksBeforeFirstFrost];
      const start = new Date(fallFrostDate.getTime() - weeks[1] * 7 * 86400000);
      const end = new Date(fallFrostDate.getTime() - weeks[0] * 7 * 86400000);
      fallSow = { start, end };
    }

    return {
      crop,
      indoorStart,
      transplant,
      directSow,
      fallSow,
      harvestWindow,
    };
  });

  const toggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: !t.completed,
          completedDate: !t.completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: GardenTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      type: newTaskType,
      completed: false,
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const formatDateShort = (d?: Date | null) => {
    if (!d || isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Seasonal Planting Calendar &amp; Task Scheduler
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Dynamic dates calculated from your last spring frost ({location.lastSpringFrost}) and first fall frost ({location.firstFallFrost}) in Zone {location.usdaZone}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex bg-[#edf2ee] dark:bg-[#111c15] border border-[#d6e2d8] dark:border-[rgba(255,255,255,0.08)] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-2xs'
                  : 'text-[#3c5244] dark:text-[#b6cfc0] hover:text-[#122017] dark:hover:text-white'
              }`}
            >
              Crop Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'tasks'
                  ? 'bg-[#183e25] text-white dark:bg-[#10b981] dark:text-[#06150d] font-bold shadow-2xs'
                  : 'text-[#3c5244] dark:text-[#b6cfc0] hover:text-[#122017] dark:hover:text-white'
              }`}
            >
              Action Checklist ({tasks.filter(t => !t.completed).length})
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              const status = getNotificationStatus();
              if (status.permission !== 'granted') {
                const granted = await requestNotificationPermission();
                if (granted) {
                  setReminderStatus('active');
                  sendLocalNotification('FloraHearth Garden Reminders Active', 'You will receive reminders for planting, harvesting, and freeze warnings!');
                } else {
                  alert('Notification permissions were not granted in your browser. Check browser settings to allow garden reminders.');
                }
              } else {
                sendLocalNotification('FloraHearth Reminder Test', 'Garden reminders are active for tasks due today and frost nights!');
                setReminderStatus('active');
              }
            }}
            aria-label="Enable browser reminders for garden tasks and frost nights"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors shadow-2xs ${
              reminderStatus === 'active'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-[#131e17] border-stone-300 dark:border-[rgba(255,255,255,0.12)] text-stone-700 dark:text-[#cad9ce] hover:bg-stone-50'
            }`}
            title="Enable browser notifications for tasks due today & frost"
          >
            {reminderStatus === 'active' ? (
              <BellRing className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{reminderStatus === 'active' ? 'Reminders On' : 'Enable Reminders'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print planting calendar and task schedule"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#131e17] border border-stone-300 dark:border-[rgba(255,255,255,0.12)] text-stone-700 dark:text-[#cad9ce] rounded-xl hover:bg-stone-50 dark:hover:bg-[#18271e] transition-colors shadow-2xs"
            title="Print planting calendar"
          >
            <Printer className="w-4 h-4 text-[#56705d] dark:text-[#7e9987]" aria-hidden="true" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingTask(true)}
            aria-label="Add custom garden task or reminder"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#183e25] dark:bg-[#10b981] text-white dark:text-[#06150d] font-bold rounded-xl hover:bg-[#112d1b] dark:hover:bg-[#34d399] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Farmer's Almanac Lunar Planting Guide Strip */}
      <div className="bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl select-none shrink-0" role="img" aria-label="moon">
            {lunarToday.phaseEmoji}
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 dark:text-emerald-400 font-bold">
              <span>Almanac Moon: {lunarToday.phase} ({lunarToday.illuminationPct}% illuminated)</span>
              <span>·</span>
              <span>Sign: {lunarToday.zodiacSign} ({lunarToday.element})</span>
              <span>·</span>
              <span className="text-stone-500 dark:text-stone-400 font-normal">{lunarToday.fertility}</span>
            </div>
            <p className="text-stone-800 dark:text-stone-200">
              <strong className="text-emerald-900 dark:text-emerald-300">{lunarToday.actionTitle}:</strong>{' '}
              {lunarToday.lunarRuleSummary}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold shrink-0 bg-white dark:bg-[#14261b] px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-2xs">
          Best Chore: {lunarToday.almanacChoreToday.slice(0, 50)}...
        </div>
      </div>

      {/* Climate Reference Strip */}
      <div className="bg-[#f3f7f4] border border-[#d6e4da] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[#234730] text-emerald-100 rounded-lg">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <div className="font-semibold text-stone-800">
              {location.city}, {location.state} Frost Schedule
            </div>
            <div className="text-stone-600">
              Spring Frost: <strong>{location.lastSpringFrost}</strong> · Fall Frost: <strong>{location.firstFallFrost}</strong> · {location.growingSeasonDays} Safe Days
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" /> Indoor Starts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> Transplant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Direct Sow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-purple-500 inline-block" /> Fall Succession
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" /> Estimated Harvest
          </span>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs overflow-x-auto printable-area">
          <div className="min-w-[700px] space-y-4">
            {/* Month Axis */}
            <div className="grid grid-cols-12 gap-1 text-center font-mono text-xs text-stone-400 border-b border-stone-200 pb-2">
              {months.map(m => (
                <div key={m} className="font-semibold">{m}</div>
              ))}
            </div>

            {/* Crop Schedule Rows */}
            <div className="space-y-3 pt-2">
              {calendarWindows.map(({ crop, indoorStart, transplant, directSow, fallSow, harvestWindow }) => (
                <div key={crop.id} className="border-b border-stone-100 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{crop.iconEmoji}</span>
                      <span className="text-xs font-bold text-stone-800">{crop.name}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {crop.daysToMaturityRange[0]}-{crop.daysToMaturityRange[1]} days to maturity
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 flex items-center gap-3">
                      {indoorStart && (
                        <span>Start indoors: <strong>{formatDateShort(indoorStart.start)}</strong></span>
                      )}
                      {transplant && (
                        <span>Transplant: <strong>{formatDateShort(transplant.start)}</strong></span>
                      )}
                      {directSow && (
                        <span>Direct sow: <strong>{formatDateShort(directSow.start)}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Visual 12-month bar */}
                  <div className="h-6 bg-stone-100 rounded-lg relative overflow-hidden flex items-center">
                    {/* Indoor Start Bar */}
                    {indoorStart && (
                      <div
                        className="absolute h-4 bg-indigo-500/80 rounded-xs text-[10px] text-white flex items-center justify-center font-bold"
                        style={{
                          left: `${((indoorStart.start.getMonth() * 30 + indoorStart.start.getDate()) / 365) * 100}%`,
                          width: `${Math.max(3, ((indoorStart.end.getTime() - indoorStart.start.getTime()) / (365 * 86400000)) * 100)}%`,
                        }}
                        title={`Indoor Seed Starting: ${formatDateShort(indoorStart.start)} - ${formatDateShort(indoorStart.end)}`}
                      >
                        Seeds
                      </div>
                    )}

                    {/* Transplant Bar */}
                    {transplant && (
                      <div
                        className="absolute h-4 bg-emerald-600/90 rounded-xs text-[10px] text-white flex items-center justify-center font-bold"
                        style={{
                          left: `${((transplant.start.getMonth() * 30 + transplant.start.getDate()) / 365) * 100}%`,
                          width: `${Math.max(3, ((transplant.end.getTime() - transplant.start.getTime()) / (365 * 86400000)) * 100)}%`,
                        }}
                        title={`Transplant Outdoors: ${formatDateShort(transplant.start)} - ${formatDateShort(transplant.end)}`}
                      >
                        Plant
                      </div>
                    )}

                    {/* Direct Sow Bar */}
                    {directSow && (
                      <div
                        className="absolute h-4 bg-amber-500/90 rounded-xs text-[10px] text-white flex items-center justify-center font-bold"
                        style={{
                          left: `${((directSow.start.getMonth() * 30 + directSow.start.getDate()) / 365) * 100}%`,
                          width: `${Math.max(3, ((directSow.end.getTime() - directSow.start.getTime()) / (365 * 86400000)) * 100)}%`,
                        }}
                        title={`Direct Sow in Garden: ${formatDateShort(directSow.start)} - ${formatDateShort(directSow.end)}`}
                      >
                        Sow
                      </div>
                    )}

                    {/* Fall Sowing */}
                    {fallSow && (
                      <div
                        className="absolute h-4 bg-purple-500/80 rounded-xs text-[10px] text-white flex items-center justify-center font-bold"
                        style={{
                          left: `${((fallSow.start.getMonth() * 30 + fallSow.start.getDate()) / 365) * 100}%`,
                          width: `${Math.max(3, ((fallSow.end.getTime() - fallSow.start.getTime()) / (365 * 86400000)) * 100)}%`,
                        }}
                        title={`Fall Succession Sowing: ${formatDateShort(fallSow.start)} - ${formatDateShort(fallSow.end)}`}
                      >
                        Fall
                      </div>
                    )}

                    {/* Estimated Harvest Window */}
                    {harvestWindow && (
                      <div
                        className="absolute h-4 bg-rose-500/80 rounded-xs text-[10px] text-white flex items-center justify-center font-bold"
                        style={{
                          left: `${((harvestWindow.start.getMonth() * 30 + harvestWindow.start.getDate()) / 365) * 100}%`,
                          width: `${Math.max(4, ((harvestWindow.end.getTime() - harvestWindow.start.getTime()) / (365 * 86400000)) * 100)}%`,
                        }}
                        title={`Estimated Harvest Window: ${formatDateShort(harvestWindow.start)} - ${formatDateShort(harvestWindow.end)}`}
                      >
                        Harvest
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Action Checklist View */
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 printable-area">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-[#183a24]">Seasonal Action Checklist</h3>
            <span className="text-xs text-stone-500">
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-stone-50/80 border-stone-200 text-stone-400'
                    : 'bg-white border-stone-200 hover:border-emerald-400 text-stone-800 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-emerald-700 shrink-0"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-emerald-600" />
                  )}
                </button>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${task.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {task.dueDate}
                    </span>
                  </div>
                  {task.notes && (
                    <p className={`text-[11px] mt-0.5 ${task.completed ? 'text-stone-400 line-through' : 'text-stone-600'}`}>
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-dialog-heading"
        >
          <form
            onSubmit={handleCreateCustomTask}
            className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <h3 id="add-task-dialog-heading" className="text-base font-bold text-[#183a24] font-serif-botanical">Add Garden Task or Reminder</h3>

            <div>
              <label htmlFor="task-title-input" className="block text-xs font-semibold text-stone-700 mb-1">Task Title</label>
              <input
                id="task-title-input"
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-xl"
                placeholder="e.g. Pinch tomato suckers; apply mulch"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-due-date-input" className="block text-xs font-semibold text-stone-700 mb-1">Target Due Date</label>
                <input
                  id="task-due-date-input"
                  type="date"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className="w-full text-xs p-2 border border-stone-300 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label htmlFor="task-category-select" className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  id="task-category-select"
                  value={newTaskType}
                  onChange={e => setNewTaskType(e.target.value as any)}
                  className="w-full text-xs p-2 border border-stone-300 rounded-xl"
                >
                  <option value="seed-start">Indoor Seed Starting</option>
                  <option value="transplant">Transplant Outdoors</option>
                  <option value="direct-sow">Direct Sow</option>
                  <option value="maintenance">Pruning &amp; Mulching</option>
                  <option value="pest-check">Pest Inspection (IPM)</option>
                  <option value="harvest">Harvest</option>
                  <option value="preserve">Food Preservation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422]"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
