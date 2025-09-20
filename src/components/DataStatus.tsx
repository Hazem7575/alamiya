import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react';

interface DataStatusProps {
  title: string;
  isLoading: boolean;
  data: any;
  error?: string;
  count?: number;
}

export function DataStatus({ title, isLoading, data, error, count }: DataStatusProps) {
  const getStatus = () => {
    if (isLoading) {
      return {
        icon: <Loader2 className="animate-spin" size={16} />,
        color: 'bg-blue-500',
        text: 'جاري التحميل...',
        variant: 'secondary' as const
      };
    }

    if (error) {
      return {
        icon: <AlertCircle size={16} />,
        color: 'bg-red-500',
        text: 'خطأ في التحميل',
        variant: 'destructive' as const
      };
    }

    if (data && count !== undefined && count > 0) {
      return {
        icon: <CheckCircle size={16} />,
        color: 'bg-green-500',
        text: `تم تحميل ${count} عنصر`,
        variant: 'default' as const
      };
    }

    if (data) {
      return {
        icon: <CheckCircle size={16} />,
        color: 'bg-green-500',
        text: 'تم التحميل بنجاح',
        variant: 'default' as const
      };
    }

    return {
      icon: <Database size={16} />,
      color: 'bg-gray-500',
      text: 'لا توجد بيانات',
      variant: 'secondary' as const
    };
  };

  const status = getStatus();

  return (
    <Card className="p-4 border-l-4" style={{ borderLeftColor: status.color.replace('bg-', '') }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          {status.icon}
        </div>
        <Badge variant={status.variant}>
          {status.text}
        </Badge>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">
          خطأ: {error}
        </p>
      )}
    </Card>
  );
}










