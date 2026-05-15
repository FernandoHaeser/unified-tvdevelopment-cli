import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Loader from '../components/Loader.js';
import { ICONS, PLATFORM_META } from '../theme.js';
import * as tizen   from '../utils/tizen.js';
import * as android from '../utils/android.js';

const UTILS = { tizen, android };

const TASKS = {
  android: [
    { id: 'assembleDebug',   label: 'Debug Build',   hint: './gradlew assembleDebug' },
    { id: 'assembleRelease', label: 'Release Build',  hint: './gradlew assembleRelease' },
    { id: 'test',            label: 'Run Tests',      hint: './gradlew test' },
    { id: 'clean',           label: 'Clean',          hint: './gradlew clean' },
  ],
  tizen: [
    { id: 'build-web',  label: 'Build Web App',   hint: 'tizen build-web' },
    { id: 'package-wgt', label: 'Package → .wgt', hint: 'tizen package -t wgt' },
  ],
};

const STEPS = { SELECT: 0, DIR: 1, BUILDING: 2, DONE: 3 };

export default function Build({ focused, platform }) {
  const meta   = PLATFORM_META[platform];
  const utils  = UTILS[platform];
  const tasks  = TASKS[platform] ?? TASKS.android;

  const [taskIdx,  setTaskIdx]  = useState(0);
  const [step,     setStep]     = useState(STEPS.SELECT);
  const [projDir,  setProjDir]  = useState('.');
  const [working,  setWorking]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  async function runBuild() {
    setStep(STEPS.BUILDING);
    setError(null);
    setWorking(true);
    try {
      let out;
      if (platform === 'android') {
        out = await utils.buildProject({
          task:        tasks[taskIdx].id,
          projectDir:  projDir,
          useWrapper:  true,
        });
        setResult(out.success
          ? `Build successful${out.apkPath ? `\nAPK: ${out.apkPath}` : ''}`
          : 'Build failed — check output');
      } else {
        out = await utils.buildApp({ projectDir: projDir });
        setResult(out || 'Build complete');
      }
      setStep(STEPS.DONE);
    } catch (e) {
      setError(e.message);
      setStep(STEPS.DIR);
    }
    setWorking(false);
  }

  useInput(async (input, key) => {
    if (!focused) return;

    if (step === STEPS.SELECT) {
      if (key.upArrow)   setTaskIdx(i => Math.max(0, i - 1));
      if (key.downArrow) setTaskIdx(i => Math.min(tasks.length - 1, i + 1));
      if (key.return)    setStep(STEPS.DIR);
    }

    if (step === STEPS.DIR && key.return) await runBuild();
    if (step === STEPS.DIR && key.escape) setStep(STEPS.SELECT);

    if (step === STEPS.DONE && (key.return || input === 'r')) {
      setStep(STEPS.SELECT);
      setResult(null);
      setError(null);
    }
  }, { isActive: focused });

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text bold color={meta.color}>{ICONS.build}  Build  <Text color="gray">[{meta.label}]</Text></Text>

      {error && (
        <Box borderStyle="round" borderColor="red" paddingX={1}>
          <Text color="red">{ICONS.cross}  {error}</Text>
        </Box>
      )}
      {working && <Loader label="Building..." color={meta.color} />}

      {step === STEPS.SELECT && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={1} paddingY={1} gap={1}>
          <Text bold>Select Build Task</Text>
          {tasks.map((t, i) => (
            <Box key={t.id}>
              <Text
                bold={focused && i === taskIdx}
                color={focused && i === taskIdx ? meta.color : 'white'}
              >
                {focused && i === taskIdx ? '▶ ' : '  '}
                {t.label.padEnd(20)}
                <Text dimColor>  {t.hint}</Text>
              </Text>
            </Box>
          ))}
          <Text dimColor marginTop={1}>↑↓ select  ⏎ continue</Text>
        </Box>
      )}

      {step === STEPS.DIR && !working && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold>Task: <Text color={meta.color}>{tasks[taskIdx]?.label}</Text></Text>
          <Box>
            <Text color={meta.color}>Project Dir: </Text>
            <TextInput
              value={projDir}
              onChange={setProjDir}
              placeholder="."
            />
          </Box>
          <Text dimColor>⏎ build  Esc back</Text>
        </Box>
      )}

      {step === STEPS.DONE && (
        <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1}>
          <Text bold color="green">{ICONS.check}  Build Complete!</Text>
          <Text color="gray" wrap="wrap">{result}</Text>
          <Text dimColor>⏎ or [r] again</Text>
        </Box>
      )}
    </Box>
  );
}
