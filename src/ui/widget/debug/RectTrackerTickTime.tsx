import React from 'react';
import { RectTrackerService } from 'base/RectTrackerService';
import { useProperty$ } from 'editor/di';

const RectTrackerTickTime: React.FC = () => {
  const tickTime = useProperty$(RectTrackerService, 'tickCostTime$', 0);
  return <div>tick cost: {tickTime.toFixed(2)} ms</div>;
};

export default RectTrackerTickTime;
