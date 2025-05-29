import { db, doc, updateDoc, getDoc, Timestamp, increment } from '@/lib/firebase';

export const useQRTracking = () => {
  const trackQRScan = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      // First get the current data to manage the daily scans array
      const restaurantDoc = await getDoc(restaurantRef);
      const data = restaurantDoc.data();
      
      // Initialize or get existing dailyScans
      let dailyScans = data?.dailyScans || [];
      
      // Find today's entry
      const todayEntry = dailyScans.find(scan => scan.date === dateKey);
      
      if (todayEntry) {
        // Update today's count
        dailyScans = dailyScans.map(scan => 
          scan.date === dateKey 
            ? { ...scan, count: scan.count + 1 }
            : scan
        );
      } else {
        // Add new entry for today
        dailyScans.push({ date: dateKey, count: 1 });
      }

      // Keep only last 7 days
      dailyScans.sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
      dailyScans = dailyScans.slice(0, 7); // Keep only last 7 days

      // Update Firestore
      await updateDoc(restaurantRef, {
        qrScans: increment(1),
        lastScanDate: Timestamp.now(),
        lastScanDay: dateKey,
        dailyScans: dailyScans
      });
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  };

  return { trackQRScan };
};
