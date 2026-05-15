import React from 'react';
import { render } from 'ink';
import App from './App.js';

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  process.stderr.write(`\n  [tvdev] Node.js ${process.versions.node} is not supported. Upgrade to Node 18 LTS or newer.\n\n`);
  process.exit(1);
}
if (nodeMajor % 2 !== 0) {
  process.stderr.write(`\n  [tvdev] Warning: Node.js ${process.versions.node} is an odd (non-LTS) release. Some platform tools may be unstable. Recommended: Node 18, 20, or 22 LTS.\n\n`);
}

render(<App />, { exitOnCtrlC: false });
