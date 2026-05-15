import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Loader from '../components/Loader.js';
import { ICONS, PLATFORM_META } from '../theme.js';
import * as webos from '../utils/webos.js';
import * as tizen from '../utils/tizen.js';

const UTILS = { webos, tizen };

const WEBOS_FALLBACK = [
  { name: 'webapp',        description: 'Basic web application' },
  { name: 'hosted_webapp', description: 'Hosted web application' },
  { name: 'js_service',    description: 'JavaScript service' },
  { name: 'qmlapp',        description: 'QML application' },
];

const TIZEN_FALLBACK = [
  { name: 'WebBasicapp',    description: 'Basic Tizen web app' },
  { name: 'WebUIApplication', description: 'Tizen UI framework app' },
  { name: 'BasicProject',  description: 'Minimal project' },
];

const STEPS = { SELECT_TPL: 0, FILL_FORM: 1, DONE: 2 };

const WEBOS_FIELDS  = ['appId', 'title', 'version', 'outDir'];
const TIZEN_FIELDS  = ['name', 'outDir'];

const FIELD_LABELS = {
  appId:  'App ID',
  title:  'Title',
  version: 'Version',
  outDir: 'Output Dir',
  name:   'Project Name',
};

const FIELD_DEFAULTS = {
  webos:  { appId: 'com.example.app', title: 'My App', version: '1.0.0', outDir: './myapp' },
  tizen:  { name: 'MyTizenApp', outDir: '.' },
};

export default function Generate({ focused, platform }) {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [step,      setStep]      = useState(STEPS.SELECT_TPL);
  const [tplIdx,    setTplIdx]    = useState(0);
  const [fieldIdx,  setFieldIdx]  = useState(0);
  const [form,      setForm]      = useState({ ...(FIELD_DEFAULTS[platform] ?? FIELD_DEFAULTS.webos) });
  const [working,   setWorking]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const meta   = PLATFORM_META[platform];
  const utils  = UTILS[platform];
  const fields = platform === 'tizen' ? TIZEN_FIELDS : WEBOS_FIELDS;
  const fallback = platform === 'tizen' ? TIZEN_FALLBACK : WEBOS_FALLBACK;

  useEffect(() => {
    utils.listTemplates()
      .then(t => setTemplates(t.length ? t : fallback))
      .catch(() => setTemplates(fallback))
      .finally(() => setLoading(false));
  }, [platform]);

  useInput(async (input, key) => {
    if (!focused) return;

    if (step === STEPS.SELECT_TPL) {
      if (key.upArrow)   setTplIdx(i => Math.max(0, i - 1));
      if (key.downArrow) setTplIdx(i => Math.min(templates.length - 1, i + 1));
      if (key.return)    setStep(STEPS.FILL_FORM);
    }

    if (step === STEPS.FILL_FORM) {
      if (key.escape) { setStep(STEPS.SELECT_TPL); setFieldIdx(0); return; }
      if (key.tab || key.return) {
        if (fieldIdx < fields.length - 1) {
          setFieldIdx(f => f + 1);
        } else {
          setWorking(true);
          setError(null);
          try {
            let out;
            if (platform === 'tizen') {
              out = await utils.generateApp({
                template: templates[tplIdx].name,
                name:     form.name,
                outDir:   form.outDir,
              });
            } else {
              out = await utils.generateApp({
                template: templates[tplIdx].name,
                outDir:   form.outDir,
                appId:    form.appId,
                title:    form.title,
                version:  form.version,
              });
            }
            setResult(out || `App created at ${form.outDir ?? form.name}`);
            setStep(STEPS.DONE);
          } catch (e) {
            setError(e.message);
          }
          setWorking(false);
        }
      }
    }

    if (step === STEPS.DONE) {
      if (key.return || input === 'r') {
        setStep(STEPS.SELECT_TPL);
        setResult(null);
        setForm({ ...(FIELD_DEFAULTS[platform] ?? FIELD_DEFAULTS.webos) });
        setFieldIdx(0);
      }
    }
  }, { isActive: focused });

  if (loading) return <Box padding={2}><Loader label="Loading templates..." color={meta.color} /></Box>;

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text bold color={meta.color}>{ICONS.generate}  Generate App  <Text color="gray">[{meta.label}]</Text></Text>

      {error && (
        <Box borderStyle="round" borderColor="red" paddingX={1}>
          <Text color="red">{ICONS.cross}  {error}</Text>
        </Box>
      )}

      {working && <Loader label="Generating app..." color={meta.color} />}

      {step === STEPS.SELECT_TPL && !working && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={1} paddingY={1} gap={1}>
          <Text bold>Select Template</Text>
          {templates.map((t, i) => (
            <Box key={t.name}>
              <Text
                bold={focused && i === tplIdx}
                color={focused && i === tplIdx ? meta.color : 'white'}
              >
                {focused && i === tplIdx ? '▶ ' : '  '}
                <Text bold>{t.name.padEnd(20)}</Text>
                <Text dimColor>  {t.description}</Text>
              </Text>
            </Box>
          ))}
          <Text dimColor marginTop={1}>↑↓ select  ⏎ continue</Text>
        </Box>
      )}

      {step === STEPS.FILL_FORM && !working && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold>
            Template: <Text color={meta.color}>{templates[tplIdx]?.name}</Text>
          </Text>
          {fields.map((field, i) => (
            <Box key={field}>
              <Text color={fieldIdx === i ? meta.color : 'gray'}>
                {(FIELD_LABELS[field] ?? field).padEnd(14)}
              </Text>
              {fieldIdx === i ? (
                <TextInput
                  value={form[field] ?? ''}
                  onChange={v => setForm(f => ({ ...f, [field]: v }))}
                  placeholder={FIELD_DEFAULTS[platform]?.[field] ?? field}
                />
              ) : (
                <Text color="white">{form[field] ?? ''}</Text>
              )}
            </Box>
          ))}
          <Text dimColor>Tab/Enter next  Last field Enter generates  Esc back</Text>
        </Box>
      )}

      {step === STEPS.DONE && (
        <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={2} paddingY={1} gap={1}>
          <Text bold color="green">{ICONS.check}  App Generated!</Text>
          <Text color="gray">{result}</Text>
          <Text dimColor>⏎ or [r] to generate another</Text>
        </Box>
      )}
    </Box>
  );
}
