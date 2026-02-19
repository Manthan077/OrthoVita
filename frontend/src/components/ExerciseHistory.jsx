import { useStore } from '../store/useStore';
import { EXERCISES } from '../utils/exerciseDetectors';
import * as XLSX from 'xlsx';

export const ExerciseHistory = ({ onClose }) => {
  const { sessionHistory, deleteSession } = useStore();

  const getDateFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const downloadHistory = () => {
    const data = [
      ['Date', 'Exercise', 'Reps', 'Accuracy (%)', 'Duration (seconds)', 'Day', 'Time'],
      ...sessionHistory
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(session => [
        session.date || getDateFromTimestamp(session.timestamp),
        EXERCISES[session.exercise]?.name || session.exercise,
        session.reps,
        session.avgAccuracy,
        session.duration,
        session.day || 1,
        new Date(session.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // Date
      { wch: 18 },  // Exercise
      { wch: 8 },   // Reps
      { wch: 14 },  // Accuracy
      { wch: 18 },  // Duration
      { wch: 8 },   // Day
      { wch: 10 }   // Time
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exercise History');
    XLSX.writeFile(wb, `orthovita-history-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDeleteSession = (sessionIndex) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionIndex);
    }
  };

  const groupByDate = () => {
    const grouped = {};
    sessionHistory.forEach(session => {
      const date = session.date || getDateFromTimestamp(session.timestamp);
      if (!grouped[date]) grouped[date] = { sessions: [], day: session.day || 1 };
      grouped[date].sessions.unshift(session);
    });
    return grouped;
  };

  const formatDateHeader = (dateKey) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = dateKey === getDateFromTimestamp(today.getTime());
    const isYesterday = dateKey === getDateFromTimestamp(yesterday.getTime());
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const dateGroups = groupByDate();
  const dates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1526] border border-[#1c2e50] rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#1c2e50] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#e8f0ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Exercise History
            </h2>
            <p className="text-sm text-[#4a5e80] mt-1">Your rehabilitation journey</p>
          </div>
          <div className="flex items-center gap-3">
            {sessionHistory.length > 0 && (
              <button
                onClick={downloadHistory}
                className="flex items-center gap-2 px-3 py-2 bg-[#00e5ff] text-[#0d1526] rounded-lg hover:bg-[#00b8cc] transition-colors text-sm font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#4a5e80] hover:text-[#e8f0ff] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {dates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-[#4a5e80]">No exercise history yet</p>
              <p className="text-sm text-[#4a5e80] mt-2">Complete your first session to see it here</p>
            </div>
          ) : (
            dates.map(date => {
              const { sessions, day } = dateGroups[date];
              return (
                <div key={date} className="bg-[#060b14] border border-[#1c2e50] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#00e5ff]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {formatDateHeader(date)}
                      </h3>
                      <p className="text-xs text-[#4a5e80] mt-0.5">Day {day}</p>
                    </div>
                    <span className="text-xs text-[#4a5e80]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {sessions.length} session{sessions.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((session, sessionIdx) => {
                      const globalIndex = sessionHistory.findIndex(s => s.timestamp === session.timestamp);
                      const grade = session.avgAccuracy >= 90 ? { label: 'Excellent', color: '#00ff9d' }
                        : session.avgAccuracy >= 75 ? { label: 'Good', color: '#00e5ff' }
                        : session.avgAccuracy >= 60 ? { label: 'Fair', color: '#ff6b35' }
                        : { label: 'Practice', color: '#ff3366' };

                      return (
                        <div key={sessionIdx} className="bg-[#0d1526] border border-[#1c2e50] rounded-lg p-3 group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#e8f0ff]">
                                {EXERCISES[session.exercise]?.name || session.exercise}
                              </span>
                              <span
                                className="text-xs px-2 py-0.5 rounded font-bold"
                                style={{ 
                                  color: grade.color, 
                                  background: `${grade.color}15`,
                                  border: `1px solid ${grade.color}40`
                                }}
                              >
                                {grade.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#4a5e80]">
                                {formatTime(session.timestamp)}
                              </span>
                              <button
                                onClick={() => handleDeleteSession(globalIndex)}
                                className="opacity-0 group-hover:opacity-100 text-[#ff3366] hover:text-[#ff6b9d] transition-all p-1 rounded"
                                title="Delete session"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="text-xs text-[#4a5e80] mb-1">Reps</div>
                              <div className="text-lg font-bold text-[#e8f0ff]">{session.reps}</div>
                            </div>
                            <div>
                              <div className="text-xs text-[#4a5e80] mb-1">Accuracy</div>
                              <div className="text-lg font-bold" style={{ color: grade.color }}>
                                {session.avgAccuracy}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-[#4a5e80] mb-1">Duration</div>
                              <div className="text-lg font-bold text-[#e8f0ff]">
                                {formatDuration(session.duration)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
