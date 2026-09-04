import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

// JwtAuthGuard wraps Passport's AuthGuard('jwt'), which needs an
// AuthModuleOptions provider (only registered via PassportModule.register())
// in the DI context of whatever module uses the guard. Registering it once
// here, globally, means every feature module gets it for free via
// @UseGuards() without importing PassportModule everywhere.
@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  exports: [PassportModule],
})
export class CommonModule {}
