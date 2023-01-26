export interface ActorNameResult {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  type: 'api' | 'user' | 'unknown';
  isDeleted: boolean;
  isValid: boolean;
}
