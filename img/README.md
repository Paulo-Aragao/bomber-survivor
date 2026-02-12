# 🎨 Guia de Personagens - Bomber Vampire

Este guia explica como adicionar e gerenciar personagens no jogo Bomber Vampire usando sprite sheets do Universal LPC Spritesheet Generator.

---

## 📁 Estrutura de Pastas

Cada personagem deve ter sua própria pasta dentro de `img/`:

```
img/
├── README.md (este arquivo)
├── sprites.psd (arquivo de trabalho - opcional)
├── bomber/
│   ├── sprite.png
│   ├── character.char
│   └── credits.txt
├── wind/
│   ├── sprite.png
│   ├── character.char
│   └── credits.txt
└── gravity/
    ├── sprite.png
    ├── character.char
    └── credits.txt
```

### Arquivos Requeridos por Personagem

| Arquivo | Descrição | Obrigatório |
|---------|-----------|-------------|
| `sprite.png` | Sprite sheet do Universal LPC (832x1344px ou similar) | ✅ Sim |
| `character.char` | Arquivo de configuração do gerador LPC | ❌ Não* |
| `credits.txt` | Créditos dos artistas dos assets usados | ⚠️ Recomendado |

*O arquivo `.char` não é usado pelo jogo, mas é útil para re-editar o personagem no gerador LPC futuramente.

---

## 🆕 Como Adicionar um Novo Personagem

### Passo 1: Preparar o Sprite Sheet

1. Acesse o [Universal LPC Spritesheet Generator](http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/)
2. Crie seu personagem customizado
3. **Download** do sprite sheet PNG
4. **Salvar** o arquivo `.char` (botão "Save" no gerador)
5. **Copiar** os créditos da aba "Credits"

### Passo 2: Criar Pasta do Personagem

Crie uma nova pasta em `img/` com um nome descritivo (lowercase, sem espaços):

```bash
img/novo_personagem/
```

**Exemplos de nomes válidos:**
- `archer` (arqueiro)
- `ninja`
- `knight` (cavaleiro)
- `mage` (mago)

### Passo 3: Adicionar Arquivos

Coloque os arquivos na pasta criada:

```
img/novo_personagem/
├── sprite.png          # Sprite sheet baixado
├── character.char      # Arquivo .char salvo
└── credits.txt         # Cole os créditos aqui
```

**⚠️ IMPORTANTE**: O sprite sheet DEVE se chamar `sprite.png` (não personalize este nome).

### Passo 4: Atualizar o Código

#### 4.1 - Adicionar ao Sistema de Sprites (`js/sprites.js`)

Adicione o novo personagem ao array de sheets:

```javascript
const sheets = [
    { name: 'one', path: 'bomber/sprite.png' },
    { name: 'two', path: 'wind/sprite.png' },
    { name: 'three', path: 'gravity/sprite.png' },
    { name: 'four', path: 'novo_personagem/sprite.png' } // ← NOVO
];
```

Atualize o objeto `spriteSheets`:

```javascript
const spriteSheets = {
    one: null,
    two: null,
    three: null,
    four: null  // ← NOVO
};
```

#### 4.2 - Adicionar ao Array de Personagens (`js/player.js`)

Adicione o novo personagem ao array `CHARACTERS`:

```javascript
const CHARACTERS = [
    // ... personagens existentes ...
    {
        id: 'novo_personagem',
        icon: '🎯',  // Emoji para o card de seleção
        spriteSheet: 'four',  // Referência ao sprite carregado
        name: 'NOME DO PERSONAGEM',
        desc: 'Descrição das habilidades.',
        stats: 'Stats | Bônus | Penalidades',
        color: '#ff6600',  // Cor temática
        apply: (p) => {
            // Customize atributos do player aqui
            p.speed += 0.5;
            p.bombMax = 3;
            // ... etc
        }
    }
];
```

### Passo 5: Testar

1. Abra o jogo no navegador
2. Verifique o console (F12) para mensagens de carregamento
3. Na tela de seleção, o novo personagem deve aparecer
4. Teste o gameplay e animações

---

## 🎨 Especificações do Sprite Sheet

### Formato Universal LPC

- **Dimensões típicas**: 832x1344 pixels (13 colunas x 21 linhas)
- **Tamanho do frame**: 64x64 pixels
- **Formato**: PNG com transparência

### Animações de Movimento (Usadas pelo Jogo)

