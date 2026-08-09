/**
 * Shared type definitions for the CMS.
 */

/**
 * JWT token payload — attached to request.user after JWT validation.
 * Defined as a class (not interface) to satisfy TypeScript's
 * isolatedModules + emitDecoratorMetadata requirements when used
 * as a parameter type in decorated controller methods.
 */
export class JwtPayload {
  sub: string;      // Account _id
  email: string;
  username: string; // Public username for URL routing
}
