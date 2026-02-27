const PageHeader = ({ title, description, actions, search }) => {
  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        
        {/* Search Section */}
        {search && (
          <div className="flex-1 max-w-2xl">
            {search}
          </div>
        )}
        
        {/* Actions Section */}
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
