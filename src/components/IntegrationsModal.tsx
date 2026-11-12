import React, { useState } from 'react';
import {
  X,
  Database,
  GitBranch,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { IntegrationsConfig, Appointment } from '../types';
import {
  testSupabaseConnection,
  syncAppointmentsToSupabase,
  fetchAppointmentsFromSupabase,
  getSupabaseSqlSchema,
} from '../services/supabaseService';
import {
  testGitHubConnection,
  exportAppointmentToGitHubIssue,
  getGitHubWorkflowYaml,
} from '../services/githubService';
import {
  testVercelConnection,
  triggerVercelDeploy,
  getVercelJsonConfig,
  getVercelEnvChecklist,
} from '../services/vercelService';

interface IntegrationsModalProps {
  config: IntegrationsConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (newConfig: IntegrationsConfig) => void;
  appointments: Appointment[];
  onImportAppointmentsFromSupabase?: (imported: Appointment[]) => void;
}

type TabType = 'supabase' | 'github' | 'vercel';

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  config,
  isOpen,
  onClose,
  onUpdateConfig,
  appointments,
  onImportAppointmentsFromSupabase,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('supabase');

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabase.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabase.anonKey);
  const [supabaseBucket, setSupabaseBucket] = useState(config.supabase.bucket || 'appointment-media');
  const [supabaseAutoSync, setSupabaseAutoSync] = useState(config.supabase.autoSync);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  // GitHub state
  const [githubToken, setGithubToken] = useState(config.github.token);
  const [githubRepo, setGithubRepo] = useState(config.github.repo);
  const [githubStatusMsg, setGithubStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [isExportingGitHub, setIsExportingGitHub] = useState(false);

  // Vercel state
  const [vercelDeployHook, setVercelDeployHook] = useState(config.vercel.deployHookUrl || '');
  const [vercelToken, setVercelToken] = useState(config.vercel.token || '');
  const [vercelProjectId, setVercelProjectId] = useState(config.vercel.projectId || '');
  const [vercelStatusMsg, setVercelStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isTestingVercel, setIsTestingVercel] = useState(false);
  const [isTriggeringVercel, setIsTriggeringVercel] = useState(false);

  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfigs = () => {
    const updated: IntegrationsConfig = {
      supabase: {
        ...config.supabase,
        url: supabaseUrl.trim(),
        anonKey: supabaseAnonKey.trim(),
        bucket: supabaseBucket.trim(),
        autoSync: supabaseAutoSync,
      },
      github: {
        ...config.github,
        token: githubToken.trim(),
        repo: githubRepo.trim(),
      },
      vercel: {
        ...config.vercel,
        deployHookUrl: vercelDeployHook.trim(),
        token: vercelToken.trim(),
        projectId: vercelProjectId.trim(),
      },
    };
    onUpdateConfig(updated);
  };

  // Supabase Actions
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);
    const res = await testSupabaseConnection({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      bucket: supabaseBucket.trim(),
      connected: false,
      autoSync: supabaseAutoSync,
    });
    setIsTestingSupabase(false);
    setSupabaseStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    if (res.success) {
      onUpdateConfig({
        ...config,
        supabase: {
          ...config.supabase,
          url: supabaseUrl.trim(),
          anonKey: supabaseAnonKey.trim(),
          bucket: supabaseBucket.trim(),
          connected: true,
          autoSync: supabaseAutoSync,
        },
      });
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseStatusMsg(null);
    const res = await syncAppointmentsToSupabase(appointments, {
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      bucket: supabaseBucket.trim(),
      connected: true,
      autoSync: supabaseAutoSync,
    });
    setIsSyncingSupabase(false);
    if (res.success) {
      setSupabaseStatusMsg({
        type: 'success',
        text: `${res.count} compromisso(s) sincronizados com sucesso no Supabase!`,
      });
      onUpdateConfig({
        ...config,
        supabase: {
          ...config.supabase,
          lastSyncAt: new Date().toISOString(),
          connected: true,
        },
      });
    } else {
      setSupabaseStatusMsg({
        type: 'error',
        text: `Erro ao sincronizar: ${res.error}`,
      });
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseStatusMsg(null);
    const res = await fetchAppointmentsFromSupabase({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      bucket: supabaseBucket.trim(),
      connected: true,
      autoSync: supabaseAutoSync,
    });
    setIsSyncingSupabase(false);
    if (res.success && res.data) {
      setSupabaseStatusMsg({
        type: 'success',
        text: `${res.data.length} compromisso(s) obtidos da nuvem Supabase!`,
      });
      if (onImportAppointmentsFromSupabase) {
        onImportAppointmentsFromSupabase(res.data);
      }
    } else {
      setSupabaseStatusMsg({
        type: 'error',
        text: `Erro ao carregar dados do Supabase: ${res.error}`,
      });
    }
  };

  // GitHub Actions
  const handleTestGitHub = async () => {
    setIsTestingGitHub(true);
    setGithubStatusMsg(null);
    const res = await testGitHubConnection(githubToken, githubRepo);
    setIsTestingGitHub(false);
    setGithubStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    if (res.success) {
      onUpdateConfig({
        ...config,
        github: {
          token: githubToken.trim(),
          repo: githubRepo.trim(),
          connected: true,
        },
      });
    }
  };

  const handleExportAllToGitHub = async () => {
    setIsExportingGitHub(true);
    setGithubStatusMsg(null);
    let count = 0;
    for (const apt of appointments) {
      const res = await exportAppointmentToGitHubIssue(apt, {
        token: githubToken.trim(),
        repo: githubRepo.trim(),
        connected: true,
      });
      if (res.success) count++;
    }
    setIsExportingGitHub(false);
    setGithubStatusMsg({
      type: 'success',
      text: `${count} compromisso(s) exportados como Issues no repositório ${githubRepo}!`,
    });
  };

  // Vercel Actions
  const handleTestVercel = async () => {
    setIsTestingVercel(true);
    setVercelStatusMsg(null);
    const res = await testVercelConnection(vercelToken, vercelProjectId);
    setIsTestingVercel(false);
    setVercelStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handleTriggerDeploy = async () => {
    setIsTriggeringVercel(true);
    setVercelStatusMsg(null);
    const res = await triggerVercelDeploy(vercelDeployHook);
    setIsTriggeringVercel(false);
    setVercelStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    if (res.success && res.deployment) {
      onUpdateConfig({
        ...config,
        vercel: {
          ...config.vercel,
          connected: true,
          lastDeployment: res.deployment,
        },
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Central de Integrações na Nuvem
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Gerencie a sincronização de agendamentos e mídia com Supabase, GitHub e Vercel.
            </p>
          </div>
          <button
            onClick={() => {
              handleSaveConfigs();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Service Tabs */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/30 px-6 gap-2">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase (Banco & Mídia)
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'github'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            GitHub (Issues & CI/CD)
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'vercel'
                ? 'border-black dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Rocket className="w-4 h-4" />
            Vercel (Deploy Contínuo)
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* ================= SUPABASE TAB ================= */}
          {activeTab === 'supabase' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs">
                <div className="space-y-1">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Supabase PostgreSQL & Storage Bucket
                  </h4>
                  <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    Armazena compromissos na tabela <code>public.appointments</code> e gerencia
                    arquivos de fotos e vídeos no bucket de storage <code>appointment-media</code>.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold shrink-0 ${
                    config.supabase.connected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {config.supabase.connected ? 'Conectado' : 'Modo Local / Desconectado'}
                </span>
              </div>

              {/* Status Message */}
              {supabaseStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    supabaseStatusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {supabaseStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{supabaseStatusMsg.text}</span>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzproject.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Supabase Anon Public Key (API Key)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Storage Bucket de Mídia
                    </label>
                    <input
                      type="text"
                      value={supabaseBucket}
                      onChange={(e) => setSupabaseBucket(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={supabaseAutoSync}
                        onChange={(e) => setSupabaseAutoSync(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Sincronização em tempo real (Auto-Sync)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  disabled={isTestingSupabase}
                  onClick={handleTestSupabase}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {isTestingSupabase ? 'Testando Conexão...' : 'Testar Conexão Supabase'}
                </button>

                <button
                  type="button"
                  disabled={isSyncingSupabase}
                  onClick={handleSyncToSupabase}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  Sincronizar Dados Agora ({appointments.length})
                </button>

                <button
                  type="button"
                  disabled={isSyncingSupabase}
                  onClick={handlePullFromSupabase}
                  className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Carregar da Nuvem
                </button>
              </div>

              {/* SQL Migration Script Box */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    Schema SQL do Banco Supabase
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getSupabaseSqlSchema(), 'sql')}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {copiedKey === 'sql' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Script SQL
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 text-neutral-300 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40 border border-neutral-800">
                  {getSupabaseSqlSchema()}
                </pre>
              </div>
            </div>
          )}

          {/* ================= GITHUB TAB ================= */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs">
                <div className="space-y-1">
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-indigo-600" />
                    GitHub Issues & Repositório
                  </h4>
                  <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                    Permite exportar compromissos multimídia diretamente como Issues no repositório
                    com link das fotos e vídeos, além de automação CI/CD via GitHub Actions.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold shrink-0 ${
                    config.github.connected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {config.github.connected ? 'Vinculado' : 'Não Configurado'}
                </span>
              </div>

              {githubStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    githubStatusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {githubStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{githubStatusMsg.text}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Repositório GitHub (usuario/repo)
                  </label>
                  <input
                    type="text"
                    placeholder="empresa/cronosmedia"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Personal Access Token (PAT) do GitHub
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_1234567890abcdef..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Requer escopo <code>repo</code> ou <code>public_repo</code> para criação de
                    issues.
                  </p>
                </div>
              </div>

              {/* GitHub Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  disabled={isTestingGitHub}
                  onClick={handleTestGitHub}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {isTestingGitHub ? 'Testando Conexão...' : 'Testar Conexão com Repositório'}
                </button>

                <button
                  type="button"
                  disabled={isExportingGitHub}
                  onClick={handleExportAllToGitHub}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {isExportingGitHub
                    ? 'Exportando...'
                    : `Exportar Todos os Compromissos (${appointments.length})`}
                </button>
              </div>

              {/* GitHub Actions YAML Preview */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    GitHub Actions Workflow (.github/workflows/deploy.yml)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getGitHubWorkflowYaml(), 'gh_yaml')}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {copiedKey === 'gh_yaml' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Workflow
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 text-neutral-300 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40 border border-neutral-800">
                  {getGitHubWorkflowYaml()}
                </pre>
              </div>
            </div>
          )}

          {/* ================= VERCEL TAB ================= */}
          {activeTab === 'vercel' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-xs">
                <div className="space-y-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-indigo-500" />
                    Vercel Edge & Cloud Deployment
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Hospede este aplicativo Vite com suporte a rotas SPA, cache de mídia e acionamento
                    instantâneo de novos deploys via Deploy Hooks.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold shrink-0 ${
                    config.vercel.connected
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {config.vercel.connected ? 'Ativo' : 'Deploy Hook Pronto'}
                </span>
              </div>

              {vercelStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    vercelStatusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {vercelStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{vercelStatusMsg.text}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                    Vercel Deploy Hook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../..."
                    value={vercelDeployHook}
                    onChange={(e) => setVercelDeployHook(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Encontrado no painel do seu projeto na Vercel em Settings &gt; Git &gt; Deploy
                    Hooks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Token Vercel (Opcional - API)
                    </label>
                    <input
                      type="password"
                      placeholder="ver_..."
                      value={vercelToken}
                      onChange={(e) => setVercelToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                      Project ID na Vercel (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="prj_xyz..."
                      value={vercelProjectId}
                      onChange={(e) => setVercelProjectId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Vercel Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  disabled={isTriggeringVercel}
                  onClick={handleTriggerDeploy}
                  className="px-3.5 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  {isTriggeringVercel ? 'Disparando Deploy...' : 'Disparar Novo Deploy na Vercel'}
                </button>

                {vercelToken && (
                  <button
                    type="button"
                    disabled={isTestingVercel}
                    onClick={handleTestVercel}
                    className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    {isTestingVercel ? 'Validando...' : 'Consultar Projetos na API'}
                  </button>
                )}
              </div>

              {/* Environment Variables Checklist for Vercel */}
              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Variáveis de Ambiente Recomendadas na Vercel
                </h5>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 divide-y divide-neutral-200 dark:divide-neutral-700 text-xs">
                  {getVercelEnvChecklist().map((env) => (
                    <div key={env.key} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                          {env.key}
                        </span>
                        <p className="text-[11px] text-neutral-500">{env.description}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 shrink-0">
                        {env.required ? 'Obrigatório' : 'Opcional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* vercel.json generator */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    Arquivo de Configuração (vercel.json)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getVercelJsonConfig(), 'vercel_json')}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {copiedKey === 'vercel_json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar vercel.json
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 text-neutral-300 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40 border border-neutral-800">
                  {getVercelJsonConfig()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50">
          <div className="text-[11px] text-neutral-500 font-mono">
            {config.supabase.connected && '✓ Supabase conectado'}
            {config.github.connected && ' · ✓ GitHub vinculado'}
            {config.vercel.connected && ' · ✓ Vercel ativo'}
          </div>

          <button
            onClick={() => {
              handleSaveConfigs();
              onClose();
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
