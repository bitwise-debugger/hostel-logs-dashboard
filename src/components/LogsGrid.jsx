import { UserCircle, Clock, Home, CheckCircle } from 'lucide-react';
import moment from 'moment';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const LogsGrid = ({ logs, allotments, onRowClick }) => {
  const getStatusVariant = (status) => {
    if (status === 'Boarder') return 'success';
    if (status === 'Non-Boarder') return 'warning';
    return 'destructive';
  };

  const isLateEntry = (dateTime, lateEntryHour) => {
    const hour = moment(dateTime).hour();
    return hour >= lateEntryHour;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {logs.map((log, i) => {
        const student = allotments[log['QR Code']?.trim()];
        const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
        const isLate = isLateEntry(log.DateTime, lateEntryHour);
        
        return (
          <Card 
            key={i}
            onClick={() => onRowClick(log)}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                  <UserCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {student?.Name || 'Unregistered'}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{log['QR Code']}</p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-cyan-600 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {moment(log.DateTime).format('hh:mm A, DD MMM YYYY')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Home size={14} className="text-cyan-600 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 truncate">
                        {student?.Hostel || 'N/A'} - Room {student?.Room || '??'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge variant={getStatusVariant(log.Status)}>
                        {log.Status}
                      </Badge>
                      <Badge variant={student?.['Mess Status'] === 'ON' ? 'success' : 'secondary'}>
                        Mess: {student?.['Mess Status'] || 'N/A'}
                      </Badge>
                      {isLate && (
                        <Badge variant="destructive">
                          Late Entry
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LogsGrid;