| Linha | Animação | Direção | Frames |
|-------|----------|---------|--------|
| 8 | Walk | ⬆️ Cima (North) | 9 |
| 9 | Walk | ⬅️ Esquerda (West) | 9 |
| 10 | Walk | ⬇️ Baixo (South) | 9 |
| 11 | Walk | ➡️ Direita (East) | 9 |

> **Nota**: Atualmente o jogo usa apenas as animações de caminhada. Outras linhas (ataque, morte, etc.) não são utilizadas mas podem ser implementadas no futuro.

---

## ⚙️ Personalizando Atributos

Os atributos do personagem são definidos na função `apply(p)`:

```javascript
apply: (p) => {
    // Bombas
    p.bombMax = 2;           // Quantidade de bombas simultâneas
    p.bombRange = 3;         // Alcance da explosão
    p.bombTimer = 100;       // Tempo até explosão (em frames)
    p.bombCooldownMax = 60;  // Tempo entre colocações
    p.bombShape = 'cross';   // Forma: 'cross', 'xshape', 'circle', 'star', 'line', 'full'
    
    // Player
    p.speed = 3.5;           // Velocidade de movimento
    p.maxHp = 5;             // Vida máxima
    p.armor = 1;             // Redução de dano
    
    // Utilidades
    p.magnetRange = 5;       // Alcance de coleta de XP
    p.xpMultiplier = 1.5;    // Multiplicador de XP
    
    // Habilidades especiais
    p.gravityBombs = true;   // Bombas puxam inimigos
    p.windSpin = true;       // Efeito giratório
}
```

---

## 🎭 Exemplos de Personagens

### Personagem Tanque (Alta Vida, Lento)

```javascript
{
    id: 'tank',
    icon: '🛡️',
    spriteSheet: 'five',
    name: 'TANK',
    desc: 'Muita vida, mas lento.',
    stats: '+5 HP | -30% Velocidade | +2 Armadura',
    color: '#888888',
    apply: (p) => {
        p.maxHp += 5;
        p.hp += 5;
        p.speed *= 0.7;
        p.armor += 2;
    }
}
```

### Personagem Velocista (Rápido, Frágil)

```javascript
{
    id: 'speedster',
    icon: '⚡',
    spriteSheet: 'six',
    name: 'SPEEDSTER',
    desc: 'Extremamente rápido, mas frágil.',
    stats: '+100% Velocidade | -2 HP | -Cooldown',
    color: '#ffff00',
    apply: (p) => {
        p.speed *= 2;
        p.maxHp -= 2;
        p.hp = p.maxHp;
        p.bombCooldownMax = Math.floor(p.bombCooldownMax * 0.5);
    }
}
```

---

## 📋 Checklist de Adição

- [ ] Sprite sheet baixado do Universal LPC Generator
- [ ] Pasta criada em `img/nome_personagem/`
- [ ] Arquivos organizados: `sprite.png`, `character.char`, `credits.txt`
- [ ] Adicionado ao `spriteSheets` em `sprites.js`
- [ ] Adicionado aos `sheets` array em `sprites.js`
- [ ] Adicionado ao `CHARACTERS` array em `player.js`
- [ ] Definidos atributos na função `apply()`
- [ ] Testado no jogo (carregamento, seleção, gameplay)
- [ ] Créditos dos artistas preservados

---

## 🔧 Troubleshooting

**Sprite não carrega:**
- Verifique o nome do arquivo: deve ser exatamente `sprite.png`
- Confirme o caminho em `sprites.js`
- Veja o console (F12) para erros de carregamento

**Personagem não aparece na seleção:**
- Verifique se foi adicionado ao array `CHARACTERS`
- Confirme que `spriteSheet` corresponde ao nome em `spriteSheets`

**Animação incorreta ou bugada:**
- Confirme que o sprite sheet segue o formato LPC padrão
- Verifique se as linhas 8-11 contêm animações de caminhada
- Cada animação deve ter 9 frames

---

## 📚 Recursos Úteis

- [Universal LPC Spritesheet Generator](http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/)
- [LPC Sprite Guide](https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator)
- [OpenGameArt LPC Collection](https://opengameart.org/content/lpc-collection)

---

## 📜 Licenças e Créditos

Todos os sprite sheets usam assets da **Liberated Pixel Cup (LPC)** sob licenças CC-BY-SA 3.0 e GPL 3.0.

**Sempre preserve os créditos dos artistas** no arquivo `credits.txt` de cada personagem!

---

*Última atualização: Fevereiro 2026*
