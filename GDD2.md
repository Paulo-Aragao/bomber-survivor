# 💣 BOMBER VAMPIRE — Game Design Document 3.0

**Versão Expandida — Estrutura Profissional para um Survivor com Identidade Própria**

---

# 🎯 Visão de Produto

**Gênero:** Action Roguelite / Survivor
**Plataforma:** Web (HTML5 Canvas)
**Engine:** Vanilla JavaScript
**Estilo:** Pixel Art Dark Retro

## North Star

> Criar um survivor focado em **controle espacial**, onde cada personagem muda drasticamente a forma de pensar o mapa.

O objetivo NÃO é competir com Vampire Survivors em escala — mas sim vencer em **identidade mecânica**.

---

# 🔥 Pilares de Design

### 1. Gameplay emergente

Builds devem criar situações inesperadas.

### 2. Clareza no caos

Mesmo com dezenas de inimigos, o jogador entende o que está acontecendo.

### 3. Decisões reais

Nada de perks que só dão +5%.

### 4. Runs com personalidade

O jogador deve lembrar da run depois.

### 5. Performance sólida

Survivor que trava morre cedo.

---

# 🎮 Controles (Padrão da Indústria)

| Ação      | Tecla        |
| --------- | ------------ |
| Mover     | WASD / Setas |
| Bombas    | SPACE        |
| Confirmar | ENTER        |
| Cancelar  | ESC          |
| Navegar   | Setas / A-D  |

**Removido:** Hold to confirm.

Motivo: reduz fricção e aumenta responsividade.

---

# 🧠 Estrutura Psicológica de Retenção

Survivors funcionam por loops de dopamina bem definidos.

## Micro Loop (1–5 segundos)

* matar inimigo
* pegar XP
* barra subir

👉 recompensa constante.

## Médio Loop (1–3 minutos)

* subir de nível
* escolher perk
* build começa a nascer

👉 sensação de agência.

## Macro Loop (runs completas)

* desbloquear personagens
* descobrir evoluções
* testar builds novas

👉 retenção verdadeira.

### Regra de Ouro:

> O jogador deve SEMPRE estar perto de algo excitante.

---

# 👾 Movimento dos Inimigos — GRID (Mantido Intencionalmente)

Isso é uma assinatura do jogo.

Benefícios:

* charme retrô
* leitura tática
* previsibilidade estratégica
* contraste com player livre

**Recomendação técnica:** interpolação visual entre tiles.

---

# 💣 Sistema de Bombas — Direção Moderna

Melhorias críticas:

* flash branco 1 frame antes da explosão
* hit stop de ~40ms
* screen shake leve
* preview com maior contraste

Impacto > realismo.

---

# 🧛 SISTEMA DE PERSONAGENS (20 Ideias Fortes)

## Design Rule

Cada personagem deve alterar UMA destas dimensões:

* posicionamento
* timing
* risco
* controle de mapa
* mobilidade
* densidade de explosões

Se não mudar nenhuma → corte.

---

## 🧨 1. Bomber

Equilibrado.

Passive:

* +1 bomba
* -10% fuse

---

## 🌪️ 2. Wind Alchemist

Explosão em X que gira após 0.15s causando dano duplo.

* -20% alcance
* altíssimo skill expression

---

## 🧲 3. Gravity Nun

Bombas puxam inimigos antes de explodir.

Gameplay: setups e combos.

---

## 🔵 4. Chrono Bomber

+50% fuse
+50% dano

Armadilhas devastadoras.

---

## 🔥 5. Hell Engineer

Explosões deixam fogo persistente.

Zona proibida.

---

## ⚡ 6. Spark Runner

Bombas instantâneas.

* apenas 1 ativa
* cooldown maior

Alta agressividade.

---

## 🪞 7. Echo Phantom

Bombas repetem automaticamente após 1s.

Menor dano base.

Build de eco.

---

## 🩸 8. Blood Chemist

Inimigos mortos podem virar mini bombas.

Gameplay caótico e satisfatório.

---

## 🧊 9. Frost Warden

Explosões congelam tiles por 2s.

Controle absurdo de rota.

---

## 🌑 10. Void Monk

Bombas criam micro buracos negros.

Agrupamento extremo.

---

## 🐇 11. Blink Trickster

Dash curto ao colocar bomba.

Estilo hiper móvel.

---

## 🪤 12. Mine Architect

Bombas invisíveis para inimigos.

Jogabilidade tática.

---

## 🌊 13. Tide Caller

Explosões empurram inimigos em ondas.

Sobrevivência forte.

---

## 🎲 14. Chaos Engineer

Cada bomba tem forma aleatória.

Rejogabilidade enorme.

---

## 👑 15. Glass Saint

+100% dano
HP = 1

Personagem streamer-friendly.

---

## 🐢 16. Fortress Knight

Imune após ficar parado por 1s.

