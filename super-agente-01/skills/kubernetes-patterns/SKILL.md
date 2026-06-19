---
name: kubernetes-patterns
description: Padrões de workloads Kubernetes, gerenciamento de recursos, RBAC, probes, autoscaling, manipulação de ConfigMap/Secret e depuração com kubectl para deployments em produção.
metadata:
  origin: ECC
---

# Padrões Kubernetes

Padrões Kubernetes prontos para produção para implantar, gerenciar e depurar workloads de forma confiável.

## Quando Ativar

- Escrever manifestos Kubernetes (Deployments, Services, Ingress, Jobs)
- Configurar requests/limits de recursos, probes de liveness/readiness
- Configurar RBAC, namespaces ou ServiceAccounts
- Gerenciar configuração e secrets no K8s
- Depurar CrashLoopBackOff, OOMKilled, pods pendentes ou erros de image pull
- Configurar HPA (Horizontal Pod Autoscaler) ou PodDisruptionBudgets
- Revisar YAML do K8s por questões de segurança ou correção

## Quando Usar

> Igual ao **Quando Ativar** acima. Este alias satisfaz as convenções de formato de skill do repositório. Use esta skill sempre que estiver escrevendo, revisando ou depurando YAML e workloads Kubernetes.

## Como Funciona

Esta skill fornece **padrões YAML prontos para produção** e **comandos kubectl para depuração** organizados por tarefa:

1. **Template de Deployment** — Um `Deployment` de produção completamente configurado com security context, estratégia de rolling update, todos os três tipos de probe, limites de recursos e injeção de variáveis de ambiente via ConfigMap/Secret.
2. **Probes** — Tabela de decisão para startup vs liveness vs readiness, com a matemática correta de `failureThreshold × periodSeconds`.
3. **Services e Ingress** — Padrões de ClusterIP, LoadBalancer e Ingress com TLS e anotações do cert-manager.
4. **ConfigMaps e Secrets** — `envFrom`, montagem como arquivo e orientações sobre secrets externos.
5. **Gerenciamento de recursos** — Regras práticas de requests vs limits por tipo de workload (web API, JVM, worker, sidecar).
6. **RBAC** — Cadeia ServiceAccount → Role → RoleBinding com privilégio mínimo.
7. **HPA e PDB** — Configurações de autoscaling e segurança durante drenagem de nó.
8. **Jobs e CronJobs** — Padrões de workload único e agendado com `restartPolicy` correto.
9. **Cheatsheet kubectl** — Comandos de logs, exec, rollback, port-forward, dry-run e diagnóstico de erros comuns.
10. **Anti-padrões e checklist** — O que NÃO fazer e um checklist de segurança/confiabilidade/observabilidade.

## Exemplos

Veja as seções abaixo para exemplos completos e executáveis. Referências rápidas:

