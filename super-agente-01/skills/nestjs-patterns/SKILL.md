---
name: nestjs-patterns
description: Padrões de arquitetura NestJS para módulos, controllers, providers, validação de DTO, guards, interceptors, config e backends TypeScript de nível de produção.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento NestJS

Padrões NestJS de nível de produção para backends TypeScript modulares.

## Quando Ativar

- Construir APIs ou serviços NestJS
- Estruturar módulos, controllers e providers
- Adicionar validação de DTO, guards, interceptors ou filtros de exceção
- Configurar ajustes sensíveis ao ambiente e integrações de banco de dados
- Testar unidades NestJS ou endpoints HTTP

## Estrutura do Projeto

```text
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── configuration.ts
│   └── validation.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
│   └── users/
│       ├── dto/
│       ├── entities/
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── prisma/ or database/
```

- Mantenha o código de domínio dentro dos módulos de feature.
- Coloque filtros, decorators, guards e interceptors transversais em `common/`.
- Mantenha os DTOs próximos do módulo que os possui.

## Bootstrap e Validação Global

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- Sempre habilite `whitelist` e `forbidNonWhitelisted` em APIs públicas.
- Prefira um único pipe de validação global em vez de repetir a config de validação por rota.

## Módulos, Controllers e Providers

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async create(dto: CreateUserDto) {
    return this.usersRepo.create(dto);
  }
}
```

- Controllers devem permanecer enxutos: analisar a entrada HTTP, chamar um provider, retornar DTOs de resposta.
- Coloque a lógica de negócio em serviços injetáveis, não nos controllers.
- Exporte apenas os providers de que outros módulos realmente precisam.

## DTOs e Validação

```ts
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

- Valide cada DTO de requisição com `class-validator`.
- Use DTOs de resposta dedicados ou serializers em vez de retornar entidades do ORM diretamente.
- Evite vazar campos internos como hashes de senha, tokens ou colunas de auditoria.

## Auth, Guards e Contexto de Requisição

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/report')
getAdminReport(@Req() req: AuthenticatedRequest) {
  return this.reportService.getForUser(req.user.id);
}
```

- Mantenha estratégias de auth e guards locais ao módulo, a menos que sejam realmente compartilhados.
- Codifique regras de acesso grosseiras em guards e depois faça a autorização específica de recurso nos serviços.
- Prefira tipos de requisição explícitos para objetos de requisição autenticados.

## Filtros de Exceção e Formato de Erro

```ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        path: request.url,
        error: exception.getResponse(),
      });
    }

    return response.status(500).json({
      path: request.url,
      error: 'Internal server error',
    });
  }
}
```

- Mantenha um envelope de erro consistente em toda a API.
- Lance exceções do framework para erros esperados do cliente; registre e encapsule falhas inesperadas de forma centralizada.

## Validação de Config e Ambiente

```ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validateEnv,
});
```

- Valide o env no boot, não de forma preguiçosa na primeira requisição.
- Mantenha o acesso à config atrás de helpers tipados ou serviços de config.
- Separe as preocupações de dev/staging/prod em factories de config em vez de ramificar por todo o código de feature.

## Persistência e Transações

- Mantenha o código de repositório / ORM atrás de providers que falam a linguagem de domínio.
- Para Prisma ou TypeORM, isole os fluxos de trabalho transacionais em serviços que detêm a unidade de trabalho.
- Não deixe os controllers coordenarem escritas de múltiplas etapas diretamente.

## Testes

```ts
describe('UsersController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
});
```

- Faça testes de unidade dos providers de forma isolada com dependências mockadas.
- Adicione testes em nível de requisição para guards, pipes de validação e filtros de exceção.
- Reutilize nos testes os mesmos pipes/filtros globais que você usa em produção.

## Padrões de Produção

- Habilite logging estruturado e ids de correlação de requisição.
- Encerre com env/config inválidos em vez de subir parcialmente.
- Prefira inicialização assíncrona de providers para clientes de DB/cache com health checks explícitos.
- Mantenha jobs em background e consumidores de eventos em seus próprios módulos, não dentro de controllers HTTP.
- Torne rate limiting, auth e logging de auditoria explícitos para endpoints públicos.
