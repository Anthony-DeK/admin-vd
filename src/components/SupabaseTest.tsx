import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [envStatus, setEnvStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [debugInfo, setDebugInfo] = useState<{
    hasUrl: boolean;
    hasKey: boolean;
    urlLength: number;
    keyLength: number;
  }>({
    hasUrl: false,
    hasKey: false,
    urlLength: 0,
    keyLength: 0,
  });

  useEffect(() => {
    // Check if environment variables are present
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setDebugInfo({
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
    });
    
    if (!url || !key) {
      setEnvStatus('missing');
      setStatus('error');
      setErrorMessage('Environment variables are missing. Please check your .env file.');
      return;
    }
    
    setEnvStatus('ok');

    // Test the connection
    async function testConnection() {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('apartments').select('count').limit(1);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Supabase connection successful:', data);
        setStatus('success');
      } catch (err) {
        console.error('Connection error:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Environment Variables Status:</h3>
        {envStatus === 'checking' && <div className="text-blue-600">Checking environment variables...</div>}
        {envStatus === 'ok' && <div className="text-green-600">✅ Environment variables are present</div>}
        {envStatus === 'missing' && <div className="text-red-600">❌ Environment variables are missing</div>}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Debug Information:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>URL Present: {debugInfo.hasUrl ? '✅' : '❌'}</p>
          <p>Key Present: {debugInfo.hasKey ? '✅' : '❌'}</p>
          <p>URL Length: {debugInfo.urlLength}</p>
          <p>Key Length: {debugInfo.keyLength}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Connection Status:</h3>
        {status === 'loading' && <div className="text-blue-600">Testing connection...</div>}
        {status === 'success' && <div className="text-green-600">✅ Successfully connected to Supabase!</div>}
        {status === 'error' && (
          <div className="text-red-600">
            ❌ Connection failed: {errorMessage}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-800">Troubleshooting Tips:</h3>
          <ul className="list-disc list-inside text-red-700 mt-2">
            <li>Check if your .env file exists in the project root</li>
            <li>Verify that your .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
            <li>Make sure you've copied the correct values from your Supabase project settings</li>
            <li>Try restarting your development server</li>
            <li>Check the browser console for more detailed error messages</li>
          </ul>
        </div>
      )}
    </div>
  );
} 