| Tarefa | Ir para |
|------|---------|
| YAML completo de Deployment em produção | [Padrões de Workload Principal](#padrões-de-workload-principal) |
| Configuração de probes | [Probes](#probes--liveness-readiness-startup) |
| Configuração RBAC com privilégio mínimo | [RBAC](#rbac--roles-e-serviceaccounts) |
| Depurar um CrashLoopBackOff | [Cheatsheet kubectl para Depuração](#cheatsheet-kubectl-para-depuração) |
| Autoscaling | [HPA](#horizontal-pod-autoscaler-hpa) |

---

## Padrões de Workload Principal

### Deployment — Template de Produção

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-namespace
  labels:
    app: my-app
    version: "1.0.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Permite 1 pod extra durante a atualização
      maxUnavailable: 0    # Nunca reduz abaixo da contagem desejada
  template:
    metadata:
      labels:
        app: my-app
        version: "1.0.0"
    spec:
      # Security context a nível do pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

      # Encerramento gracioso
      terminationGracePeriodSeconds: 30

      containers:
        - name: my-app
          image: ghcr.io/org/my-app:1.0.0   # Nunca use :latest
          imagePullPolicy: IfNotPresent

          ports:
            - containerPort: 8080
              protocol: TCP

          # Requests E limits de recursos são ambos obrigatórios
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"

          # Security context do container
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL

          # Probes (veja a seção Probes abaixo)
          startupProbe:
            httpGet:
              path: /health
              port: 8080
            failureThreshold: 30
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 0
            periodSeconds: 30
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 2

          # Variáveis de ambiente via ConfigMap e Secret
          envFrom:
            - configMapRef:
                name: my-app-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: my-app-secrets
                  key: db-password

          # Diretório tmp gravável quando readOnlyRootFilesystem: true
          volumeMounts:
            - name: tmp
              mountPath: /tmp

      volumes:
        - name: tmp
          emptyDir: {}
```

---

## Probes — Liveness, Readiness, Startup

Entender quando usar cada probe é fundamental:

| Probe | Ação em Falha | Para Usar |
|-------|---------------|---------|
| `startupProbe` | Mata o container se demorar para iniciar | Apps com inicialização lenta (JVM, Python) |
| `livenessProbe` | Reinicia o container | Detecção de deadlock / processo travado |
| `readinessProbe` | Remove dos endpoints do Service | Indisponibilidade temporária (reconexão ao banco) |

```yaml
# Padrão correto: startupProbe cobre a inicialização lenta,
# depois liveness/readiness assumem
startupProbe:
  httpGet:
    path: /health
    port: 8080
  failureThreshold: 30  # 30 * 5s = 150s máximo de inicialização
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  periodSeconds: 30
  failureThreshold: 3   # 3 * 30s = 90s antes de reiniciar

readinessProbe:
  httpGet:
    path: /ready         # Endpoint separado: verifica banco, cache, etc.
    port: 8080
  periodSeconds: 10
  failureThreshold: 2
```

```yaml
# ERRADO: initialDelaySeconds sem startupProbe
# Se o app demora 60s para iniciar, configure um startupProbe em vez disso
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 60   # RUIM: Espera arbitrária, condição de corrida
```

---

## Services e Ingress

### Tipos de Service

```yaml
# ClusterIP (padrão) — apenas interno
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: my-namespace
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  type: ClusterIP
```

```yaml
# LoadBalancer — tráfego externo (provedores de nuvem)
spec:
  type: LoadBalancer
  ports:
    - port: 443
      targetPort: 8080
```

### Ingress com TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  namespace: my-namespace
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - myapp.example.com
      secretName: my-app-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

---

## ConfigMaps e Secrets

### ConfigMap — Configuração não sensível

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
  namespace: my-namespace
data:
  LOG_LEVEL: "info"
  APP_ENV: "production"
  MAX_CONNECTIONS: "100"
  # Monte como arquivo para configuração complexa
  app.yaml: |
    server:
      port: 8080
      timeout: 30s
```

```yaml
# Monte ConfigMap como arquivo
volumes:
  - name: config
    configMap:
      name: my-app-config
      items:
        - key: app.yaml
          path: app.yaml
volumeMounts:
  - name: config
    mountPath: /etc/app
    readOnly: true
```

### Secrets — Dados sensíveis

```bash
# Crie um secret a partir de literal (CLI, depois armazene no Vault/SOPS)
kubectl create secret generic my-app-secrets \
  --from-literal=db-password='s3cr3t' \
  --namespace=my-namespace \
  --dry-run=client -o yaml | kubectl apply -f -
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-app-secrets
  namespace: my-namespace
type: Opaque
# Valores são codificados em base64 (NÃO criptografados — use Sealed Secrets ou ESO para criptografia real)
data:
  db-password: czNjcjN0  # base64 de 's3cr3t'
```

> **Importante:** Secrets Kubernetes brutos são apenas codificados em base64, não criptografados em repouso a menos que seu cluster tenha criptografia configurada. Use [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) ou [External Secrets Operator](https://external-secrets.io) para produção.

---

## Requests e Limits de Recursos

```yaml
resources:
  requests:       # O scheduler usa isso para posicionar o pod
    cpu: "100m"   # 100 millicores = 0,1 CPU
    memory: "128Mi"
  limits:         # O container é morto/limitado acima disso
    cpu: "500m"
    memory: "256Mi"
```

**Regras práticas:**

| Tipo de Workload | CPU Request | Memory Request | Notas |
|---------------|-------------|----------------|-------|
| Web API | 100–250m | 128–256Mi | Defina limits de 2 a 4x os requests |
| Worker/consumer | 250–500m | 256–512Mi | Memory limit = request para previsibilidade |
| App JVM | 500m–1 | 512Mi–2Gi | Dê folga acima do `-Xmx` para o overhead da JVM |
| Sidecar | 10–50m | 32–64Mi | Mantenha mínimo |

```yaml
# ERRADO: Sem requests ou limits — agendamento imprevisível, evicções por OOM
containers:
  - name: app
    image: myapp:latest
    # resources: {} ausente — isto é perigoso em produção

# ERRADO: Limits sem requests — requests padrão para limits, super-reserva de capacidade
resources:
  limits:
    cpu: "2"
    memory: "1Gi"
  # requests ausente — vai usar os valores de limits por padrão
```

---

## RBAC — Roles e ServiceAccounts

### Princípio do Privilégio Mínimo

**Dois padrões dependendo se o app chama a API Kubernetes:**

#### Padrão A — App NÃO precisa da API Kubernetes (a maioria dos apps)

Desative o automounting de token no ServiceAccount. O Role/RoleBinding não são necessários.

```yaml
# ServiceAccount com token desativado — padrão mais seguro
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: my-namespace
automountServiceAccountToken: false   # Nenhum token da API K8s injetado nos pods
```

```yaml
# Referência no Deployment — sem token, sem acesso à API
spec:
  template:
    spec:
      serviceAccountName: my-app-sa
      automountServiceAccountToken: false   # Cinto e suspensório: defina também no nível do pod
```

#### Padrão B — App PRECISA da API Kubernetes (operators, controllers, watchers de config)

Ative o token e conceda apenas as permissões realmente necessárias.

```yaml
# 1. ServiceAccount — ative o token para este SA
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: my-namespace
automountServiceAccountToken: true    # Token obrigatório: app chama a API K8s
```

```yaml
# 2. Role — conceda apenas o que o app precisa (escopo de namespace)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: my-app-role
  namespace: my-namespace
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]    # Somente leitura, recurso específico
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["my-app-secrets"]  # Restrinja ao secret específico por nome
    verbs: ["get"]
```

```yaml
# 3. Vincule Role ao ServiceAccount
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-app-rolebinding
  namespace: my-namespace
subjects:
  - kind: ServiceAccount
    name: my-app-sa
    namespace: my-namespace
roleRef:
  kind: Role
  apiGroup: rbac.authorization.k8s.io
  name: my-app-role
```

```yaml
# 4. Referencie o SA no Deployment
spec:
  template:
    spec:
      serviceAccountName: my-app-sa
      # automountServiceAccountToken padrão é true pelo SA — token é injetado
```

---

## Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
  namespace: my-namespace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2      # Sempre ao menos 2 para HA
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70    # Escale quando CPU média > 70%
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

> O HPA requer que `resources.requests` esteja definido em todos os containers — ele calcula a utilização como `atual / request`.

---

## PodDisruptionBudget (PDB)

Evite que muitos pods fiquem indisponíveis durante drenagens de nó ou rolling updates:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: my-app-pdb
  namespace: my-namespace
spec:
  minAvailable: 2           # OU use maxUnavailable: 1
  selector:
    matchLabels:
      app: my-app
```

---

## Namespaces e Multi-Tenancy

```bash
# Crie namespace com cotas de recursos
kubectl create namespace my-namespace

# Aplique ResourceQuota para limitar o consumo do namespace
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: my-namespace-quota
  namespace: my-namespace
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 4Gi
    limits.cpu: "8"
    limits.memory: 8Gi
    pods: "20"
EOF
```

---

## Jobs e CronJobs

```yaml
# Job único (migração de banco, processamento de dados)
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  namespace: my-namespace
spec:
  backoffLimit: 3          # Tente novamente até 3 vezes em caso de falha
  ttlSecondsAfterFinished: 3600   # Exclua automaticamente após 1h
  template:
    spec:
      restartPolicy: OnFailure    # Nunca para Jobs (não Always)
      containers:
        - name: migrate
          image: ghcr.io/org/my-app:1.0.0
          command: ["python", "manage.py", "migrate"]
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
```

```yaml
# CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-job
  namespace: my-namespace
spec:
  schedule: "0 2 * * *"         # 2h da manhã diariamente
  concurrencyPolicy: Forbid      # Não execute se o anterior ainda estiver rodando
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cleanup
              image: ghcr.io/org/cleanup:1.0.0
              resources:
                requests:
                  cpu: "50m"
                  memory: "64Mi"
```

---

## Cheatsheet kubectl para Depuração

```bash
# --- Status e logs do pod ---
kubectl get pods -n my-namespace
kubectl get pods -n my-namespace -o wide          # Mostra o nó atribuído
kubectl describe pod <pod-name> -n my-namespace   # Eventos e detalhes do estado
kubectl logs <pod-name> -n my-namespace           # Logs atuais
kubectl logs <pod-name> -n my-namespace --previous  # Logs do container que travou
kubectl logs <pod-name> -n my-namespace -c <container>  # Pod multi-container

# --- Execute dentro de um container em execução ---
kubectl exec -it <pod-name> -n my-namespace -- sh
kubectl exec -it <pod-name> -n my-namespace -- bash

# --- Verifique o uso de recursos ---
kubectl top pods -n my-namespace
kubectl top nodes

# --- Operações de Deployment ---
kubectl rollout status deployment/my-app -n my-namespace
kubectl rollout history deployment/my-app -n my-namespace
kubectl rollout undo deployment/my-app -n my-namespace      # Rollback
kubectl rollout undo deployment/my-app --to-revision=2 -n my-namespace

# --- Escale manualmente ---
kubectl scale deployment my-app --replicas=5 -n my-namespace

# --- Inspecione eventos (problemas no cluster) ---
kubectl get events -n my-namespace --sort-by='.lastTimestamp'

# --- Port-forward para depuração local ---
kubectl port-forward pod/<pod-name> 8080:8080 -n my-namespace
kubectl port-forward svc/my-app 8080:80 -n my-namespace

# --- Dry-run para validar YAML ---
kubectl apply -f deployment.yaml --dry-run=client
kubectl apply -f deployment.yaml --dry-run=server   # Valida contra o cluster ao vivo
```

### Diagnosticando Erros Comuns

```bash
# CrashLoopBackOff: container continua travando
kubectl logs <pod-name> --previous -n my-namespace  # Verifique logs do crash
kubectl describe pod <pod-name> -n my-namespace     # Verifique código de saída e OOMKilled

# ImagePullBackOff: não consegue fazer pull da imagem
kubectl describe pod <pod-name> -n my-namespace     # Verifique a seção Events
# Causas: tag de imagem errada, imagePullSecret ausente, registry privado

# Pod pendente: não agendado
kubectl describe pod <pod-name> -n my-namespace
# Causas: recursos insuficientes, node selector sem correspondência, incompatibilidade de taint/toleration

# OOMKilled: sem memória
# Aumente os limits de memória, verifique vazamentos de memória
kubectl describe pod <pod-name> -n my-namespace | grep -A5 "Last State"
```

---

## Anti-Padrões

```yaml
# RUIM: Usar tag :latest — deployments não determinísticos
image: myapp:latest

# BOM: Fixe em uma tag imutável específica (SHA ou semver)
image: ghcr.io/org/myapp:1.4.2
# ou
image: ghcr.io/org/myapp@sha256:abc123...

# ---

# RUIM: Executar como root
securityContext: {}    # Padrão para root

# BOM: Não-root com UID explícito
securityContext:
  runAsNonRoot: true
  runAsUser: 1001

# ---

# RUIM: Sem limits de recursos — um pod pode esgotar o nó inteiro
containers:
  - name: app
    image: myapp:1.0.0
    # Nenhum resources definido

# BOM: Sempre defina requests e limits
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi"

# ---

# RUIM: Armazenar secrets em texto puro em ConfigMaps
apiVersion: v1
kind: ConfigMap
data:
  DB_PASSWORD: "mysecretpassword"   # NUNCA — use Secret ou gerenciador de secrets externo

# ---

# RUIM: ClusterAdmin para service accounts de aplicação
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
roleRef:
  kind: ClusterRole
  name: cluster-admin    # Concede poderes divinos ao seu app

# ---

# RUIM: minAvailable: 0 no PDB — derrota o propósito
spec:
  minAvailable: 0

# ---

# RUIM: restartPolicy: Always em um Job (causa loop de reinício infinito)
spec:
  restartPolicy: Always   # Use OnFailure ou Never para Jobs
```

---

## Checklist de Boas Práticas

### Segurança
- [ ] Container executa como não-root (`runAsNonRoot: true`, `runAsUser` definido)
- [ ] `readOnlyRootFilesystem: true` com `emptyDir` para paths graváveis
- [ ] `allowPrivilegeEscalation: false`
- [ ] Todas as capabilities descartadas (`capabilities.drop: [ALL]`)
- [ ] ServiceAccount dedicado por app, não o `default`
- [ ] `automountServiceAccountToken: false` a menos que necessário
- [ ] RBAC segue privilégio mínimo (use `Role`, não `ClusterRole` a menos que necessário)
- [ ] Secrets gerenciados via Sealed Secrets ou External Secrets Operator

### Confiabilidade
- [ ] Todos os 3 tipos de probe configurados (startup + liveness + readiness)
- [ ] Requests E limits de recursos definidos em todos os containers
- [ ] `minReplicas: 2+` para qualquer workload em produção
- [ ] PodDisruptionBudget definido para serviços stateful ou críticos
- [ ] Estratégia `RollingUpdate` com `maxUnavailable: 0`
- [ ] HPA configurado para serviços com carga variável

### Observabilidade
- [ ] App expõe endpoints `/health` (liveness) e `/ready` (readiness)
- [ ] Logging JSON estruturado (sem PII nos logs)
- [ ] Labels de recursos: `app`, `version`, `environment`

---

## Skills Relacionadas

- `docker-patterns` — Dockerfiles multi-stage e segurança de imagens
- `deployment-patterns` — Pipelines CI/CD, estratégia de rollback, endpoints de health check
- `security-review` — Contexto mais amplo de hardening de segurança
- `git-workflow` — Integração GitOps com K8s (padrões ArgoCD / Flux)
