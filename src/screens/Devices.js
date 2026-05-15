import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Loader from '../components/Loader.js';
import { ICONS, PLATFORM_META } from '../theme.js';
import * as webos   from '../utils/webos.js';
import * as tizen   from '../utils/tizen.js';
import * as amazon  from '../utils/amazon.js';
import * as android from '../utils/android.js';

const UTILS = { webos, tizen, amazon, android };
const MODES = { LIST: 'list', ADD: 'add', CONFIRM_REMOVE: 'confirm_remove' };

const WEBOS_FIELDS  = ['name', 'host', 'port', 'username', 'password'];
const ADB_FIELDS    = ['host', 'port'];
const TIZEN_FIELDS  = ['host', 'port'];

function getFields(platform) {
  if (platform === 'webos')  return WEBOS_FIELDS;
  if (platform === 'tizen')  return TIZEN_FIELDS;
  return ADB_FIELDS;
}

function getDefaultForm(platform) {
  if (platform === 'webos')  return { name: '', host: '', port: '22', username: 'root', password: '' };
  if (platform === 'tizen')  return { host: '', port: '26101' };
  return { host: '', port: '5555' };
}

function getFormLabel(field, platform) {
  if (field === 'port' && platform === 'webos')   return 'SSH Port';
  if (field === 'port' && platform === 'tizen')   return 'SDB Port';
  if (field === 'port')                            return 'ADB Port';
  return field.charAt(0).toUpperCase() + field.slice(1);
}

