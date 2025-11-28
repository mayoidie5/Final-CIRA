import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User,
  Play,
  Pause
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'status_change' | 'note_added' | 'assignment' | 'creation';
  title: string;
  description?: string;
  timestamp: Date;
  user?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle size={16} />;
      case 'note_added':
        return <FileText size={16} />;
      case 'assignment':
        return <User size={16} />;
      case 'creation':
        return <Play size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'status_change':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'note_added':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'assignment':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'creation':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock size={48} className="mx-auto mb-2 opacity-50" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          {/* Icon and Line */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[40px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-800 dark:text-white">{activity.title}</p>
                {activity.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                )}
                {activity.user && (
                  <p className="text-gray-500 dark:text-gray-500 mt-1">
                    by {activity.user}
                  </p>
                )}
              </div>
              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
