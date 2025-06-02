import { db, doc, updateDoc, getDoc, Timestamp, increment } from '@/lib/firebase';

export const useQRTracking = () => {
  const trackQRScan = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      // Get current data
      const restaurantDoc = await getDoc(restaurantRef);
      if (!restaurantDoc.exists()) return;

      const data = restaurantDoc.data();
      let dailyScans = data?.dailyScans || [];
      
      // Update today's count
      const todayIndex = dailyScans.findIndex(scan => scan.date === dateKey);
      if (todayIndex >= 0) {
        dailyScans[todayIndex].count += 1;
      } else {
        dailyScans.push({ date: dateKey, count: 1 });
      }

      // Keep only last 30 days
      dailyScans.sort((a, b) => b.date.localeCompare(a.date));
      dailyScans = dailyScans.slice(0, 30);

      // Update Firestore
      await updateDoc(restaurantRef, {
        qrScans: increment(1),
        lastScanDate: Timestamp.now(),
        lastScanDay: dateKey,
        dailyScans
      });

    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  };

  return { trackQRScan };
};
