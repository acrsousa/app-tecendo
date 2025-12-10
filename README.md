# 🌿 Tecendo Saúde

> Sistema de telemedicina offline-first para regiões remotas da Amazônia.

---

## 📋 Sobre

O **Tecendo Saúde** é uma Single Page Application (SPA) projetada para conectar pacientes e profissionais de saúde em localidades com conectividade intermitente. O sistema prioriza o funcionamento offline, sincronizando automaticamente quando há rede disponível.

Objetivos:
- Permitir atendimentos e registro de dados de saúde em áreas remotas.
- Garantir que pacientes possam acessar conteúdos educativos e seus registros mesmo sem internet.
- Sincronizar dados de forma segura e eficiente quando houver conectividade.

---

## ✨ Principais Funcionalidades

### Área do Paciente
- Login simplificado por CPF (validação local e remota).
- Cadastro e envio de queixas com suporte a:
  - Texto
  - Fotos
  - Vídeos (até 1 min)
  - Áudios (gravação via MediaRecorder)
- Biblioteca "Saiba Mais" com áudios e textos pré-carregados que funcionam offline.
- Histórico de atendimentos com visualização de respostas de profissionais.
- Indicador de status de sincronização (offline / sincronizando / sincronizado).

### Área do Profissional
- Dashboard com atendimentos pendentes e cadastros incompletos.
- Gestão de medicamentos (tipo, dosagem, horários, vigência).
- Prontuário completo:
  - Dados demográficos
  - Comorbidades
  - Metas de saúde (PA mínimo/máximo, glicemia, peso)
  - Histórico de uso/vícios
- Chat de atendimento (limitado a 5 interações por caso).
- Busca de pacientes por CPF ou nome.

### Sincronização & Mídias
- Sincronização bidirecional com Supabase (Postgres + Storage).
- Loop `syncManager()` executando periodicamente (5–15s) para enviar/receber atualizações.
- Armazenamento local de mídias (áudios, fotos, vídeos) e envio diferido quando online.

---

## 🏗️ Arquitetura Técnica

- Frontend: React 18 (via Babel Standalone para evitar passos de build complexos).
- Estilização: TailwindCSS (via CDN).
- Persistência local: Dexie.js (IndexedDB).
  - Tabelas:
    - `perfil` — dados do paciente/profissional
    - `registros` — atendimentos e mensagens
    - `midias` — blobs de fotos/vídeos/áudios
    - `medicamentos` — prescrições e horários
- Backend / Sync: Supabase (Postgres + Storage)
- Aplicativo Android: Wrapper (Cordova ou Capacitor) que serve o `index.html` localmente no APK.

---

## 📂 Arquivos Principais do Projeto

- `index.html` — aplicação inteira (HTML, CSS, JS) num único arquivo.
- `app-tecendo.apk` — APK Android que carrega `index.html` localmente (via Cordova/Capacitor).
- `audios/` — pasta opcional com conteúdos de áudio pré-carregados.

---

## 🚀 Como Rodar (Desenvolvimento / Teste)

Opção 1 — Web (rápido, sem build):
1. Coloque `index.html` (e `audios/` se houver) numa pasta.
2. Execute um servidor estático simples (ex.: Python):
   ```bash
   python -m http.server 8000
   ```
3. Abra no navegador: `http://localhost:8000/index.html`

Requisitos do navegador:
- Suporte a IndexedDB e MediaRecorder API (Chrome, Firefox, Edge, Safari atualizados).

Opção 2 — Produção (hospedagem estática):
- Faça upload de `index.html` e da pasta `audios/` para qualquer serviço de hosting estático (GitHub Pages, Netlify, Vercel, S3 + CloudFront, Apache/Nginx).

Opção 3 — Android (APK):
- O APK (`app-tecendo.apk`) já carrega o `index.html` localmente. Para criar um novo APK a partir do código:
  - Usando Capacitor:
    - npm install @capacitor/core @capacitor/cli
    - npx cap init
    - npx cap add android
    - Copie `index.html` e assets para `android/app/src/main/assets/`
    - npx cap open android (build no Android Studio)
  - Ou usando Cordova:
    - cordova create tecendo
    - cordova platform add android
    - Substitua `www/index.html` pelo seu `index.html`
    - cordova build android

Permissões necessárias no Android:
- CAMERA
- RECORD_AUDIO (microfone)
- READ/WRITE_EXTERNAL_STORAGE (se usar armazenamento externo)
- INTERNET (para sincronização)

