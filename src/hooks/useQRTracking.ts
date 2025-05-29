import { db, doc, updateDoc, getDoc, Timestamp, increment } from '@/lib/firebase';

export const useQRTracking = () => {
  const trackQRScan = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        qrScans: increment(1),
        lastScanDate: Timestamp.now(),
        lastScanDay: new Date().toDateString()
      });
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  };

  return { trackQRScan };
};
