import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import moment from 'moment';
import PageHeader from '../components/PageHeader';

const Notifications = ({ isMobile }) => {
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'High Late Entry Count',
      message: '15 students entered after 10 PM today',
      time: moment().subtract(30, 'minutes'),
      read: false
    },
    {
      id: 2,
      type: 'error',
      title: 'Invalid QR Code Detected',
      message: 'Multiple invalid scan attempts detected at Gate A',
      time: moment().subtract(2, 'hours'),
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Daily Report Generated',
      message: 'Your daily attendance report is ready to download',
      time: moment().subtract(5, 'hours'),
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to the dashboard',
      time: moment().subtract(1, 'day'),
      read: true
    },
    {
      id: 5,
      type: 'warning',
      title: 'Mess Arrears Alert',
      message: '8 students have pending mess fee payments',
      time: moment().subtract(1, 'day'),
      read: true
    },
    {
      id: 6,
      type: 'info',
      title: 'Peak Time Alert',
      message: 'Highest entry traffic recorded at 9:00 PM',
      time: moment().subtract(2, 'days'),
      read: true
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-orange-600" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      default:
        return <Info className="text-cyan-600" size={20} />;
    }
  };

  const getVariant = (type) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with system alerts and updates"
        actions={
          <Badge variant="default">
            {notifications.filter(n => !n.read).length} Unread
          </Badge>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`${!notification.read ? 'border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="default" className="flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {notification.time.fromNow()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Bell className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                No Notifications
              </p>
              <p className="text-sm text-slate-500">
                You're all caught up!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
