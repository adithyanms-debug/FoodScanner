import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { NutritionInfo } from '../../types';
import { ClayCard } from './ClayCard';
import { cn } from '../../lib/utils';

interface ToggleChartProps {
    nutrition: NutritionInfo;
}

const COLORS = ['#6C63FF', '#4CAF50', '#FF9800'];

export const ToggleChart = ({ nutrition }: ToggleChartProps) => {
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
    const [servingSize, setServingSize] = useState<number>(1);

    const data = [
        { name: 'Protein', value: nutrition.protein * servingSize },
        { name: 'Carbs', value: nutrition.carbs * servingSize },
        { name: 'Fat', value: nutrition.fat * servingSize }
    ];

    return (
        <ClayCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-poppins font-semibold text-lg">Macros</h3>
                <div className="flex bg-gray-200 rounded-clay-button p-1 shadow-clay-inner">
                    <button
                        onClick={() => setChartType('pie')}
                        className={cn(
                            "px-3 py-1 rounded-clay-button text-sm font-medium transition-all duration-200",
                            chartType === 'pie' ? "bg-background shadow-clay-button text-accent" : "text-gray-500"
                        )}
                    >
                        Pie
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={cn(
                            "px-3 py-1 rounded-clay-button text-sm font-medium transition-all duration-200",
                            chartType === 'bar' ? "bg-background shadow-clay-button text-accent" : "text-gray-500"
                        )}
                    >
                        Bar
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">Serving Multiplier:</span>
                <select
                    value={servingSize}
                    onChange={(e) => setServingSize(Number(e.target.value))}
                    className="rounded-clay-input shadow-clay-inner py-1 px-3 text-sm focus:ring-0 border-none bg-gray-100"
                >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                </select>
            </div>

            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '8px 8px 20px #BEBEBE, -8px -8px 20px #EBEBEB' }}
                                itemStyle={{ color: '#212121', fontFamily: 'Inter' }}
                                formatter={(value: any) => [`${Number(value).toFixed(1)}g`]}
                            />
                        </PieChart>
                    ) : (
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '8px 8px 20px #BEBEBE, -8px -8px 20px #EBEBEB' }}
                                formatter={(value: any) => [`${Number(value).toFixed(1)}g`]}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={30}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
                {chartType === 'pie' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                        <span className="text-2xl font-bold font-poppins">{Math.round(nutrition.calories * servingSize)}</span>
                        <span className="text-xs text-gray-500 font-medium -mt-1">kcal</span>
                    </div>
                )}
            </div>

            {chartType === 'pie' && (
                <div className="flex justify-center gap-4 mt-2">
                    {data.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                            <span className="text-sm font-medium">{entry.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </ClayCard>
    );
};
