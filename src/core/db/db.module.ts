import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DBModule {
    static forRoot(entities: any[] = []): DynamicModule {
        return {
            module: DBModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory: async () => ({
                        entities,
                        type: 'postgres',
                        synchronize: true,
                        autoLoadEntities: true,
                        host: process.env.POSTGRES_HOST,
                        database: process.env.POSTGRES_DB,
                        username: process.env.POSTGRES_USER,
                        password: process.env.POSTGRES_PASSWORD,
                        port: parseInt(process.env.POSTGRES_PORT, 10),
                    }),
                }),
            ],
        };
    }
}
