import { VercelConfig } from '../types';

export async function testVercelConnection(
  token: string,
  projectId?: string
): Promise<{ success: boolean; projects?: any[]; message: string }> {
  if (!token) {
    return {
      success: false,
      message: 'Token de Acesso Pessoal (PAT) da Vercel é necessário para consultar a API.',
    };
  }

  try {
    const url = projectId
      ? `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId.trim())}`
      : 'https://api.vercel.com/v9/projects?limit=5';

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          message: 'Token da Vercel inválido ou sem permissão de leitura nos projetos.',
        };
      }
      return {
        success: false,
        message: `Vercel API retornou status ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const projectList = projectId ? [data] : (data.projects || []);

    return {
      success: true,
      projects: projectList,
      message: `Conectado à Vercel com sucesso! ${projectList.length} projeto(s) identificados.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar à API da Vercel: ${err?.message || 'Falha de rede'}`,
    };
  }
}

export async function triggerVercelDeploy(
  deployHookUrl: string
): Promise<{ success: boolean; message: string; deployment?: any }> {
  if (!deployHookUrl || !deployHookUrl.startsWith('https://api.vercel.com/v1/integrations/deploy/')) {
    return {
      success: false,
      message: 'Insira um URL válido de Deploy Hook da Vercel (ex: https://api.vercel.com/v1/integrations/deploy/...).',
    };
  }

  try {
    const res = await fetch(deployHookUrl.trim(), {
      method: 'POST',
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Falha ao acionar Deploy Hook (Status ${res.status})`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      message: 'Novo deploy disparado com sucesso na Vercel!',
      deployment: {
        id: data.job?.id || `dpl_${Date.now().toString(36)}`,
        state: 'BUILDING',
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao chamar Deploy Hook: ${err?.message || 'Erro de rede'}`,
    };
  }
}

export function getVercelJsonConfig(): string {
  return JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html',
        },
      ],
      headers: [
        {
          source: '/assets/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ],
    },
    null,
    2
  );
}

export function getVercelEnvChecklist(): Array<{ key: string; description: string; required: boolean }> {
  return [
    {
      key: 'VITE_SUPABASE_URL',
      description: 'URL do seu projeto Supabase (ex: https://xyz.supabase.co)',
      required: true,
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      description: 'Chave pública anônima (anon key) do Supabase para o cliente',
      required: true,
    },
    {
      key: 'VITE_APP_TITLE',
      description: 'Título exibido na barra superior da aplicação (opcional)',
      required: false,
    },
  ];
}
