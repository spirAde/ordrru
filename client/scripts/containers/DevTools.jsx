import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

/**
 * redux dev tools
 * */
export default createDevTools(
  <DockMonitor toggleVisibilityKey="H" changePositionKey="Q" defaultIsVisible={true}>
    <LogMonitor />
  </DockMonitor>
);
