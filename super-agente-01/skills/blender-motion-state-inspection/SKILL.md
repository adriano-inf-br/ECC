---
name: blender-motion-state-inspection
description: Use esta Skill ao inspecionar personagens, rigs, poses, retargeting de animação, contato com o solo, direção de orientação ou alinhamento modelo-vs-movimento no Blender, onde capturas de tela sozinhas não bastam.
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Blender Motion State Inspection

## When to Use

- Um personagem do Blender parece torcido, espelhado, achatado, deslocado ou deslizando os pés (foot-sliding) em uma animação.
- Um usuário pergunta se um avatar importado, armature ou movimento retargetado corresponde a uma pose esperada.
- Você precisa comparar evidência renderizada com fatos estruturados, como ossos, bounding boxes, contatos e vetores de orientação.
- Um workflow depende de decidir se um modelo é um personagem, prop, malha proxy, control rig ou uma importação quebrada.

## Princípio Central

Não julgue assets 3D animados apenas por capturas de tela. Capturas de tela são evidência de revisão, mas escondem convenções de eixos, nomes de ossos, escala de objetos, transforms locais, malhas parenteadas, slots de material e o estado de contato quadro a quadro.

Primeiro extraia o estado estruturado do Blender, depois use capturas de tela do viewport ou renders para confirmar o que os fatos implicam.

## How It Works

1. Estabeleça a cena limpa e a linha de base do asset antes de julgar o movimento.
2. Extraia fatos estruturados do Blender usando um exportador ou rodando Blender Python dentro do próprio interpretador do Blender.
3. Amostre os quadros com maior probabilidade de expor erros de contato, orientação, escala e retargeting.
4. Compare os fatos medidos contra a pose esperada do usuário, direção, plano do solo e meta de render.
5. Retorne um relatório conciso que separa fatos confirmados, causas prováveis e correções necessárias.

## Fluxo de Inspeção

1. Inventarie a cena.
   - Liste malhas, armatures, empties, câmeras, luzes, modificadores, relações de parentesco e objetos ocultos.
   - Separe as malhas do personagem da geometria auxiliar/proxy antes de julgar o avatar.
   - Registre as bounding boxes em object-space e world-space.

2. Identifique o esqueleto.
   - Capture nomes de armatures, pose bones, heads/tails dos ossos, roll, cadeias de parentesco, constraints e eixos de rest-pose.
   - Mapeie ossos semânticos como quadris (hips), coluna (spine), pescoço (neck), cabeça (head), ombros, cotovelos, mãos, coxas, joelhos, tornozelos e pés.
   - Sinalize pares esquerda/direita ausentes e esquemas de nomenclatura incomuns.

3. Determine os eixos forward, up e side.
   - Use a pelve, coluna, ombros, quadris, cabeça e pés em conjunto; não confie em uma única normal de malha.
   - Compare os eixos locais do armature com os eixos do mundo e as convenções do arquivo importado, como glTF Y-up vs Blender Z-up.
   - Marque importações provavelmente espelhadas ou invertidas quando a direção da face/cabeça/pés conflita com o root motion.

4. Amostre os quadros da animação.
   - Inspecione o primeiro quadro, o do meio, os de contato, os no ar (airborne) e os extremos.
   - Registre a localização do root, o heading do root, a altura da pelve, a inclinação do tronco, as direções dos membros, a folga dos pés e os limites da malha.
   - Para movimento longo ou rápido, amostre de forma mais densa em torno de flips, aterrissagens, viradas, colisões e contatos com o piso.

5. Verifique a integridade do modelo antes de culpar o retargeting.
   - Confirme a forma da linha de base limpa antes de aplicar a animação.
   - Preserve a malha original, materiais, armature e skinning, a menos que o usuário peça explicitamente o reparo.
   - Trate blobs inexplicáveis em forma de esfera, malhas proxy gigantes ou corpos esmagados como problemas de importação/seleção até prova em contrário.

6. Diagnostique problemas de contato e movimento.
   - Penetração no solo: compare os vértices mais baixos do pé ou do calçado com a altura do piso por quadro.
   - Deslizamento de pé (foot sliding): compare as posições do pé no mundo entre os quadros plantados.
   - Cruzamento de pernas: compare a ordenação de lado de coxa, joelho, tornozelo e pé esquerdo/direito.
   - Dano de torção (twist): compare a direção de swing do osso separadamente do roll/twist em torno do eixo do membro.
   - Deriva de escala: compare os limites da malha animada contra os limites da linha de base limpa.

7. Reporte fatos antes de opiniões.
   - Inclua números de quadro, nomes de objetos, nomes de ossos, coordenadas do mundo e limiares.
   - Separe as falhas confirmadas das suspeitas visuais.
   - Anexe capturas de tela apenas depois que o estado estruturado explicar o que procurar.

