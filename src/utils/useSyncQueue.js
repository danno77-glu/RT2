import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import localforage from 'localforage';

export const useSyncQueue = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const keys = await localforage.keys();
      const pendingAudits = keys.filter(key => key.startsWith('audit-'));

      for (const key of pendingAudits) {
        const record = await localforage.getItem(key);

        if (record.photo_url && record.photo_url.startsWith('photo-')) {
          // Upload photo
          const photoData = await localforage.getItem(record.photo_url);
          if (photoData) {
            const { base64, contentType, name } = photoData;
            const fileExt = name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `damage-photos/${fileName}`;

            const byteCharacters = atob(base64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: contentType });

            const { error: uploadError } = await supabase.storage
              .from('audit-photos')
              .upload(filePath, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('audit-photos')
              .getPublicUrl(filePath);

            record.photo_url = publicUrl;
            await localforage.removeItem(record.photo_url); // Remove photo from localforage
          }
        }

        // Upload record
        const { error: recordError } = await supabase
          .from('damage_records')
          .insert([record]); // Use an array here

        if (recordError) throw recordError;

        // Remove record from localforage
        await localforage.removeItem(key);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      console.log('Device is online. Attempting to sync data...');
      syncData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return { syncData, isSyncing };
};