---

## ⚙️ Configuração do Supabase

No topo do `index.html` configure as variáveis:

```javascript
const SUPABASE_URL = 'https://rucpqwojmgnqibeskaaj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_...'; // Insira sua Public Key
```

Observações:
- Use a Public (anon) key apenas para operações seguras e públicas. Para operações sensíveis, implemente regras no Supabase (políticas RLS) e endpoints server-side.
- Monitore o uso de Storage (plano gratuito tem limite ~1GB).

Modelos de tabelas (exemplo resumido):
- profiles (id, cpf, nome, tipo:[paciente|profissional], metadata...)
- records (id, profile_id, tipo, texto, timestamp, sync_status)
- medias (id, record_id, filename, mime, size, local_blob_ref, uploaded_url)
- medications (id, profile_id, nome, dosagem, horarios, ativo, prescritor_id)

---

## 🔐 Segurança e Privacidade

- Transmissão via HTTPS.
- Dados locais ficam no IndexedDB do dispositivo; orientações para proteção física do dispositivo são recomendadas.
- Em produção, é recomendado:
  - Autenticação reforçada (SMS/OTP ou integração com identidade oficial).
  - Políticas RLS no Supabase.
  - Criptografia a nível de campo para dados sensíveis se requerido.
  - Backups regulares do banco (Supabase exportações).
  - Nunca versionar chaves: use `.env`/variáveis do deploy para gerar `env.js` (já ignorado no git) com `window.__ENV = { SUPABASE_URL, SUPABASE_KEY }`. Gere nova chave se alguma foi exposta.

## ⚠️ Limitações e Recomendações
  - Vídeos hospedados externamente (ej. YouTube) requerem conexão ativa.
  - O plano gratuito do Supabase tem limitações de storage; controlar uploads de vídeo é importante.
  - Navegadores antigos ou dispositivos muito antigos podem não suportar MediaRecorder ou IndexedDB de forma estável.
  - Testar cenários de sincronização com filas de conflitos e retries é essencial.

---

## ⚠️ Limitações e Recomendações

- Vídeos hospedados externamente (ej. YouTube) requerem conexão ativa.
- O plano gratuito do Supabase tem limitações de storage; controlar uploads de vídeo é importante.
- Navegadores antigos ou dispositivos muito antigos podem não suportar MediaRecorder ou IndexedDB de forma estável.
- Testar cenários de sincronização com filas de conflitos e retries é essencial.

---

## 🧭 Regiões e UBS (pré-configuradas)

Regiões (municípios) incluídas no projeto:
- Santarém, Belterra, Mojuí dos Campos, Alenquer, Curuá, Óbidos, Oriximiná, Terra Santa, Faro, Juruti, Monte Alegre, Almeirim, Prainha

Unidades Básicas de Saúde (exemplos):
- UBS Antônio Evangelista
- UBS Boa Esperança
- UBS Divinópolis
- UBS Márcio Marinho
- UBS Haroldo Martins
- UBS Maria Bibiana da Silva
- UBS Nadime Miranda
- UBS Neli Loeblein
- UBS Vicente Alves da Silva

---

## 🛠️ Roadmap / Próximos Recursos Sugeridos

- Notificações push para avisar pacientes sobre novas respostas.
- Geração de PDF do prontuário para impressão nas UBS.
- Gráficos de evolução das metas (glicemia / pressão / peso).
- Integração com sistemas de saúde governamentais (e-SUS) via API.
- Camada de verificação adicional no login (OTP/SMS).
- Mecanismos avançados de resolução de conflitos na sincronização.

---

## 🤝 Contribuição

Contribuições são bem-vindas:
1. Fork no repositório.
2. Crie uma branch feature/bugfix.
3. Abra um Pull Request descrevendo a mudança.

Por favor, abra issues para bugs/funcionalidades antes de grandes mudanças de arquitetura.

---

## 📝 Licença

Escolha uma licença adequada para o projeto (ex.: MIT, AGPL, GPL). Recomenda-se adicionar um arquivo `LICENSE` na raiz do repositório.

---

## Contato
Desenvolvido para o projeto "Tecendo Linhas do Cuidado Integral à Saúde na Amazônia".  
Se precisar, entre em contato com os mantenedores do projeto para informações adicionais ou acesso ao backend Supabase.