## Formato de Relatório Recomendado

```markdown
## Blender Motion Inspection

### Scene Inventory
- Character candidates:
- Armatures:
- Helper/proxy objects:
- Cameras/lights:

### Orientation
- World up:
- Character forward:
- Root heading:
- Mirrored/backwards risk:

### Baseline Integrity
- Clean mesh bounds:
- Animated mesh bounds:
- Materials/skin preserved:
- Suspicious non-character meshes:

### Frame Findings
| Frame | Finding | Evidence |
| --- | --- | --- |
| 1 | Clean baseline pose | hips/spine/feet aligned |
| 96 | Foot penetrates floor | left_foot min_z = -0.04 |

### Verdict
- Pass/fail:
- Required fix:
- Render readiness:
```

## Examples

### Ciclo de Caminhada Com Deslizamento de Pé

Cenário: um personagem retargetado parece patinar durante um ciclo de caminhada, mas o ângulo da câmera frontal dificulta julgar o contato do pé.

Aplique o workflow:
- Inventarie a cena: malha do personagem `HeroBody`, armature `HeroRig`, plano do solo `Floor`, sem malhas proxy ocultas.
- Identifique o esqueleto: os pés semânticos são `foot.L` e `foot.R`; os quadris são `pelvis`; o osso root é `root`.
- Amostre os quadros da animação: inspecione os quadros 1, 18, 24, 30, 42 e 48 em torno dos momentos de pé plantado.
- Diagnostique problemas de contato e movimento: compare as localizações dos pés em world-space durante os quadros plantados.

Fatos extraídos:

| Frame | Fact | Evidence |
| --- | --- | --- |
| 18 | Left foot is planted | `foot.L min_z = 0.004`, toe and heel both near floor |
| 24 | Left foot slides while planted | `foot.L x = 0.21 -> 0.28` over six frames |
| 30 | Pelvis keeps moving forward | `pelvis y = 1.14 -> 1.31` |

Veredito: reprovado para prontidão de render. O movimento precisa de limpeza de foot-lock ou revisão de constraint de retargeting; a malha do corpo não precisa de mudanças de proporção.

### Personagem Importado Invertido

Cenário: um personagem parece correto em um quadro estático, mas a animação se move no sentido oposto à direção de deslocamento esperada.

Aplique o workflow:
- Determine os eixos forward, up e side: compare cabeça, peito, pés e root motion.
- Amostre os quadros da animação: inspecione o quadro 1 e o ponto médio do trajeto de deslocamento.
- Reporte fatos antes de opiniões: inclua o heading do root e a direção de orientação do modelo separadamente.

Fatos extraídos:

| Frame | Fact | Evidence |
| --- | --- | --- |
| 1 | Character face points toward world `-Y` | head/chest vector from `neck` to `head` resolves to `-Y` |
| 72 | Root motion travels toward world `+Y` | `root y = 0.0 -> 2.8` |
| 72 | Feet remain visually forward-facing opposite travel | toe bones point `-Y` while displacement is `+Y` |

Veredito: provavelmente importação invertida ou incompatibilidade do eixo forward de retargeting. Corrija o mapeamento de eixo da importação/retarget antes de editar as curvas de animação.

## Limiares Práticos

- Assuma as unidades padrão de escala em metros do Blender, a menos que a escala de unidade da cena diga o contrário.
- Trate penetração no solo acima de 1-2 cm como visível, a menos que o piso seja macio ou intencionalmente estilizado.
- Trate uma mudança súbita de escala acima de 5% como provável problema de rig, constraint ou herança de transform.
- Trate inversões de ordem de lado do tornozelo esquerdo/direito durante movimento invertido no ar como risco de cruzamento de pernas, mesmo que se recupere depois.
- Trate saltos de heading do root acima de 30 graus por quadro como suspeitos, a menos que o movimento de origem inclua uma virada brusca.

## Anti-Patterns

- Não modifique as proporções do corpo para forçar a correspondência de pose, a menos que a tarefa seja explicitamente reparo de malha.
- Não faça bake da linha de base limpa antes de registrá-la.
- Não use um único ângulo de câmera renderizado como prova de que uma pose está correta.
- Não exclua objetos auxiliares até ter registrado por que eles não fazem parte do personagem.
- Não presuma que um avatar aponta para +Y, -Y, +X ou -X sem checar cabeça, pés, tronco e root motion em conjunto.

## Notas de Ferramental

Se um exportador de estado do Blender estiver disponível, prefira JSON que inclua malhas, armatures, pose bones, materiais, contatos, bounding boxes e quadros de animação amostrados. Se nenhum exportador existir, rode um pequeno script Blender Python através do próprio Blender, por exemplo `blender --background scene.blend --python collect_motion_state.py`, porque `bpy` não está disponível em um interpretador Python de sistema normal.
