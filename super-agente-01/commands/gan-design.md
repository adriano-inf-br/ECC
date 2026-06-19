---
description: Executa um loop de design gerador/avaliador para trabalho de frontend ou visual com iterações limitadas e pontuação.
---

Faça o parse do seguinte a partir de $ARGUMENTS:
1. `brief` — a descrição do usuário sobre o design a ser criado
2. `--max-iterations N` — (opcional, padrão 10) número máximo de ciclos design-avaliação
3. `--pass-threshold N` — (opcional, padrão 7.5) pontuação ponderada para aprovação (padrão mais alto para design)

## Harness de Design no Estilo GAN

Um loop de dois agents (Gerador + Avaliador) focado na qualidade de design de frontend. Sem planner — o brief É a especificação.

Este é o mesmo modo que a Anthropic usou em seus experimentos de design de frontend, onde observaram avanços criativos como o museu de arte holandês em 3D com perspectiva CSS e navegação por portas.

### Configuração
1. Crie o diretório `gan-harness/`
2. Escreva o brief diretamente como `gan-harness/spec.md`
3. Escreva um `gan-harness/eval-rubric.md` focado em design com peso extra em Qualidade de Design e Originalidade

### Rubrica de Avaliação Específica para Design
```markdown
### Design Quality (weight: 0.35)
### Originality (weight: 0.30)
### Craft (weight: 0.25)
### Functionality (weight: 0.10)
```

Nota: O peso de Originalidade é maior (0.30 vs 0.20) para impulsionar avanços criativos. O peso de Funcionalidade é menor, já que o modo de design foca na qualidade visual.

### Loop
Igual à Fase 2 do `/project:gan-build`, mas:
- Pule o planner
- Use a rubrica focada em design
- O prompt do Gerador enfatiza qualidade visual em vez de completude de funcionalidades
- O prompt do Avaliador enfatiza "isso ganharia um prêmio de design?" em vez de "todas as funcionalidades funcionam?"

### Diferença Principal em Relação ao gan-build
Diz-se ao Gerador: "Seu objetivo PRINCIPAL é a excelência visual. Um app deslumbrante e pela metade vence um funcional e feio. Busque saltos criativos — layouts incomuns, animações personalizadas, trabalho de cores distintivo."
