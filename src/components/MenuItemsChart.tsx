
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MenuItemsChartProps {
  data: Array<{
    name: string;
    items: number;
  }>;
}

const MenuItemsChart = ({ data }: MenuItemsChartProps) => {
  return (
    <Card className="bg-white border border-gray-200 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-black">Menu Items by Section</CardTitle>
        <CardDescription className="text-sm">Number of items in each menu section</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              fontSize={11}
              tick={{ fill: '#374151' }}
            />
            <YAxis 
              fontSize={11}
              tick={{ fill: '#374151' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="items" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MenuItemsChart;
