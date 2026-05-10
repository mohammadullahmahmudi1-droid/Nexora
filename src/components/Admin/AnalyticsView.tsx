/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, MessageSquare, MousePointer2 } from 'lucide-react';

const data = [
  { name: 'Mon', users: 400, messages: 240, ads: 12 },
  { name: 'Tue', users: 520, messages: 350, ads: 18 },
  { name: 'Wed', users: 480, messages: 420, ads: 15 },
  { name: 'Thu', users: 610, messages: 510, ads: 22 },
  { name: 'Fri', users: 780, messages: 680, ads: 31 },
  { name: 'Sat', users: 950, messages: 890, ads: 45 },
  { name: 'Sun', users: 1100, messages: 1050, ads: 58 },
];

const categoryData = [
  { name: 'Creator Mode', value: 45, color: '#8b5cf6' },
  { name: 'Business Mode', value: 35, color: '#3b82f6' },
  { name: 'General', value: 20, color: '#64748b' },
];

export default function AnalyticsView() {
  const gridColor = '#e4e4e7';
  const textColor = '#52525b';
  const tooltipBg = '#ffffff';
  const tooltipBorder = '#e4e4e7';

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Platform Analytics</h2>
        <p className="text-zinc-500">Deep dive into user behavior and platform growth.</p>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* User Growth */}
        <div className="p-6 lg:p-8 bg-white border border-zinc-200 rounded-[2rem] space-y-6 shadow-xl transition-colors">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-bold flex items-center gap-2 text-zinc-700">
                <Users className="w-4 h-4 text-blue-500" /> User Growth
              </h3>
              <select className="bg-zinc-50 border-none rounded-lg text-[10px] uppercase font-bold tracking-widest px-2 py-1 outline-none text-zinc-600 w-full sm:w-auto">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px'}}
                    itemStyle={{color: '#000'}}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Message Activity */}
        <div className="p-6 lg:p-8 bg-white border border-zinc-200 rounded-[2rem] space-y-6 shadow-xl transition-colors">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-bold flex items-center gap-2 text-zinc-700">
                <MessageSquare className="w-4 h-4 text-purple-500" /> Messaging Activity
              </h3>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /><span className="text-[10px] text-zinc-500 uppercase font-bold">Messages</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-400" /><span className="text-[10px] text-zinc-500 uppercase font-bold">Avg</span></div>
              </div>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#f4f4f5', opacity: 0.4}}
                    contentStyle={{backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px'}}
                    itemStyle={{color: '#000'}}
                  />
                  <Bar dataKey="messages" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* AI Mode Distribution */}
        <div className="p-6 lg:p-8 bg-white border border-zinc-200 rounded-[2rem] space-y-6 shadow-xl transition-colors">
           <h3 className="font-bold flex items-center gap-2 text-zinc-700">
              <TrendingUp className="w-4 h-4 text-orange-500" /> AI Mode Usage
           </h3>
           <div className="h-64 flex items-center justify-between gap-4">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                        data={categoryData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {categoryData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px'}} />
                   </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                 {categoryData.map((cat) => (
                   <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                         <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: cat.color}} />
                         <span className="text-zinc-700 font-medium truncate">{cat.name}</span>
                      </div>
                      <span className="text-zinc-400 font-bold ml-2 text-[10px] sm:text-xs">{cat.value}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Ad Performance */}
        <div className="p-6 lg:p-8 bg-white border border-zinc-200 rounded-[2rem] space-y-6 shadow-xl transition-colors">
           <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-zinc-700">
                <MousePointer2 className="w-4 h-4 text-green-500" /> Ad Click Performance
              </h3>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px'}}
                    itemStyle={{color: '#000'}}
                  />
                  <Line type="stepAfter" dataKey="ads" stroke="#10b981" strokeWidth={3} dot={{fill: '#10b981', r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
