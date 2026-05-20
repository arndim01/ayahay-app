import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    // Add security headers
    response.header('X-Content-Type-Options', 'nosniff');
    response.header('X-Frame-Options', 'SAMEORIGIN');
    response.header('X-XSS-Protection', '1; mode=block');
    
    return next.handle().pipe(
      tap(() => {
        // Post-request operations if needed
      })
    );
  }
}