export default function Devices({ focused, platform, onDeviceChange }) {
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [mode,    setMode]      = useState(MODES.LIST);
  const [cursor,  setCursor]    = useState(0);
  const [status,  setStatus]    = useState(null);
  const [working, setWorking]   = useState(false);

  const meta   = PLATFORM_META[platform];
  const utils  = UTILS[platform];
  const fields = getFields(platform);

  const [form,      setForm]      = useState(getDefaultForm(platform));
  const [formField, setFormField] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const devs = await utils.listDevices().catch(() => []);
    setDevices(devs);
    setLoading(false);
  }, [platform]);

  useEffect(() => { load(); }, [platform]);

  useInput(async (input, key) => {
    if (!focused) return;

    if (mode === MODES.LIST) {
      if (key.upArrow)   setCursor(c => Math.max(0, c - 1));
      if (key.downArrow) setCursor(c => Math.min(devices.length - 1, c + 1));
      if (input === 'a') { setMode(MODES.ADD); setForm(getDefaultForm(platform)); setFormField(0); }
      if (input === 'd' && devices[cursor]) setMode(MODES.CONFIRM_REMOVE);
      if (input === 'r') { setStatus(null); load(); }

      if (input === 's' && devices[cursor] && platform === 'webos') {
        setWorking(true);
        try {
          await utils.setDefaultDevice(devices[cursor].name);
          onDeviceChange(devices[cursor]);
          setStatus({ ok: true, msg: `Default set to ${devices[cursor].name}` });
          await load();
        } catch (e) {
          setStatus({ ok: false, msg: e.message });
        }
        setWorking(false);
      }

      if ((key.return || input === 's') && devices[cursor] && platform !== 'webos') {
        onDeviceChange({ ...devices[cursor], default: true });
        setStatus({ ok: true, msg: `Active device set to ${devices[cursor].name ?? devices[cursor].serial}` });
      }
    }

    if (mode === MODES.ADD) {
      if (key.escape) { setMode(MODES.LIST); return; }
      if (key.tab || key.return) {
        if (formField < fields.length - 1) {
          setFormField(f => f + 1);
        } else {
          setWorking(true);
          try {
            if (platform === 'webos') {
              await utils.addDevice(form);
              setStatus({ ok: true, msg: `Device '${form.name}' added` });
            } else {
              const out = await utils.connectDevice({ host: form.host, port: parseInt(form.port) || undefined });
              setStatus({ ok: true, msg: out || `Connected to ${form.host}:${form.port}` });
            }
            await load();
            setMode(MODES.LIST);
          } catch (e) {
            setStatus({ ok: false, msg: e.message });
          }
          setWorking(false);
        }
      }
    }

    if (mode === MODES.CONFIRM_REMOVE) {
      if (input === 'y') {
        setWorking(true);
        try {
          if (platform === 'webos') {
            await utils.removeDevice(devices[cursor].name);
          } else {
            await utils.disconnectDevice({ host: devices[cursor].host, port: devices[cursor].port });
          }
          setStatus({ ok: true, msg: `Removed ${devices[cursor].name ?? devices[cursor].serial}` });
          setCursor(0);
          await load();
        } catch (e) {
          setStatus({ ok: false, msg: e.message });
        }
        setMode(MODES.LIST);
        setWorking(false);
      }
      if (input === 'n' || key.escape) setMode(MODES.LIST);
    }
  }, { isActive: focused });

  if (loading) return <Box padding={2}><Loader label="Loading devices..." color={meta.color} /></Box>;

  const addLabel = platform === 'webos' ? 'Add Device' : 'Connect Device';
  const removeLabel = platform === 'webos' ? 'Remove' : 'Disconnect';

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Text bold color={meta.color}>{meta.icon}  Device Manager</Text>

      {status && (
        <Box borderStyle="round" borderColor={status.ok ? 'green' : 'red'} paddingX={1}>
          <Text color={status.ok ? 'green' : 'red'}>
            {status.ok ? ICONS.check : ICONS.cross}  {status.msg}
          </Text>
        </Box>
      )}

      {working && <Loader label="Working..." color={meta.color} />}

      {mode === MODES.LIST && (
        <>
          <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={1}>
            <Box marginBottom={1}>
              <Text bold>{'Name / Serial'.padEnd(24)}</Text>
              <Text bold>{'Host'.padEnd(18)}</Text>
              <Text bold>Port</Text>
            </Box>
            {devices.length === 0 && <Text color="gray">  No devices. Press [a] to add / connect.</Text>}
            {devices.map((d, i) => (
              <Box key={d.name ?? d.serial}>
                <Text
                  bold={focused && i === cursor}
                  color={focused && i === cursor ? meta.color : d.default ? 'green' : 'white'}
                >
                  {focused && i === cursor ? '▶ ' : '  '}
                  {(d.name ?? d.serial).padEnd(22)}
                  <Text color="gray">{'  ' + (d.host ?? '').padEnd(16)}</Text>
                  <Text color="gray">{'  ' + String(d.port ?? '')}</Text>
                  {d.default && <Text color="green">  ★</Text>}
                </Text>
              </Box>
            ))}
          </Box>
          <Text dimColor>
            [a] {addLabel}  [d] {removeLabel}  {platform === 'webos' ? '[s] Set Default  ' : '[⏎] Set Active  '}[r] Refresh
          </Text>
        </>
      )}

      {mode === MODES.ADD && (
        <Box flexDirection="column" borderStyle="round" borderColor={meta.color} paddingX={2} paddingY={1} gap={1}>
          <Text bold color={meta.color}>{addLabel}</Text>
          {fields.map((field, i) => (
            <Box key={field}>
              <Text color={formField === i ? meta.color : 'gray'}>
                {getFormLabel(field, platform).padEnd(12)}
              </Text>
              {formField === i ? (
                <TextInput
                  value={form[field] ?? ''}
                  onChange={v => setForm(f => ({ ...f, [field]: v }))}
                  placeholder={field === 'port' ? (platform === 'tizen' ? '26101' : '5555') : `Enter ${field}...`}
                />
              ) : (
                <Text color="white">{form[field] || <Text dimColor>(empty)</Text>}</Text>
              )}
            </Box>
          ))}
          <Text dimColor>Tab/Enter next  Last field Enter submits  Esc cancel</Text>
        </Box>
      )}

      {mode === MODES.CONFIRM_REMOVE && devices[cursor] && (
        <Box borderStyle="round" borderColor="red" paddingX={2} paddingY={1}>
          <Text color="red">{removeLabel} </Text>
          <Text bold color="white">{devices[cursor].name ?? devices[cursor].serial}</Text>
          <Text color="red">? </Text>
          <Text color="yellow">[y] Yes  [n] No</Text>
        </Box>
      )}
    </Box>
  );
}
