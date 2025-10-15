import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

interface ActivityEffectiveness {
  breathing: number;
  stretching: number;
  gratitude: number;
  [key: string]: number;
}

interface InsightData {
  correlationWithSleep: number;
  weeklyPattern: string;
  activityEffectiveness: ActivityEffectiveness;
}

const AdvancedAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<InsightData>({
    correlationWithSleep: 0.72,
    weeklyPattern: 'Better moods on Wednesdays',
    activityEffectiveness: {
      breathing: 0.8,
      stretching: 0.6,
      gratitude: 0.9
    }
  });

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Data-Backed Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Sleep Impact</h3>
          <Progress value={insights.correlationWithSleep * 100} />
          <p className="mt-2 text-sm text-gray-600">
            {Math.round(insights.correlationWithSleep * 100)}% correlation between sleep and mood
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Weekly Pattern</h3>
          <p className="text-sm text-gray-600">{insights.weeklyPattern}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Activity Effectiveness</h3>
        <div className="space-y-4">
          {Object.entries(insights.activityEffectiveness).map(([activity, effectiveness]) => (
            <div key={activity}>
              <div className="flex justify-between mb-1">
                <span className="text-sm capitalize">{activity}</span>
                <span className="text-sm text-gray-600">
                  {Math.round(effectiveness * 100)}%
                </span>
              </div>
              <Progress value={effectiveness * 100} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;