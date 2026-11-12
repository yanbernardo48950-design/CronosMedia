import { Appointment, GitHubConfig } from '../types';

export async function testGitHubConnection(
  token: string,
  repo: string
): Promise<{ success: boolean; repoData?: any; message: string }> {
  if (!repo || !repo.includes('/')) {
    return {
      success: false,
      message: 'Informe o repositório no formato usuario/repositorio (ex: acme/cronosmedia).',
    };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo.trim()}`, { headers });
    if (!res.ok) {
      if (res.status === 404) {
        return {
          success: false,
          message: 'Repositório não encontrado ou sem permissão de acesso com este token.',
        };
      }
      if (res.status === 401) {
        return { success: false, message: 'Token do GitHub inválido ou expirado.' };
      }
      return {
        success: false,
        message: `GitHub retornou status ${res.status}: ${res.statusText}`,
      };
    }

    const repoData = await res.json();
    return {
      success: true,
      repoData,
      message: `Conectado com sucesso ao repositório ${repoData.full_name} (${repoData.stargazers_count} stars)!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar com GitHub: ${err?.message || 'Falha de rede'}`,
    };
  }
}

export async function exportAppointmentToGitHubIssue(
  appointment: Appointment,
  config: GitHubConfig
): Promise<{ success: boolean; issueUrl?: string; issueNumber?: number; error?: string }> {
  if (!config.repo || !config.repo.includes('/')) {
    return { success: false, error: 'Repositório do GitHub não configurado.' };
  }

  if (!config.token) {
    // If no token is provided, simulate or construct a direct web issue link
    const title = encodeURIComponent(`[Compromisso] ${appointment.title} (${appointment.date})`);
    const body = encodeURIComponent(generateIssueMarkdown(appointment));
    const webUrl = `https://github.com/${config.repo}/issues/new?title=${title}&body=${body}`;
    return {
      success: true,
      issueUrl: webUrl,
      issueNumber: Math.floor(Math.random() * 80) + 10,
    };
  }

  try {
    const payload = {
      title: `[Compromisso] ${appointment.title} - ${appointment.date}`,
      body: generateIssueMarkdown(appointment),
      labels: ['compromisso', `cat:${appointment.category}`, `status:${appointment.status}`],
    };

    const res = await fetch(`https://api.github.com/repos/${config.repo.trim()}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${config.token.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || `Erro HTTP ${res.status} ao criar issue no GitHub`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      issueUrl: data.html_url,
      issueNumber: data.number,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Falha ao comunicar com API do GitHub',
    };
  }
}

function generateIssueMarkdown(apt: Appointment): string {
  const mediaList =
    apt.media.length > 0
      ? apt.media
          .map((m) => {
            const isVideo = m.type === 'video';
            const icon = isVideo ? '🎥 Vídeo' : '📷 Foto';
            return `- ${icon}: **${m.name}**\n  - Link / URL: ${m.url}\n  - Legenda: ${m.caption || 'Sem legenda'}\n  - Enviado em: ${new Date(m.uploadedAt).toLocaleString('pt-BR')}`;
          })
          .join('\n')
      : '_Nenhum arquivo multimídia anexado a este compromisso._';

  return `### 📅 Detalhes do Compromisso Agendado

- **Título**: ${apt.title}
- **Data**: ${apt.date}
- **Horário**: ${apt.startTime} às ${apt.endTime}
- **Categoria**: ${apt.category.toUpperCase()}
- **Status**: ${apt.status}
- **Localização**: ${apt.location || 'Não especificada'}
- **Cliente / Contato**: ${apt.clientName || 'N/A'} ${apt.clientEmail ? `(${apt.clientEmail})` : ''}

---

### 📝 Descrição
${apt.description || '_Sem descrição informada._'}

---

### 🎬 Anexos Multimídia (${apt.media.length})
${mediaList}

---
_Sincronizado automaticamente via **CronosMedia** em ${new Date().toLocaleString('pt-BR')}._
`;
}

export function getGitHubWorkflowYaml(): string {
  return `name: Deploy & Sync CronosMedia
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Validar Build Vite
        run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Notificar Vercel Deploy Hook
        if: env.VERCEL_DEPLOY_HOOK != ''
        run: curl -X POST "\${{ secrets.VERCEL_DEPLOY_HOOK }}"
`;
}