Build tank rara em survivors.

---

## 🌀 17. Temporal Hacker

Chance de bombas não consumirem cooldown.

Spam estratégico.

---

## 🌵 18. Thorn Herald

Inimigos que encostam sofrem dano massivo.

Build contato.

---

## ☢️ 19. Plague Brewer

Explosões infectam inimigos.

Dano que se propaga.

---

## 🧨 20. Overload Savant

Quanto mais bombas ativas, maior o dano.

Recompensa risco.

---

# ⭐ Sistema de Evoluções (EXTREMAMENTE RECOMENDADO)

Pegue dois perks específicos → crie um SUPER perk.

Isso gera descoberta e mastery.

## Exemplos Fortes

### 🔥 Napalm

Fire Trail + Increased Duration
→ fogo eterno por alguns segundos.

---

### 🌌 Singularity

Gravity + Shockwave
→ puxa e depois colapsa.

---

### 💥 Aftershock

Echo + Overcharge
→ terceira explosão massiva.

---

### ❄️ Absolute Zero

Freeze + Long Fuse
→ inimigos param completamente.

---

### 🩸 Blood Reactor

Blood Bomb + Chain Reaction
→ mapa vira um dominó.

---

### ⚡ Quantum Detonation

Instant Bomb + Cooldown perks
→ múltiplas explosões quase simultâneas.

---

### 🧲 Event Horizon

Void + Magnetism
→ tela inteira puxa levemente.

---

# 🧠 Como Evitar Fadiga de Build

Fadiga acontece quando todas as runs convergem.

## Soluções

### ✅ Personagens MUITO diferentes

Não apenas números.

### ✅ Perks transformadores

Nada de +3%.

### ✅ Evoluções raras

Jogador persegue combinações.

### ✅ Pools semi-randômicos

Garanta diversidade nas ofertas.

### ✅ Perks mutuamente exclusivos

Exemplo:

Glass Cannon ❌ Fortress

Escolhas dolorosas criam memória.

---

# 📈 Curva Ideal de Dificuldade

## 0–3 minutos

Jogador se sente poderoso.

Objetivo: entrar no flow.

---

## 3–6 minutos

Pressão cresce.

Elites aparecem.

Jogador precisa de build.

---

## 6–10 minutos

Mapa começa a fechar.

Momento “oh shit”.

---

## 10–15 minutos

Teste real da build.

Aqui nascem as histórias.

---

## Pós 15

Modo sobrevivência.

Densidade controlada — não spam infinita.

Escalar HP > escalar quantidade.

---

# 👑 Elite Enemies

Spawn periódico.

Características:

* maiores
* aura
* mais HP

Dropam baús com múltiplos perks.

Picos de dopamina são ESSENCIAIS.

---

# 💎 Sistema de XP Anti-Lag (Obrigatório)

## XP Closure

Threshold: ~80 gems.

Novas gems viram:

xpBank += valor

Ao coletar:

xpTotal += xpBank
xpBank = 0

Spawn ocasional de uma gem gigante para feedback.

---

# ⚙️ OTIMIZAÇÕES CRÍTICAS (Canvas)

## Object Pooling — obrigatório

Nunca instanciar durante caos.

Pools para:

* inimigos
* gems
* partículas
* explosões

---

## Spatial Partition

Divida o mapa logicamente.

Colisões locais apenas.

---

## Offscreen Culling

Não renderizar fora da câmera.

Gigante para FPS.

---

## Enemy Cap Inteligente

maxEnemies = 120 + minutos * 15

Mais HP é melhor que mais entidades.

---

## Redução de partículas

Prefira impacto visual.

Não micro partículas.

---

# 🎯 Estrutura de Perks — Direção

Meta inicial: **25–35 perks excelentes**.

Não 80 medianos.

Pergunta obrigatória ao criar um perk:

> “Isso muda como o jogador pensa?”

Se não → corte.

---

# 🚀 Roadmap Ideal

## PASSO 1 — Performance

* pooling
* culling
* xp closure
* enemy cap

Sem isso, survivor quebra.

---

## PASSO 2 — Personagens (3 primeiro)

* Bomber
* Wind
* Gravity

Já criam diversidade enorme.

---

## PASSO 3 — Perks transformadores

---

## PASSO 4 — Elites + Baús

Altíssimo impacto na diversão.

---

## PASSO 5 — Evoluções

Poucas já mudam percepção.

---

## PASSO 6 — Polimento

* hit stop
* screen shake
* flashes

Sensação > números.

---

# 🔮 Direção Estratégica Final

Se bem executado, este jogo não será visto como:

> “um clone de survivor com bombas”

Mas sim como:

> **um survivor tático de controle espacial.**

A bomba giratória tem potencial real de virar mecânica assinatura.

Priorize identidade — não escala.

Jogos memoráveis são os que fazem algo que ninguém mais faz.
