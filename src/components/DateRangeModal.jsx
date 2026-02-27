import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DateRangeModal = ({ isOpen, onClose, onApply, currentStartDate, currentEndDate }) => {
  const [startDate, setStartDate] = useState(currentStartDate || '');
  const [endDate, setEndDate] = useState(currentEndDate || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(startDate, endDate);
  };

  const handleViewAll = () => {
    onApply('', '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} className="text-cyan-600" />
            Select Date Range
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApply}
              className="flex-1"
              disabled={!startDate && !endDate}
            >
              Apply Filter
            </Button>
            <Button
              onClick={handleViewAll}
              variant="outline"
              className="flex-1"
            >
              View All Scans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DateRangeModal;
