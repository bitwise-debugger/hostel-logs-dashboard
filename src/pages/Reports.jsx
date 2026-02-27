import { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const Reports = ({ logs }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logs by date range
  const filteredLogs = useMemo(() => {
    if (!startDate && !endDate) return logs;

    return logs.filter(log => {
      const logDate = moment(log.DateTime).format('YYYY-MM-DD');
      
      if (startDate && endDate) {
        return logDate >= startDate && logDate <= endDate;
      } else if (startDate) {
        return logDate >= startDate;
      } else if (endDate) {
        return logDate <= endDate;
      }
      
      return true;
    });
  }, [logs, startDate, endDate]);

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };
  // Peak Times Data
  const peakTimesData = useMemo(() => {
    const hourCounts = {};
    filteredLogs.forEach(log => {
      const hour = moment(log.DateTime).hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: moment().hour(parseInt(hour)).format('hh A'),
        hourNum: parseInt(hour),
        count
      }))
      .sort((a, b) => a.hourNum - b.hourNum);
  }, [filteredLogs]);

  // Status Distribution Data
  const statusData = useMemo(() => {
    const boarders = filteredLogs.filter(l => l.Status === 'Boarder').length;
    const nonBoarders = filteredLogs.filter(l => l.Status === 'Non-Boarder').length;
    const invalid = filteredLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder').length;
    const total = filteredLogs.length;

    return [
      { 
        name: 'Boarders', 
        value: boarders,
        percentage: total > 0 ? ((boarders / total) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Non-Boarders', 
        value: nonBoarders,
        percentage: total > 0 ? ((nonBoarders / total) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Invalid', 
        value: invalid,
        percentage: total > 0 ? ((invalid / total) * 100).toFixed(1) : '0.0'
      }
    ];
  }, [filteredLogs]);

  // Daily Trend Data (last 7 days or date range)
  const dailyTrendData = useMemo(() => {
    if (startDate && endDate) {
      // Use selected date range
      const start = moment(startDate);
      const end = moment(endDate);
      const days = [];
      
      for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
        const date = m.format('YYYY-MM-DD');
        const count = filteredLogs.filter(log => 
          moment(log.DateTime).format('YYYY-MM-DD') === date
        ).length;
        days.push({
          date: m.format('MMM DD'),
          count
        });
      }
      return days;
    } else {
      // Default: last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const count = filteredLogs.filter(log => 
          moment(log.DateTime).format('YYYY-MM-DD') === date
        ).length;
        last7Days.push({
          date: moment().subtract(i, 'days').format('MMM DD'),
          count
        });
      }
      return last7Days;
    }
  }, [filteredLogs, startDate, endDate]);

  // Late Entries Data
  const lateEntriesData = useMemo(() => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const lateCount = filteredLogs.filter(log => moment(log.DateTime).hour() >= lateEntryHour).length;
    const onTimeCount = filteredLogs.length - lateCount;
    const total = filteredLogs.length;
    return [
      { name: 'On Time', value: onTimeCount, percentage: total > 0 ? ((onTimeCount / total) * 100).toFixed(1) : '0.0' },
      { name: 'Late (After 10 PM)', value: lateCount, percentage: total > 0 ? ((lateCount / total) * 100).toFixed(1) : '0.0' }
    ];
  }, [filteredLogs]);

  // Summary Stats
  const stats = useMemo(() => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const peakHour = peakTimesData.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    , { count: 0, hour: 'N/A' });

    const daysCount = startDate && endDate 
      ? moment(endDate).diff(moment(startDate), 'days') + 1 
      : 7;
    const avgPerDay = daysCount > 0 ? (filteredLogs.length / daysCount).toFixed(0) : '0';
    const lateEntries = filteredLogs.filter(log => moment(log.DateTime).hour() >= lateEntryHour).length;
    const invalidEntries = filteredLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder').length;

    return {
      peakHour: peakHour.hour,
      peakCount: peakHour.count,
      avgPerDay,
      lateEntries,
      invalidEntries
    };
  }, [filteredLogs, peakTimesData, startDate, endDate]);

  const COLORS = {
    'Boarders': '#10b981',
    'Non-Boarders': '#f97316',
    'Invalid': '#ef4444',
    'On Time': '#06b6d4',
    'Late (After 10 PM)': '#f59e0b'
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Visual insights and statistics</p>
        </div>

        {/* Date Range Filter */}
        <Card className="w-auto">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-slate-400" size={18} />
                <div className="flex items-center gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <span className="text-slate-400 mt-5">—</span>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>
              {(startDate || endDate) && (
                <Button variant="outline" onClick={clearDateRange} className="mt-5">
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Display */}
      {(startDate || endDate) && (
        <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg px-4 py-2">
          <p className="text-sm text-cyan-900 dark:text-cyan-100">
            Showing analytics: {' '}
            <span className="font-semibold">
              {startDate ? moment(startDate).format('MMM DD, YYYY') : 'Beginning'} 
              {' '} to {' '}
              {endDate ? moment(endDate).format('MMM DD, YYYY') : 'Now'}
            </span>
            {' '}({filteredLogs.length} records)
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Peak Hour</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.peakHour}</p>
                <p className="text-xs text-slate-500">{stats.peakCount} entries</p>
              </div>
              <Clock className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Per Day</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgPerDay}</p>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Late Entries</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lateEntries}</p>
                <p className="text-xs text-slate-500">After 10 PM</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Invalid Scans</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.invalidEntries}</p>
                <p className="text-xs text-slate-500">Total invalid</p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Container - Scrollable */}
      <div className="flex-1 overflow-auto space-y-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Status Distribution</CardTitle>
            <CardDescription>Breakdown of boarders, non-boarders, and invalid entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center space-y-3">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[item.name] }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                      <p className="text-xs text-slate-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Entry Trend</CardTitle>
            <CardDescription>Daily scan entries for the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} name="Entries" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Times */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Entry Times</CardTitle>
            <CardDescription>Hourly distribution of scan entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakTimesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#06b6d4" name="Number of Entries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Late Entries */}
        <Card>
          <CardHeader>
            <CardTitle>On-Time vs Late Entries</CardTitle>
            <CardDescription>Entries before and after 10:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lateEntriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {lateEntriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center space-y-3">
                {lateEntriesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[item.name] }}
                      />
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                      <p className="text-xs text-slate-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
