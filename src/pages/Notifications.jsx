import { Construction } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Notifications = ({ isMobile }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader 
        title="Notifications" 
        description="System alerts and updates"
      />

      <div className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <Construction className="w-16 h-16 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Under Development
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            This feature is currently being developed and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
