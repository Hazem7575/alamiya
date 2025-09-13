import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/services/api';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

export function ApiDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [endpoint, setEndpoint] = useState('/users');
  const [method, setMethod] = useState('GET');
  
  const testApi = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      let response;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, {});
          break;
        default:
          response = await apiClient.get(endpoint);
      }
      
      setResult({
        success: true,
        data: response,
        timestamp: new Date().toLocaleString()
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'حدث خطأ',
        details: error,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/health');
      const data = await response.json();
      
      setResult({
        success: true,
        message: 'الاتصال بالسيرفر ناجح',
        data,
        timestamp: new Date().toLocaleString()
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: 'فشل في الاتصال بالسيرفر',
        error: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle size={20} />
        تصحيح أخطاء الـ API
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endpoint">Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/users"
            />
          </div>
          
          <div>
            <Label htmlFor="method">Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testApi} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            اختبار API
          </Button>
          
          <Button onClick={testConnection} variant="outline" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            اختبار الاتصال
          </Button>
          
          <Button onClick={() => setResult(null)} variant="ghost">
            <RefreshCw size={16} className="mr-2" />
            مسح النتائج
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? 'نجح' : 'فشل'}
              </Badge>
              <span className="text-sm text-muted-foreground">{result.timestamp}</span>
            </div>
            
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}









