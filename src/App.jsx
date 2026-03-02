import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import moment from 'moment';
import { Clock, Users, ShieldAlert, AlertTriangle, Search, Calendar, LayoutGrid, List, Filter, Activity } from 'lucide-react';
import { cn } from './lib/utils';

import Sidebar from './components/Sidebar';
import PageHeader from './components/PageHeader';
import StatsCard from './components/StatsCard';
import LogsTable from './components/LogsTable';
import LogsGrid from './components/LogsGrid';
import ImageModal from './components/ImageModal';
import DateRangeModal from './components/DateRangeModal';
import InstallPWA from './components/InstallPWA';
import Login from './pages/Login';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from './components/ui/toast';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const App = () => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data
  const [logs, setLogs] = useState([]);
  const [allotments, setAllotments] = useState({});
  const [lastSync, setLastSync] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUnique, setShowUnique] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('dormsyncscanner_auth');
    setIsAuthenticated(auth === 'true');
  }, []);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setViewMode('grid');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get URLs from env or localStorage
      const scanLogsUrl = import.meta.env.VITE_SCAN_LOGS_URL || 
                         localStorage.getItem('scanLogsPath') || 
                         'https://raw.githubusercontent.com/G5-UOGIAN/scanner-logs/main/scan_logs.csv';
      
      const allotmentsUrl = scanLogsUrl.replace('scan_logs.csv', 'allotments.csv');
      
      // Fetch both files
      const [logsResponse, allotmentsResponse] = await Promise.all([
        fetch(scanLogsUrl),
        fetch(allotmentsUrl)
      ]);
      
      const csvText = await logsResponse.text();
      const allotmentsText = await allotmentsResponse.text();

      // Parse allotments first
      Papa.parse(allotmentsText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const allotMap = {};
          result.data.forEach(row => {
            const rollNo = row['Roll No.']?.trim();
            if (rollNo) {
              allotMap[rollNo] = {
                'Roll No.': rollNo,
                Name: row.Name?.trim(),
                Hostel: row.Hostel?.trim(),
                Room: row.Room?.trim(),
                Allotment: row.Hostel?.trim(),
                Contact: row.Contact?.trim(),
                Batch: row.Batch?.trim()
              };
            }
          });
          setAllotments(allotMap);
        }
      });

      // Parse scan logs
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          let lastUpdateDate = null;
          
          // Process logs and extract last update date
          const processedLogs = result.data
            .filter(row => {
              // Check if this is the last update marker
              if (row.Name?.trim() === 'LAST UPDAED LOGS' || row.Name?.trim() === 'LAST UPDATED LOGS') {
                lastUpdateDate = `${row.Date_?.trim()} ${row.Time?.trim()}`;
                return false; // Don't include this row in logs
              }
              return row.Date_ && row.QR_Code && row.QR_Code !== 'NULL';
            })
            .map(row => ({
              DateTime: `${row.Date_?.trim()} ${row.Time?.trim()}`,
              'QR Code': row.QR_Code?.trim(),
              Status: row.Status?.trim(),
              Name: row.Name?.trim(),
              Hostel: row.Hostel?.trim(),
              Room: row.RoomNo?.trim(),
              Mobile: row.MobileNo?.trim(),
              ImagePath: row.Image_Path?.trim()
            }));

          setLogs(processedLogs);
          
          // Set last sync from CSV or current time
          if (lastUpdateDate) {
            setLastSync(moment(lastUpdateDate, 'DD/MM/YYYY HH:mm:ss').toDate());
          } else {
            setLastSync(new Date());
          }
          
          setLoading(false);
          toast.success('Data loaded successfully');
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          setLoading(false);
          toast.error('Failed to parse CSV data');
        }
      });
    } catch (err) {
      console.error('Fetch Error:', err);
      setLoading(false);
      toast.error('Failed to load data');
    }
  };

  // Get unique logs (filter duplicates by QR Code)
  const uniqueLogs = useMemo(() => {
    if (!showUnique) return logs;
    
    const seen = new Set();
    return logs.filter(log => {
      const key = log['QR Code'];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [logs, showUnique]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    let filtered = showUnique ? uniqueLogs : logs;

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(log => {
        const logDate = moment(log.DateTime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');
        
        if (startDate && endDate) {
          return logDate >= startDate && logDate <= endDate;
        } else if (startDate) {
          return logDate >= startDate;
        } else if (endDate) {
          return logDate <= endDate;
        }
        
        return true;
      });
    }

    // Tab filter
    if (filterTab === 'late') {
      const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
      filtered = filtered.filter(log => {
        const hour = moment(log.DateTime, 'DD/MM/YYYY HH:mm:ss').hour();
        return hour >= lateEntryHour;
      });
    } else if (filterTab === 'boarder') {
      filtered = filtered.filter(log => log.Status === 'Boarder');
    } else if (filterTab === 'non-boarder') {
      filtered = filtered.filter(log => log.Status === 'Non-Boarder');
    } else if (filterTab === 'invalid') {
      filtered = filtered.filter(log => 
        log.Status !== 'Boarder' && log.Status !== 'Non-Boarder'
      );
    } else if (filterTab === 'missing') {
      // Show boarders who haven't scanned in the selected date range
      const scannedRollNos = new Set(
        filtered.filter(l => l.Status === 'Boarder').map(l => l['QR Code'])
      );
      const missingBoarders = Object.values(allotments).filter(
        student => !scannedRollNos.has(student['Roll No.'])
      );
      // Convert to log format for display
      return missingBoarders.map(student => ({
        DateTime: 'Not Scanned',
        'QR Code': student['Roll No.'],
        Status: 'Missing',
        Name: student.Name,
        Hostel: student.Hostel,
        Room: student.Room
      }));
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => {
        const name = log.Name || '';
        const rollNo = log['QR Code'] || '';
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rollNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  }, [logs, uniqueLogs, showUnique, searchTerm, filterTab, allotments, startDate, endDate]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    const sorted = [...filteredLogs];
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'identity':
          aValue = a.Name || '';
          bValue = b.Name || '';
          break;
        case 'time':
          aValue = moment(a.DateTime, 'DD/MM/YYYY HH:mm:ss').valueOf();
          bValue = moment(b.DateTime, 'DD/MM/YYYY HH:mm:ss').valueOf();
          break;
        case 'room':
          aValue = a.Room || '';
          bValue = b.Room || '';
          break;
        case 'status':
          aValue = a.Status || '';
          bValue = b.Status || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredLogs, sortConfig]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalScans = logs.length;
    const boarders = logs.filter(l => l.Status === 'Boarder').length;
    const nonBoarders = logs.filter(l => l.Status === 'Non-Boarder').length;
    const invalid = logs.filter(l => 
      l.Status !== 'Boarder' && l.Status !== 'Non-Boarder'
    ).length;

    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const lateEntries = logs.filter(log => 
      moment(log.DateTime, 'DD/MM/YYYY HH:mm:ss').hour() >= lateEntryHour
    ).length;

    // Calculate peak time
    const hourCounts = {};
    logs.forEach(log => {
      const hour = moment(log.DateTime, 'DD/MM/YYYY HH:mm:ss').hour();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour = 0;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    const peakTime = moment().hour(peakHour).format('hh:00 A');

    return {
      totalScans,
      boarders,
      nonBoarders,
      invalid,
      lateEntries,
      peakTime
    };
  }, [logs]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('dormsyncscanner_auth');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab) => {
    setProcessing(true);
    setFilterTab(tab);
    setTimeout(() => {
      setProcessing(false);
    }, 100);
  };

  const handleViewModeChange = (mode) => {
    setProcessing(true);
    setViewMode(mode);
    setTimeout(() => {
      setProcessing(false);
    }, 100);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = () => {
    // Search is reactive, no action needed
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDateRangeApply = (start, end) => {
    setIsDateModalOpen(false);
    setStartDate(start);
    setEndDate(end);
    
    if (start || end) {
      toast.success('Date range filter applied');
    } else {
      toast.success('Showing all records');
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    toast.success('Showing all records');
  };

  const toggleUnique = () => {
    setShowUnique(!showUnique);
    toast.success(showUnique ? 'Showing all entries' : 'Showing unique entries');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (activeTab !== 'dashboard') {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {!isMobile && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            isMobile={isMobile}
            onLogout={handleLogout}
          />
        )}
        
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden",
          isMobile && "pb-16"
        )}>
          {activeTab === 'students' && <Students allotments={allotments} isMobile={isMobile} />}
          {activeTab === 'reports' && <Reports logs={logs} allotments={allotments} isMobile={isMobile} showUnique={showUnique} toggleUnique={toggleUnique} />}
          {activeTab === 'notifications' && <Notifications isMobile={isMobile} />}
          {activeTab === 'settings' && <Settings isMobile={isMobile} onLogout={handleLogout} />}
        </div>

        {isMobile && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            isMobile={isMobile}
            onLogout={handleLogout}
          />
        )}

        <InstallPWA />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {!isMobile && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          onLogout={handleLogout}
        />
      )}
      
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        isMobile && "pb-16"
      )}>
        <PageHeader 
          title="Dashboard" 
          description="Monitor and manage hostel scan entries"
          search={
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="text"
                  placeholder={isMobile ? "Search..." : "Search by name or roll number..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              {!isMobile && (
                <Button onClick={handleSearch}>
                  Search
                </Button>
              )}
            </div>
          }
          actions={
            !isMobile && (
              <div className="flex items-center gap-3">
                <Button
                  variant={showUnique ? 'default' : 'outline'}
                  onClick={toggleUnique}
                  className="gap-2"
                >
                  <Filter size={16} />
                  {showUnique ? 'Unique' : 'All Entries'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDateModalOpen(true)}
                  className="gap-2"
                >
                  <Calendar size={16} />
                  {startDate || endDate ? 'Change Range' : 'Date Range'}
                </Button>
                {(startDate || endDate) && (
                  <Button variant="outline" onClick={clearDateRange}>
                    Clear
                  </Button>
                )}
              </div>
            )
          }
        />

        <div className="flex-1 overflow-hidden p-3 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
          {/* Mobile controls */}
          {isMobile && (
            <div className="flex gap-2">
              <Button
                variant={showUnique ? 'default' : 'outline'}
                onClick={toggleUnique}
                size="sm"
                className="flex-1 gap-2"
              >
                <Filter size={14} />
                {showUnique ? 'Unique' : 'All'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDateModalOpen(true)}
                size="sm"
                className="flex-1 gap-2"
              >
                <Calendar size={14} />
                Range
              </Button>
              {(startDate || endDate) && (
                <Button variant="outline" onClick={clearDateRange} size="sm">
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Last Sync Info */}
          {lastSync && (
            <div className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span className="text-sm text-cyan-900 dark:text-cyan-100">
                  Last synced: {moment(lastSync).format('MMM DD, YYYY [at] hh:mm A')}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}>
                Refresh
              </Button>
            </div>
          )}

          {/* Analytics Widgets - 2 per row on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatsCard
              label="Boarders"
              value={stats.boarders}
              icon={Users}
              description={`Total: ${stats.totalScans} scans`}
              variant="default"
            />
            <StatsCard
              label="Non-Boarders"
              value={stats.nonBoarders}
              icon={Users}
              description="Visitors"
              variant="default"
            />
            <StatsCard
              label="Late Entries"
              value={stats.lateEntries}
              icon={AlertTriangle}
              description={`After ${localStorage.getItem('lateEntryHour') || '22'}:00`}
              variant="warning"
            />
            <StatsCard
              label="Invalid Scans"
              value={stats.invalid}
              icon={ShieldAlert}
              variant="danger"
            />
          </div>

          {/* Tabs and Table Container */}
          <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
            {/* Date Display */}
            <div className="px-3 md:px-6 py-2 md:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
                Showing records: {' '}
                <span className="text-slate-900 dark:text-white font-semibold">
                  {startDate || endDate 
                    ? `${startDate ? moment(startDate).format('MMM DD, YYYY') : 'Beginning'} to ${endDate ? moment(endDate).format('MMM DD, YYYY') : 'Now'}`
                    : 'All Time'
                  }
                </span>
                {' '}({filteredLogs.length} records)
                {showUnique && <span className="text-cyan-600"> • Unique entries</span>}
              </p>
            </div>

            <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-x-auto">
                  <Tabs value={filterTab} onValueChange={handleTabChange}>
                    <TabsList className="w-full md:w-auto">
                      <TabsTrigger 
                        value="all" 
                        active={filterTab === 'all'}
                        onClick={() => handleTabChange('all')}
                        disabled={processing}
                        className="text-xs md:text-sm whitespace-nowrap"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger 
                        value="boarder" 
                        active={filterTab === 'boarder'}
                        onClick={() => handleTabChange('boarder')}
                        disabled={processing}
                        className="text-xs md:text-sm whitespace-nowrap"
                      >
                        Boarders
                      </TabsTrigger>
                      <TabsTrigger 
                        value="non-boarder" 
                        active={filterTab === 'non-boarder'}
                        onClick={() => handleTabChange('non-boarder')}
                        disabled={processing}
                        className="text-xs md:text-sm whitespace-nowrap"
                      >
                        Non-Boarders
                      </TabsTrigger>
                      <TabsTrigger 
                        value="missing" 
                        active={filterTab === 'missing'}
                        onClick={() => handleTabChange('missing')}
                        disabled={processing}
                        className="text-xs md:text-sm whitespace-nowrap"
                      >
                        Missing
                      </TabsTrigger>
                      <TabsTrigger 
                        value="invalid" 
                        active={filterTab === 'invalid'}
                        onClick={() => handleTabChange('invalid')}
                        disabled={processing}
                        className="text-xs md:text-sm whitespace-nowrap"
                      >
                        Invalid
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewModeChange('table')}
                      className="gap-2"
                      disabled={processing}
                    >
                      <List size={16} />
                      Table
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleViewModeChange('grid')}
                      className="gap-2"
                      disabled={processing}
                    >
                      <LayoutGrid size={16} />
                      Cards
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto max-h-44 sm:max-h-58 md:max-h-68 lg:max-h-88 xl:max-h-104 p-2 sm:p-0">
              {loading ? (
                <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[300px]">
                  <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-cyan-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600 dark:text-slate-400">Loading data...</p>
                  </div>
                </div>
              ) : processing ? (
                <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[300px]">
                  <svg className="animate-spin h-8 w-8 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : sortedLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[300px]">
                  <div className="text-center">
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Records Found</p>
                    <p className="text-sm text-slate-500">
                      {filterTab === 'missing' 
                        ? 'All boarders have scanned their cards'
                        : 'Try adjusting your filters or date range'}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'table' ? (
                <LogsTable 
                  logs={sortedLogs}
                  allotments={allotments}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  onRowClick={setSelectedLog}
                />
              ) : (
                <LogsGrid 
                  logs={sortedLogs}
                  allotments={allotments}
                  onCardClick={setSelectedLog}
                />
              )}
            </div>
          </div>
        </div>

        {selectedLog && (
          <ImageModal
            log={selectedLog}
            student={allotments[selectedLog['QR Code']?.trim()]}
            onClose={() => setSelectedLog(null)}
          />
        )}

        <DateRangeModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          onApply={handleDateRangeApply}
          currentStartDate={startDate}
          currentEndDate={endDate}
        />

        {isMobile && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            isMobile={isMobile}
            onLogout={handleLogout}
          />
        )}

        <InstallPWA />
      </div>
    </div>
  );
};

export default App;
