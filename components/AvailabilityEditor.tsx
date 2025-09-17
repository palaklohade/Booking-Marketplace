// AvailabilityEditor.tsx
import React, { useState, useEffect } from 'react';
import { Availability } from '../types';

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface Props {
  initialAvailability: Availability | null;
  onSave: (availability: Availability) => Promise<void>;
}

const AvailabilityEditor: React.FC<Props> = ({ initialAvailability, onSave }) => {
  const [availability, setAvailability] = useState<{ [key: string]: boolean }>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: false }), {})
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialAvailability) {
      setAvailability(initialAvailability.days || {});
      setStartTime(initialAvailability.start_time || '09:00');
      setEndTime(initialAvailability.end_time || '17:00');
    }
  }, [initialAvailability]);

  const handleDayToggle = (day: string) => {
    setAvailability(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await onSave({
        days: availability,
        start_time: startTime,
        end_time: endTime,
      } as Availability);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving availability:", err);
      alert("Failed to save availability. Please try again.");
    } finally {
      console.log("ooo");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Working Days</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => handleDayToggle(day)}
              className={`px-3 py-2 text-sm rounded-md transition ${
                availability[day]
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {day.substring(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            From
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      <div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityEditor;